"""
Somnia blockchain interaction
Handles contract calls and transactions
"""

import os
import json
import logging
import random
from typing import Optional, Dict, Any, List
from pathlib import Path

from web3 import Web3
from web3.contract import Contract
from eth_account import Account

from app.database import DocumentDatabase

logger = logging.getLogger(__name__)


class SomniaClient:
    """Client for interacting with Somnia L1 contracts"""
    
    def __init__(
        self,
        rpc_url: Optional[str] = None,
        private_key: Optional[str] = None,
        access_nft_address: Optional[str] = None,
        agent_registry_address: Optional[str] = None,
        provenance_address: Optional[str] = None,
    ):
        self.rpc_url = rpc_url or os.getenv("SOMNIA_RPC_URL")
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
        logger.info(f"Connected to Somnia L1: {self.rpc_url}")
        
        # Account
        self.private_key = private_key or os.getenv("DEPLOYER_PRIVATE_KEY") or os.getenv("AGENT_PRIVATE_KEY")
        if self.private_key:
            self.account = Account.from_key(self.private_key)
        else:
            self.account = None
        
        # Contract addresses
        self.access_nft_address = access_nft_address or os.getenv("ACCESS_NFT_ADDRESS")
        self.agent_registry_address = agent_registry_address or os.getenv("AGENT_REGISTRY_ADDRESS")
        self.provenance_address = provenance_address or os.getenv("PROVENANCE_ADDRESS")
        self.company_dropbox_address = os.getenv("COMPANY_DROPBOX_ADDRESS")
        
        # Load contracts
        self.access_nft = self._load_contract("AccessNFT", self.access_nft_address)
        self.agent_registry = self._load_contract("AgentRegistry", self.agent_registry_address)
        self.provenance = self._load_contract("Provenance", self.provenance_address)
        self.company_dropbox = self._load_company_dropbox_contract()
        
        # Initialize database for document caching
        self.db = DocumentDatabase()
    
    def _load_contract(self, name: str, address: Optional[str]) -> Optional[Contract]:
        """Load contract from ABI"""
        if not address:
            return None
        
        # Try to load ABI from artifacts
        abi_path = Path(__file__).parent.parent.parent / "contracts" / "artifacts" / "src" / f"{name}.sol" / f"{name}.json"
        
        if not abi_path.exists():
            print(f"Warning: ABI not found for {name} at {abi_path}")
            return None
        
        with open(abi_path) as f:
            artifact = json.load(f)
            abi = artifact["abi"]
        
        return self.w3.eth.contract(
            address=Web3.to_checksum_address(address),
            abi=abi
        )
    
    def _load_company_dropbox_contract(self):
        """Load CompanyDropbox contract using contract_config"""
        try:
            from .contract_config import get_contract_address, get_contract_abi
            
            address = get_contract_address("company_dropbox") or self.company_dropbox_address
            if not address:
                logger.warning("No CompanyDropbox contract address configured")
                return None
            
            abi = get_contract_abi("company_dropbox")
            logger.info(f"Loading CompanyDropbox contract at {address}")
            return self.w3.eth.contract(address=self.w3.to_checksum_address(address), abi=abi)
        except Exception as e:
            logger.error(f"Failed to load CompanyDropbox contract: {e}")
            return None
    
    async def check_nft_ownership(self, token_id: int, user_address: str) -> bool:
        """Check if user owns a specific NFT"""
        # If ABI/contract not loaded (development or missing artifacts), allow access
        # This prevents the backend from returning 500 when running locally without
        # compiled contract artifacts. In production, ensure ABIs are present.
        if not self.access_nft:
            logger.warning("AccessNFT contract not loaded - skipping on-chain ownership check (dev mode)")
            # Treat as owner in dev mode so AI executions can proceed for testing
            return True

        try:
            owner = self.access_nft.functions.ownerOf(token_id).call()
            return owner.lower() == user_address.lower()
        except Exception:
            return False
    
    async def get_document_cid(self, token_id: int) -> str:
        """Get document CID from NFT metadata"""
        if not self.access_nft:
            logger.warning("AccessNFT contract not loaded - returning empty CID (dev mode)")
            return ""

        return self.access_nft.functions.tokenURI(token_id).call()
    
    async def register_agent(
        self,
        did: str,
        name: str,
        metadata_cid: str
    ) -> str:
        """Register agent in AgentRegistry with proper gas estimation"""
        if not self.agent_registry:
            raise ValueError("AgentRegistry contract not loaded")
        
        if not self.account:
            raise ValueError("No account configured")
        
        logger.info(f"Registering agent: {did}")
        logger.debug(f"Agent name: {name}, metadata: {metadata_cid}")
        
        # Estimate gas first
        try:
            gas_estimate = self.agent_registry.functions.registerAgent(
                did,
                name,
                metadata_cid
            ).estimate_gas({'from': self.account.address})
            
            # Add 50% buffer to gas estimate
            gas_limit = int(gas_estimate * 1.5)
            logger.info(f"Gas estimate: {gas_estimate}, using limit: {gas_limit}")
        except Exception as e:
            logger.error(f"Gas estimation failed: {e}")
            raise
        
        # Build transaction
        tx = self.agent_registry.functions.registerAgent(
            did,
            name,
            metadata_cid
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': gas_limit,
            'gasPrice': self.w3.eth.gas_price,
        })
        
        logger.debug(f"Transaction built: nonce={tx['nonce']}, gas={tx['gas']}, gasPrice={tx['gasPrice']}")
        
        # Sign and send
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        logger.info(f"Transaction sent: {tx_hash.hex()}")
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        if receipt['status'] == 1:
            logger.info(
                f"Agent registered successfully",
                extra={
                    'tx_hash': tx_hash.hex(),
                    'did': did,
                    'gas_used': receipt['gasUsed'],
                    'block_number': receipt['blockNumber']
                }
            )
        else:
            logger.error(
                f"Agent registration failed",
                extra={
                    'tx_hash': tx_hash.hex(),
                    'did': did,
                    'gas_used': receipt['gasUsed']
                }
            )
        
        return tx_hash.hex()
    
    async def is_agent_active(self, did: str) -> bool:
        """Check if agent is registered and active"""
        if not self.agent_registry:
            return False
        
        return self.agent_registry.functions.isActiveAgent(did).call()
    
    async def record_provenance(
        self,
        nft_token_id: int,
        input_cid: str,
        input_root: str,
        output_cid: str,
        execution_root: str,
        trace_cid: str,
        agent_did: str,
        proof_cid: str = ""
    ) -> Dict[str, Any]:
        """
        Record provenance on-chain with proper gas estimation and logging
        
        Returns:
            Dict with tx_hash and record_id
        """
        if not self.provenance:
            raise ValueError("Provenance contract not loaded")
        
        if not self.account:
            raise ValueError("No account configured")
        
        logger.info(f"Recording provenance for NFT #{nft_token_id} by agent {agent_did}")
        logger.debug(f"Input CID: {input_cid}, Output CID: {output_cid}, Trace: {trace_cid}")
        
        # Convert roots to bytes32 if they're hex strings
        if isinstance(input_root, str):
            if input_root.startswith("0x"):
                input_root = bytes.fromhex(input_root[2:])
            else:
                input_root = bytes.fromhex(input_root)
        
        if isinstance(execution_root, str):
            if execution_root.startswith("0x"):
                execution_root = bytes.fromhex(execution_root[2:])
            else:
                execution_root = bytes.fromhex(execution_root)
        
        # Estimate gas
        try:            
            gas_estimate = self.provenance.functions.recordDerivative(
                nft_token_id,
                input_cid,
                input_root,
                output_cid,
                execution_root,
                trace_cid,
                agent_did,
                proof_cid
            ).estimate_gas({'from': self.account.address})
            gas_limit = int(gas_estimate * 1.5)
            logger.info(f"Gas estimate: {gas_estimate}, using limit: {gas_limit}")
        except Exception as e:
            logger.error(f"Gas estimation failed: {e}")
            gas_limit = 1000000  # Fallback
            logger.warning(f"Using fallback gas limit: {gas_limit}")
        
        # Build transaction
        tx = self.provenance.functions.recordDerivative(
            nft_token_id,
            input_cid,
            input_root,
            output_cid,
            execution_root,
            trace_cid,
            agent_did,
            proof_cid
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': gas_limit,
            'gasPrice': self.w3.eth.gas_price,
        })
        
        # Sign and send
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        logger.info(f"Provenance transaction sent: {tx_hash.hex()}")
        
        # Wait for confirmation
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        # Extract record ID from logs
        record_id = None
        if receipt['logs']:
            # Decode ProvenanceRecorded event
            event = self.provenance.events.ProvenanceRecorded()
            for log in receipt['logs']:
                try:
                    decoded = event.process_log(log)
                    record_id = decoded['args']['recordId']
                    logger.info(f"Provenance recorded with ID: {record_id}")
                    break
                except Exception:
                    continue
        
        if receipt['status'] == 1:
            logger.info(
                f"Provenance recorded successfully",
                extra={
                    'tx_hash': tx_hash.hex(),
                    'record_id': record_id,
                    'nft_token_id': nft_token_id,
                    'agent_did': agent_did,
                    'gas_used': receipt['gasUsed'],
                    'block_number': receipt['blockNumber']
                }
            )
        else:
            logger.error(f"Provenance recording failed: tx={tx_hash.hex()}")
        
        return {
            "tx_hash": tx_hash.hex(),
            "record_id": record_id,
            "block_number": receipt['blockNumber'],
            "gas_used": receipt['gasUsed']
        }
    
    async def get_records_by_nft(self, token_id: int) -> List[int]:
        """Get all provenance record IDs for an NFT"""
        if not self.provenance:
            raise ValueError("Provenance contract not loaded")
        
        return self.provenance.functions.getRecordsByNFT(token_id).call()
    
    async def get_record(self, record_id: int) -> Dict[str, Any]:
        """Get a specific provenance record"""
        if not self.provenance:
            raise ValueError("Provenance contract not loaded")
        
        record = self.provenance.functions.getRecord(record_id).call()
        
        return {
            "nftTokenId": record[0],
            "inputCID": record[1],
            "inputRoot": record[2].hex(),
            "outputCID": record[3],
            "executionRoot": record[4].hex(),
            "traceCID": record[5],
            "agentDIDHash": record[6].hex(),
            "executor": record[7],
            "timestamp": record[8],
            "proofCID": record[9],
            "verified": record[10]
        }
    
    async def record_document_on_chain(
        self,
        cid: str,
        document_hash: str,
        filename: str,
        file_size: int,
        token_id: int
    ) -> Dict[str, Any]:
        """
        Record document upload on CompanyDropbox contract
        
        Args:
            cid: IPFS content identifier
            document_hash: SHA256 hash of document
            filename: Original filename
            file_size: File size in bytes
            token_id: NFT token ID for authentication
            
        Returns:
            Dictionary with transaction details and document_id
        """
        if not self.company_dropbox:
            raise ValueError("CompanyDropbox contract not loaded")
        
        if not self.account:
            raise ValueError("No account configured")
        
        logger.info(f"Recording document on chain: {filename} (CID: {cid})")
        
        # Convert document hash string to bytes32
        if isinstance(document_hash, str):
            # Remove '0x' prefix if present
            hash_hex = document_hash.replace('0x', '')
            # Convert hex string to bytes32
            document_hash_bytes = bytes.fromhex(hash_hex)
        else:
            document_hash_bytes = document_hash
        
        # Estimate gas first
        try:
            gas_estimate = self.company_dropbox.functions.uploadDocument(
                cid,
                document_hash_bytes,
                filename,
                file_size
            ).estimate_gas({'from': self.account.address})
            
            # Add 50% buffer to gas estimate
            gas_limit = int(gas_estimate * 1.5)
            logger.info(f"Gas estimate: {gas_estimate}, using limit: {gas_limit}")
        except Exception as e:
            logger.error(f"Gas estimation failed: {e}")
            raise
        
        # Build transaction
        tx = self.company_dropbox.functions.uploadDocument(
            cid,
            document_hash_bytes,
            filename,
            file_size
        ).build_transaction({
            'from': self.account.address,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
            'gas': gas_limit,
        })
        
        # Sign and send
        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        logger.info(f"Transaction sent: {tx_hash.hex()}")
        
        # Wait for receipt
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt['status'] != 1:
            logger.error("Transaction failed")
            raise Exception("Document recording transaction failed")
        
        # Parse DocumentUploaded event to get document_id
        document_id = None
        for log in receipt['logs']:
            try:
                event = self.company_dropbox.events.DocumentUploaded().process_log(log)
                document_id = event['args']['documentId']
                logger.info(f"Document recorded with ID: {document_id}")
                break
            except:
                continue
        
        return {
            "tx_hash": tx_hash.hex(),
            "block_number": receipt['blockNumber'],
            "gas_used": receipt['gasUsed'],
            "document_id": document_id,
            "cid": cid,
            "filename": filename
        }
    
    def verify_document_on_chain(self, tx_hash: str, expected_block: int, expected_data: Dict[str, Any]) -> bool:
        """
        Verify a cached document exists on blockchain with matching data
        Used to detect cache tampering
        
        Args:
            tx_hash: Transaction hash from cache
            expected_block: Block number from cache
            expected_data: Document data from cache (ipfs_hash, document_hash, etc.)
            
        Returns:
            True if document verified on chain, False if tampered
        """
        try:
            # Get transaction receipt from blockchain
            receipt = self.w3.eth.get_transaction_receipt(tx_hash)
            
            # Verify block number matches
            if receipt['blockNumber'] != expected_block:
                logger.warning(f"Block mismatch for tx {tx_hash}: expected {expected_block}, got {receipt['blockNumber']}")
                return False
            
            # Verify transaction succeeded
            if receipt['status'] != 1:
                logger.warning(f"Transaction {tx_hash} failed on chain")
                return False
            
            # Verify event exists in logs
            event_signature = self.w3.keccak(text="DocumentUploaded(uint256,address,uint256,string,bytes32,string)").hex()
            
            for log in receipt['logs']:
                try:
                    if log['topics'][0].hex() == event_signature:
                        # Parse event data
                        decoded = self.company_dropbox.events.DocumentUploaded().process_log(log)
                        args = decoded['args']
                        
                        # Verify document data matches cache
                        if (args['ipfsHash'] == expected_data.get('ipfs_hash') and
                            args['documentHash'].hex() if isinstance(args['documentHash'], bytes) else args['documentHash'] == expected_data.get('document_hash') and
                            args['fileName'] == expected_data.get('filename')):
                            logger.debug(f"Document verified: tx {tx_hash}")
                            return True
                        else:
                            logger.warning(f"Document data mismatch for tx {tx_hash}")
                            return False
                except Exception as e:
                    # Not our event or parsing error
                    continue
            
            logger.warning(f"DocumentUploaded event not found in tx {tx_hash}")
            return False
            
        except Exception as e:
            logger.error(f"Error verifying document on chain: {e}")
            return False
    
    async def get_user_documents(self, user_address: str) -> list[Dict[str, Any]]:
        """
        Get all documents uploaded by a user using hybrid cache approach:
        1. Check SQLite cache first
        2. Verify random 10% sample against blockchain
        3. Query only new blocks since last sync
        4. Update cache with new documents
        
        Args:
            user_address: Ethereum address of the user
            
        Returns:
            List of document records with metadata
        """
        if not self.company_dropbox:
            raise ValueError("CompanyDropbox contract not loaded")
        
        logger.info(f"Fetching documents for user: {user_address}")
        
        try:
            # Step 1: Check cache first
            cached_docs = self.db.get_user_documents(user_address)
            logger.info(f"Cache hit: {len(cached_docs)} documents")
            
            # Step 2: Random verification (10% sample) to detect tampering
            if cached_docs:
                verification_rate = float(os.getenv("CACHE_VERIFICATION_RATE", "0.1"))
                sample_size = max(1, int(len(cached_docs) * verification_rate))
                sample_docs = random.sample(cached_docs, sample_size)
                
                logger.info(f"Verifying {len(sample_docs)}/{len(cached_docs)} documents")
                
                for doc in sample_docs:
                    is_valid = self.verify_document_on_chain(
                        doc['tx_hash'],
                        doc['block_number'],
                        doc
                    )
                    
                    if not is_valid:
                        logger.warning(f"Cache tampered! Document {doc['document_id']} failed verification. Clearing cache.")
                        self.db.clear_user_cache(user_address)
                        cached_docs = []
                        break
                else:
                    logger.info(f"Verified {len(sample_docs)}/{len(cached_docs)} documents - all valid")
            
            # Step 3: Incremental sync - query only new blocks
            current_block = self.w3.eth.block_number
            logger.info(f"Current block: {current_block}")
            
            # Get last synced block, default to deployment block
            DEPLOYMENT_BLOCK = int(os.getenv("COMPANY_DROPBOX_DEPLOYMENT_BLOCK", "219187000"))
            last_synced_block = self.db.get_last_synced_block(user_address)
            from_block = last_synced_block + 1 if last_synced_block else DEPLOYMENT_BLOCK
            
            # Only query if there are new blocks
            new_documents = []
            if current_block >= from_block:
                logger.info(f"Syncing blocks {from_block} to {current_block} ({current_block - from_block + 1} blocks)")
                
                # Query in batches to avoid Somnia's 1000 block limit
                BATCH_SIZE = int(os.getenv("BLOCKCHAIN_QUERY_BATCH_SIZE", "500"))
                
                for batch_start in range(from_block, current_block + 1, BATCH_SIZE):
                    batch_end = min(batch_start + BATCH_SIZE - 1, current_block)
                    
                    try:
                        event_filter = self.company_dropbox.events.DocumentUploaded.create_filter(
                            from_block=batch_start,
                            to_block=batch_end,
                            argument_filters={'uploader': user_address}
                        )
                        
                        batch_events = event_filter.get_all_entries()
                        
                        if batch_events:
                            logger.info(f"Found {len(batch_events)} new events in batch {batch_start}-{batch_end}")
                            
                            # Process new events
                            for event in batch_events:
                                args = event['args']
                                
                                # Get block timestamp
                                block = self.w3.eth.get_block(event['blockNumber'])
                                
                                doc = {
                                    "user_address": user_address,
                                    "document_id": args['documentId'],
                                    "filename": args['fileName'],
                                    "ipfs_hash": args['ipfsHash'],
                                    "document_hash": args['documentHash'].hex() if isinstance(args['documentHash'], bytes) else args['documentHash'],
                                    "token_id": args['tokenId'],
                                    "timestamp": block['timestamp'],
                                    "tx_hash": event['transactionHash'].hex(),
                                    "block_number": event['blockNumber']
                                }
                                new_documents.append(doc)
                                
                    except Exception as batch_error:
                        logger.warning(f"Error in batch {batch_start}-{batch_end}: {batch_error}")
                        continue
                
                # Step 4: Update cache with new documents
                if new_documents:
                    self.db.insert_documents_batch(new_documents)
                    logger.info(f"Cached {len(new_documents)} new documents")
                    
                # Update sync status
                self.db.update_sync_status(user_address, current_block)
                logger.info(f"Updated sync status to block {current_block}")
            else:
                logger.info("No new blocks to sync")
            
            # Step 5: Combine cached and new documents
            all_documents = cached_docs + new_documents
            
            # Sort by timestamp descending (most recent first)
            all_documents.sort(key=lambda x: x['timestamp'], reverse=True)
            
            logger.info(f"Returning {len(all_documents)} total documents ({len(cached_docs)} cached, {len(new_documents)} new)")
            
            return all_documents
            
        except Exception as e:
            logger.error(f"Error fetching documents: {e}")
            # Return empty list instead of raising error - graceful handling for no documents
            return []


# ============ Example Usage ============

async def example_usage():
    """Demonstrate blockchain operations"""
    
    client = SomniaClient()
    
    # Check NFT ownership
    owns_nft = await client.check_nft_ownership(
        token_id=1,
        user_address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    )
    print(f"Owns NFT: {owns_nft}")
    
    # Register agent
    tx_hash = await client.register_agent(
        did="did:key:z6Mk...",
        name="Test Agent",
        metadata_cid="QmXYZ..."
    )
    print(f"Agent registered: {tx_hash}")
    
    # Record provenance
    result = await client.record_provenance(
        nft_token_id=1,
        input_cid="QmABC...",
        input_root="0x1234...",
        output_cid="QmDEF...",
        execution_root="0x5678...",
        trace_cid="QmGHI...",
        agent_did="did:key:z6Mk..."
    )
    print(f"Provenance recorded: {result}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())

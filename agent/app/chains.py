"""
Somnia blockchain interaction
Handles contract calls and transactions
"""

import os
import json
import logging
from typing import Optional, Dict, Any, List
from pathlib import Path

from web3 import Web3
from web3.contract import Contract
from eth_account import Account

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
        
        # Load contracts
        self.access_nft = self._load_contract("AccessNFT", self.access_nft_address)
        self.agent_registry = self._load_contract("AgentRegistry", self.agent_registry_address)
        self.provenance = self._load_contract("Provenance", self.provenance_address)
    
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
    
    async def check_nft_ownership(self, token_id: int, user_address: str) -> bool:
        """Check if user owns a specific NFT"""
        if not self.access_nft:
            raise ValueError("AccessNFT contract not loaded")
        
        try:
            owner = self.access_nft.functions.ownerOf(token_id).call()
            return owner.lower() == user_address.lower()
        except Exception:
            return False
    
    async def get_document_cid(self, token_id: int) -> str:
        """Get document CID from NFT metadata"""
        if not self.access_nft:
            raise ValueError("AccessNFT contract not loaded")
        
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
        tx_hash = self.w3.eth.send_raw_transaction(signed.rawTransaction)
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
            raise ValueError("AgentRegistry contract not loaded")
        
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

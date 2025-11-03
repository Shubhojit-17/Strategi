"""
Test agent registration step by step
"""
import asyncio
import os
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv
import json
from pathlib import Path

load_dotenv()

async def test_registration():
    # Setup
    rpc_url = "https://dream-rpc.somnia.network"
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    private_key = os.getenv("DEPLOYER_PRIVATE_KEY")
    account = Account.from_key(private_key)
    
    registry_address = os.getenv("AGENT_REGISTRY_ADDRESS")
    did = os.getenv("AGENT_DID")
    
    print("=" * 60)
    print("AGENT REGISTRATION TEST")
    print("=" * 60)
    print(f"Network: Somnia L1")
    print(f"RPC: {rpc_url}")
    print(f"Account: {account.address}")
    print(f"Balance: {w3.eth.get_balance(account.address) / 10**18} STT")
    print(f"Registry: {registry_address}")
    print(f"DID: {did}")
    print("=" * 60)
    
    # Load contract ABI
    abi_path = Path(__file__).parent.parent / "contracts" / "artifacts" / "src" / "AgentRegistry.sol" / "AgentRegistry.json"
    with open(abi_path) as f:
        artifact = json.load(f)
        abi = artifact["abi"]
    
    contract = w3.eth.contract(address=registry_address, abi=abi)
    
    # Check if already registered
    did_hash = w3.keccak(text=did).hex()
    print(f"\nDID Hash: {did_hash}")
    
    try:
        is_active = contract.functions.isActiveAgent(did).call()
        print(f"Currently registered: {is_active}")
    except Exception as e:
        print(f"Error checking registration: {e}")
    
    # Try to get the claim
    try:
        claim = contract.functions.claims(did_hash).call()
        print(f"\nExisting claim: {claim}")
        if claim[5] != 0:  # timestamp field
            print("⚠️  Agent already registered!")
            print(f"   Controller: {claim[1]}")
            print(f"   Name: {claim[3]}")
            print(f"   Active: {claim[4]}")
            print(f"   Timestamp: {claim[5]}")
            return
    except Exception as e:
        print(f"Error reading claim: {e}")
    
    # Register agent
    print("\n" + "=" * 60)
    print("REGISTERING AGENT...")
    print("=" * 60)
    
    name = "Somnia AI Agent"
    metadata_uri = "ipfs://QmTestMetadata"
    
    try:
        # Build transaction
        tx = contract.functions.registerAgent(
            did,
            name,
            metadata_uri
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': 500000,
            'gasPrice': w3.eth.gas_price,
        })
        
        print(f"Gas price: {w3.eth.gas_price / 10**9} Gwei")
        print(f"Estimated gas: {tx['gas']}")
        print(f"Nonce: {tx['nonce']}")
        
        # Sign transaction
        signed = account.sign_transaction(tx)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        print(f"\nTransaction sent: {tx_hash.hex()}")
        
        # Wait for confirmation
        print("Waiting for confirmation...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        print("\n" + "=" * 60)
        print("TRANSACTION RECEIPT")
        print("=" * 60)
        print(f"Status: {receipt['status']} {'✅ SUCCESS' if receipt['status'] == 1 else '❌ FAILED'}")
        print(f"Block: {receipt['blockNumber']}")
        print(f"Gas used: {receipt['gasUsed']}")
        print(f"Tx hash: {receipt['transactionHash'].hex()}")
        print(f"Events emitted: {len(receipt['logs'])}")
        
        if receipt['status'] == 0:
            print("\n❌ Transaction REVERTED")
            print("Possible reasons:")
            print("  - Agent already registered")
            print("  - Invalid DID format")
            print("  - Insufficient gas")
            return
        
        # Verify registration
        print("\n" + "=" * 60)
        print("VERIFICATION")
        print("=" * 60)
        
        is_active = contract.functions.isActiveAgent(did).call()
        print(f"isActiveAgent: {is_active}")
        
        claim = contract.functions.claims(did_hash).call()
        print(f"\nClaim details:")
        print(f"  didHash: {claim[0].hex()}")
        print(f"  controller: {claim[1]}")
        print(f"  metadataURI: {claim[2]}")
        print(f"  name: {claim[3]}")
        print(f"  isActive: {claim[4]}")
        print(f"  timestamp: {claim[5]}")
        print(f"  executionCount: {claim[6]}")
        
        if is_active:
            print("\n✅ AGENT SUCCESSFULLY REGISTERED!")
        else:
            print("\n❌ Agent not active after registration")
            
    except Exception as e:
        print(f"\n❌ Error during registration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_registration())

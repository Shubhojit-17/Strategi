"""
Test with different DID formats to find the issue
"""
import asyncio
import os
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv
import json
from pathlib import Path

load_dotenv()

async def test_did_formats():
    rpc_url = "https://dream-rpc.somnia.network"
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    private_key = os.getenv("DEPLOYER_PRIVATE_KEY")
    account = Account.from_key(private_key)
    registry_address = os.getenv("AGENT_REGISTRY_ADDRESS")
    
    # Load contract
    abi_path = Path(__file__).parent.parent / "contracts" / "artifacts" / "src" / "AgentRegistry.sol" / "AgentRegistry.json"
    with open(abi_path) as f:
        artifact = json.load(f)
        abi = artifact["abi"]
    
    contract = w3.eth.contract(address=registry_address, abi=abi)
    
    # Test different DIDs
    test_dids = [
        "did:key:testAgent1",
        "did:key:simple",
        os.getenv("AGENT_DID")
    ]
    
    for did in test_dids:
        print(f"\n{'='*60}")
        print(f"Testing DID: {did}")
        print(f"{'='*60}")
        
        # Check if already registered
        try:
            is_active = contract.functions.isActiveAgent(did).call()
            print(f"Already registered: {is_active}")
            
            if is_active:
                print("✅ This DID is already registered and active!")
                continue
        except Exception as e:
            print(f"Check error: {e}")
        
        # Try to register
        try:
            tx = contract.functions.registerAgent(
                did,
                f"Test Agent {did[-10:]}",
                "ipfs://QmTest"
            ).build_transaction({
                'from': account.address,
                'nonce': w3.eth.get_transaction_count(account.address),
                'gas': 500000,
                'gasPrice': w3.eth.gas_price,
            })
            
            signed = account.sign_transaction(tx)
            tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
            print(f"TX sent: {tx_hash.hex()}")
            
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
            
            if receipt['status'] == 1:
                print("✅ SUCCESS!")
                
                # Verify
                is_active = contract.functions.isActiveAgent(did).call()
                print(f"Verified active: {is_active}")
                
                if is_active:
                    print(f"\n🎉 FOUND WORKING DID FORMAT: {did}")
                    return did
            else:
                print(f"❌ FAILED - Status: {receipt['status']}")
                print(f"Gas used: {receipt['gasUsed']}")
                
        except Exception as e:
            print(f"Error: {e}")
    
    return None

if __name__ == "__main__":
    working_did = asyncio.run(test_did_formats())
    if working_did:
        print(f"\n\n✅ WORKING DID: {working_did}")
        print("Update your .env with this DID!")
    else:
        print("\n\n❌ No working DID format found")

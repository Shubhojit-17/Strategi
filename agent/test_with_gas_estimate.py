"""
Test registration with higher gas limit and detailed logging
"""
import asyncio
import os
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv
import json
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agent_registration.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

load_dotenv()

async def test_with_gas_estimate():
    logger.info("="*60)
    logger.info("AGENT REGISTRATION TEST - GAS ESTIMATION")
    logger.info("="*60)
    
    rpc_url = "https://dream-rpc.somnia.network"
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    private_key = os.getenv("DEPLOYER_PRIVATE_KEY")
    account = Account.from_key(private_key)
    registry_address = os.getenv("AGENT_REGISTRY_ADDRESS")
    did = "did:key:testAgent123"  # Simple test DID
    
    logger.info(f"Network: Somnia L1")
    logger.info(f"Account: {account.address}")
    logger.info(f"Balance: {w3.eth.get_balance(account.address) / 10**18} STT")
    logger.info(f"Registry: {registry_address}")
    logger.info(f"DID: {did}")
    
    # Load contract
    abi_path = Path(__file__).parent.parent / "contracts" / "artifacts" / "src" / "AgentRegistry.sol" / "AgentRegistry.json"
    with open(abi_path) as f:
        artifact = json.load(f)
        abi = artifact["abi"]
    
    contract = w3.eth.contract(address=registry_address, abi=abi)
    
    # Estimate gas
    try:
        logger.info("\nEstimating gas...")
        gas_estimate = contract.functions.registerAgent(
            did,
            "Test Agent",
            "ipfs://QmTest"
        ).estimate_gas({
            'from': account.address
        })
        logger.info(f"✅ Gas estimate: {gas_estimate}")
        
        # Add 50% buffer
        gas_limit = int(gas_estimate * 1.5)
        logger.info(f"Using gas limit: {gas_limit} (estimate + 50%)")
        
    except Exception as e:
        logger.error(f"❌ Gas estimation failed: {e}")
        logger.error("This usually means the transaction will revert")
        logger.error("Possible reasons:")
        logger.error("  - Agent already registered")
        logger.error("  - Invalid parameters")
        logger.error("  - Contract logic error")
        return False
    
    # Register with estimated gas
    try:
        logger.info("\n" + "="*60)
        logger.info("SENDING REGISTRATION TRANSACTION")
        logger.info("="*60)
        
        tx = contract.functions.registerAgent(
            did,
            "Test Agent",
            "ipfs://QmTest"
        ).build_transaction({
            'from': account.address,
            'nonce': w3.eth.get_transaction_count(account.address),
            'gas': gas_limit,
            'gasPrice': w3.eth.gas_price,
        })
        
        logger.info(f"Gas limit: {tx['gas']}")
        logger.info(f"Gas price: {tx['gasPrice'] / 10**9} Gwei")
        logger.info(f"Nonce: {tx['nonce']}")
        
        signed = account.sign_transaction(tx)
        tx_hash = w3.eth.send_raw_transaction(signed.rawTransaction)
        logger.info(f"TX sent: {tx_hash.hex()}")
        
        logger.info("Waiting for confirmation...")
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        
        logger.info("\n" + "="*60)
        logger.info("TRANSACTION RECEIPT")
        logger.info("="*60)
        logger.info(f"Status: {receipt['status']} {'✅ SUCCESS' if receipt['status'] == 1 else '❌ FAILED'}")
        logger.info(f"Block: {receipt['blockNumber']}")
        logger.info(f"Gas used: {receipt['gasUsed']} / {gas_limit}")
        logger.info(f"Tx hash: {receipt['transactionHash'].hex()}")
        
        if receipt['status'] == 1:
            logger.info("✅ REGISTRATION SUCCESSFUL!")
            
            # Verify
            is_active = contract.functions.isActiveAgent(did).call()
            logger.info(f"Verified active: {is_active}")
            
            if is_active:
                logger.info(f"\n🎉 Agent registered successfully: {did}")
                return True
        else:
            logger.error("❌ Transaction failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    success = asyncio.run(test_with_gas_estimate())
    if success:
        logger.info("\n✅ TEST PASSED - Agent registration works!")
    else:
        logger.error("\n❌ TEST FAILED - Need to debug contract")

from web3 import Web3
import os
from dotenv import load_dotenv

load_dotenv()

w3 = Web3(Web3.HTTPProvider("https://dream-rpc.somnia.network"))

# Check both transaction hashes
tx_hashes = [
    "0xbb4ed85008ceb169ebbf0f503c198e991d313e6623d71fead755fb9d327",  # First attempt
    "0x5609dab83071e589640eff5df223b6fd91d184c0272f6f8567e5800cd25"   # Second attempt
]

for tx_hash in tx_hashes:
    print(f"\nChecking transaction: {tx_hash}...")
    try:
        # Add full hash if truncated
        if len(tx_hash) < 66:
            print("  Note: Transaction hash appears truncated")
            continue
            
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        print(f"  Status: {receipt['status']} (1 = success, 0 = reverted)")
        print(f"  Gas used: {receipt['gasUsed']}")
        print(f"  Block: {receipt['blockNumber']}")
        print(f"  Logs: {len(receipt['logs'])} events emitted")
        
        if receipt['status'] == 0:
            print("  ❌ Transaction REVERTED")
        else:
            print("  ✅ Transaction SUCCESS")
            
    except Exception as e:
        print(f"  Error: {e}")

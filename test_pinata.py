import os
from dotenv import load_dotenv
import requests

load_dotenv('agent/.env')

PINATA_JWT = os.getenv('PINATA_JWT')

if not PINATA_JWT or PINATA_JWT == 'your_pinata_jwt_token_here':
    print("❌ Error: PINATA_JWT not set in agent/.env")
    print("Please add your Pinata JWT token to agent/.env file")
    exit(1)

print("🔍 Testing Pinata connection...")
print(f"📝 JWT length: {len(PINATA_JWT)} characters")

# Test upload
url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
headers = {
    "Authorization": f"Bearer {PINATA_JWT}",
    "Content-Type": "application/json"
}
data = {
    "pinataContent": {
        "test": "Hello from Somnia AI!",
        "timestamp": "2025-11-01",
        "project": "Verifiable AI Agents"
    },
    "pinataMetadata": {
        "name": "test-connection.json"
    }
}

try:
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print("\n✅ Pinata connected successfully!")
        print(f"📦 CID: {result['IpfsHash']}")
        print(f"📏 Size: {result.get('PinSize', 'N/A')} bytes")
        print(f"⏰ Timestamp: {result.get('Timestamp', 'N/A')}")
        print(f"\n🔗 View your file at:")
        print(f"   https://gateway.pinata.cloud/ipfs/{result['IpfsHash']}")
        print(f"   https://ipfs.io/ipfs/{result['IpfsHash']}")
    else:
        print(f"\n❌ Error: {response.status_code}")
        print(f"Response: {response.text}")
        if response.status_code == 401:
            print("\n💡 Tip: Check that your JWT token is correct and has 'pinFileToIPFS' permission")
        elif response.status_code == 429:
            print("\n💡 Tip: Rate limit exceeded. Wait a few seconds and try again")
            
except Exception as e:
    print(f"\n❌ Connection error: {e}")
    print("💡 Tip: Check your internet connection")

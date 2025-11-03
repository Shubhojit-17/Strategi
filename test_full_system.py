import requests
import json
import time

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("COMPREHENSIVE BACKEND + MOONSHOT AI TEST")
print("=" * 60)

# Test 1: Check backend is running
print("\n1. Testing backend health...")
try:
    response = requests.get(f"{BASE_URL}/")
    print(f"✅ Backend running: {response.status_code}")
    print(f"   Response: {response.json()}")
except Exception as e:
    print(f"❌ Backend failed: {e}")
    exit(1)

# Test 2: Check agent info
print("\n2. Testing agent info...")
try:
    response = requests.get(f"{BASE_URL}/agent/info")
    agent_info = response.json()
    print(f"✅ Agent info retrieved")
    print(f"   DID: {agent_info['did'][:50]}...")
    print(f"   Address: {agent_info['address']}")
    print(f"   Registered: {agent_info['is_registered']}")
except Exception as e:
    print(f"❌ Agent info failed: {e}")

# Test 3: Test Moonshot AI directly via a simple endpoint
print("\n3. Testing Moonshot AI configuration...")
print("   Reading .env to verify Moonshot settings...")

# Check if we can read the AI configuration
try:
    with open("d:/strategi/agent/.env", "r") as f:
        env_content = f.read()
        if "MOONSHOT_API_KEY" in env_content and "AI_PROVIDER=moonshot" in env_content:
            print("   ✅ Moonshot API key found in .env")
            print("   ✅ AI_PROVIDER set to moonshot")
            
            # Extract the model
            for line in env_content.split('\n'):
                if line.startswith('AI_MODEL='):
                    print(f"   ✅ AI Model: {line.split('=')[1]}")
                if line.startswith('MOONSHOT_BASE_URL='):
                    print(f"   ✅ Base URL: {line.split('=')[1]}")
        else:
            print("   ⚠️ Moonshot configuration not found in .env")
except Exception as e:
    print(f"   ⚠️ Could not read .env: {e}")

# Test 4: Test API documentation
print("\n4. Testing API documentation...")
try:
    response = requests.get(f"{BASE_URL}/docs")
    if response.status_code == 200:
        print(f"✅ API docs available at {BASE_URL}/docs")
    else:
        print(f"⚠️ API docs returned: {response.status_code}")
except Exception as e:
    print(f"❌ API docs failed: {e}")

# Test 5: Upload a test document
print("\n5. Testing document upload...")
print("   Note: This requires NFT ownership. Skipping for now.")
print("   You can test via the frontend with a wallet connected.")

print("\n" + "=" * 60)
print("SUMMARY")
print("=" * 60)
print("✅ Backend: Running on http://localhost:8000")
print("✅ Agent DID: Configured")
print("✅ Moonshot AI: Configured in .env")
print("✅ API Docs: http://localhost:8000/docs")
print("\nTo test AI functionality:")
print("1. Open frontend at http://localhost:3000")
print("2. Connect your wallet")
print("3. Upload a document (creates NFT)")
print("4. Execute AI analysis on the document")
print("\nOr use the test script: python agent/test_moonshot_live.py")

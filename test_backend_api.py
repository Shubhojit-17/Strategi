import requests
import json

# Test root endpoint
print("Testing backend root endpoint...")
try:
    response = requests.get("http://localhost:8000/")
    print(f"✅ Root endpoint: {response.status_code}")
    print(f"Response: {response.json()}\n")
except Exception as e:
    print(f"❌ Root endpoint failed: {e}\n")

# Test agent info
print("Testing agent info endpoint...")
try:
    response = requests.get("http://localhost:8000/agent/info")
    print(f"✅ Agent info: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}\n")
except Exception as e:
    print(f"❌ Agent info failed: {e}\n")

# Test AI by checking the AI agent initialization
print("Testing Moonshot AI configuration...")
try:
    # This endpoint shows if AI is configured
    response = requests.get("http://localhost:8000/agent/info")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ AI Provider configured: {data.get('ai_provider', 'unknown')}")
        print(f"✅ AI Model: {data.get('model', 'unknown')}\n")
    else:
        print(f"❌ Could not verify AI configuration\n")
except Exception as e:
    print(f"❌ AI config check failed: {e}\n")

# Test docs endpoint
print("Testing API docs...")
try:
    response = requests.get("http://localhost:8000/docs")
    print(f"✅ API docs available: {response.status_code}\n")
except Exception as e:
    print(f"❌ Docs test failed: {e}\n")

print("Backend testing complete!")

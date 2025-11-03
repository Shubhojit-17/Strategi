import sys
sys.path.insert(0, r'D:\strategi\agent')

from fastapi.testclient import TestClient
from app.main import app
from pathlib import Path

client = TestClient(app)

# Create test file
test_file = Path("test-upload.txt")
test_file.write_text("Test document for Somnia AI Agents")

print("Testing upload endpoint...")
with open(test_file, "rb") as f:
    response = client.post(
        "/documents/upload",
        files={"file": ("test.txt", f, "text/plain")}
    )

print(f"Status: {response.status_code}")
print(f"Response: {response.text}")

if response.status_code == 200:
    data = response.json()
    print(f"✅ SUCCESS!")
    print(f"CID: {data['cid']}")
    print(f"Gateway: {data['gateway_url']}")
else:
    print(f"❌ FAILED")

"""Test complete workflow with PDF"""
import requests
import json

BACKEND = "http://localhost:8000"
WALLET = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
PDF_PATH = r"d:\strategi\DevTrack_Hackathon_Presentation[1].pdf"

print("=" * 60)
print("TESTING COMPLETE WORKFLOW")
print("=" * 60)

# 1. Upload PDF
print("\n1. Uploading PDF...")
with open(PDF_PATH, 'rb') as f:
    upload_resp = requests.post(
        f"{BACKEND}/documents/upload",
        files={'file': ('test.pdf', f, 'application/pdf')},
        data={'wallet_address': WALLET}
    )

print(f"Status: {upload_resp.status_code}")
if upload_resp.status_code == 200:
    upload_data = upload_resp.json()
    print(f"CID: {upload_data['cid']}")
    cid = upload_data['cid']
else:
    print(f"Error: {upload_resp.text}")
    exit(1)

# 2. Execute AI
print("\n2. Executing AI with Mistral...")
exec_resp = requests.post(
    f"{BACKEND}/execute",
    json={
        'task': 'Summarize this document in one paragraph',
        'wallet_address': WALLET,
        'document_cid': cid,
        'provider': 'mistral',
        'model': 'mistralai/mistral-7b-instruct:free'
    }
)

print(f"Status: {exec_resp.status_code}")
if exec_resp.status_code == 200:
    exec_data = exec_resp.json()
    print(f"\n✅ SUCCESS!")
    print(f"Record ID: {exec_data.get('record_id')}")
    print(f"TX Hash: {exec_data['tx_hash']}")
    print(f"Output CID: {exec_data['output_cid']}")
    print(f"\nAI Output:\n{exec_data['output_text']}")
else:
    print(f"❌ FAILED")
    print(f"Error: {exec_resp.text[:500]}")
    
print("\n" + "=" * 60)

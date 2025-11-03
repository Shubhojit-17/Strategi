import asyncio
from pathlib import Path
import sys
sys.path.insert(0, r'D:\strategi\agent')

from app.ipfs import IPFSClient
from dotenv import load_dotenv
import os

load_dotenv()

async def test():
    try:
        client = IPFSClient(use_pinata=True)
        print(f"IPFS Client created, JWT: {client.pinata_jwt[:20]}...")
        
        # Create test file
        test_file = Path("test-upload.txt")
        test_file.write_text("Test document for Somnia")
        
        print(f"Testing upload of {test_file.name}")
        cid = await client.upload_file(test_file, metadata={"name": "test.txt"})
        print(f"SUCCESS! CID: {cid}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

asyncio.run(test())

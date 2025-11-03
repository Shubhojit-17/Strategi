import httpx
import asyncio

async def test_upload():
    async with httpx.AsyncClient() as client:
        with open("test-upload.txt", "rb") as f:
            files = {"file": ("test.txt", f, "text/plain")}
            try:
                response = await client.post(
                    "http://localhost:8000/documents/upload",
                    files=files,
                    timeout=30.0
                )
                print(f"Status: {response.status_code}")
                print(f"Response: {response.text}")
            except Exception as e:
                print(f"Error: {e}")

asyncio.run(test_upload())

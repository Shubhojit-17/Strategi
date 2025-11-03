"""
IPFS Client for document storage
Supports Pinata and local IPFS node
"""

import os
import json
import logging
import httpx
from typing import Optional, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class IPFSClient:
    """Wrapper for IPFS operations (Pinata or local node)"""
    
    def __init__(
        self,
        use_pinata: bool = True,
        pinata_jwt: Optional[str] = None,
        ipfs_gateway: str = "https://ipfs.io/ipfs/"
    ):
        self.use_pinata = use_pinata
        self.pinata_jwt = pinata_jwt or os.getenv("PINATA_JWT")
        self.ipfs_gateway = ipfs_gateway
        
        if use_pinata and not self.pinata_jwt:
            raise ValueError("PINATA_JWT not provided")
        
        logger.info(f"IPFS client initialized: {'Pinata' if use_pinata else 'Local node'}")
    
    async def upload_file(
        self,
        file_path: Path,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Upload file to IPFS
        
        Returns:
            CID (content identifier)
        """
        if self.use_pinata:
            return await self._upload_to_pinata(file_path, metadata)
        else:
            return await self._upload_to_local_node(file_path)
    
    async def upload_json(
        self,
        data: Dict[str, Any],
        filename: str = "data.json"
    ) -> str:
        """
        Upload JSON data to IPFS
        
        Returns:
            CID
        """
        if self.use_pinata:
            return await self._upload_json_to_pinata(data, filename)
        else:
            return await self._upload_json_to_local_node(data)
    
    async def _upload_to_pinata(
        self,
        file_path: Path,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Upload file to Pinata"""
        url = "https://api.pinata.cloud/pinning/pinFileToIPFS"
        
        headers = {
            "Authorization": f"Bearer {self.pinata_jwt}"
        }
        
        try:
            # Read file content first
            with open(file_path, "rb") as f:
                file_content = f.read()
            
            # Prepare multipart data
            files = {"file": (file_path.name, file_content)}
            
            # Optional metadata
            data = {}
            if metadata:
                data["pinataMetadata"] = json.dumps({
                    "name": metadata.get("name", file_path.name),
                    "keyvalues": metadata.get("keyvalues", {})
                })
            
            logger.info(f"Uploading file to Pinata: {file_path.name}, size: {len(file_content)} bytes")
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    url,
                    headers=headers,
                    files=files,
                    data=data
                )
                response.raise_for_status()
                result = response.json()
                cid = result["IpfsHash"]
                logger.info(f"File uploaded successfully: CID={cid}")
                return cid
        except Exception as e:
            logger.error(f"Pinata upload failed: {str(e)}", exc_info=True)
            raise
    
    async def _upload_json_to_pinata(
        self,
        data: Dict[str, Any],
        filename: str
    ) -> str:
        """Upload JSON to Pinata"""
        url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
        
        headers = {
            "Authorization": f"Bearer {self.pinata_jwt}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "pinataContent": data,
            "pinataMetadata": {
                "name": filename
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            result = response.json()
            return result["IpfsHash"]
    
    async def _upload_to_local_node(self, file_path: Path) -> str:
        """Upload to local IPFS node via HTTP API"""
        url = "http://127.0.0.1:5001/api/v0/add"
        
        with open(file_path, "rb") as f:
            files = {"file": f}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, files=files)
                response.raise_for_status()
                result = response.json()
                return result["Hash"]
    
    async def _upload_json_to_local_node(self, data: Dict[str, Any]) -> str:
        """Upload JSON to local IPFS node"""
        import tempfile
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(data, f)
            temp_path = f.name
        
        try:
            cid = await self._upload_to_local_node(Path(temp_path))
            return cid
        finally:
            os.unlink(temp_path)
    
    async def fetch(self, cid: str) -> bytes:
        """Fetch content from IPFS by CID"""
        url = f"{self.ipfs_gateway}{cid}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.content
    
    async def fetch_json(self, cid: str) -> Dict[str, Any]:
        """Fetch JSON content from IPFS"""
        content = await self.fetch(cid)
        return json.loads(content.decode('utf-8'))
    
    def get_gateway_url(self, cid: str) -> str:
        """Get HTTP gateway URL for a CID"""
        return f"{self.ipfs_gateway}{cid}"


# ============ Example Usage ============

async def example_usage():
    """Demonstrate IPFS operations"""
    import tempfile
    
    # Create client (use Pinata in production)
    client = IPFSClient(
        use_pinata=True,
        pinata_jwt=os.getenv("PINATA_JWT")
    )
    
    # Upload JSON
    data = {
        "title": "My Document",
        "content": "This is test content",
        "timestamp": 1234567890
    }
    
    cid = await client.upload_json(data, "test.json")
    print(f"Uploaded JSON: {cid}")
    print(f"Gateway URL: {client.get_gateway_url(cid)}")
    
    # Fetch back
    fetched = await client.fetch_json(cid)
    print(f"Fetched: {fetched}")
    
    # Upload file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("Hello from IPFS!")
        temp_path = f.name
    
    try:
        file_cid = await client.upload_file(
            Path(temp_path),
            metadata={
                "name": "greeting.txt",
                "keyvalues": {"type": "test"}
            }
        )
        print(f"Uploaded file: {file_cid}")
    finally:
        os.unlink(temp_path)


if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())

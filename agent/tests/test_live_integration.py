# Test AI execution with all providers - LIVE APIs only
import pytest
import asyncio
import os
from httpx import AsyncClient

# Test configuration
API_BASE_URL = "http://localhost:8000"
TIMEOUT = 60.0

@pytest.mark.asyncio
async def test_moonshot_execution_live():
    """Test AI execution with LIVE Moonshot AI via OpenRouter"""
    print("\n🧪 Testing Moonshot AI (Live OpenRouter API)")
    
    # Import agent directly
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    
    from app.agent import AIAgent
    
    # Create agent with Moonshot provider
    agent = AIAgent(provider="moonshot")
    
    # Test simple query
    print("   Query: What is 5+7? Reply with only the number.")
    result = await agent.execute(
        prompt="What is 5+7? Reply with only the number.",
        context="Simple math test"
    )
    
    print(f"   Response: {result}")
    
    # Verify result
    assert result is not None
    assert len(result) > 0
    assert "12" in result
    
    print("✅ Moonshot AI execution successful")

@pytest.mark.asyncio
async def test_moonshot_document_analysis():
    """Test Moonshot with document analysis"""
    print("\n🧪 Testing Moonshot document analysis")
    
    import sys
    from pathlib import Path
    sys.path.insert(0, str(Path(__file__).parent.parent))
    
    from app.agent import AIAgent
    
    agent = AIAgent(provider="moonshot")
    
    context = """
    Somnia is a high-performance blockchain designed for AI applications.
    It features sub-second finality and EVM compatibility.
    Developers can deploy smart contracts using Solidity.
    """
    
    result = await agent.execute(
        prompt="List the three key features mentioned",
        context=context
    )
    
    print(f"   Response: {result}")
    
    # Check that response mentions the features
    assert result is not None
    assert len(result) > 20  # Should be meaningful response
    
    print("✅ Document analysis successful")

@pytest.mark.asyncio
async def test_api_health_check():
    """Test API health endpoint"""
    print("\n🧪 Testing API health check")
    
    async with AsyncClient(base_url=API_BASE_URL, timeout=TIMEOUT) as client:
        response = await client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        
        print(f"   Response: {data}")
        assert "message" in data
        
    print("✅ Health check passed")

@pytest.mark.asyncio
async def test_agent_info():
    """Test GET /agent/info returns agent details"""
    print("\n🧪 Testing /agent/info endpoint")
    
    async with AsyncClient(base_url=API_BASE_URL, timeout=TIMEOUT) as client:
        response = await client.get("/agent/info")
        
        assert response.status_code == 200
        data = response.json()
        
        print(f"   Agent DID: {data.get('did')}")
        print(f"   Address: {data.get('address')}")
        print(f"   Registered: {data.get('is_registered')}")
        
        # Verify structure
        assert "did" in data
        assert "address" in data
        assert "is_registered" in data
        
        # Agent should be registered
        assert data["is_registered"] == True, "Agent not registered! Run registration first."
        
    print("✅ Agent info endpoint passed")

@pytest.mark.asyncio
async def test_ipfs_upload_live():
    """Test document upload to LIVE Pinata IPFS"""
    print("\n🧪 Testing IPFS upload (Live Pinata)")
    
    import tempfile
    
    # Create test file
    with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
        f.write("Test document content for LIVE IPFS upload test.\nThis will be uploaded to Pinata.")
        temp_path = f.name
    
    try:
        async with AsyncClient(base_url=API_BASE_URL, timeout=TIMEOUT) as client:
            # Upload file
            with open(temp_path, 'rb') as f:
                response = await client.post(
                    "/documents/upload",
                    files={"file": ("test.txt", f, "text/plain")}
                )
            
            assert response.status_code == 200
            data = response.json()
            
            print(f"   CID: {data['cid']}")
            print(f"   Gateway URL: {data['gateway_url']}")
            
            # Verify CID format
            assert "cid" in data
            assert data["cid"].startswith("Qm") or data["cid"].startswith("bafy")
            
            # Verify gateway URL
            assert "gateway_url" in data
            assert "pinata" in data["gateway_url"] or "ipfs" in data["gateway_url"]
            
            # Test retrieval from IPFS (this verifies it's actually uploaded)
            import httpx
            print(f"   Verifying IPFS retrieval...")
            gateway_response = httpx.get(data["gateway_url"], timeout=30.0)
            
            assert gateway_response.status_code == 200
            assert "Test document content" in gateway_response.text
            
            print("✅ IPFS upload and retrieval successful")
            
    finally:
        # Cleanup
        import os
        os.unlink(temp_path)

@pytest.mark.asyncio
async def test_crossmint_wallet_creation():
    """Test wallet creation via LIVE Crossmint API"""
    print("\n🧪 Testing Crossmint wallet creation (Live API)")
    
    import time
    email = f"test-{int(time.time())}@example.com"
    
    async with AsyncClient(base_url=API_BASE_URL, timeout=TIMEOUT) as client:
        response = await client.post("/crossmint/wallet", json={
            "email": email
        })
        
        assert response.status_code == 200
        data = response.json()
        
        print(f"   Email: {data['email']}")
        print(f"   Wallet: {data['walletAddress']}")
        print(f"   New: {data['isNew']}")
        
        # Verify wallet address format
        assert "walletAddress" in data
        assert data["walletAddress"].startswith("0x")
        assert len(data["walletAddress"]) == 42
        
        # Verify email
        assert data["email"] == email
        
    print("✅ Crossmint wallet creation successful")

if __name__ == "__main__":
    # Run tests with pytest
    import subprocess
    subprocess.run(["pytest", __file__, "-v", "-s"])

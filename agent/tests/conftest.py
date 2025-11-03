# Test configuration and fixtures
import pytest
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Test configuration
TEST_TIMEOUT = 60  # seconds
API_BASE_URL = "http://localhost:8000"

@pytest.fixture
def test_email():
    """Generate unique test email"""
    import time
    return f"test-{int(time.time())}@example.com"

@pytest.fixture
def test_document_content():
    """Sample document content for testing"""
    return """
    This is a test document about artificial intelligence and blockchain technology.
    
    AI agents can process this document and create verifiable execution proofs.
    The provenance of the AI's work is recorded on the Somnia blockchain.
    
    This enables trust and transparency in AI operations.
    """

@pytest.fixture
def test_cid():
    """Generate unique test CID format"""
    import time
    return f"QmTest{int(time.time())}"

# Environment checks
def pytest_configure(config):
    """Check required environment variables before running tests"""
    required_vars = [
        "SOMNIA_RPC_URL",
        "ACCESS_NFT_ADDRESS",
        "AGENT_REGISTRY_ADDRESS",
        "PROVENANCE_ADDRESS",
        "PINATA_JWT",
        "MOONSHOT_API_KEY"
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        print(f"\n[ERROR] Missing required environment variables: {', '.join(missing)}")
        print("Please check your .env file")
        sys.exit(1)
    
    print("\n[OK] All required environment variables found")

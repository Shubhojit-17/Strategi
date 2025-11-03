import asyncio
from app.chains import SomniaClient
from web3 import Web3

async def debug_registration():
    client = SomniaClient()
    
    did1 = 'did:key:z6Mku4xTanSL1Dr2ZZLtiiRE6ziSv6Ls9hwLb5LzHF856WDc'
    did2 = 'did:key:z6Mk...'
    
    # Compute did hashes
    did_hash1 = Web3.keccak(text=did1).hex()
    did_hash2 = Web3.keccak(text=did2).hex()
    
    print(f"DID 1: {did1}")
    print(f"  Hash: {did_hash1}")
    
    print(f"\nDID 2: {did2}")
    print(f"  Hash: {did_hash2}")
    
    # Try to get claim directly
    try:
        claim1 = client.agent_registry.functions.claims(did_hash1).call()
        print(f"\nClaim 1: {claim1}")
    except Exception as e:
        print(f"\nClaim 1 error: {e}")
    
    try:
        claim2 = client.agent_registry.functions.claims(did_hash2).call()
        print(f"\nClaim 2: {claim2}")
    except Exception as e:
        print(f"\nClaim 2 error: {e}")
    
    # Check isActiveAgent
    is_active1 = await client.is_agent_active(did1)
    is_active2 = await client.is_agent_active(did2)
    
    print(f"\nisActiveAgent(DID 1): {is_active1}")
    print(f"isActiveAgent(DID 2): {is_active2}")

if __name__ == "__main__":
    asyncio.run(debug_registration())

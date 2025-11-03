import asyncio
from app.chains import SomniaClient

async def check():
    client = SomniaClient()
    did = 'did:key:z6Mku4xTanSL1Dr2ZZLtiiRE6ziSv6Ls9hwLb5LzHF856WDc'
    result = await client.is_agent_active(did)
    print(f'DID: {did}')
    print(f'Registered: {result}')
    
    # Also check with original placeholder DID
    did2 = 'did:key:z6Mk...'
    result2 = await client.is_agent_active(did2)
    print(f'\nOriginal DID: {did2}')
    print(f'Registered: {result2}')

if __name__ == "__main__":
    asyncio.run(check())

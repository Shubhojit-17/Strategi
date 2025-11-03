"""
Configuration Status Checker
Shows what's configured and what needs to be set up
"""

import os
from dotenv import load_dotenv

load_dotenv('agent/.env')

print("🔍 Somnia AI Agents - Configuration Status\n")

# Blockchain
print("📡 BLOCKCHAIN:")
rpc = os.getenv('SOMNIA_RPC_URL')
pk = os.getenv('DEPLOYER_PRIVATE_KEY')
print(f"   RPC URL: {'✅ ' + rpc if rpc and rpc != 'https://dream-rpc.somnia.network' else '⚠️  Using default'}")
print(f"   Private Key: {'✅ Configured' if pk and pk != 'your_private_key_here_without_0x_prefix' else '❌ Not set'}")

# Contracts
print("\n📝 CONTRACTS:")
nft_addr = os.getenv('ACCESS_NFT_ADDRESS')
registry_addr = os.getenv('AGENT_REGISTRY_ADDRESS')
prov_addr = os.getenv('PROVENANCE_ADDRESS')
print(f"   AccessNFT: {'✅ ' + nft_addr if nft_addr else '⚠️  Not deployed yet'}")
print(f"   AgentRegistry: {'✅ ' + registry_addr if registry_addr else '⚠️  Not deployed yet'}")
print(f"   Provenance: {'✅ ' + prov_addr if prov_addr else '⚠️  Not deployed yet'}")

# IPFS
print("\n💾 IPFS:")
pinata_jwt = os.getenv('PINATA_JWT')
print(f"   Pinata JWT: {'✅ Configured (' + str(len(pinata_jwt)) + ' chars)' if pinata_jwt and pinata_jwt != 'your_pinata_jwt_token_here' else '❌ Not set'}")

# AI
print("\n🤖 AI CONFIGURATION:")
use_local = os.getenv('USE_LOCAL_MODEL', 'false').lower() == 'true'
ai_model = os.getenv('AI_MODEL', 'gpt-3.5-turbo')
openai_key = os.getenv('OPENAI_API_KEY')

print(f"   Mode: {'🏠 Local (Ollama)' if use_local else '☁️  Cloud (OpenAI)'}")
print(f"   Model: {ai_model}")

if use_local:
    ollama_endpoint = os.getenv('OLLAMA_ENDPOINT', 'http://localhost:11434')
    print(f"   Ollama Endpoint: {ollama_endpoint}")
    print(f"   Status: ⚠️  Make sure Ollama is running and model '{ai_model}' is pulled")
else:
    has_key = openai_key and openai_key != 'your_openai_api_key_here'
    print(f"   OpenAI API Key: {'✅ Configured' if has_key else '❌ Not set'}")
    if has_key:
        print(f"   ⚠️  OpenAI needs payment method at: https://platform.openai.com/account/billing")
        print(f"   💡 To use free local AI: Set USE_LOCAL_MODEL=true in .env")

# Agent
print("\n🤝 AGENT:")
agent_did = os.getenv('AGENT_DID')
print(f"   DID: {agent_did if agent_did and 'did:key:' in agent_did else '⚠️  Will auto-generate'}")

print("\n" + "="*60)
print("SUMMARY:")
print("="*60)

ready = []
pending = []

# Check readiness
if pinata_jwt and pinata_jwt != 'your_pinata_jwt_token_here':
    ready.append("✅ IPFS Storage (Pinata)")
else:
    pending.append("❌ Configure Pinata JWT")

if use_local:
    ready.append("✅ AI (Local mode - free)")
    pending.append("⚠️  Make sure Ollama is running")
else:
    if openai_key and openai_key != 'your_openai_api_key_here':
        ready.append("⚠️  AI (OpenAI - needs billing)")
        pending.append("💳 Add payment to OpenAI")
    else:
        pending.append("❌ Configure OpenAI API key or enable local mode")

if pk and pk != 'your_private_key_here_without_0x_prefix':
    ready.append("✅ Blockchain wallet configured")
else:
    pending.append("❌ Add DEPLOYER_PRIVATE_KEY")

if nft_addr and registry_addr and prov_addr:
    ready.append("✅ Contracts deployed")
else:
    pending.append("⏳ Deploy contracts (after wallet configured)")

print("\n🎯 READY:")
for item in ready:
    print(f"   {item}")

if pending:
    print("\n⏳ TODO:")
    for item in pending:
        print(f"   {item}")

print("\n" + "="*60)
print("\n💡 NEXT STEPS:")
if not pinata_jwt or pinata_jwt == 'your_pinata_jwt_token_here':
    print("   1. Get Pinata JWT from https://app.pinata.cloud/")
    
if not pk or pk == 'your_private_key_here_without_0x_prefix':
    print("   2. Add your wallet private key to .env")
    print("      (Get testnet ETH from Somnia faucet)")

if not use_local and (not openai_key or openai_key == 'your_openai_api_key_here'):
    print("   3. Either:")
    print("      a) Add payment to OpenAI (https://platform.openai.com/account/billing)")
    print("      b) Or enable local AI (set USE_LOCAL_MODEL=true)")

if not nft_addr:
    print("   4. Deploy contracts: npx hardhat run scripts/deploy.js --network somnia")

print("\n🚀 Ready to start? Run: python -m app.main")
print("="*60)

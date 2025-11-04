# Somnia AI Agents - Setup Guide

## 📋 Prerequisites

- **Node.js** 18+ (for contracts)
- **Python** 3.11+ (for agent backend)
- **Git**
- **Somnia testnet tokens** (get from faucet)
- **Pinata account** (for IPFS)
- **OpenAI API key** (or local vLLM setup)

---

## 🚀 Step-by-Step Setup

### 1. Install Dependencies

#### Contracts
```bash
cd contracts
npm install
```

#### Agent Backend
```bash
cd agent
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
venv\Scripts\activate.bat
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
```

---

### 2. Configure Environment Variables

#### Get Somnia Network Details
Visit: https://docs.somnia.network
- RPC URL
- Chain ID
- Explorer URL
- Faucet (get testnet tokens)

#### Get Pinata API Keys
Visit: https://pinata.cloud
1. Create account
2. Go to API Keys
3. Create new key
4. Copy JWT token

#### Get OpenAI API Key
Visit: https://platform.openai.com
1. Create account
2. Go to API Keys
3. Create new key

#### Create `.env` file in root:
```bash
# Copy example
cp contracts/.env.example .env

# Edit .env with your values:
DEPLOYER_PRIVATE_KEY=your_private_key_here
SOMNIA_RPC_URL=https://rpc.somnia.network
SOMNIA_CHAIN_ID=1234
SOMNIA_EXPLORER_URL=https://explorer.somnia.network
PINATA_JWT=your_pinata_jwt_here
OPENAI_API_KEY=your_openai_key_here
```

---

### 3. Deploy Smart Contracts

```bash
cd contracts

# Compile
npx hardhat compile

# Deploy to Somnia
npx hardhat run scripts/deploy.js --network somnia

# Save the deployed addresses!
# Output will look like:
# AccessNFT:       0x1234...
# AgentRegistry:   0x5678...
# Provenance:      0xABCD...
```

#### Update `.env` with contract addresses:
```bash
ACCESS_NFT_ADDRESS=0x1234...
AGENT_REGISTRY_ADDRESS=0x5678...
PROVENANCE_ADDRESS=0xABCD...
```

---

### 4. Generate Agent DID

```bash
cd agent
python -c "
from app.verifiable import DIDKey
import json

# Generate new DID
key = DIDKey()

print('Add these to your .env file:')
print()
print(f'AGENT_DID={key.did}')
print(f'AGENT_JWK={json.dumps(key.to_jwk())}')
"
```

#### Add to `.env`:
```bash
AGENT_DID=did:key:z6Mk...
AGENT_JWK={"kty":"OKP",...}
```

---

### 5. Start Agent Backend

```bash
cd agent

# Make sure virtual environment is activated
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1

# Start server
python -m app.main
# or
uvicorn app.main:app --reload

# Server will start at http://localhost:8000
# API docs at http://localhost:8000/docs
```

---

### 6. Register Agent on Somnia

```bash
# In another terminal
curl -X POST http://localhost:8000/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Verifiable AI Agent",
    "metadata": {
      "model": "gpt-4",
      "capabilities": ["summarization", "qa", "analysis"]
    }
  }'

# Response:
# {
#   "did": "did:key:z6Mk...",
#   "tx_hash": "0xabcd...",
#   "metadata_cid": "QmXYZ..."
# }
```

---

### 7. Test the System

#### Create a test script `test_flow.py`:
```python
import requests
import json

API_URL = "http://localhost:8000"

# 1. Check agent info
print("1. Getting agent info...")
response = requests.get(f"{API_URL}/agent/info")
print(json.dumps(response.json(), indent=2))

# 2. Upload a test document
print("\n2. Uploading document...")
with open("test_document.txt", "w") as f:
    f.write("This is a test document about AI and blockchain.")

files = {"file": open("test_document.txt", "rb")}
response = requests.post(f"{API_URL}/documents/upload", files=files)
doc_cid = response.json()["cid"]
print(f"Document CID: {doc_cid}")

# 3. Mint NFT (you'll need to do this via contract or frontend)
# For now, assume NFT #1 exists and you own it
nft_token_id = 1
user_address = "0xYourAddressHere"

print(f"\n3. NFT Token ID: {nft_token_id}")
print(f"   Owner: {user_address}")

# 4. Execute AI agent
print("\n4. Executing AI agent...")
response = requests.post(f"{API_URL}/execute", json={
    "nft_token_id": nft_token_id,
    "user_address": user_address,
    "prompt": "Summarize this document in one sentence",
    "model": "gpt-4"
})

if response.status_code == 200:
    result = response.json()
    print(f"✅ Success!")
    print(f"Output: {result['output_text']}")
    print(f"Record ID: {result['record_id']}")
    print(f"Tx Hash: {result['tx_hash']}")
    print(f"Execution Root: {result['execution_root']}")
    print(f"Trace CID: {result['trace_cid']}")
    
    # 5. Verify provenance
    print("\n5. Verifying provenance...")
    verify = requests.get(f"{API_URL}/provenance/verify/{result['record_id']}")
    verify_result = verify.json()
    print(f"Verified: {verify_result['verified']}")
    print(f"Step Count: {verify_result['step_count']}")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.json())
```

#### Run the test:
```bash
python test_flow.py
```

---

## 🔍 Verification

### Check on Somnia Explorer

1. Go to: `https://explorer.somnia.network`
2. Search for your transaction hash
3. View the `ProvenanceRecorded` event
4. See `executionRoot` and other parameters

### Verify Execution Trace

```bash
# Fetch trace from IPFS
curl https://ipfs.io/ipfs/{trace_cid} | jq .

# Check execution root
curl http://localhost:8000/provenance/verify/{record_id}
```

---

## 🎨 Frontend Setup (Optional)

### Create Next.js App

```bash
npx create-next-app@latest app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir

cd app
npm install wagmi viem @rainbow-me/rainbowkit
npm install @crossmint/client-sdk-react-ui
```

### Configure wagmi for Somnia

Create `app/lib/somnia.ts`:
```typescript
import { defineChain } from 'viem';

export const somniaChain = defineChain({
  id: 1234, // Replace with actual chain ID
  name: 'Somnia',
  network: 'somnia',
  nativeCurrency: {
    decimals: 18,
    name: 'Somnia',
    symbol: 'SOM',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.somnia.network'],
    },
    public: {
      http: ['https://rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://explorer.somnia.network',
    },
  },
});
```

---

## 🐛 Troubleshooting

### Contract deployment fails
- Check you have testnet tokens: `eth_getBalance` on your address
- Verify RPC URL is correct
- Check gas price is set correctly

### Agent registration fails
- Ensure contracts are deployed
- Check `.env` has correct contract addresses
- Verify private key has funds

### IPFS upload fails
- Check Pinata JWT is correct
- Verify Pinata account is active
- Try using smaller files first

### AI execution fails with 403
- Verify NFT ownership on-chain
- Check user address matches NFT owner
- Ensure NFT token ID exists

---

## 📚 Next Steps

1. **Build Frontend**:
   - Create `WalletConnect` component
   - Add NFT minting UI
   - Build document upload form
   - Show provenance records

2. **Add Features**:
   - Document encryption
   - Multi-agent execution
   - ZK proof generation
   - Agent reputation system

3. **Production Deployment**:
   - Deploy backend to Railway/Fly.io
   - Deploy frontend to Vercel
   - Set up monitoring (Sentry)
   - Configure CORS properly

4. **Record Demo Video**:
   - Show wallet connection
   - Mint NFT
   - Upload document
   - Run AI agent
   - View receipt on Somnia explorer
   - Verify execution trace

---

## 🆘 Support

- **Somnia Discord**: [link]
- **GitHub Issues**: [link]
- **Technical Docs**: `SOMNIA_INTEGRATION_PLAN.md`

---

**Ready to build the future of verifiable AI! 🚀**

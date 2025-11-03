# 🚀 Somnia AI Agents - Complete Integration

**NFT-Gated Verifiable AI Agents on Somnia L1**

This repository contains a **production-ready architecture** for running AI agents with verifiable execution on Somnia blockchain, combining elements from:

- **qbft_network** - Blockchain infrastructure (adapted from Besu to Somnia EVM)
- **Nft-membership** - NFT-based access control
- **final-company-dropbox-** - Decentralized storage (IPFS)
- **verifiable_agent_demo** - Verifiable execution with DIDs, VCs, and Merkle trees

---

## 🎯 What This Does

**"AI Agents for NFT-gated knowledge objects on Somnia"**

1. User mints an **Access NFT** (email login via Crossmint) that represents ownership of a document
2. User uploads encrypted document to **IPFS**, CID anchored on NFT
3. **AI agent** (with DID identity) executes:
   - Checks NFT ownership for access control
   - Computes **inputRoot** (commitment to what it read)
   - Runs LLM, logs each step in Merkle tree
   - Computes **executionRoot** (proof of what it did)
   - Anchors both commitments on **Somnia Provenance contract**
4. Anyone can verify the agent provably consumed X and produced Y by:
   - Fetching execution trace from IPFS
   - Recomputing Merkle root locally
   - Comparing with on-chain executionRoot

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  Next.js Frontend                            │
│  - Crossmint wallet (email/social login)    │
│  - NFT minting & management                 │
│  - Document upload to IPFS                  │
│  - AI execution trigger                     │
│  - Verifiable receipt viewer                │
└──────────────┬──────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────┐
│ FastAPI      │  │ IPFS/Pinata  │
│ AI Backend   │  │ - Documents  │
│ - DIDKit     │  │ - Traces     │
│ - OpenAI/vLLM│  │ - Outputs    │
│ - Merkle     │  └──────────────┘
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│  Somnia L1 (EVM) Smart Contracts            │
│  ┌─────────────┐  ┌──────────────────┐     │
│  │ AccessNFT   │  │ AgentRegistry    │     │
│  │ (ERC-721)   │  │ (DID→address)    │     │
│  └─────────────┘  └──────────────────┘     │
│  ┌──────────────────────────────────┐      │
│  │ Provenance                        │      │
│  │ - inputRoot commitment            │      │
│  │ - executionRoot (Merkle tree)     │      │
│  │ - CID anchoring                   │      │
│  └──────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

---

## 📦 Repository Structure

```
strategi/
├── SOMNIA_INTEGRATION_PLAN.md  # Complete technical design
│
├── contracts/                   # Somnia EVM contracts
│   ├── src/
│   │   ├── AccessNFT.sol       # ERC-721 for document access
│   │   ├── AgentRegistry.sol   # DID identity registry
│   │   └── Provenance.sol      # Input/execution commitments
│   ├── scripts/deploy.js
│   ├── hardhat.config.js       # Somnia RPC config
│   └── package.json
│
├── agent/                       # AI backend (Python)
│   ├── app/
│   │   ├── main.py             # FastAPI server
│   │   ├── verifiable.py       # DID, VC, Merkle trees
│   │   ├── ipfs.py             # IPFS client (Pinata)
│   │   ├── chains.py           # Somnia contract interaction
│   │   └── agent.py            # AI execution (OpenAI/vLLM)
│   └── requirements.txt
│
├── app/                         # Next.js frontend (TODO)
│   ├── src/
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── NFTMinter.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   └── ProvenanceViewer.tsx
│   │   └── hooks/
│   │       ├── useAccessNFT.ts
│   │       └── useProvenance.ts
│   └── package.json
│
└── README.md
```

---

## ⚡ Quick Start

### 1. Deploy Contracts to Somnia

```bash
cd contracts
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with:
# - DEPLOYER_PRIVATE_KEY
# - SOMNIA_RPC_URL (get from Somnia docs)
# - SOMNIA_CHAIN_ID

# Deploy
npm run deploy:somnia

# Note the deployed contract addresses
```

### 2. Start AI Backend

```bash
cd agent
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp ../.env.example .env
# Edit .env with:
# - SOMNIA_RPC_URL
# - ACCESS_NFT_ADDRESS (from step 1)
# - AGENT_REGISTRY_ADDRESS
# - PROVENANCE_ADDRESS
# - PINATA_JWT

# AI Provider Configuration (choose one):
# Option 1: Ollama (free, local)
# AI_PROVIDER=ollama
# AI_MODEL=phi
# OLLAMA_ENDPOINT=http://localhost:11434

# Option 2: OpenAI (paid, high quality)
# AI_PROVIDER=openai
# OPENAI_API_KEY=sk-...
# AI_MODEL=gpt-3.5-turbo

# Option 3: Moonshot AI / Kimi (competitive pricing, excellent quality)
# AI_PROVIDER=moonshot
# MOONSHOT_API_KEY=sk-...
# MOONSHOT_BASE_URL=https://api.moonshot.ai/v1
# MOONSHOT_MODEL=moonshot-v1-8k

# Generate agent DID
python -c "from app.verifiable import DIDKey; import json; k = DIDKey(); print(f'AGENT_DID={k.did}'); print(f'AGENT_JWK={json.dumps(k.to_jwk())}')"

# Add AGENT_DID and AGENT_JWK to .env

# Run server
python -m app.main
```

### 3. Register Agent

```bash
# Register agent on Somnia
curl -X POST http://localhost:8000/agent/register \
  -H "Content-Type: application/json" \
  -d '{"name": "My Verifiable Agent"}'
```

### 4. Test Execution

```python
# mint_and_test.py
import requests

# 1. Mint NFT (via frontend or directly)
# 2. Upload document
files = {'file': open('test_doc.pdf', 'rb')}
response = requests.post('http://localhost:8000/documents/upload', files=files)
print(f"Document CID: {response.json()['cid']}")

# 3. Execute AI
response = requests.post('http://localhost:8000/execute', json={
    'nft_token_id': 1,
    'user_address': '0xYourAddress',
    'prompt': 'Summarize this document',
    'model': 'gpt-4'
})
result = response.json()
print(f"Output: {result['output_text']}")
print(f"Tx: https://explorer.somnia.network/tx/{result['tx_hash']}")

# 4. Verify
verify = requests.get(f'http://localhost:8000/provenance/verify/{result["record_id"]}')
print(f"Verified: {verify.json()['verified']}")
```

---

## 🔑 Key Features

### ✅ What Makes This Somnia-Native

- **Sub-second finality** → instant provenance updates
- **EVM-compatible** → standard Solidity, no custom VM
- **NFT-first** → access control via ERC-721
- **Composable** → other dapps can read Provenance events
- **Public & demo-able** → not a private chain

### ✅ Verifiability

- **DID identity** → Agent has did:key registered on-chain
- **Input commitment** → inputRoot = keccak256(all inputs)
- **Execution trace** → Merkle tree of every step
- **Anchored on-chain** → executionRoot stored in Provenance contract
- **Anyone can verify** → fetch trace from IPFS, recompute root, compare

### ✅ NFT-Gated Access

- Only NFT owner can authorize AI to process their document
- NFT ownership = document ownership
- Transferable access rights
- On-chain access control (no off-chain auth server)

### ✅ IPFS Storage

- Documents stored encrypted on IPFS
- CID anchored on NFT metadata
- Execution traces on IPFS (linked on-chain)
- Derivative outputs on IPFS

---

## 🎨 Frontend Integration (Next Steps)

### Crossmint Wallet Flow

```typescript
// 1. User signs in with email
const { address } = await crossmint.login(email);

// 2. Backend mints NFT to that address
await fetch('/api/mint', {
  method: 'POST',
  body: JSON.stringify({ to: address, documentCID })
});

// 3. User now has NFT in Crossmint wallet (no seed phrases!)
```

### wagmi + RainbowKit Setup

```typescript
// wagmi.config.ts
import { somniaChain } from './chains';

export const config = createConfig({
  chains: [somniaChain],
  transports: {
    [somniaChain.id]: http(process.env.NEXT_PUBLIC_SOMNIA_RPC_URL),
  },
});

// Use in components
const { data: nftBalance } = useReadContract({
  address: process.env.NEXT_PUBLIC_ACCESS_NFT_ADDRESS,
  abi: AccessNFTABI,
  functionName: 'balanceOf',
  args: [userAddress],
});
```

---

## 📝 Smart Contract Interfaces

### AccessNFT.sol

```solidity
function mint(address to, string memory documentCID) returns (uint256);
function hasAccess(address user, uint256 tokenId) returns (bool);
function tokenURI(uint256 tokenId) returns (string);  // Returns document CID
```

### AgentRegistry.sol

```solidity
function registerAgent(string calldata did, string calldata name, string calldata metadataURI);
function isActiveAgent(string calldata did) returns (bool);
```

### Provenance.sol

```solidity
function recordDerivative(
    uint256 nftTokenId,
    string calldata inputCID,
    bytes32 inputRoot,
    string calldata outputCID,
    bytes32 executionRoot,
    string calldata traceCID,
    string calldata agentDID,
    string calldata proofCID
) returns (uint256 recordId);

function getRecordsByNFT(uint256 tokenId) returns (uint256[] memory);
```

---

## 🔐 Security Considerations

1. **NFT ownership verification** → Always check on-chain before execution
2. **DID registration** → Only registered agents can record provenance
3. **Execution roots** → Immutable on-chain, can't be changed after recording
4. **IPFS pinning** → Use Pinata or paid service to ensure traces remain available
5. **Private keys** → Never commit DEPLOYER_PRIVATE_KEY or AGENT_PRIVATE_KEY

---

## 🚀 Deployment Checklist

- [ ] Get Somnia testnet tokens from faucet
- [ ] Deploy contracts to Somnia testnet
- [ ] Verify contracts on Somnia explorer
- [ ] Generate agent DID and register on-chain
- [ ] Configure IPFS (Pinata account)
- [ ] Set up OpenAI API key
- [ ] Deploy backend to Railway/Fly.io
- [ ] Build and deploy frontend to Vercel
- [ ] Record demo video
- [ ] Write submission README

---

## 📚 Reference Links

- **Somnia Docs**: https://docs.somnia.network
- **Verifiable Agent Demo**: https://github.com/AkshatGada/verifiable_agent_demo
- **DIDKit**: https://github.com/spruceid/didkit
- **Crossmint**: https://docs.crossmint.com
- **Pinata**: https://docs.pinata.cloud

---

## 🎯 Hackathon Submission

### Title
"Somnia AI Agents - NFT-Gated Verifiable Knowledge Objects"

### Description
AI agents that read NFT-gated documents, produce derivatives, and anchor cryptographic provenance on Somnia L1. Every execution is verifiable: anyone can fetch the execution trace from IPFS, recompute the Merkle root, and compare with the on-chain commitment.

### Why Somnia?
- **Sub-second finality** → Real-time provenance updates
- **EVM-compatible** → Standard Solidity, easy to verify
- **NFT-first ecosystem** → Natural fit for access control
- **Composable** → Other dapps can build on our Provenance events

### Tech Stack
- **Chain**: Somnia L1 (EVM)
- **Contracts**: AccessNFT (ERC-721), AgentRegistry (DIDs), Provenance (commitments)
- **Storage**: IPFS (Pinata)
- **AI**: FastAPI + OpenAI/vLLM
- **Verifiability**: DIDKit (W3C VCs), Merkle trees
- **Frontend**: Next.js + wagmi + Crossmint

### Demo Flow
1. User logs in with email (Crossmint)
2. User mints Access NFT
3. User uploads document → IPFS
4. User clicks "Run AI Agent"
5. Agent:
   - Verifies NFT ownership
   - Fetches document
   - Computes inputRoot
   - Executes LLM with logging
   - Computes executionRoot (Merkle tree)
   - Uploads trace to IPFS
   - Records provenance on Somnia
6. User sees receipt with link to Somnia explorer
7. Anyone can verify execution by fetching trace and recomputing root

### Enterprise Extension
This architecture can also run on **Hyperledger Besu + Tessera** for private organizations requiring permissioned chains and private transactions. The same verifiability primitives work on both public (Somnia) and private (Besu) chains.

---

## 🤝 Contributing

This is a hackathon submission. For production use, consider:

- [ ] Add ZK proof verification (circom/snarkjs)
- [ ] Implement document encryption (lit protocol, NuCypher)
- [ ] Add agent reputation scoring
- [ ] Implement agent marketplace
- [ ] Add DAO governance for agent approvals
- [ ] Build metaverse integration (3D asset generation)

---

## 📄 License

MIT

---

**Built for Somnia Hackathon 2025** 🚀

*The universe is EVM-shaped enough for this to work.*

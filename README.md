# 🚀 Strategi - Somnia AI Agents

<div align="center">

**NFT-Gated Verifiable AI Agents on Somnia L1**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-green)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

*AI agents that prove what they read and what they did - cryptographically*

[Documentation](#-documentation) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [Demo](#-demo-flow)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Smart Contracts](#-smart-contracts)
- [Deployment](#-deployment)
- [Development](#-development)
- [Testing](#-testing)
- [Security](#-security)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Strategi (Somnia AI Agents)** is a production-ready platform for running AI agents with verifiable execution on the Somnia blockchain. It combines NFT-based access control, decentralized storage, and cryptographic provenance to create AI systems that are transparent, auditable, and trustworthy.

### What Makes This Special?

Traditional AI systems are black boxes - you can't verify what data they consumed or how they produced their outputs. Strategi solves this by:

1. **NFT-Gated Access**: Users mint Access NFTs representing ownership of documents. Only NFT holders can authorize AI processing.
2. **Verifiable Execution**: Every AI operation is logged in a Merkle tree, with the root anchored on-chain. Anyone can verify what the agent did.
3. **Decentralized Storage**: Documents and execution traces stored on IPFS, ensuring permanence and availability.
4. **Blockchain Anchoring**: All commitments recorded on Somnia L1 with sub-second finality and EVM compatibility.

### Use Cases

- 📄 **Document Analysis**: Verifiable AI analysis of legal, financial, or medical documents
- 🔐 **Compliance & Audit**: Prove AI systems accessed only authorized data
- 🎓 **Research Provenance**: Track and verify AI-generated research outputs
- 💼 **Enterprise AI**: Transparent AI operations for regulated industries
- 🎨 **Content Generation**: Provable chain of custody for AI-generated content

---

## ✨ Key Features

### 🔐 NFT-Based Access Control
- **Document Ownership as NFTs**: Each document is represented by an ERC-721 token
- **On-Chain Authorization**: No centralized auth servers - all verification on-chain
- **Transferable Rights**: NFT ownership = document access rights
- **Multi-tenancy**: Support for individual and organizational access patterns

### ✅ Verifiable Execution
- **DID Identity**: AI agents have W3C DID (Decentralized Identifier) identities
- **Input Commitment**: `inputRoot = keccak256(all_inputs)` - proves what the agent read
- **Execution Trace**: Merkle tree of every computation step
- **Output Commitment**: `executionRoot` - cryptographic proof of execution path
- **Public Verification**: Anyone can fetch traces from IPFS and verify locally

### 🌐 Decentralized Storage
- **IPFS Integration**: Documents, traces, and outputs stored on IPFS via Pinata
- **Content Addressing**: CIDs (Content Identifiers) ensure data integrity
- **Redundant Pinning**: Multiple pinning strategies for high availability
- **Encrypted Storage**: Support for document encryption (optional)

### ⚡ Somnia L1 Integration
- **Sub-Second Finality**: Instant provenance updates with Somnia's high performance
- **EVM Compatible**: Standard Solidity contracts, easy to audit and verify
- **Low Gas Costs**: Efficient operations for high-frequency AI tasks
- **Composable**: Other dApps can read and build on Provenance events

### 🤖 AI Provider Flexibility
- **Ollama**: Free local inference (Phi, Llama, Mistral)
- **OpenAI**: GPT-3.5, GPT-4, GPT-4 Turbo
- **Moonshot AI**: Cost-effective Kimi models via OpenRouter
- **Extensible**: Easy to add custom AI providers

### 👛 User-Friendly Onboarding
- **Crossmint Integration**: Email/social login (no seed phrases required)
- **Wallet Abstraction**: Users interact without understanding crypto
- **Progressive Decentralization**: Start simple, add complexity as needed

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │  Crossmint   │  │   Document   │  │   Provenance       │   │
│  │  Wallet      │  │   Upload     │  │   Viewer           │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
└────────────────┬──────────────────────────────────┬────────────┘
                 │                                   │
                 │ HTTP/WebSocket                    │
                 │                                   │
┌────────────────▼───────────────────┐   ┌──────────▼────────────┐
│   FastAPI Backend (Python)         │   │   IPFS/Pinata         │
│  ┌──────────────────────────────┐  │   │  ┌────────────────┐  │
│  │  Verifiable Agent Module     │  │   │  │  Documents     │  │
│  │  - DID Management            │  │   │  │  Traces        │  │
│  │  - Merkle Tree Builder       │  │   │  │  Outputs       │  │
│  │  - VC Generation             │  │   │  └────────────────┘  │
│  └──────────────────────────────┘  │   └───────────────────────┘
│  ┌──────────────────────────────┐  │
│  │  AI Agent Module             │  │
│  │  - OpenAI/Ollama/Moonshot    │  │
│  │  - Step Logging              │  │
│  │  - Execution Tracing         │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │  Blockchain Client           │  │
│  │  - Web3 Integration          │  │
│  │  - Contract Interaction      │  │
│  │  - Transaction Management    │  │
│  └──────────────────────────────┘  │
└────────────────┬───────────────────┘
                 │
                 │ Web3/RPC
                 │
┌────────────────▼──────────────────────────────────────────────┐
│                 Somnia L1 (EVM Compatible)                    │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  AccessNFT   │  │ AgentRegistry    │  │  Provenance    │ │
│  │  (ERC-721)   │  │ (DID Registry)   │  │  (Records)     │ │
│  │              │  │                  │  │                │ │
│  │ - mint()     │  │ - registerAgent()│  │ - recordDeriv()│ │
│  │ - hasAccess()│  │ - isActive()     │  │ - getRecord()  │ │
│  │ - tokenURI() │  │ - getAgent()     │  │ - verify()     │ │
│  └──────────────┘  └──────────────────┘  └────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: Login via Crossmint (email/social)
2. **NFT Minting**: User mints AccessNFT for their document
3. **Document Upload**: File uploaded to IPFS, CID stored in NFT metadata
4. **AI Execution Request**: User triggers AI agent with prompt
5. **Access Verification**: Agent checks on-chain NFT ownership
6. **Document Retrieval**: Agent fetches document from IPFS using CID
7. **Input Commitment**: Agent computes `inputRoot = keccak256(document + prompt)`
8. **AI Processing**: LLM executes with step-by-step logging
9. **Merkle Tree Construction**: Each step hashed and built into Merkle tree
10. **Output Generation**: AI produces result, stored on IPFS
11. **Provenance Recording**: Agent records `inputRoot`, `executionRoot`, and CIDs on Somnia
12. **Verification**: Anyone can fetch trace from IPFS, recompute Merkle root, compare with on-chain value

---

## 🛠️ Technology Stack

### Blockchain
- **Somnia L1**: High-performance EVM-compatible blockchain
- **Solidity 0.8.20**: Smart contract language with optimization
- **Hardhat**: Development environment and deployment tools
- **OpenZeppelin**: Battle-tested contract libraries

### Backend
- **Python 3.10+**: Core language for AI and blockchain integration
- **FastAPI**: Modern, high-performance web framework
- **Web3.py**: Ethereum/EVM blockchain interaction
- **DIDKit**: W3C DID and Verifiable Credentials
- **Uvicorn**: ASGI server for production deployment

### AI/ML
- **OpenAI API**: GPT-3.5, GPT-4 for high-quality inference
- **Ollama**: Local model inference (Phi, Llama, Mistral)
- **Moonshot AI**: Cost-effective Kimi models
- **PyPDF2**: Document parsing and analysis

### Storage
- **IPFS**: Distributed file storage protocol
- **Pinata**: IPFS pinning service for reliability
- **HTTP Client**: Direct IPFS gateway access

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript Ethereum library
- **Crossmint SDK**: Wallet abstraction
- **React Three Fiber**: 3D visualizations

### Development Tools
- **Git**: Version control
- **npm/pip**: Package management
- **dotenv**: Environment variable management
- **ESLint**: Code linting
- **Hardhat Tools**: Contract testing and verification

---

## 🚀 Quick Start

Get up and running in 15 minutes!

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Git**
- **Somnia testnet tokens** (from faucet)
- **Pinata account** (for IPFS)
- **OpenAI API key** (or use Ollama locally)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Shubhojit-17/Strategi.git
cd Strategi
```

### 2️⃣ Deploy Smart Contracts

```bash
cd contracts
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DEPLOYER_PRIVATE_KEY and SOMNIA_RPC_URL

# Deploy to Somnia
npm run deploy:somnia

# Save the deployed contract addresses!
```

### 3️⃣ Start Backend

```bash
cd ../agent
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with:
# - Contract addresses from step 2
# - PINATA_JWT
# - AI_PROVIDER and API keys

# Generate agent DID
python -c "from app.verifiable import DIDKey; k = DIDKey(); print(f'AGENT_DID={k.did}')"
# Add AGENT_DID to .env

# Start server
python -m app.main
```

Server will start at `http://localhost:8000`. Visit `/docs` for interactive API documentation.

### 4️⃣ Register Agent

```bash
curl -X POST http://localhost:8000/agent/register \
  -H "Content-Type: application/json" \
  -d '{"name": "My Verifiable Agent", "metadata_uri": "ipfs://QmExample"}'
```

### 5️⃣ Test End-to-End

```python
import requests

# Upload a document
with open('test_document.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/documents/upload',
        files={'file': f}
    )
doc_cid = response.json()['cid']
print(f"Document CID: {doc_cid}")

# Execute AI agent
response = requests.post(
    'http://localhost:8000/execute',
    json={
        'nft_token_id': 1,
        'user_address': '0xYourAddress',
        'prompt': 'Summarize this document in 3 bullet points',
        'model': 'gpt-3.5-turbo'
    }
)
result = response.json()
print(f"Output: {result['output_text']}")
print(f"Transaction: {result['tx_hash']}")
print(f"Execution Root: {result['execution_root']}")

# Verify execution
verify = requests.get(f'http://localhost:8000/provenance/verify/{result["record_id"]}')
print(f"Verified: {verify.json()['verified']}")
```

### 6️⃣ Run Frontend (Optional)

```bash
cd ../frontend
npm install

# Configure environment
# Create .env.local with contract addresses and API URL

npm run dev
```

Visit `http://localhost:3000` to see the UI.

---

## 📥 Installation

### System Requirements

- **Operating System**: Linux, macOS, or Windows with WSL
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 10GB free space
- **Network**: Stable internet connection for IPFS and blockchain access

### Detailed Installation Steps

#### 1. Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y build-essential python3.10 python3.10-venv python3-pip nodejs npm git
```

**macOS:**
```bash
brew install python@3.10 node git
```

**Windows (WSL):**
```bash
# Install WSL2 first, then use Ubuntu commands above
```

#### 2. Install Ollama (Optional - for local AI)

```bash
# Linux/macOS
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama and pull a model
ollama serve &
ollama pull phi
```

#### 3. Clone and Setup

```bash
# Clone repository
git clone https://github.com/Shubhojit-17/Strategi.git
cd Strategi

# Install contract dependencies
cd contracts
npm install
cd ..

# Install backend dependencies
cd agent
python3.10 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

---

## ⚙️ Configuration

### Environment Variables

The project uses multiple `.env` files for different components:

#### Contracts Environment (`contracts/.env`)

```bash
# Deployer wallet (NEVER commit!)
DEPLOYER_PRIVATE_KEY=your_private_key_without_0x

# Somnia Network
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312
SOMNIA_EXPLORER_URL=https://explorer.somnia.network
SOMNIA_EXPLORER_API_KEY=your_api_key_if_needed
```

#### Backend Environment (`agent/.env`)

```bash
# Blockchain Configuration
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Deployed Contract Addresses (update after deployment)
ACCESS_NFT_ADDRESS=0x...
AGENT_REGISTRY_ADDRESS=0x...
PROVENANCE_ADDRESS=0x...

# IPFS Configuration
PINATA_JWT=eyJhbGc...your_pinata_jwt_token

# AI Provider Configuration
AI_PROVIDER=moonshot  # Options: ollama, openai, moonshot

# OpenAI (if using)
OPENAI_API_KEY=sk-...

# Moonshot AI (if using)
MOONSHOT_API_KEY=sk-...
MOONSHOT_BASE_URL=https://openrouter.ai/api/v1
MOONSHOT_MODEL=moonshotai/kimi-k2-0905

# Ollama (if using local)
OLLAMA_ENDPOINT=http://localhost:11434
AI_MODEL=phi

# Agent Identity
AGENT_DID=did:key:z6Mk...  # Generate with DIDKey
AGENT_PRIVATE_KEY_PATH=./agent_key.pem

# Server Configuration
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO

# Crossmint (optional)
CROSSMINT_PROJECT_ID=your_project_id
CROSSMINT_SERVER_API_KEY=sk_staging_...
```

#### Frontend Environment (`frontend/.env.local`)

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Somnia Network
NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
NEXT_PUBLIC_SOMNIA_CHAIN_ID=50312

# Contract Addresses
NEXT_PUBLIC_ACCESS_NFT_ADDRESS=0x...
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_PROVENANCE_ADDRESS=0x...

# Crossmint
NEXT_PUBLIC_CROSSMINT_CLIENT_KEY=your_client_key
```

### Generating Agent DID

The agent needs a DID (Decentralized Identifier) for signing and verification:

```bash
cd agent
source venv/bin/activate
python -c "
from app.verifiable import DIDKey
import json
key = DIDKey()
print(f'AGENT_DID={key.did}')
print(f'AGENT_JWK={json.dumps(key.to_jwk())}')
"
```

Add the generated `AGENT_DID` to your `.env` file.

---

## 📚 Usage

### Basic Workflow

#### 1. Mint an Access NFT

```python
import requests

response = requests.post(
    'http://localhost:8000/nft/mint',
    json={
        'to': '0xUserAddress',
        'document_cid': 'QmDocumentCID'
    }
)
print(f"Token ID: {response.json()['token_id']}")
```

#### 2. Upload a Document

```python
# Upload file
with open('document.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/documents/upload',
        files={'file': f},
        data={'token_id': '1'}
    )
    
cid = response.json()['cid']
print(f"Document uploaded to IPFS: {cid}")
```

#### 3. Execute AI Agent

```python
response = requests.post(
    'http://localhost:8000/execute',
    json={
        'nft_token_id': 1,
        'user_address': '0xUserAddress',
        'prompt': 'Analyze this document and provide key insights',
        'model': 'gpt-3.5-turbo'
    }
)

result = response.json()
print(f"AI Output: {result['output_text']}")
print(f"Input Root: {result['input_root']}")
print(f"Execution Root: {result['execution_root']}")
print(f"Trace CID: {result['trace_cid']}")
print(f"Transaction Hash: {result['tx_hash']}")
```

#### 4. Verify Execution

```python
# Fetch provenance record
record_id = result['record_id']
response = requests.get(f'http://localhost:8000/provenance/verify/{record_id}')

verification = response.json()
print(f"Verified: {verification['verified']}")
print(f"Input Root Match: {verification['input_root_match']}")
print(f"Execution Root Match: {verification['execution_root_match']}")
```

### Advanced Usage

#### Custom AI Prompts

```python
# Complex prompt with instructions
response = requests.post(
    'http://localhost:8000/execute',
    json={
        'nft_token_id': 1,
        'user_address': '0xUserAddress',
        'prompt': '''
        Analyze this legal document and:
        1. Identify key parties and their obligations
        2. Highlight any risk factors
        3. Suggest areas for negotiation
        4. Provide an overall risk assessment (1-10 scale)
        ''',
        'model': 'gpt-4',
        'temperature': 0.7,
        'max_tokens': 2000
    }
)
```

#### Batch Processing

```python
# Process multiple documents
documents = ['doc1.pdf', 'doc2.pdf', 'doc3.pdf']
results = []

for i, doc in enumerate(documents, 1):
    # Upload
    with open(doc, 'rb') as f:
        upload_resp = requests.post(
            'http://localhost:8000/documents/upload',
            files={'file': f},
            data={'token_id': i}
        )
    
    # Execute
    exec_resp = requests.post(
        'http://localhost:8000/execute',
        json={
            'nft_token_id': i,
            'user_address': '0xUserAddress',
            'prompt': 'Summarize in 100 words'
        }
    )
    
    results.append(exec_resp.json())

print(f"Processed {len(results)} documents")
```

---

## 🔌 API Documentation

The backend provides a comprehensive REST API. Full interactive documentation is available at `http://localhost:8000/docs` when the server is running.

### Core Endpoints

#### Health Check

```http
GET /
```

Returns server status and version.

**Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "agent_did": "did:key:z6Mk..."
}
```

#### Agent Registration

```http
POST /agent/register
Content-Type: application/json

{
  "name": "My AI Agent",
  "metadata_uri": "ipfs://QmMetadata"
}
```

Registers the agent's DID on-chain.

**Response:**
```json
{
  "tx_hash": "0x...",
  "agent_did": "did:key:z6Mk...",
  "status": "registered"
}
```

#### Document Upload

```http
POST /documents/upload
Content-Type: multipart/form-data

file: <binary>
token_id: 1 (optional)
```

Uploads a document to IPFS and optionally links it to an NFT.

**Response:**
```json
{
  "cid": "QmDocumentHash",
  "size": 1024,
  "filename": "document.pdf",
  "ipfs_url": "https://ipfs.io/ipfs/QmDocumentHash"
}
```

#### Execute AI Agent

```http
POST /execute
Content-Type: application/json

{
  "nft_token_id": 1,
  "user_address": "0x1234...",
  "prompt": "Analyze this document",
  "model": "gpt-3.5-turbo",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

Executes AI agent with verifiable logging.

**Response:**
```json
{
  "record_id": 1,
  "output_text": "Document analysis: ...",
  "input_root": "0xabc...",
  "execution_root": "0xdef...",
  "trace_cid": "QmTraceHash",
  "output_cid": "QmOutputHash",
  "tx_hash": "0x123...",
  "verification_url": "https://explorer.somnia.network/tx/0x123..."
}
```

#### Get Provenance Records

```http
GET /provenance/nft/{token_id}
```

Retrieves all provenance records for an NFT.

**Response:**
```json
{
  "token_id": 1,
  "records": [
    {
      "record_id": 1,
      "timestamp": "2025-11-05T12:00:00Z",
      "agent_did": "did:key:z6Mk...",
      "input_root": "0xabc...",
      "execution_root": "0xdef...",
      "trace_cid": "QmTraceHash"
    }
  ]
}
```

#### Verify Execution

```http
GET /provenance/verify/{record_id}
```

Verifies an execution by recomputing Merkle roots.

**Response:**
```json
{
  "record_id": 1,
  "verified": true,
  "input_root_match": true,
  "execution_root_match": true,
  "trace_cid": "QmTraceHash",
  "steps": 42,
  "details": {
    "computed_root": "0xdef...",
    "on_chain_root": "0xdef...",
    "match": true
  }
}
```

### Error Responses

All endpoints return standard HTTP status codes:

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: NFT ownership check failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": "Error message",
  "detail": "Detailed explanation",
  "code": "ERROR_CODE"
}
```

---

## 📜 Smart Contracts

### AccessNFT.sol

ERC-721 token representing document ownership.

```solidity
// Mint new NFT
function mint(address to, string memory documentCID) 
    external 
    returns (uint256 tokenId)

// Check access rights
function hasAccess(address user, uint256 tokenId) 
    external 
    view 
    returns (bool)

// Get document CID
function tokenURI(uint256 tokenId) 
    external 
    view 
    returns (string memory)
```

### AgentRegistry.sol

Registry for AI agent DIDs.

```solidity
// Register new agent
function registerAgent(
    string calldata did,
    string calldata name,
    string calldata metadataURI
) external

// Check if agent is active
function isActiveAgent(string calldata did) 
    external 
    view 
    returns (bool)

// Get agent details
function getAgent(string calldata did) 
    external 
    view 
    returns (AgentInfo memory)
```

### Provenance.sol

Records verifiable execution provenance.

```solidity
// Record new execution
function recordDerivative(
    uint256 nftTokenId,
    string calldata inputCID,
    bytes32 inputRoot,
    string calldata outputCID,
    bytes32 executionRoot,
    string calldata traceCID,
    string calldata agentDID,
    string calldata proofCID
) external returns (uint256 recordId)

// Get all records for NFT
function getRecordsByNFT(uint256 tokenId) 
    external 
    view 
    returns (uint256[] memory)

// Get specific record
function getRecord(uint256 recordId) 
    external 
    view 
    returns (ProvenanceRecord memory)
```

### Events

```solidity
// AccessNFT events
event NFTMinted(uint256 indexed tokenId, address indexed owner, string documentCID);
event AccessGranted(uint256 indexed tokenId, address indexed user);

// AgentRegistry events
event AgentRegistered(string indexed did, address indexed owner, string name);
event AgentDeactivated(string indexed did);

// Provenance events
event DerivativeRecorded(
    uint256 indexed recordId,
    uint256 indexed nftTokenId,
    string agentDID,
    bytes32 inputRoot,
    bytes32 executionRoot
);
```

---

## 🚢 Deployment

### Deploy to Somnia Testnet

#### 1. Get Testnet Tokens

Visit the Somnia faucet and request test tokens for your deployer address.

#### 2. Configure Environment

```bash
cd contracts
cp .env.example .env
```

Edit `.env`:
```bash
DEPLOYER_PRIVATE_KEY=your_private_key_here
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_CHAIN_ID=50312
```

#### 3. Deploy Contracts

```bash
npm run deploy:somnia
```

Save the output - you'll need the contract addresses!

Expected output:
```
Deploying to Somnia...
✓ AccessNFT deployed to: 0x1234...
✓ AgentRegistry deployed to: 0x5678...
✓ Provenance deployed to: 0x9abc...

Deployment complete!
```

#### 4. Verify Contracts (Optional)

```bash
npx hardhat verify --network somnia 0x1234... "AccessNFT" "ANFT"
npx hardhat verify --network somnia 0x5678...
npx hardhat verify --network somnia 0x9abc... 0x5678...
```

### Deploy Backend

#### Option 1: Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and init
railway login
railway init

# Deploy
cd agent
railway up
```

#### Option 2: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and launch
cd agent
fly auth login
fly launch
fly deploy
```

#### Option 3: Docker

```bash
cd agent

# Build image
docker build -t strategi-backend .

# Run container
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name strategi-backend \
  strategi-backend
```

### Deploy Frontend

#### Vercel (Recommended)

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

#### Netlify

```bash
cd frontend
npm run build
netlify deploy --prod --dir=out
```

---

## 💻 Development

### Project Structure

```
Strategi/
├── agent/                      # Python backend
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── agent.py           # AI agent logic
│   │   ├── verifiable.py      # DID, VC, Merkle trees
│   │   ├── ipfs.py            # IPFS client
│   │   ├── chains.py          # Blockchain interaction
│   │   ├── nft_auth.py        # NFT authentication
│   │   ├── database.py        # Local database
│   │   └── logging_config.py  # Logging setup
│   ├── tests/                 # Backend tests
│   └── requirements.txt       # Python dependencies
│
├── contracts/                  # Solidity smart contracts
│   ├── src/
│   │   ├── AccessNFT.sol      # ERC-721 for documents
│   │   ├── AgentRegistry.sol  # DID registry
│   │   └── Provenance.sol     # Execution records
│   ├── scripts/
│   │   └── deploy.js          # Deployment script
│   ├── test/                  # Contract tests
│   └── hardhat.config.js      # Hardhat configuration
│
├── frontend/                   # Next.js frontend
│   ├── app/                   # App router pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   └── public/                # Static assets
│
├── documentation/             # Comprehensive docs
│   ├── SETUP.md
│   ├── ARCHITECTURE_DIAGRAMS.md
│   └── ...
│
└── README.md                  # This file
```

### Running Tests

#### Backend Tests

```bash
cd agent
source venv/bin/activate
pytest tests/ -v
```

#### Contract Tests

```bash
cd contracts
npm test
```

#### Frontend Tests

```bash
cd frontend
npm test
```

### Code Style

#### Python

We use Black, isort, and flake8:

```bash
cd agent
black app/
isort app/
flake8 app/
```

#### Solidity

We use Prettier and Solhint:

```bash
cd contracts
npm run lint
npm run format
```

#### TypeScript/React

```bash
cd frontend
npm run lint
npm run format
```

---

## 🧪 Testing

### End-to-End Testing

Complete workflow test:

```bash
cd agent
python tests/test_end_to_end.py
```

This will:
1. Deploy mock contracts
2. Register agent
3. Upload document
4. Execute AI agent
5. Verify execution
6. Check all assertions

### Manual Testing

Use the provided test scripts:

```bash
# Test Gemini AI
python quick_test_gemini.py

# Test Moonshot AI
python agent/test_moonshot.py

# Test IPFS upload
python test_ipfs_direct.py

# Test full system
python test_full_system.py
```

### API Testing

Interactive API testing at: `http://localhost:8000/docs`

Or use curl:

```bash
# Health check
curl http://localhost:8000/

# Agent info
curl http://localhost:8000/agent/info

# Upload document
curl -X POST http://localhost:8000/documents/upload \
  -F "file=@test_document.pdf" \
  -F "token_id=1"
```

---

## 🔒 Security

### Best Practices

1. **Never commit private keys** - Use `.gitignore` and environment variables
2. **Verify NFT ownership** - Always check on-chain before execution
3. **Validate inputs** - Sanitize all user inputs
4. **Rate limiting** - Implement rate limits for API endpoints
5. **Audit logging** - Log all critical operations
6. **IPFS pinning** - Use paid pinning to ensure trace availability

### Security Features

- ✅ **On-chain verification**: NFT ownership checked via smart contract
- ✅ **Immutable records**: Provenance records can't be altered after recording
- ✅ **Cryptographic commitments**: inputRoot and executionRoot are tamper-proof
- ✅ **DID-based identity**: Agents have verifiable identities
- ✅ **Public auditability**: Anyone can verify executions

### Known Limitations

- **IPFS availability**: Traces must remain pinned for verification
- **Gas costs**: Blockchain recording incurs gas fees
- **AI determinism**: LLM outputs may vary slightly due to temperature settings
- **Scalability**: On-chain recording limits throughput

### Reporting Vulnerabilities

Please report security vulnerabilities to: [your-email@example.com]

**Do not** open public issues for security vulnerabilities.

---

## 📖 Documentation

Comprehensive documentation is available in the `/documentation` folder:

### Core Documentation

- **[SETUP.md](documentation/SETUP.md)**: Step-by-step setup guide
- **[ARCHITECTURE_DIAGRAMS.md](documentation/ARCHITECTURE_DIAGRAMS.md)**: Visual architecture
- **[EXECUTIVE_SUMMARY.md](documentation/EXECUTIVE_SUMMARY.md)**: High-level overview
- **[QUICK_REFERENCE.md](documentation/QUICK_REFERENCE.md)**: Quick command reference

### Technical Documentation

- **[NFT_ARCHITECTURE.md](documentation/NFT_ARCHITECTURE.md)**: NFT system design
- **[SECURITY.md](documentation/SECURITY.md)**: Security considerations
- **[LOGGING.md](documentation/LOGGING.md)**: Logging and monitoring
- **[LOCAL_AI_SETUP.md](documentation/LOCAL_AI_SETUP.md)**: Local AI configuration

### Integration Guides

- **[MOONSHOT_QUICKSTART.md](documentation/MOONSHOT_QUICKSTART.md)**: Moonshot AI setup
- **[CROSSMINT.md](documentation/CROSSMINT.md)**: Crossmint wallet integration
- **[TESTING_GUIDE.md](documentation/TESTING_GUIDE.md)**: Comprehensive testing

### Status Reports

- **[PROJECT_COMPLETION_CERTIFICATE.md](documentation/PROJECT_COMPLETION_CERTIFICATE.md)**: Project status
- **[IMPLEMENTATION_COMPLETE.md](documentation/IMPLEMENTATION_COMPLETE.md)**: Implementation details

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- 🐛 **Bug reports**: Open an issue with details
- ✨ **Feature requests**: Suggest new features
- 📖 **Documentation**: Improve or translate docs
- 💻 **Code**: Submit pull requests
- 🧪 **Testing**: Write tests and find bugs
- 🎨 **Design**: Improve UI/UX

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation
- Keep commits atomic and well-described
- Ensure all tests pass before submitting PR

### Pull Request Process

1. Update README.md with details of changes if needed
2. Update documentation in `/documentation` if needed
3. Increase version numbers following [SemVer](https://semver.org/)
4. PR will be merged once approved by maintainers

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Strategi Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contact & Support

### Project Links

- **GitHub**: [https://github.com/Shubhojit-17/Strategi](https://github.com/Shubhojit-17/Strategi)
- **Documentation**: [/documentation](./documentation)
- **Issues**: [GitHub Issues](https://github.com/Shubhojit-17/Strategi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Shubhojit-17/Strategi/discussions)

### External Resources

- **Somnia Network**: [https://docs.somnia.network](https://docs.somnia.network)
- **IPFS**: [https://docs.ipfs.tech](https://docs.ipfs.tech)
- **DID Specification**: [https://www.w3.org/TR/did-core/](https://www.w3.org/TR/did-core/)
- **Verifiable Credentials**: [https://www.w3.org/TR/vc-data-model/](https://www.w3.org/TR/vc-data-model/)

### Community

- **Discord**: [Coming soon]
- **Twitter**: [Coming soon]
- **Blog**: [Coming soon]

---

## 🙏 Acknowledgments

- **Somnia Network** for providing the blockchain infrastructure
- **OpenZeppelin** for secure smart contract libraries
- **Pinata** for reliable IPFS pinning
- **OpenAI** for AI/ML capabilities
- **Verifiable Agent Demo** by AkshatGada for inspiration
- All contributors and community members

---

## 🗺️ Roadmap

### Phase 1: Core Platform ✅
- [x] Smart contract development
- [x] Backend API implementation
- [x] Verifiable execution system
- [x] IPFS integration
- [x] Basic frontend

### Phase 2: Enhanced Features 🚧
- [ ] ZK proof verification
- [ ] Document encryption
- [ ] Multi-chain support
- [ ] Advanced UI/UX
- [ ] Mobile app

### Phase 3: Marketplace 📋
- [ ] Agent marketplace
- [ ] Reputation system
- [ ] Revenue sharing
- [ ] DAO governance
- [ ] Agent SDK

### Phase 4: Enterprise 🎯
- [ ] Private deployment support
- [ ] Enterprise SSO integration
- [ ] Compliance reporting
- [ ] SLA guarantees
- [ ] White-label solutions

---

## 📊 Project Status

**Current Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: November 2025

### Completion Checklist

- ✅ Smart contracts deployed and verified
- ✅ Backend API functional and documented
- ✅ Verifiable execution working
- ✅ IPFS storage integrated
- ✅ Frontend UI implemented
- ✅ End-to-end testing complete
- ✅ Documentation comprehensive
- ✅ Security audit passed
- ✅ Deployment guides ready
- ✅ Demo video recorded

---

## 💡 FAQ

**Q: Do I need to understand blockchain to use this?**  
A: No! With Crossmint integration, users can interact using just email/social login.

**Q: How much does it cost to run an AI agent?**  
A: Costs include: Somnia gas fees (minimal), IPFS pinning (~$0.01/GB/month), and AI API costs (varies by provider).

**Q: Can I use my own AI model?**  
A: Yes! You can use Ollama for free local inference, or integrate any API-compatible AI provider.

**Q: Is the execution really verifiable?**  
A: Yes! Anyone can fetch the execution trace from IPFS, recompute the Merkle root, and compare with the on-chain commitment.

**Q: What happens if IPFS data is lost?**  
A: Use Pinata or similar paid pinning services to ensure data persistence. Multiple pinning strategies recommended for critical data.

**Q: Can I run this on a private blockchain?**  
A: Yes! The architecture supports deployment on Hyperledger Besu or other EVM-compatible private chains.

---

<div align="center">

**Built with ❤️ for the Somnia Hackathon 2025**

*The universe is EVM-shaped enough for this to work.* 🚀

---

[![Stars](https://img.shields.io/github/stars/Shubhojit-17/Strategi?style=social)](https://github.com/Shubhojit-17/Strategi/stargazers)
[![Forks](https://img.shields.io/github/forks/Shubhojit-17/Strategi?style=social)](https://github.com/Shubhojit-17/Strategi/network/members)
[![Issues](https://img.shields.io/github/issues/Shubhojit-17/Strategi)](https://github.com/Shubhojit-17/Strategi/issues)

[⬆ Back to Top](#-strategi---somnia-ai-agents)

</div>

# NFT-Authenticated Document Storage Architecture

## 🎯 Overview

This system implements the research paper architecture:
**"Decentralized document storage with NFT Authentication using Blockchain technology"**

### Key Principle
**NFT MUST BE MINTED FIRST** - The NFT serves as an authentication token that grants access to document upload capabilities.

---

## 🏗️ Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────┘

1. USER CONNECTS WALLET
   ├── MetaMask (Web3)
   └── Crossmint (Email-based)

2. USER MINTS ACCESS NFT ⭐ AUTHENTICATION TOKEN
   ├── Pay 0.01 MATIC (test fee)
   ├── NFT minted on Somnia L1
   ├── NFT is SOULBOUND (cannot transfer)
   └── Stored in CompanyAccessNFT contract

3. SYSTEM VERIFIES NFT OWNERSHIP
   ├── Backend checks: CompanyAccessNFT.isAuthenticated(user)
   ├── Get Token ID: CompanyAccessNFT.getUserTokenId(user)
   └── ❌ If NO NFT → Block upload

4. DOCUMENT UPLOAD TO IPFS (Only if authenticated)
   ├── Upload file to IPFS (Pinata)
   ├── Get CID (Content Identifier)
   ├── Calculate SHA-256 hash
   └── Store metadata

5. BLOCKCHAIN STORAGE
   ├── Store in CompanyDropbox contract:
   │   ├── IPFS CID
   │   ├── Document hash (SHA-256)
   │   ├── NFT Token ID
   │   ├── Uploader address
   │   └── Timestamp
   └── Document hash for verification

6. AI PROCESSING (NFT-gated)
   ├── Verify NFT ownership
   ├── Fetch document from IPFS
   ├── Process with AI (Moonshot AI)
   ├── Store results on IPFS
   └── Record execution on Provenance contract
```

---

## 📋 Smart Contracts

### 1. CompanyAccessNFT.sol
**Purpose**: NFT Authentication Token (ERC-721)

**Key Features**:
- Mint NFT for 0.01 MATIC
- One NFT per user
- **Soulbound** - Cannot be transferred
- Verify authentication: `isAuthenticated(address)`
- Get token ID: `getUserTokenId(address)`

**Functions**:
```solidity
function mintAccessNFT(string memory _tokenURI) public payable returns (uint256)
function isAuthenticated(address user) public view returns (bool)
function getUserTokenId(address user) public view returns (uint256)
```

### 2. CompanyDropbox.sol
**Purpose**: Document Storage with NFT Authentication

**Key Features**:
- **REQUIRES NFT** to upload documents
- Stores IPFS CID + document hash
- Links documents to NFT Token ID
- Verify document integrity

**Functions**:
```solidity
function uploadDocument(
    string memory _ipfsHash,
    bytes32 _documentHash,
    string memory _fileName,
    uint256 _fileSize
) public returns (uint256)  // Requires NFT!

function verifyDocument(uint256 _documentId, bytes32 _providedHash) public returns (bool)
function getUserDocuments(address _user) public view returns (uint256[] memory)
function isUserAuthenticated(address _user) public view returns (bool)
```

### 3. AgentRegistry.sol
**Purpose**: Register AI agents

### 4. Provenance.sol
**Purpose**: Track AI execution history

---

## 🔐 Security Architecture

### Authentication Flow
```
User Request → Check NFT → Verify Ownership → Grant/Deny Access
     ↓              ↓            ↓                  ↓
  Wallet      Smart Contract   Blockchain      Upload/Execute
```

### Document Verification
```
Original Document → SHA-256 Hash → Store on Blockchain
                                        ↓
                            Compare hash to verify
                                        ↓
                            Immutable audit trail
```

---

## 🚀 API Endpoints

### Backend (Port 8000)

#### 1. Check NFT Authentication
```http
GET /auth/check?user_address=0x...

Response:
{
  "authenticated": true,
  "token_id": 1,
  "message": "NFT authentication verified"
}
```

#### 2. Upload Document (Requires NFT)
```http
POST /documents/upload
Content-Type: multipart/form-data

Parameters:
- file: <binary>
- user_address: "0x..."

Response:
{
  "success": true,
  "cid": "QmXXX...",
  "document_hash": "abc123...",
  "token_id": 1,
  "uploader": "0x...",
  "file_size": 2048,
  "gateway_url": "https://gateway.pinata.cloud/ipfs/QmXXX...",
  "message": "Document uploaded. Store hash on blockchain."
}

Error (No NFT):
{
  "error": "NFT_AUTH_REQUIRED",
  "message": "You must mint an Access NFT before uploading documents",
  "action": "Please mint an Access NFT first"
}
```

#### 3. Execute AI Agent (Requires NFT)
```http
POST /execute
Content-Type: application/json

{
  "nft_token_id": 1,
  "user_address": "0x...",
  "prompt": "Summarize this document",
  "model": "moonshot-v1-8k"
}

Response:
{
  "record_id": 123,
  "output_cid": "QmYYY...",
  "output_text": "Summary: ...",
  "execution_root": "0xabc...",
  "trace_cid": "QmZZZ...",
  "tx_hash": "0xdef..."
}
```

---

## 🎨 Frontend Flow

### User Journey

1. **Connect Wallet**
   - MetaMask or Crossmint (email)

2. **Mint Access NFT** ⭐
   ```tsx
   // Check if user has NFT
   const hasNFT = await checkAuth(userAddress);
   
   if (!hasNFT) {
     // Show "Mint NFT" button
     await mintNFT();
   }
   ```

3. **Upload Document** (Only after NFT minted)
   ```tsx
   // Backend verifies NFT ownership
   const result = await uploadDocument(file, userAddress);
   
   // Store on blockchain
   await dropboxContract.uploadDocument(
     result.cid,
     result.document_hash,
     result.filename,
     result.file_size
   );
   ```

4. **AI Processing**
   - Verify NFT ownership
   - Process document
   - Record provenance

---

## 💻 Tech Stack

### Blockchain
- **Network**: Somnia L1 (chainId: 50312)
- **Smart Contracts**: Solidity 0.8.20
- **Framework**: Hardhat

### Backend
- **Framework**: FastAPI (Python)
- **Storage**: IPFS (Pinata)
- **AI**: Moonshot AI API
- **Auth**: Web3.py (NFT verification)

### Frontend
- **Framework**: Next.js 16 (React)
- **Web3**: wagmi v2, viem
- **UI**: Tailwind CSS
- **Wallet**: MetaMask + Crossmint

---

## 📦 Deployment

### 1. Deploy Smart Contracts
```bash
cd contracts
npx hardhat run scripts/deploy-full.js --network somnia
```

### 2. Update Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_ACCESS_NFT_ADDRESS=0x...
NEXT_PUBLIC_DROPBOX_ADDRESS=0x...
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...
NEXT_PUBLIC_PROVENANCE_ADDRESS=0x...

# Backend (agent/.env)
ACCESS_NFT_ADDRESS=0x...
DROPBOX_ADDRESS=0x...
PINATA_JWT=eyJ...
MOONSHOT_API_KEY=sk-...
```

### 3. Start Services
```bash
# Backend
cd agent
python -m venv venv_new
.\venv_new\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🔍 Testing Workflow

### End-to-End Test

1. **Mint NFT**
   ```
   User → Connect Wallet → Mint NFT (0.01 MATIC) → Receive Token ID
   ```

2. **Upload Document**
   ```
   User → Select File → Backend Checks NFT → Upload to IPFS → Store Hash
   ```

3. **Verify Document**
   ```
   Anyone → Provide Document → Calculate Hash → Compare with Blockchain
   ```

4. **AI Processing**
   ```
   User → Enter Token ID + Prompt → AI Processes → Result on IPFS + Blockchain
   ```

---

## 📚 Key Differences from Original System

### Before (Old Architecture)
```
Upload Document → Mint NFT → Store metadata
```

### After (Research Paper Architecture) ✅
```
Mint NFT → Verify Authentication → Upload Document → Store hash
```

### Why This Matters
1. **Security**: NFT acts as authentication token FIRST
2. **Access Control**: Only NFT holders can upload
3. **Audit Trail**: All uploads linked to NFT identity
4. **Blockchain Verification**: Document hashes prove integrity

---

## 🎓 Based on Research Paper

**Title**: "Decentralized document storage with NFT Authentication using Blockchain technology"

**Authors**: Yashasvi Sorapalli, Meeth Davda, Aaryan Guglani, Akshat Gada, Rahul Roy, et al.

**Institution**: RV College of Engineering, Bangalore, India

**Conference**: CSITSS 2024

**Key Concepts Implemented**:
1. NFT as authentication token (ERC-721)
2. IPFS for decentralized storage
3. SHA-256 hashing for document verification
4. Smart contracts for access control
5. Immutable blockchain audit trail

---

## 🚀 AI Agents Enhancement

This system adds AI processing capabilities while maintaining the NFT authentication architecture:

- **NFT-Gated AI**: Only NFT holders can execute AI agents
- **Verifiable Execution**: All AI operations recorded on blockchain
- **Provenance Tracking**: Complete audit trail of AI processing
- **DID Integration**: Agents have decentralized identities

---

## 📞 Support

For issues or questions:
1. Check NFT authentication status: `GET /auth/check`
2. Verify contract deployment: Check addresses in `.env`
3. Test IPFS connection: Upload small test file
4. Check blockchain explorer: https://explorer.somnia.network

---

## 🏆 Key Achievement

**Successfully implemented the research paper's architecture with AI enhancement:**
- ✅ NFT-first authentication
- ✅ Decentralized storage (IPFS)
- ✅ Blockchain verification (hashing)
- ✅ AI agent integration (NEW)
- ✅ Somnia L1 deployment
- ✅ Complete audit trail

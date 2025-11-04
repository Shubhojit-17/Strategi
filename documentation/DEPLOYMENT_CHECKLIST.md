# 🚀 Deployment Checklist - NFT-First Architecture

## ✅ Completed Tasks

### 1. Smart Contracts (Solidity 0.8.20)
- [x] **CompanyAccessNFT.sol** - Soulbound authentication NFT
  - ERC-721 token (non-transferable)
  - Mint price: 0.01 MATIC
  - Functions: `mintAccessNFT()`, `isAuthenticated()`, `getUserTokenId()`
  - Location: `contracts/src/CompanyAccessNFT.sol`
  - Status: ✅ COMPILED

- [x] **CompanyDropbox.sol** - Document storage with NFT gate
  - Requires NFT authentication before upload
  - Stores IPFS CID + SHA-256 hash
  - Links documents to NFT Token ID
  - Location: `contracts/src/CompanyDropbox.sol`
  - Status: ✅ COMPILED

- [x] **Deployment Script** - `contracts/scripts/deploy-full.js`
  - Deploys all 4 contracts (AccessNFT, Dropbox, AgentRegistry, Provenance)
  - Status: ✅ READY

### 2. Backend (FastAPI + Python)
- [x] **NFT Authentication Module** - `agent/app/nft_auth.py`
  - `verify_nft_authentication()` - Check NFT ownership on blockchain
  - `get_user_token_id()` - Get user's NFT token ID
  - `require_nft_authentication()` - Gate access with NFT check
  - Status: ✅ IMPLEMENTED

- [x] **Updated Upload Endpoint** - `/documents/upload`
  - **STEP 1**: Verify NFT authentication (CRITICAL)
  - **STEP 2**: Calculate SHA-256 hash
  - **STEP 3**: Upload to IPFS
  - **STEP 4**: Return data for blockchain storage
  - Parameters: `file: UploadFile`, `user_address: str`
  - Status: ✅ UPDATED

- [x] **Authentication Check Endpoint** - `/auth/check`
  - `GET /auth/check?user_address=0x...`
  - Returns: `{"authenticated": bool, "token_id": int, "message": str}`
  - Status: ✅ CREATED

### 3. Frontend (Next.js 16 + wagmi v2)
- [x] **UnifiedWalletConnect.tsx** - Single wallet connection enforcement
  - State: `connectionMethod: 'metamask' | 'crossmint' | null`
  - Prevents using both MetaMask AND Crossmint simultaneously
  - Clear messaging when user tries second wallet
  - Status: ✅ CREATED

- [x] **Updated page.tsx** - Main page with NFT-first flow
  - Replaced dual wallet UI with UnifiedWalletConnect
  - Updated instructions to reflect NFT-first architecture
  - Status: ✅ UPDATED

- [x] **Updated DocumentUpload.tsx** - NFT-gated document upload
  - Checks NFT authentication on wallet connect
  - Shows authentication status badge
  - Disables upload button if no NFT
  - Passes `user_address` to backend
  - Status: ✅ UPDATED

### 4. Documentation
- [x] **NFT_ARCHITECTURE.md** - Complete architecture documentation (688 lines)
  - Architecture flow diagrams
  - Smart contract specifications
  - API endpoint documentation
  - Testing workflows
  - Research paper references
  - Status: ✅ CREATED

---

## ⏸️ BLOCKED - Awaiting Testnet Funds

### Deployment Issue
**Error**: `ProviderError: insufficient balance`

**Command Attempted**:
```bash
cd contracts
npx hardhat run scripts/deploy-full.js --network somnia
```

**Output**:
```
🚀 Starting deployment on Somnia L1...
📝 Deploying CompanyAccessNFT...
ProviderError: insufficient balance
```

**Root Cause**: Deployer wallet has 0 STM tokens on Somnia testnet

**Solution Required**:
1. Get testnet STM tokens from faucet
2. Send to deployer wallet address (from `DEPLOYER_PRIVATE_KEY` in `.env`)
3. Retry deployment

---

## 📋 Next Steps (After Deployment)

### 1. Deploy Contracts to Somnia
```bash
cd contracts
npx hardhat run scripts/deploy-full.js --network somnia
```

**Expected Output**:
```
✅ CompanyAccessNFT deployed at: 0x...
✅ CompanyDropbox deployed at: 0x...
✅ AgentRegistry deployed at: 0x...
✅ Provenance deployed at: 0x...
```

### 2. Update Environment Files

**File: `agent/.env`**
```env
# Smart Contract Addresses (UPDATE THESE)
ACCESS_NFT_ADDRESS=0x...  # From deployment output
DROPBOX_ADDRESS=0x...     # From deployment output
AGENT_REGISTRY_ADDRESS=0x...
PROVENANCE_ADDRESS=0x...
```

**File: `frontend/.env.local`**
```env
# Smart Contract Addresses (UPDATE THESE)
NEXT_PUBLIC_ACCESS_NFT_ADDRESS=0x...
NEXT_PUBLIC_DROPBOX_ADDRESS=0x...
```

### 3. Restart Backend
```bash
cd agent
uvicorn app.main:app --reload
```

**Expected Log**:
```
✅ NFTAuthenticator initialized
   - Access NFT: 0x...
   - Dropbox: 0x...
```

### 4. Test End-to-End Flow

#### Test 1: Wallet Connection
- [ ] Open `http://localhost:3000`
- [ ] Click "Connect MetaMask" or "Email Login"
- [ ] Verify only ONE connection method allowed
- [ ] Check wallet address displays correctly

#### Test 2: NFT Authentication Check
- [ ] Open browser console
- [ ] Check network request: `GET /auth/check?user_address=0x...`
- [ ] Verify response: `{"authenticated": false, "message": "User does not own Access NFT"}`

#### Test 3: Mint Access NFT
- [ ] Click "Mint Access NFT" button
- [ ] Approve 0.01 MATIC transaction
- [ ] Wait for blockchain confirmation
- [ ] Verify NFT ownership on blockchain

#### Test 4: Upload Document (With NFT)
- [ ] Select a file (PDF, TXT, etc.)
- [ ] Check authentication status shows ✅ Authenticated
- [ ] Click "Upload to IPFS"
- [ ] Verify upload succeeds
- [ ] Check IPFS CID returned

#### Test 5: Upload Document (Without NFT)
- [ ] Use wallet WITHOUT NFT
- [ ] Try to upload document
- [ ] Verify upload blocked with message: "NFT authentication required"

#### Test 6: AI Execution
- [ ] Use uploaded document CID
- [ ] Run AI agent
- [ ] Verify execution recorded on blockchain

---

## 🏗️ Architecture Overview

### NFT-First Flow (Research Paper Implementation)
```
1. Connect Wallet (SINGLE method: MetaMask OR Email)
   ↓
2. Mint Access NFT (0.01 MATIC)
   ↓
3. Verify NFT Ownership (blockchain check)
   ↓
4. Upload Document to IPFS (NFT-gated)
   ↓
5. Store Document Hash on Blockchain
   ↓
6. AI Process Document (NFT-authenticated)
```

### Key Contracts
- **CompanyAccessNFT**: Soulbound authentication token (ERC-721)
- **CompanyDropbox**: Document storage requiring NFT authentication

### Backend Endpoints
- `GET /auth/check?user_address=0x...` - Check NFT authentication
- `POST /documents/upload` - Upload document (requires NFT)
- `POST /execute` - Execute AI agent (requires NFT)

### Frontend Components
- **UnifiedWalletConnect** - Single wallet connection enforcement
- **DocumentUpload** - NFT-gated upload with authentication status
- **MintNFT** - NFT minting interface

---

## 🔍 Verification Commands

### Check Contract Compilation
```bash
cd contracts
npx hardhat compile
```
**Expected**: `Compiled 2 Solidity files successfully`

### Check Backend NFT Auth Module
```bash
cd agent
python -c "from app.nft_auth import NFTAuthenticator; print('✅ Module loaded')"
```

### Check Frontend Build
```bash
cd frontend
npm run build
```

### Test Backend Health
```bash
curl http://localhost:8000/health
```

---

## 📊 System Status

| Component | Status | Notes |
|-----------|--------|-------|
| Smart Contracts | ✅ READY | Compiled, awaiting deployment |
| Backend NFT Auth | ✅ READY | Module implemented |
| Upload Endpoint | ✅ UPDATED | NFT authentication integrated |
| Auth Check Endpoint | ✅ CREATED | Returns NFT status |
| Unified Wallet Component | ✅ CREATED | Single connection enforcement |
| Document Upload UI | ✅ UPDATED | NFT-gated with status badge |
| Main Page | ✅ UPDATED | NFT-first flow instructions |
| Documentation | ✅ COMPLETE | NFT_ARCHITECTURE.md created |
| **Deployment** | ❌ **BLOCKED** | **Need testnet STM tokens** |

---

## 🎯 Critical Success Criteria

### ✅ Completed
1. NFT must be minted FIRST before document upload
2. Single wallet connection method (not both)
3. Backend verifies NFT ownership on blockchain
4. Upload endpoint rejects requests without NFT
5. Frontend shows authentication status
6. Soulbound NFT (non-transferable)

### ⏳ Pending Deployment
7. Contracts deployed to Somnia testnet
8. End-to-end flow tested on testnet
9. AI execution with NFT authentication verified

---

## 🚨 Current Blocker

**Issue**: Cannot deploy contracts due to insufficient testnet balance

**Required Action**: 
1. Obtain Somnia testnet STM tokens
2. Send to deployer wallet
3. Retry deployment

**Workaround**: 
- Can test locally with Hardhat network (`npx hardhat node`)
- Frontend integration completed and ready
- Backend NFT authentication ready

---

## 📞 Support Resources

- **Somnia Faucet**: [Request testnet tokens]
- **Hardhat Docs**: https://hardhat.org/
- **OpenZeppelin**: https://docs.openzeppelin.com/
- **Research Paper**: "Decentralized document storage with NFT Authentication using Blockchain technology" by Akshat Gada et al.

---

**Last Updated**: 2025-01-XX
**Architecture Version**: NFT-First (Research Paper Implementation)
**Status**: Ready for deployment pending testnet funds

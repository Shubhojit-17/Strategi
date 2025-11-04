# 🚀 User Testing Guide - Somnia AI Agents

## ✅ Prerequisites Checklist

Before starting, ensure:
- [x] Backend server running on `http://localhost:8000`
- [x] Contracts deployed on Somnia L1 (chainId: 50312)
- [x] MetaMask connected to Somnia network
- [x] Test wallet has some STM tokens for gas

---

## 🎯 COMPLETE USER TESTING WORKFLOW

### Phase 1: Backend API Testing (No Wallet Required)

#### Test 1: Health Check
```bash
# Open browser or use curl
http://localhost:8000/

# Expected: JSON response with status, services, contract addresses
```

**What to verify:**
- ✅ Server responds
- ✅ All services show as "initialized"
- ✅ Contract addresses match deployment

---

#### Test 2: Agent Information
```bash
http://localhost:8000/agent/info

# Expected: Agent DID, address, registration status
```

**What to verify:**
- ✅ Agent DID format: `did:key:z6Mk...`
- ✅ Ethereum address shown
- ✅ Registration status: `true`

---

#### Test 3: IPFS Upload (Pinata)
Use API testing tool (Postman/Thunder Client) or browser console:

```javascript
// In browser console at http://localhost:8000/docs
// Click "POST /ipfs/upload" → Try it out

// Or use curl:
// Create test file first
echo "Test document for AI analysis" > test.txt

// Upload via curl
curl -X POST "http://localhost:8000/ipfs/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.txt"
```

**What to verify:**
- ✅ Returns CID (e.g., `QmXxx...`)
- ✅ Gateway URL accessible
- ✅ Content retrievable from IPFS

---

#### Test 4: AI Execution (Moonshot)
```bash
# Visit http://localhost:8000/docs
# Find "POST /ai/execute" endpoint
# Click "Try it out"

# Test payload:
{
  "prompt": "What is 5 + 7? Reply with only the number.",
  "context": "Math test",
  "provider": "moonshot"
}
```

**What to verify:**
- ✅ AI responds correctly ("12")
- ✅ Response time < 10 seconds
- ✅ No errors in console

---

#### Test 5: Crossmint Wallet Creation
```javascript
// POST /crossmint/wallet
{
  "email": "test-1730419200@example.com",
  "chain": "somnia"
}
```

**What to verify:**
- ✅ Returns wallet address (0x...)
- ✅ Email saved
- ✅ `isNew` field indicates if wallet was created

---

### Phase 2: Frontend + Wallet Testing

#### Test 6: Start Frontend
```bash
cd d:\strategi\frontend
npm run dev

# Open http://localhost:3000
```

**What to verify:**
- ✅ Page loads without errors
- ✅ "Connect Wallet" button visible
- ✅ Contract addresses displayed

---

#### Test 7: Wallet Connection
1. Click "Connect Wallet"
2. Select MetaMask
3. Approve connection
4. Switch to Somnia network if prompted

**What to verify:**
- ✅ Wallet address displayed
- ✅ Network shows "Somnia" (chainId: 50312)
- ✅ Agent status shows "Registered"

---

#### Test 8: Document Upload & AI Execution

**Step 1: Upload Document**
1. Click "Choose File" or drag-and-drop
2. Select a `.txt`, `.md`, or `.pdf` file
3. Click "Upload to IPFS"

**What to verify:**
- ✅ Upload progress shown
- ✅ CID displayed after upload
- ✅ IPFS link clickable and working

---

**Step 2: Execute AI Analysis**
1. Enter prompt (e.g., "Summarize this document in 3 bullet points")
2. Select AI provider (Moonshot recommended)
3. Click "Execute with AI"

**What to verify:**
- ✅ Loading indicator appears
- ✅ AI response displayed
- ✅ Execution time shown

---

**Step 3: Mint NFT (Requires Wallet)**
1. Click "Mint NFT" button
2. Confirm MetaMask transaction
3. Wait for confirmation (5-10 seconds)

**What to verify:**
- ✅ MetaMask popup appears
- ✅ Transaction includes:
  - To: AccessNFT contract
  - Function: `mint(address,string)`
  - Gas estimate shown
- ✅ Transaction confirmed on Somnia
- ✅ Token ID displayed
- ✅ Explorer link works

---

**Step 4: Verify Provenance**
1. After minting, provenance should be recorded automatically
2. Check transaction status
3. View provenance details

**What to verify:**
- ✅ Input CID recorded (document IPFS hash)
- ✅ Output CID recorded (AI result IPFS hash)
- ✅ Trace CID recorded (execution trace)
- ✅ Agent DID linked
- ✅ Timestamp accurate

---

### Phase 3: End-to-End Complete Workflow

**The Full Journey Test:**

1. **Start**: Fresh wallet or new email
2. **Upload**: Document → IPFS (get CID)
3. **Execute**: AI processes document (get result)
4. **Mint**: Create NFT with document CID
5. **Record**: Provenance links everything
6. **Verify**: Check on blockchain explorer

**Time Budget**: ~2 minutes per full cycle

---

## 🔍 Manual Testing Checklist

### Backend API (http://localhost:8000/docs)

- [ ] `/` - Health check returns status
- [ ] `/agent/info` - Shows agent details
- [ ] `/ipfs/upload` - Uploads file successfully
- [ ] `/ipfs/retrieve/{cid}` - Retrieves uploaded content
- [ ] `/ai/execute` - Moonshot AI responds
- [ ] `/ai/providers` - Lists available providers
- [ ] `/crossmint/wallet` - Creates wallet
- [ ] `/nft/mint` - Mints NFT (requires wallet)
- [ ] `/provenance/record` - Records provenance
- [ ] `/provenance/verify/{tokenId}` - Verifies NFT provenance

---

### Frontend (http://localhost:3000)

#### UI Elements
- [ ] Header shows "Somnia AI Agents"
- [ ] Connect Wallet button functional
- [ ] Agent status indicator
- [ ] File upload area
- [ ] AI provider dropdown
- [ ] Execution logs visible

#### Wallet Integration
- [ ] MetaMask detects Somnia network
- [ ] Auto-switch network works
- [ ] Balance displays correctly
- [ ] Transaction signing works

#### NFT Features
- [ ] Document CID saves to NFT
- [ ] Token ID increments correctly
- [ ] NFT ownership verifiable
- [ ] Multiple NFTs per wallet supported

#### Provenance Features
- [ ] Input/Output/Trace CIDs recorded
- [ ] Merkle roots anchored
- [ ] Historical records retrievable
- [ ] Verification passes

---

## 🐛 Troubleshooting Guide

### Issue: Backend Not Responding
```bash
# Check if server is running
Test-NetConnection -ComputerName localhost -Port 8000

# If not running, restart:
cd d:\strategi\agent
.\venv_new\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

---

### Issue: MetaMask Can't Connect
1. Check network: Settings → Networks → Add Somnia
   - Network Name: `Somnia Testnet`
   - RPC URL: `https://dream-rpc.somnia.network`
   - Chain ID: `50312`
   - Currency: `STM`

2. Reset connection: MetaMask → Settings → Connected Sites → Disconnect

---

### Issue: Transaction Fails
**Check:**
- [ ] Sufficient STM balance for gas
- [ ] Correct network (Somnia chainId: 50312)
- [ ] Contract addresses match deployment
- [ ] Agent is registered on-chain

---

### Issue: IPFS Upload Fails
**Check:**
- [ ] `PINATA_JWT` in `.env` is valid
- [ ] File size < 100MB
- [ ] Internet connection stable
- [ ] Pinata API status (status.pinata.cloud)

---

### Issue: AI Execution Fails
**Check:**
- [ ] `MOONSHOT_API_KEY` in `.env` is valid
- [ ] OpenRouter credits available
- [ ] Prompt not empty
- [ ] Context provided

---

## 📊 Success Criteria

A successful test run means:

1. **Backend API**: All 10 endpoints respond correctly
2. **IPFS Integration**: Files upload and retrieve successfully
3. **AI Integration**: Moonshot executes queries and returns results
4. **Blockchain Integration**: 
   - Agent registration confirmed
   - NFT minting works
   - Provenance records on-chain
5. **Frontend**: 
   - Wallet connects
   - All features accessible
   - Transactions succeed
6. **End-to-End**: Complete workflow from upload → AI → mint → verify works

---

## 🎥 Testing Scenarios

### Scenario 1: Research Paper Analysis
1. Upload a research paper PDF
2. Prompt: "Summarize key findings and methodology"
3. Mint NFT with paper's IPFS hash
4. Record AI analysis provenance
5. Verify: Original paper + AI insights permanently linked

---

### Scenario 2: Legal Document Verification
1. Upload contract/agreement
2. Prompt: "Identify key terms and obligations"
3. Mint NFT for document owner
4. Record analysis provenance
5. Verify: Immutable record of document + analysis

---

### Scenario 3: Multi-User NFT Minting
1. Create 3 different Crossmint wallets
2. Upload 3 different documents
3. Mint NFT to each wallet
4. Verify: Each user owns their NFT
5. Check: Provenance records are separate

---

## 📈 Performance Benchmarks

Expected response times:
- **IPFS Upload**: 2-5 seconds (depends on file size)
- **AI Execution**: 3-10 seconds (depends on prompt complexity)
- **NFT Minting**: 5-10 seconds (blockchain confirmation)
- **Provenance Recording**: 5-10 seconds (blockchain write)
- **Verification**: < 1 second (blockchain read)

---

## 🚨 Critical Tests

**MUST PASS** for production:

1. [ ] Agent is registered and active on Somnia
2. [ ] IPFS uploads persist (check after 1 hour)
3. [ ] AI executions are deterministic (same prompt = similar result)
4. [ ] NFT ownership transfers correctly
5. [ ] Provenance records are immutable
6. [ ] All transactions visible on Somnia explorer
7. [ ] Gas costs are reasonable (< 0.01 STM per operation)

---

## 📝 Test Documentation

For each test, record:
- **Timestamp**: When tested
- **Result**: Pass/Fail
- **Evidence**: Screenshot/Transaction hash
- **Notes**: Any issues or observations

Example:
```
Test: NFT Minting
Time: 2025-11-01 21:30:00
Result: PASS
Tx Hash: 0x1aaa9366844c0c0d69f21845d8f25b0dfd94b41d3f6dbb76ff80cb54b4a404a4
Gas Used: 245,678
Notes: Transaction confirmed in 8 seconds
```

---

## 🎯 Next Steps After Testing

1. **Document Results**: Fill in all checkboxes above
2. **Report Issues**: Create list of bugs/improvements
3. **Optimize**: Based on performance data
4. **Demo Preparation**: Prepare walkthrough script
5. **Production Deployment**: If all tests pass

---

## 🔗 Useful Links

- **Backend API Docs**: http://localhost:8000/docs
- **Frontend App**: http://localhost:3000
- **Somnia Explorer**: https://explorer.somnia.network
- **IPFS Gateway**: https://gateway.pinata.cloud/ipfs/
- **Contracts**:
  - AccessNFT: `0x82a539fa3ea34287241c0448547Be65C6918a857`
  - AgentRegistry: `0x493179DB5063b98D7272f976a7173F199859656d`
  - Provenance: `0x3D4820d8F65Dc2E0b1013D6BEa6A19F2744e82e6`

---

## 🎬 Quick Start Command

Run this to test everything quickly:

```bash
# Terminal 1: Backend
cd d:\strategi\agent
.\venv_new\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend  
cd d:\strategi\frontend
npm run dev

# Terminal 3: Quick API test
curl http://localhost:8000/
curl http://localhost:8000/agent/info

# Open browser
start http://localhost:3000
start http://localhost:8000/docs
```

**Status**: 🟢 **READY FOR USER TESTING**

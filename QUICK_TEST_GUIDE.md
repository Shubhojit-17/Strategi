# Quick Testing Guide

## Prerequisites ✅
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ All text now visible with dark theme

## Test Flow (5-10 minutes)

### 1. **Open the Application**
```
http://localhost:3000
```
You should now see a dark-themed interface with clearly visible white/light gray text.

---

### 2. **Test Wallet Connection** (Choose ONE option)

#### Option A: MetaMask (Recommended if you have it)
1. Click **"Connect Wallet"** button
2. Approve MetaMask connection
3. **Expected**: Your wallet address appears in format `0x1234...5678`
4. **Visual Feedback**: Address shows in top-right, disconnect button appears

#### Option B: Crossmint (Email-based wallet)
1. Scroll to **"Crossmint Login"** section
2. Enter any email address (e.g., `test@example.com`)
3. Click **"Create/Login Wallet"**
4. **Expected**: 
   - Success message: "✅ Wallet created successfully!"
   - Shows wallet address
   - **Note**: If Crossmint API is down, it generates a demo address (still works for testing)

---

### 3. **Test Document Upload to IPFS**
1. Locate **"Upload Document to IPFS"** section
2. Click **"Choose File"** and select any document (PDF, TXT, etc.)
3. Click **"Upload to IPFS"**
4. **Expected**:
   - Green success message: "✅ Upload Successful!"
   - Shows IPFS CID (starts with `Qm...`)
   - **Copy this CID** - you'll need it for next step
5. Click the IPFS link to verify file is accessible

**Example CID format**: `QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX`

---

### 4. **Test NFT Minting**
1. Scroll to **"Mint Access NFT"** section
2. **Paste the CID** from step 3 into the input field
3. Click **"Mint NFT"**
4. **Expected**:
   - MetaMask popup asking for transaction approval
   - Confirm the transaction
   - Wait 5-10 seconds
   - Green success message: "✅ NFT minted successfully!"
   - Shows transaction link to Somnia explorer
5. **Note the token ID** (usually shows as #1, #2, etc.)

---

### 5. **Test AI Agent Execution**
1. Scroll to **"Execute AI Agent"** section
2. Enter the **NFT Token ID** (e.g., `1`)
3. Enter a prompt, for example:
   ```
   Summarize the key points from this document
   ```
4. Click **"Run AI Agent"**
5. **Expected** (takes 10-30 seconds):
   - Purple "Executing..." status
   - Green success message: "✅ Execution Complete!"
   - Shows:
     - Record ID
     - Output CID (on IPFS)
     - AI Response text
     - Verification details (execution root, trace CID, tx hash)
6. Click "View on IPFS" to see the full response
7. Click "View transaction" to see blockchain proof

---

## Quick Verification Checklist

### Visual Check ✓
- [ ] All text is clearly visible (white/light gray on dark background)
- [ ] Cards have dark semi-transparent backgrounds
- [ ] Success messages are green
- [ ] Error messages are red (if any)
- [ ] Links are blue and clickable

### Functional Check ✓
- [ ] Can connect wallet (MetaMask or Crossmint)
- [ ] Can upload file to IPFS
- [ ] Can mint NFT with document CID
- [ ] Can execute AI agent with NFT token ID
- [ ] All transactions show on Somnia explorer

---

## Expected Results

### 1. **Document Upload**
```
✅ Upload Successful!
CID: QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX
View on IPFS: [link]
```

### 2. **NFT Minting**
```
✅ NFT minted successfully!
View transaction: [Somnia explorer link]
```

### 3. **AI Execution**
```
✅ Execution Complete!
Record ID: 123456789
Output CID: QmAbc123...
AI Response: [Summary of your document]
Execution Root: 0xabc123...
Trace CID: QmXyz789...
View transaction: [Somnia explorer link]
```

---

## Common Issues & Solutions

### Issue 1: "Connect your wallet" still showing
**Solution**: Make sure you approved the MetaMask connection. Try refreshing the page.

### Issue 2: Crossmint wallet creation takes long
**Solution**: If it takes >10 seconds, it may be in demo mode. This is fine - you'll still get a wallet address.

### Issue 3: NFT minting fails
**Solution**: 
- Make sure you have testnet STM tokens
- Check that the CID format is correct (starts with `Qm`)
- Confirm the transaction in MetaMask

### Issue 4: AI execution fails
**Solution**:
- Verify you entered a valid NFT token ID
- Check that you minted an NFT first
- Ensure backend is responding: http://localhost:8000/docs

---

## Backend API Testing (Optional)

Test backend directly at: **http://localhost:8000/docs**

### Quick API Tests:
1. **POST /crossmint/wallet** - Create wallet with email
2. **POST /upload** - Upload file to IPFS
3. **POST /execute** - Run AI agent

---

## Success Criteria

**Your implementation is working if:**
1. ✅ All text is visible and readable
2. ✅ Wallet connects successfully
3. ✅ Documents upload to IPFS
4. ✅ NFTs mint with document CIDs
5. ✅ AI executes and returns responses
6. ✅ All transactions appear on Somnia blockchain
7. ✅ Provenance is recorded on-chain

---

## Test Data Examples

### Sample Email (Crossmint):
```
test@somnia-hackathon.com
```

### Sample Prompt (AI Agent):
```
Summarize this document in 3 bullet points
```

OR

```
What are the main topics covered in this document?
```

OR

```
Extract the key dates and figures from this document
```

---

## Time Estimates

- **Wallet Connection**: 30 seconds
- **Document Upload**: 1-2 minutes
- **NFT Minting**: 1-2 minutes (including blockchain confirmation)
- **AI Execution**: 30-60 seconds
- **Total End-to-End Test**: 5-10 minutes

---

## Need Help?

1. **Check logs**: 
   - Backend: Terminal running `uvicorn`
   - Frontend: Terminal running `npm run dev`

2. **API Documentation**: http://localhost:8000/docs

3. **Check contract addresses** in `.env` files

4. **Verify services**:
   ```powershell
   # Backend
   Test-NetConnection localhost -Port 8000
   
   # Frontend  
   Test-NetConnection localhost -Port 3000
   ```

---

## What's Being Tested

This flow demonstrates:
- ✅ **Decentralized Storage**: Documents stored on IPFS
- ✅ **NFT-Gated Access**: Ownership verified via Somnia L1 NFTs
- ✅ **AI Agent Execution**: Moonshot AI processes documents
- ✅ **Blockchain Provenance**: All executions recorded on-chain
- ✅ **Custodial Wallets**: Easy onboarding via Crossmint
- ✅ **Web3 Integration**: Full MetaMask support

**This is your complete Somnia AI Agents hackathon submission! 🎉**

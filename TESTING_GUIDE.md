# Testing Guide - NFT-First DApp on Somnia Network

## Recent Fixes Applied ✅

### 1. Currency Display Fixed
- ❌ Before: UI showed "0.01 MATIC" and "ETH"
- ✅ After: UI now shows "0.01 STM" (Somnia testnet token)
- **Files Updated**:
  - `frontend/components/MintNFT.tsx` - Button text and info text
  - `frontend/app/page.tsx` - Architecture overview

### 2. Network Configuration Enhanced
- Added network detection and validation
- Displays warning banner when connected to wrong network
- One-click network switching to Somnia (Chain ID: 50312)
- **Files Updated**:
  - `frontend/components/UnifiedWalletConnect.tsx`

### 3. MetaMask Connection Improved
- Force connection to Somnia chain (ID: 50312)
- Better error messages for network issues
- Helpful alert showing Somnia network details if connection fails
- **Files Updated**:
  - `frontend/components/UnifiedWalletConnect.tsx`

### 4. Comprehensive Logging System
- Created `frontend/lib/logger.ts` with 300+ lines
- Audit trails for all critical operations
- Persistent logs in browser localStorage
- Color-coded console output for development
- Backend sync for ERROR and AUDIT level logs
- **Files Created**:
  - `frontend/lib/logger.ts`
- **Files Enhanced with Logging**:
  - `frontend/components/UnifiedWalletConnect.tsx`
  - `frontend/components/MintNFT.tsx`

---

## Network Configuration

**Somnia Shannon Testnet Details:**
- **Name**: Somnia L1
- **Chain ID**: 50312
- **RPC URL**: https://dream-rpc.somnia.network
- **Native Currency**: STM (or STT in some displays)
- **Symbol**: STM
- **Decimals**: 18
- **Explorer**: https://explorer.somnia.network

**Deployed Contracts:**
- **CompanyAccessNFT**: `0x95Efa56D6f45dA9CC478C8F7718828Ee1fcE25Be`
- **CompanyDropbox**: `0xcbc3A0cf6881BEff6027e542244aBD54112DE559`

---

## Pre-Testing Setup

### Step 1: Add Somnia Network to MetaMask

1. Open MetaMask
2. Click on the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Enter the following details:
   ```
   Network Name: Somnia L1
   New RPC URL: https://dream-rpc.somnia.network
   Chain ID: 50312
   Currency Symbol: STM
   Block Explorer URL: https://explorer.somnia.network
   ```
5. Click "Save"

### Step 2: Get Testnet Tokens

You should already have STM tokens from the faucet in your wallet. Verify by:
1. Switch to Somnia L1 network in MetaMask
2. Check your balance (should see STM tokens)
3. If balance is low, visit the Somnia faucet (check Somnia documentation)

### Step 3: Ensure Servers are Running

**Backend:**
```powershell
cd backend
python -m uvicorn main:app --reload
```
Should be running on: http://localhost:8000

**Frontend:**
```powershell
cd frontend
npm run dev
```
Should be running on: http://localhost:3000

---

## Testing Checklist

### Test 1: Network Detection ✅
**Objective**: Verify the app detects and warns about wrong network

**Steps:**
1. Open MetaMask
2. Switch to a different network (e.g., Ethereum Mainnet, Polygon)
3. Visit http://localhost:3000
4. Click "Connect with MetaMask"
5. Allow connection in MetaMask popup

**Expected Result:**
- ✅ MetaMask connects successfully
- ✅ Red warning banner appears: "⚠️ Wrong Network! Please switch to Somnia Shannon Testnet"
- ✅ Banner shows current network name and ID
- ✅ Banner shows expected network: "Somnia L1 (ID: 50312)"
- ✅ "Switch to Somnia Network" button is visible

**Logs to Check:**
- Open browser console (F12)
- Look for colored logs:
  - 🟢 Green: INFO - "Initiating MetaMask connection"
  - 🟡 Yellow: WARN - "Wrong network detected"

---

### Test 2: Network Switching ✅
**Objective**: Verify one-click network switching works

**Prerequisites:** Complete Test 1 (connected to wrong network)

**Steps:**
1. In the red warning banner, click "Switch to Somnia Network"
2. Approve the network switch in MetaMask popup

**Expected Result:**
- ✅ MetaMask switches to Somnia L1 (Chain ID: 50312)
- ✅ Red warning banner disappears
- ✅ Wallet shows "Connected (MetaMask)" with green checkmark
- ✅ Network shows: "Somnia L1 (ID: 50312)"

**Logs to Check:**
- 🟢 INFO: "Attempting to switch to Somnia"
- 🔵 AUDIT: "Switched to Somnia network"

---

### Test 3: Direct Somnia Connection ✅
**Objective**: Verify MetaMask connects directly to Somnia

**Steps:**
1. Disconnect wallet if connected
2. In MetaMask, manually switch to "Somnia L1" network
3. Refresh the page (http://localhost:3000)
4. Click "Connect with MetaMask"
5. Approve connection in MetaMask

**Expected Result:**
- ✅ Connection succeeds immediately
- ✅ NO warning banner (correct network from start)
- ✅ Wallet address displayed correctly
- ✅ Balance shows in STM (not ETH or MATIC)

**Logs to Check:**
- 🔵 AUDIT: "Wallet connected - MetaMask" with chainId: 50312

---

### Test 4: NFT Minting with Correct Currency ✅
**Objective**: Verify mint shows STM (not MATIC/ETH) in MetaMask popup

**Prerequisites:** Complete Test 3 (connected to Somnia)

**Steps:**
1. Scroll to the "Mint Access NFT" section
2. Verify button shows: "🎫 Mint Access NFT (0.01 STM)"
3. Verify info text shows: "Cost: 0.01 STM (Somnia testnet token)"
4. Click the mint button
5. **IMPORTANT**: Check the MetaMask popup carefully

**Expected Result in MetaMask Popup:**
- ✅ Network: "Somnia L1" (NOT Ethereum, NOT Polygon)
- ✅ Amount: "0.01 STM" (NOT "0.01 ETH" or "0.01 MATIC")
- ✅ Gas fee: Shown in STM
- ✅ Total: 0.01 STM + gas fee

**Expected Result After Approval:**
- ✅ "⏳ Confirming Transaction..." appears
- ✅ "⛏️ Minting NFT..." appears
- ✅ Success message with transaction hash
- ✅ NFT status updates to "Already Minted ✓"

**Logs to Check:**
- 🟢 INFO: "Initiating NFT mint" with chain: 50312
- 🔵 DEBUG: "Writing contract for mint" with value: "0.01 STM"
- 🔵 AUDIT: "NFT minted successfully" with transaction hash
- 🔵 AUDIT: Transaction logged to blockchain

---

### Test 5: NFT Authentication Check ✅
**Objective**: Verify NFT status is checked and logged

**Prerequisites:** Complete Test 4 (NFT minted)

**Steps:**
1. Refresh the page
2. Connect wallet again
3. Observe the "Mint Access NFT" section

**Expected Result:**
- ✅ Component shows "✅ Access NFT Verified"
- ✅ Token ID displayed
- ✅ Button shows "Already Minted ✓" (disabled)
- ✅ Green success border around component

**Logs to Check:**
- 🔵 DEBUG: "Checking NFT status" with address
- 🔵 AUDIT: "NFT authentication check" with authenticated: true, tokenId

---

### Test 6: Document Upload (NFT-Gated) ✅
**Objective**: Verify document upload requires NFT authentication

**Prerequisites:** 
- Test 4 completed (NFT minted)
- Test 5 verified (NFT authenticated)

**Steps:**
1. Scroll to "Upload Document" section
2. Select a PDF file (test with a small file first)
3. Click "Upload to IPFS"
4. Wait for upload to complete

**Expected Result:**
- ✅ Upload succeeds (NFT auth passed)
- ✅ IPFS CID displayed (e.g., `Qm...`)
- ✅ Success message shown
- ✅ File stored on IPFS

**Expected if NO NFT:**
- ❌ Upload blocked with error: "NFT authentication required"
- ⚠️ Message: "Please mint an Access NFT first"

**Logs to Check:**
- 🟢 INFO: "Initiating document upload"
- 🔵 DEBUG: "Checking NFT authentication before upload"
- 🔵 AUDIT: "Document uploaded to IPFS" with CID, file size, file name

---

### Test 7: Audit Trail Verification ✅
**Objective**: Verify all actions are logged and retrievable

**Steps:**
1. Complete Tests 1-6
2. Open browser console (F12)
3. Type: `localStorage.getItem('app_logs')`
4. Or use the logger API: `window.getAppLogs()`

**Expected Result:**
- ✅ JSON array of all logged events
- ✅ Logs include: timestamp, level, category, action, details
- ✅ AUDIT level logs for: wallet connection, NFT mint, document upload
- ✅ Color-coded console output for easy debugging

**Log Categories to Verify:**
- 🟣 WALLET: Connection, disconnection, network switches
- 🎫 NFT: Mint attempts, status checks, authentication
- 📄 UPLOAD: Document uploads with CIDs
- 🌐 NETWORK: Network switches, wrong network warnings
- 🔐 AUTH: Authentication checks and validations

---

## Testing Edge Cases

### Edge Case 1: Multiple Wallet Prevention
**Test:** Try to connect both MetaMask AND Crossmint simultaneously

**Steps:**
1. Connect with MetaMask
2. Try to click "Connect with Email (Crossmint)"

**Expected:**
- ❌ Alert: "Please disconnect MetaMask wallet first"
- ✅ Only ONE wallet can be active at a time

---

### Edge Case 2: Wrong Network NFT Mint
**Test:** Try to mint NFT while on wrong network

**Steps:**
1. Connect MetaMask to Ethereum or Polygon
2. Try to click "Mint Access NFT"

**Expected:**
- ❌ Alert: "Please switch to Somnia Shannon Testnet first"
- ✅ Transaction doesn't proceed
- ✅ Log: WARN level - "Mint attempted on wrong network"

---

### Edge Case 3: Insufficient Balance
**Test:** Try to mint with insufficient STM balance

**Steps:**
1. Use a wallet with < 0.01 STM balance
2. Try to mint NFT

**Expected:**
- ❌ MetaMask shows "Insufficient funds"
- ✅ Transaction fails before submission
- ✅ Error message shown to user

---

### Edge Case 4: Network Switch During Transaction
**Test:** Switch network while transaction is pending

**Steps:**
1. Start NFT mint
2. While "⏳ Confirming Transaction..." shows, switch network in MetaMask

**Expected:**
- ⚠️ Transaction may fail
- ✅ Error logged with details
- ✅ User can retry after switching back to Somnia

---

## Troubleshooting Guide

### Issue 1: "MetaMask not available"
**Cause:** MetaMask extension not installed or disabled
**Solution:**
1. Install MetaMask from https://metamask.io
2. Enable the extension
3. Refresh the page

---

### Issue 2: MetaMask shows ETH instead of STM
**Cause:** Connected to wrong network or Somnia not added to MetaMask
**Solution:**
1. Check current network in MetaMask (top of popup)
2. If not "Somnia L1", click the network warning banner
3. Click "Switch to Somnia Network"
4. If switch fails, manually add Somnia network (see Pre-Testing Setup)

---

### Issue 3: Transaction Fails - "chain not supported"
**Cause:** Somnia network not configured in wagmi
**Solution:**
1. Verify `frontend/.env.local` has:
   ```
   NEXT_PUBLIC_SOMNIA_CHAIN_ID=50312
   NEXT_PUBLIC_SOMNIA_RPC_URL=https://dream-rpc.somnia.network
   ```
2. Restart frontend: `npm run dev`
3. Clear browser cache and reconnect wallet

---

### Issue 4: NFT Mint Shows Wrong Price
**Cause:** Price hardcoded in contract or frontend
**Solution:**
1. Check `MintNFT.tsx` line 126: `parseEther('0.01')` - should be 0.01
2. Check button text: Should say "0.01 STM" not "0.01 MATIC"
3. If wrong, the recent fixes should have corrected this

---

### Issue 5: Backend NFT Auth Fails
**Cause:** Backend not synced with contract or database issue
**Solution:**
1. Check backend logs for errors
2. Verify contract address in backend matches frontend
3. Test endpoint: `curl http://localhost:8000/auth/check?user_address=YOUR_ADDRESS`
4. Restart backend if needed

---

### Issue 6: Logs Not Appearing
**Cause:** Logger not initialized or console filtered
**Solution:**
1. Check console filter - set to "All levels"
2. Verify logger imported: `import { logger, LogCategory } from '@/lib/logger'`
3. Check localStorage: `localStorage.getItem('app_logs')`

---

## Success Criteria Summary

✅ **All tests pass if:**
1. MetaMask connects to Somnia network (Chain ID: 50312)
2. All UI text shows "STM" currency (never "MATIC" or "ETH")
3. MetaMask popup shows "0.01 STM" for mint transaction
4. Network warning appears when on wrong network
5. Network switching works with one click
6. NFT mint succeeds and is recorded on Somnia blockchain
7. NFT authentication blocks document upload without NFT
8. All actions are logged with proper audit trails
9. Only ONE wallet connection method active at a time
10. Color-coded logs visible in browser console

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Deploy to production (testnet)
2. Update documentation with test results
3. Create video demo showing the flow
4. Share with team for QA

### If Tests Fail ❌
1. Check the Troubleshooting Guide above
2. Review browser console logs (colored)
3. Check backend logs for errors
4. Verify environment variables in `.env.local`
5. Report issue with:
   - Test number that failed
   - Expected vs actual result
   - Console logs
   - MetaMask screenshots

---

## Contact & Support

- **Frontend Port**: http://localhost:3000
- **Backend Port**: http://localhost:8000
- **Backend API Docs**: http://localhost:8000/docs
- **Network Explorer**: https://explorer.somnia.network

**Gas Used for Deployment**: 0.186 STM (81.6% funds retained)

**Last Updated**: 2025
**Version**: 1.0.0 (NFT-First Architecture with Logging)

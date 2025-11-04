# Verified Cache Implementation - Testing Guide

## Overview
This document provides step-by-step instructions for testing the newly implemented verified cache system with Merkle proof verification.

## What Was Implemented

### Architecture Changes
- **SQLite Database**: Persistent cache at `./agent/data/documents.db`
- **Hybrid Fetch Logic**: Cache-first approach with blockchain verification
- **Random Sampling**: 10% verification to detect tampering without full blockchain queries
- **Incremental Sync**: Only queries new blocks since last sync checkpoint
- **Automatic Recovery**: Clears cache and re-syncs if tampering is detected

### Files Modified
1. `agent/app/chains.py`:
   - Added `random` and `DocumentDatabase` imports
   - Initialized `self.db` in `SomniaClient.__init__()`
   - Added `verify_document_on_chain()` method (65 lines)
   - Completely rewrote `get_user_documents()` with hybrid cache logic (130+ lines)

2. `agent/app/database.py`:
   - Created new file with `DocumentDatabase` class (445 lines)
   - Implemented 12 methods for CRUD operations, sync management, statistics

3. `agent/.env`:
   - Added `DATABASE_PATH=./agent/data/documents.db`
   - Added `COMPANY_DROPBOX_DEPLOYMENT_BLOCK=219187000`
   - Added `CACHE_VERIFICATION_RATE=0.1`
   - Added `BLOCKCHAIN_QUERY_BATCH_SIZE=500`

### Database Schema
```sql
-- Documents table (stores cached blockchain events)
CREATE TABLE documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_address TEXT NOT NULL,
    document_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    ipfs_hash TEXT NOT NULL,
    document_hash TEXT NOT NULL,
    token_id INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    tx_hash TEXT NOT NULL,
    block_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_address, document_id)
);

-- Sync status table (tracks last synced block per user)
CREATE TABLE sync_status (
    user_address TEXT PRIMARY KEY,
    last_synced_block INTEGER NOT NULL,
    last_sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX idx_user_address ON documents(user_address);
CREATE INDEX idx_block_number ON documents(block_number);
CREATE INDEX idx_tx_hash ON documents(tx_hash);
```

## Testing Procedure

### Phase 1: Backend Startup ✅ COMPLETED
**Status**: Backend started successfully, database initialized

**Verification**:
```bash
# Check database file exists
Test-Path d:\strategi\agent\data\documents.db
# Result: True

# Check database structure
cd d:\strategi\agent
python check_database.py
# Result: All tables, indexes, and columns verified
```

**Logs Confirm**:
- "Database tables created successfully"
- "Document database initialized: ./data/documents.db"
- "Connected to Somnia L1"
- "Loading CompanyDropbox contract at 0x28F66A1bcb918bc75Cbe7FAa5356B352148a879D"

### Phase 2: Document Upload Test
**Objective**: Upload a document and verify it appears in UI + cached in database

**Steps**:
1. Open frontend at http://localhost:3000
2. Connect wallet (must have Access NFT with tokenId)
3. Upload a test document (any PDF/text file)
4. Wait for transaction confirmation
5. Verify document appears in "My Documents" section

**Expected Behavior**:
- First upload will query blockchain from deployment block (219187000)
- Document should be inserted into database
- Logs should show:
  ```
  Cache hit: 0 documents
  Syncing blocks 219187000 to [current_block]
  Found [N] new events in batch [X-Y]
  Cached 1 new documents
  Updated sync status to block [current_block]
  Returning 1 total documents (0 cached, 1 new)
  ```

**Database Verification**:
```bash
cd d:\strategi\agent
python -c "
import sqlite3
conn = sqlite3.connect('data/documents.db')
cursor = conn.cursor()
cursor.execute('SELECT user_address, filename, ipfs_hash, block_number FROM documents')
print('Documents:', cursor.fetchall())
cursor.execute('SELECT user_address, last_synced_block FROM sync_status')
print('Sync Status:', cursor.fetchall())
conn.close()
"
```

### Phase 3: Cache Persistence Test
**Objective**: Verify documents persist after page refresh and backend restart

**Steps**:
1. After Phase 2, refresh the browser page
2. Verify document still appears (should be instant from cache)
3. Stop backend: `Get-Process -Name python | Where-Object { $_.Path -like "*Python313*" } | Stop-Process -Force`
4. Start backend: Run task "Start Backend"
5. Refresh page again
6. Verify document still appears

**Expected Behavior**:
- Page refresh should be instant (no blockchain query)
- Logs should show:
  ```
  Cache hit: 1 documents
  Verifying 1/1 documents (or 0/1 if random sample picks none)
  Verified 1/1 documents - all valid (if sample picked document)
  No new blocks to sync (or minimal new blocks)
  Returning 1 total documents (1 cached, 0 new)
  ```

### Phase 4: Incremental Sync Test
**Objective**: Verify only new blocks are queried on subsequent uploads

**Steps**:
1. Upload a second document
2. Check logs for sync behavior

**Expected Behavior**:
- Should NOT query from deployment block (219187000)
- Should query from `last_synced_block + 1` to `current_block`
- Logs should show:
  ```
  Cache hit: 1 documents
  Verifying 1/1 documents (10% sample)
  Verified 1/1 documents - all valid
  Syncing blocks [last_synced+1] to [current_block] ([small number] blocks)
  Found 1 new events in batch [X-Y]
  Cached 1 new documents
  Updated sync status to block [current_block]
  Returning 2 total documents (1 cached, 1 new)
  ```

### Phase 5: Tamper Detection Test
**Objective**: Verify automatic cache clearing when tampering is detected

**Steps**:
1. After Phase 4, stop the backend
2. Manually corrupt the database:
   ```bash
   cd d:\strategi\agent
   python -c "
   import sqlite3
   conn = sqlite3.connect('data/documents.db')
   cursor = conn.cursor()
   cursor.execute('UPDATE documents SET ipfs_hash = \"QmFAKE123\" WHERE id = 1')
   conn.commit()
   conn.close()
   print('Database tampered successfully')
   "
   ```
3. Start backend
4. Refresh page

**Expected Behavior**:
- Random verification will eventually detect mismatch (within 10 refreshes on average)
- When detected, logs should show:
  ```
  Cache hit: 2 documents
  Verifying 1/2 documents
  WARNING: Cache tampered! Document [X] failed verification. Clearing cache.
  Syncing blocks 219187000 to [current_block] (full re-sync)
  Cached 2 new documents
  Returning 2 total documents (0 cached, 2 new)
  ```
- Cache will be cleared and rebuilt from blockchain
- All documents should still appear correctly in UI

### Phase 6: Performance Verification
**Objective**: Measure cache performance improvements

**Steps**:
1. Check logs for timing comparisons
2. First request (cold cache): Should take ~5-30 seconds
3. Subsequent requests (warm cache): Should take <100ms

**Expected Results**:
- **Cold Cache (first upload)**: 5-30 seconds
  - Queries ~100,000+ blocks from deployment
  - ~200 RPC calls (500 blocks per batch)
  
- **Warm Cache (subsequent loads)**: <100ms
  - No blockchain queries if no new blocks
  - Only database SELECT query
  
- **Incremental Sync (new upload)**: 1-5 seconds
  - Queries only ~100-5000 new blocks
  - 1-10 RPC calls
  
- **Performance Gain**: ~75x speedup for cached requests

### Phase 7: Error Handling Test
**Objective**: Verify graceful handling of edge cases

**Test Cases**:
1. **Empty Cache**: Upload first document → Should work
2. **RPC Failure**: Disconnect network briefly → Should return cached data
3. **Database Lock**: Access database file while backend is running → Should handle gracefully
4. **Invalid Block Number**: Manually set last_synced_block to future block → Should handle gracefully

## Monitoring

### Key Log Messages to Watch

**Success Indicators**:
- ✅ "Database tables created successfully"
- ✅ "Document database initialized"
- ✅ "Cache hit: N documents"
- ✅ "Verified N/M documents - all valid"
- ✅ "Cached N new documents"
- ✅ "Updated sync status to block N"

**Warning Indicators**:
- ⚠️ "Error in batch X-Y: ..." → RPC issues, non-critical
- ⚠️ "Cache tampered! ... Clearing cache." → Tampering detected, auto-recovery
- ⚠️ "Error verifying document on chain" → Verification failure

**Error Indicators**:
- ❌ "Error fetching documents" → Critical failure
- ❌ "CompanyDropbox contract not loaded" → Configuration issue
- ❌ "Database error" → SQLite issue

### Database Monitoring Queries

```bash
# Check cache statistics
cd d:\strategi\agent
python -c "
import sqlite3
conn = sqlite3.connect('data/documents.db')
cursor = conn.cursor()

# Total documents
cursor.execute('SELECT COUNT(*) FROM documents')
print(f'Total documents: {cursor.fetchone()[0]}')

# Documents per user
cursor.execute('SELECT user_address, COUNT(*) FROM documents GROUP BY user_address')
print('Documents per user:')
for row in cursor.fetchall():
    print(f'  {row[0]}: {row[1]} documents')

# Sync status
cursor.execute('SELECT user_address, last_synced_block, last_sync_time FROM sync_status')
print('Sync status:')
for row in cursor.fetchall():
    print(f'  {row[0]}: Block {row[1]} at {row[2]}')

# Database size
import os
db_size = os.path.getsize('data/documents.db')
print(f'Database size: {db_size / 1024:.2f} KB')

conn.close()
"
```

## Success Criteria

- [x] Backend starts without errors
- [x] Database file created at correct path
- [x] All tables and indexes present
- [ ] First upload caches document in database
- [ ] Page refresh shows cached documents instantly
- [ ] Backend restart preserves cached documents
- [ ] Second upload only queries new blocks
- [ ] Tamper detection triggers cache clear and re-sync
- [ ] Performance gain of ~75x for cached requests
- [ ] All log messages show expected behavior

## Troubleshooting

### Issue: "Database tables created successfully" but file is empty
**Solution**: Database might be in-memory. Check DATABASE_PATH in .env

### Issue: "Cache hit: 0 documents" after upload
**Solution**: Check if document is being inserted. Add debug logging to insert_documents_batch()

### Issue: Verification always fails
**Solution**: 
1. Check transaction hash is correct
2. Verify block number matches
3. Check event data format (hex vs string)

### Issue: Performance not improved
**Solution**:
1. Check CACHE_VERIFICATION_RATE (should be 0.1 or lower)
2. Verify incremental sync is working (check last_synced_block)
3. Check RPC latency with: `curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://dream-rpc.somnia.network`

## Next Steps After Testing

1. **Production Hardening**:
   - Add database backup strategy
   - Implement cache size limits
   - Add cache expiry policy
   - Set up monitoring alerts

2. **Optimization**:
   - Batch verification for multiple users
   - Pre-cache popular documents
   - Implement read-through cache pattern

3. **Security**:
   - Set database file permissions to 600
   - Encrypt sensitive fields
   - Add rate limiting for cache queries
   - Implement access control lists

4. **Documentation**:
   - Add API documentation for cache endpoints
   - Create runbook for operations team
   - Document disaster recovery procedures

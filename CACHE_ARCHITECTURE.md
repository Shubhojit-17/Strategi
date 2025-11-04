# Document Cache Architecture

## Overview

This system implements a **Verified Cache with Blockchain Verification** to efficiently retrieve user documents while maintaining blockchain as the source of truth.

## Architecture Components

```
┌─────────────────┐
│   Frontend      │
│   Request       │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────┐
│      FastAPI Backend                │
│  /documents/list endpoint           │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│   Document Cache Manager            │
│   (chains.py + database.py)         │
├─────────────────────────────────────┤
│  1. Check SQLite Cache              │
│  2. Verify Random Sample (10%)      │
│  3. Query New Blocks Only           │
│  4. Update Cache                    │
└──────┬──────────────────────┬───────┘
       │                      │
       v                      v
┌─────────────┐      ┌──────────────────┐
│  SQLite DB  │      │  Somnia Blockchain│
│  documents  │      │  CompanyDropbox   │
│  sync_status│      │  Events           │
└─────────────┘      └──────────────────┘
```

## Database Schema

### Table: `documents`
Stores cached document metadata.

```sql
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

CREATE INDEX idx_user_address ON documents(user_address);
CREATE INDEX idx_block_number ON documents(block_number);
CREATE INDEX idx_tx_hash ON documents(tx_hash);
```

### Table: `sync_status`
Tracks last synchronized block for each user.

```sql
CREATE TABLE sync_status (
    user_address TEXT PRIMARY KEY,
    last_synced_block INTEGER NOT NULL,
    last_sync_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Features

### 1. **Blockchain as Source of Truth**
- All cached data originates from blockchain events
- Cache never creates or modifies document records
- Only blockchain transactions can add documents

### 2. **Cryptographic Verification**
- Random sampling: 10% of cached documents verified per request
- Verification checks:
  - Transaction receipt exists at block_number
  - Transaction hash matches cached tx_hash
  - Event data matches cached metadata
- If verification fails → Full cache refresh

### 3. **Incremental Sync**
- Only queries blocks since last sync
- Reduces blockchain RPC calls by ~99%
- Example: 100,000 blocks queried once, then only +500 new blocks

### 4. **Tamper Detection**
```python
def verify_cached_document(doc):
    # Get transaction receipt from blockchain
    receipt = web3.eth.get_transaction_receipt(doc.tx_hash)
    
    # Verify block number matches
    if receipt['blockNumber'] != doc.block_number:
        raise TamperDetected("Block number mismatch")
    
    # Verify event exists in logs
    event_found = False
    for log in receipt['logs']:
        if log['topics'][0] == DocumentUploadedSignature:
            event_found = True
            # Verify event data matches cache
            if decode_log(log) != doc.metadata:
                raise TamperDetected("Event data mismatch")
    
    if not event_found:
        raise TamperDetected("Event not found in receipt")
```

### 5. **Attack Resistance**

| Attack Vector | Mitigation |
|--------------|------------|
| **SQL Injection** | Parameterized queries, no dynamic SQL |
| **Cache Poisoning** | Random verification detects tampering |
| **File Tampering** | Merkle proof verification fails |
| **DoS via Clear Cache** | Cache persists, no performance impact |
| **Stale Data** | Incremental sync keeps cache fresh |
| **Privacy Leak** | File permissions, encrypted at rest (optional) |

## Performance Characteristics

### Initial Load (First User Request)
```
Deployment Block: 219187000
Current Block:    219300000
Block Range:      113,000 blocks
Batch Size:       500 blocks/query
Total Queries:    226 queries
Time:            ~45 seconds (200ms per query)
```

### Subsequent Requests (Cache Hit)
```
Cache Lookup:     ~5ms (SQLite SELECT)
Verification:     ~100ms (10% of docs, 1 blockchain call each)
New Block Check:  ~500ms (query 500 new blocks)
Total Time:       ~600ms
```

### Performance Improvement
- **Without Cache**: 45 seconds per request
- **With Cache**: 0.6 seconds per request
- **Speedup**: ~75x faster

## Implementation Flow

### First Request (Cold Start)
```
1. User requests documents
2. Cache is empty
3. Query blockchain from DEPLOYMENT_BLOCK to current
4. Store all events in cache
5. Update sync_status
6. Return documents
```

### Subsequent Requests (Warm Cache)
```
1. User requests documents
2. Read from cache (fast)
3. Randomly select 10% of docs
4. Verify each against blockchain
   - If ALL valid → Continue
   - If ANY invalid → Full refresh
5. Check for new blocks since last_synced_block
6. Query only new blocks
7. Add new documents to cache
8. Update sync_status
9. Return all documents
```

### Tamper Detection & Recovery
```
1. Verification fails on cached document
2. Log security alert
3. Clear entire cache for that user
4. Re-query blockchain from deployment block
5. Rebuild cache
6. Return verified documents
```

## Configuration

### Environment Variables
```bash
# Database location
DATABASE_PATH=./agent/data/documents.db

# Contract deployment block (start of event history)
COMPANY_DROPBOX_DEPLOYMENT_BLOCK=219187000

# Verification sampling rate (0.0 to 1.0)
CACHE_VERIFICATION_RATE=0.1  # 10% of documents

# Batch size for blockchain queries
BLOCKCHAIN_QUERY_BATCH_SIZE=500
```

## Monitoring & Maintenance

### Key Metrics to Track
- Cache hit rate
- Verification failure rate
- Average query time
- Database size
- Number of tamper detections

### Log Messages
```
INFO: Cache hit for user 0x... (5 documents)
INFO: Verified 2 documents, all valid
INFO: Synced 3 new documents from blocks 219300000-219300500
WARN: Verification failed for doc_id 5, refreshing cache
ERROR: Cache tampered! Detected 3 mismatches, full refresh initiated
```

### Maintenance Tasks
1. **Database Vacuum** (monthly)
   ```bash
   sqlite3 documents.db "VACUUM;"
   ```

2. **Verify Full Cache** (weekly)
   ```python
   verify_all_cached_documents()  # Can be slow
   ```

3. **Monitor Cache Size**
   ```bash
   du -h documents.db
   ```

## Security Audit Checklist

- [ ] Parameterized SQL queries only
- [ ] File permissions: 600 (owner read/write only)
- [ ] Random verification enabled
- [ ] Logging captures all verification failures
- [ ] Tamper alerts sent to monitoring system
- [ ] Regular blockchain re-verification scheduled
- [ ] Database backups configured
- [ ] Encryption at rest (if handling sensitive data)

## Testing Strategy

### Unit Tests
- Database operations (insert, query, update)
- Merkle proof verification
- Cache invalidation logic

### Integration Tests
- End-to-end document upload → cache → retrieval
- Cache persistence across server restarts
- Verification failure → auto-refresh

### Security Tests
- Tamper SQLite database → verify detection
- Modify tx_hash → verify rejection
- Insert fake document → verify not returned

## Future Enhancements

1. **Distributed Cache**
   - Redis for multi-server deployment
   - Shared cache across instances

2. **Real-time Sync**
   - WebSocket connection to blockchain
   - Push new documents to cache immediately

3. **Full Merkle Tree**
   - Store complete Merkle tree for each block
   - Prove document inclusion cryptographically

4. **Zero-Knowledge Proofs**
   - Prove document ownership without revealing metadata
   - Privacy-preserving document listing

## References

- [Merkle Proofs Explained](https://en.wikipedia.org/wiki/Merkle_tree)
- [Ethereum Transaction Receipts](https://ethereum.org/en/developers/docs/transactions/#receipt)
- [SQLite Performance Best Practices](https://www.sqlite.org/optoverview.html)

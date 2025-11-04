# Document Registry Implementation Plan

## Problem Statement

Currently, when users upload documents to IPFS, there is **no persistent storage** of the upload metadata (filename, CID, upload timestamp, file size). The system returns the CID to the user, but:

1. **No historical access**: Users cannot see previously uploaded documents
2. **No metadata tracking**: Filename, upload date/time, and file size are lost after upload
3. **No association with NFT**: No connection maintained between NFT token and documents
4. **Frontend limitation**: No UI component to list/browse uploaded documents
5. **Decentralized Dropbox broken**: The "Dropbox-like" experience is incomplete

---

## Current Architecture Issues

### Backend (`agent/app/main.py`)
```python
# Line 365-410: /documents/list endpoint
# Currently returns:
{
    "user_address": "0x...",
    "token_id": 1,
    "documents": [],  # ❌ ALWAYS EMPTY
    "message": "Document registry not yet implemented..."
}
```

**Issue**: The endpoint has a TODO comment but no implementation. All uploaded documents are lost after the response.

### Smart Contract (`contracts/src/CompanyDropbox.sol`)
```solidity
// Lines 23-34: Data structures exist but are NOT USED
mapping(address => uint256[]) public userDocuments;
mapping(uint256 => uint256[]) public nftDocuments;
struct Document { ... }

// Lines 73-102: uploadDocument() function exists
// But is NEVER CALLED from the FastAPI backend
```

**Issue**: The contract has the storage infrastructure, but the Python backend doesn't interact with it. Documents are stored on IPFS only, not anchored on blockchain.

### Frontend (`frontend/components/DocumentUpload.tsx`)
```tsx
// Lines 1-199: Only uploads documents
// NO component exists to list/view previously uploaded documents
```

**Issue**: No UI to display document history or metadata.

---

## Solution Architecture

### Option A: Database-Backed Registry (Recommended for MVP)

**Benefits:**
- Fastest to implement
- No blockchain overhead
- Persistent storage
- Search/filter capabilities
- Fast reads

**Changes Required:**

#### 1. Backend: Add SQLite/PostgreSQL Database

**File**: `agent/app/database.py` (NEW)

```python
# Pseudocode structure:
from sqlalchemy import create_engine, Column, String, Integer, DateTime, LargeBinary
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DocumentRecord(Base):
    __tablename__ = "documents"
    
    id: int (primary key)
    user_address: str (indexed)
    nft_token_id: int (indexed)
    filename: str
    cid: str (indexed - IPFS hash)
    file_size: int
    document_hash: str (SHA-256)
    upload_timestamp: datetime
    gateway_url: str
    created_at: datetime (automatic)
    updated_at: datetime (automatic)
```

**Implementation Location**: `agent/app/database.py` (create this file)

#### 2. Backend: Update Upload Endpoint

**File**: `agent/app/main.py` - `/documents/upload` endpoint (Line 280-360)

**Changes**:
- After successful IPFS upload (line 331), INSERT record into database:
  ```python
  db_record = DocumentRecord(
      user_address=user_address,
      nft_token_id=token_id,
      filename=file.filename,
      cid=cid,
      file_size=len(content),
      document_hash=document_hash,
      upload_timestamp=datetime.now(timezone.utc),
      gateway_url=f"https://gateway.pinata.cloud/ipfs/{cid}"
  )
  session.add(db_record)
  session.commit()
  ```

#### 3. Backend: Implement `/documents/list` Endpoint

**File**: `agent/app/main.py` - `/documents/list` endpoint (Line 365-410)

**Changes**:
- Replace empty TODO with database query:
  ```python
  # Query documents for authenticated user
  documents = session.query(DocumentRecord)\
      .filter(DocumentRecord.user_address == user_address)\
      .order_by(DocumentRecord.upload_timestamp.desc())\
      .all()
  
  # Return structured data:
  return {
      "user_address": user_address,
      "token_id": auth_result["token_id"],
      "documents": [
          {
              "id": doc.id,
              "filename": doc.filename,
              "cid": doc.cid,
              "file_size": doc.file_size,
              "upload_timestamp": doc.upload_timestamp.isoformat(),
              "gateway_url": doc.gateway_url,
              "document_hash": doc.document_hash
          }
          for doc in documents
      ],
      "total_documents": len(documents),
      "total_size": sum(doc.file_size for doc in documents)
  }
  ```

#### 4. Backend: Add New Endpoint `/documents/{cid}`

**File**: `agent/app/main.py` (NEW endpoint)

**Purpose**: Fetch single document metadata by CID

```python
@app.get("/documents/{cid}")
async def get_document_by_cid(cid: str, user_address: str):
    """Retrieve document metadata by IPFS CID"""
    doc = session.query(DocumentRecord)\
        .filter(DocumentRecord.cid == cid)\
        .filter(DocumentRecord.user_address == user_address)\
        .first()
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return { ... doc metadata ... }
```

#### 5. Backend: Update `requirements.txt`

**File**: `agent/requirements.txt`

**Add**:
```
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0  # For PostgreSQL
# OR
# sqlite3 (built-in to Python)
```

---

### Option B: Blockchain-Based Registry (Production)

**Benefits:**
- Fully decentralized
- Immutable audit trail
- No backend database
- Smart contract can enforce access control

**Changes Required**:

#### 1. Smart Contract: Implement `uploadDocument()` Call

**File**: `contracts/src/CompanyDropbox.sol` (Already exists, needs to be called)

**Current State**: Function exists but FastAPI never calls it

#### 2. Backend: Call Smart Contract on Upload

**File**: `agent/app/chains.py` - SomniaClient class

**Add Method**:
```python
async def record_document_on_chain(
    self,
    user_address: str,
    nft_token_id: int,
    cid: str,
    document_hash: str,
    filename: str,
    file_size: int
):
    """
    Record document upload on CompanyDropbox contract
    Returns transaction hash
    """
    # Call contract.uploadDocument(cid, hash, filename, size)
    # Return tx_hash for confirmation
```

#### 3. Backend: Query Blockchain Events

**File**: `agent/app/main.py` - `/documents/list` endpoint

**Implementation**:
```python
# Use Web3.py to query blockchain events
# Filter DocumentUploaded events by user_address and nft_token_id
# Reconstruct document list from events

web3 = Web3(...)
events = contract.events.DocumentUploaded().get_logs(
    filter={
        'uploader': user_address,
        'tokenId': nft_token_id
    }
)

documents = [
    {
        'id': event['documentId'],
        'filename': event['fileName'],
        'cid': event['ipfsHash'],
        'tx_hash': event['transactionHash'],
        'block_number': event['blockNumber']
    }
    for event in events
]
```

---

### Option C: Hybrid Approach (Recommended for Production)

**Benefits:**
- Database for fast queries
- Blockchain for audit trail
- Best of both worlds

**Changes**:
1. **Database**: Store documents for fast listing
2. **Blockchain**: Anchor document hash + CID on-chain for verification
3. **Sync Logic**: Periodically verify database against blockchain

---

## Frontend Changes Required

### 1. New Component: `DocumentList.tsx`

**File**: `frontend/components/DocumentList.tsx` (NEW)

**Features**:
- Display list of previously uploaded documents
- Show: Filename | CID (clickable link) | Upload Date/Time | File Size | Status
- Sort by date (newest first)
- Filter by date range
- Copy CID button
- View on IPFS button
- Delete document option (if implementing deletion)

**Implementation Approach**:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

export default function DocumentList() {
  const { address } = useAccount();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!address) return;

    const fetchDocuments = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/list?user_address=${address}`
        );
        const data = await response.json();
        setDocuments(data.documents);
      } catch (err) {
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [address]);

  if (loading) return <div>Loading documents...</div>;
  if (documents.length === 0) return <div>No documents uploaded yet</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Your Documents</h2>
      <table className="w-full text-white">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2">Filename</th>
            <th className="text-left py-2">CID</th>
            <th className="text-left py-2">Upload Date</th>
            <th className="text-left py-2">Size</th>
            <th className="text-left py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.cid} className="border-b border-gray-600 hover:bg-gray-700">
              <td className="py-3">{doc.filename}</td>
              <td className="py-3 font-mono text-sm">{doc.cid.substring(0, 10)}...</td>
              <td className="py-3">{new Date(doc.upload_timestamp).toLocaleString()}</td>
              <td className="py-3">{formatFileSize(doc.file_size)}</td>
              <td className="py-3">
                <button onClick={() => copyToClipboard(doc.cid)}>Copy CID</button>
                <a href={doc.gateway_url} target="_blank">View on IPFS</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 2. Update Main Page: `app/page.tsx`

**File**: `frontend/app/page.tsx`

**Changes**:
- Add `<DocumentList />` component to display previously uploaded documents
- Place it alongside or below the upload component
- Show summary: "You have X documents stored" with total size

### 3. Add Search/Filter Component (Optional)

**File**: `frontend/components/DocumentSearch.tsx` (NEW - Optional)

**Features**:
- Search by filename
- Filter by date range
- Sort options (name, date, size)

---

## Database Schema (Option A)

```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(255) NOT NULL,
    nft_token_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    cid VARCHAR(255) NOT NULL UNIQUE,
    file_size INT NOT NULL,
    document_hash VARCHAR(255) NOT NULL,
    upload_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    gateway_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_address ON documents(user_address);
CREATE INDEX idx_nft_token_id ON documents(nft_token_id);
CREATE INDEX idx_cid ON documents(cid);
CREATE INDEX idx_upload_timestamp ON documents(upload_timestamp DESC);
```

---

## API Changes Summary

### Current Endpoints
- `POST /documents/upload` → Returns single CID (already working)

### New Endpoints Needed
- `GET /documents/list?user_address=0x...` → Returns all documents for user
- `GET /documents/{cid}?user_address=0x...` → Returns metadata for single document
- `DELETE /documents/{cid}?user_address=0x...` → (Optional) Delete document

### Response Format

**GET /documents/list**
```json
{
  "user_address": "0x...",
  "token_id": 1,
  "documents": [
    {
      "id": 1,
      "filename": "report.pdf",
      "cid": "QmWxF1yFV4h...",
      "file_size": 1024000,
      "upload_timestamp": "2025-11-03T21:30:45Z",
      "gateway_url": "https://gateway.pinata.cloud/ipfs/QmWxF1yFV4h...",
      "document_hash": "abc123def456..."
    }
  ],
  "total_documents": 1,
  "total_size": 1024000
}
```

---

## Implementation Priority

### Phase 1 (MVP - Immediate)
1. ✅ Add SQLite database to backend
2. ✅ Create `DocumentRecord` model
3. ✅ Update `/documents/upload` to save metadata to DB
4. ✅ Implement `/documents/list` endpoint
5. ✅ Create `DocumentList.tsx` component
6. ✅ Update main page to show document history

### Phase 2 (Enhancement)
1. Add search/filter UI
2. Implement document deletion
3. Add pagination for large document lists
4. Add file preview functionality

### Phase 3 (Production)
1. Migrate to PostgreSQL
2. Add blockchain anchoring
3. Add event indexing
4. Implement access logs

---

## Files to Create/Modify

### New Files
- `agent/app/database.py` - Database models and session management
- `agent/app/crud.py` - Database CRUD operations
- `frontend/components/DocumentList.tsx` - Document list UI component
- `frontend/components/DocumentSearch.tsx` - (Optional) Search/filter component

### Modified Files
- `agent/app/main.py` - Update upload and list endpoints
- `agent/requirements.txt` - Add SQLAlchemy dependency
- `frontend/app/page.tsx` - Add DocumentList component
- `frontend/components/DocumentUpload.tsx` - (Minor) Add refresh callback

### Configuration Files
- `.env` (backend) - Database URL
- `.env.local` (frontend) - No changes needed

---

## Key Considerations

1. **Data Privacy**: Document metadata (except CID) is stored on backend database, not blockchain. Consider implications for decentralization.

2. **Scalability**: For large deployments:
   - Use PostgreSQL instead of SQLite
   - Add caching layer (Redis)
   - Implement pagination in list endpoint

3. **Verification**: Document integrity can be verified by:
   - Checking CID matches stored hash
   - Recomputing SHA-256 and comparing

4. **Blockchain Anchoring**: For audit trail:
   - Call `CompanyDropbox.uploadDocument()` on successful IPFS upload
   - Store transaction hash in database
   - Allow users to verify on-chain

5. **CORS**: Ensure frontend can access `/documents/list` endpoint (already configured)

---

## Success Criteria

✅ Users can see all previously uploaded documents
✅ Each document shows: filename, CID, upload date/time, file size
✅ Documents are sorted by upload date (newest first)
✅ Users can copy CID to clipboard
✅ Users can click to view document on IPFS
✅ Metadata persists across browser sessions and server restarts
✅ Document list only shows documents uploaded by authenticated user (NFT verified)


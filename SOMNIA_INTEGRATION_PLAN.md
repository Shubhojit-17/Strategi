# Somnia-Native NFT-Gated AI Agent Architecture

## 🎯 Hackathon Vision
**"AI-Agents for NFT-gated knowledge objects on Somnia"**

AI agents read → reason → produce derivative documents → anchor provenance on Somnia → show receipt in UI.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Next.js Frontend (wagmi + RainbowKit)              │
│  - Crossmint wallet abstraction                     │
│  - NFT minting & ownership check                    │
│  - Document upload to IPFS                          │
│  - AI execution trigger                             │
│  - Verifiable receipt viewer                        │
└──────────────┬──────────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────────┐  ┌──────────────────────┐
│ FastAPI      │  │ IPFS (Pinata/Kubo)   │
│ AI Runner    │  │ - Encrypted docs     │
│ - vLLM/GPT   │  │ - Execution traces   │
│ - DIDKit     │  │ - Derivative outputs │
│ - Merkle     │  └──────────────────────┘
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  Somnia L1 (EVM) Smart Contracts                    │
│                                                      │
│  ┌─────────────────┐  ┌────────────────────┐       │
│  │ AccessNFT.sol   │  │ AgentRegistry.sol  │       │
│  │ (ERC-721)       │  │ - DID → address    │       │
│  │ - token ownership│  │ - Agent claims     │       │
│  └─────────────────┘  └────────────────────┘       │
│                                                      │
│  ┌──────────────────────────────────────────┐      │
│  │ Provenance.sol                            │      │
│  │ - recordDerivative(inputCid, outputCid)   │      │
│  │ - inputRoot (commitment)                  │      │
│  │ - executionRoot (Merkle tree)             │      │
│  │ - optional ZK proof verifier              │      │
│  └──────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Repository Structure

```
somnia-ai-agents/
├── contracts/                  # Somnia EVM contracts
│   ├── src/
│   │   ├── AccessNFT.sol      # ERC-721 for document access
│   │   ├── AgentRegistry.sol  # DID identity registry
│   │   ├── Provenance.sol     # Input/execution commitments
│   │   └── Verifier.sol       # ZK proof verifier (circom)
│   ├── test/
│   ├── scripts/deploy.js
│   ├── hardhat.config.js      # Somnia RPC config
│   └── package.json
│
├── agent/                     # AI runner backend
│   ├── app/
│   │   ├── main.py           # FastAPI server
│   │   ├── agent.py          # AI execution logic
│   │   ├── verifiable.py     # DID, VC, Merkle tree
│   │   ├── ipfs.py           # IPFS client
│   │   └── chains.py         # Somnia contract interaction
│   ├── requirements.txt       # vLLM, DIDKit, web3.py
│   └── Dockerfile
│
├── app/                       # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── NFTMinter.tsx
│   │   │   ├── DocumentUpload.tsx
│   │   │   ├── AgentRunner.tsx
│   │   │   └── ProvenanceViewer.tsx
│   │   ├── hooks/
│   │   │   ├── useAccessNFT.ts
│   │   │   ├── useProvenance.ts
│   │   │   └── useCrossmint.ts
│   │   └── lib/
│   │       ├── somnia.ts      # Somnia RPC config
│   │       └── ipfs.ts
│   ├── wagmi.config.ts
│   └── package.json
│
├── circuits/                  # Optional ZK proofs
│   ├── merkle_verifier.circom
│   ├── input.json
│   └── generate_proof.sh
│
├── docs/
│   ├── ARCHITECTURE.md        # Full technical design
│   ├── DEPLOYMENT.md          # Somnia deployment guide
│   └── CROSSMINT.md           # Wallet abstraction flow
│
└── README.md                  # Hackathon submission
```

---

## 🔗 Tech Stack

### On-Chain (Somnia EVM)
- **Contracts**: Solidity 0.8.20+
- **Framework**: Hardhat (or Foundry)
- **Network**: Somnia L1 (sub-second finality, EVM-compatible)
- **RPC**: `https://rpc.somnia.network` (check official docs)

### Off-Chain
- **Storage**: IPFS via Pinata API or web3.storage
- **AI Backend**: FastAPI (Python 3.11+)
  - **Inference**: vLLM (local) or OpenAI/DeepSeek API
  - **Verifiability**: DIDKit (did:key), circom/snarkjs (optional ZK)
- **Frontend**: Next.js 15 + TypeScript
  - **Web3**: wagmi v2 + viem + RainbowKit
  - **Wallet**: Crossmint (email/social login)

---

## 🔄 End-to-End Flow

### 1. User Onboarding
```
User → Crossmint login (email/social)
     → Crossmint creates wallet (0xABC...)
     → Frontend mints AccessNFT on Somnia → transfer to 0xABC...
     → User now has NFT in their Crossmint wallet
```

### 2. Document Upload
```
User → selects file (PDF/markdown/etc.)
     → Frontend encrypts & uploads to IPFS
     → Returns CID (e.g., QmXYZ...)
     → Frontend calls AccessNFT.setTokenURI(tokenId, CID)
     → NFT now "owns" the document
```

### 3. AI Agent Execution (with Verifiable Receipts)
```
User → clicks "Run AI Agent"
     → Backend checks NFT ownership (only owner can run)
     
     → Agent:
       1. Fetches document from IPFS (CID from NFT metadata)
       2. Computes inputRoot = keccak256(CID, chunks, timestamp)
       3. Signs Verifiable Credential (VC) with DIDKit
       4. Anchors inputRoot on Provenance.sol
       
       5. Runs LLM (vLLM/OpenAI):
          - Logs each step: [prompt, tool_call, response]
          - Builds Merkle tree → executionRoot
       
       6. Uploads trace to IPFS → traceCID
       7. Optional: generates ZK proof that executionRoot is valid
       8. Anchors executionRoot + traceCID on Provenance.sol
       
       9. Produces derivative output → uploads to IPFS → outputCID
       10. Calls Provenance.recordDerivative(inputCID, outputCID, executionRoot, proofCID)
       
     → Emits ProvenanceRecorded event on Somnia
     → Frontend shows receipt with links to Somnia explorer
```

### 4. Verification
```
Anyone → views Provenance event on Somnia explorer
       → fetches traceCID from IPFS
       → recomputes Merkle root locally
       → compares with on-chain executionRoot
       → optionally verifies ZK proof via Verifier.sol
       
       → Conclusion: "Agent provably consumed [inputCID] and produced [outputCID]"
```

---

## 📝 Smart Contract Interfaces

### AccessNFT.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AccessNFT is ERC721URIStorage {
    uint256 private _tokenIdCounter;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId, string uri);
    
    function mint(address to, string memory documentCID) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, documentCID);
        emit NFTMinted(to, tokenId, documentCID);
        return tokenId;
    }
    
    function hasAccess(address user, uint256 tokenId) external view returns (bool) {
        return ownerOf(tokenId) == user;
    }
}
```

### AgentRegistry.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentRegistry {
    struct AgentClaim {
        bytes32 didHash;      // keccak256(did:key:...)
        address controller;
        string metadataURI;   // IPFS CID with agent capabilities
        uint256 timestamp;
    }
    
    mapping(bytes32 => AgentClaim) public claims;
    
    event AgentRegistered(bytes32 indexed didHash, address indexed controller);
    
    function registerAgent(
        string calldata did,
        string calldata metadataURI
    ) external {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        require(claims[didHash].timestamp == 0, "Already registered");
        
        claims[didHash] = AgentClaim({
            didHash: didHash,
            controller: msg.sender,
            metadataURI: metadataURI,
            timestamp: block.timestamp
        });
        
        emit AgentRegistered(didHash, msg.sender);
    }
}
```

### Provenance.sol
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Provenance {
    struct ProvenanceRecord {
        uint256 nftTokenId;
        string inputCID;
        bytes32 inputRoot;       // commitment to inputs
        string outputCID;
        bytes32 executionRoot;   // Merkle root of execution trace
        string traceCID;         // IPFS CID of full trace
        bytes32 agentDID;        // which agent ran this
        uint256 timestamp;
        bytes proofCID;          // optional ZK proof
    }
    
    ProvenanceRecord[] public records;
    mapping(uint256 => uint256[]) public nftToRecords;  // tokenId → record indices
    
    event ProvenanceRecorded(
        uint256 indexed recordId,
        uint256 indexed nftTokenId,
        bytes32 indexed agentDID,
        bytes32 executionRoot
    );
    
    function recordDerivative(
        uint256 nftTokenId,
        string calldata inputCID,
        bytes32 inputRoot,
        string calldata outputCID,
        bytes32 executionRoot,
        string calldata traceCID,
        bytes32 agentDID,
        bytes calldata proofCID
    ) external returns (uint256) {
        uint256 recordId = records.length;
        
        records.push(ProvenanceRecord({
            nftTokenId: nftTokenId,
            inputCID: inputCID,
            inputRoot: inputRoot,
            outputCID: outputCID,
            executionRoot: executionRoot,
            traceCID: traceCID,
            agentDID: agentDID,
            timestamp: block.timestamp,
            proofCID: proofCID
        }));
        
        nftToRecords[nftTokenId].push(recordId);
        
        emit ProvenanceRecorded(recordId, nftTokenId, agentDID, executionRoot);
        return recordId;
    }
    
    function getRecordsByNFT(uint256 nftTokenId) external view returns (uint256[] memory) {
        return nftToRecords[nftTokenId];
    }
}
```

---

## 🔐 Verifiable Agent Implementation (Python)

### agent/app/verifiable.py
```python
from typing import List, Dict, Any
import hashlib
import json
from web3 import Web3
from didkit import DIDKit

class VerifiableAgent:
    def __init__(self, did: str, jwk: Dict[str, Any]):
        self.did = did
        self.jwk = jwk
        self.execution_steps: List[Dict] = []
    
    def compute_input_root(self, doc_cid: str, chunks: List[str]) -> str:
        """Compute commitment to inputs"""
        data = {
            "cid": doc_cid,
            "chunks": chunks,
            "timestamp": int(time.time())
        }
        return Web3.keccak(text=json.dumps(data, sort_keys=True)).hex()
    
    def log_step(self, step_type: str, data: Dict):
        """Log execution step for Merkle tree"""
        step = {
            "type": step_type,
            "data": data,
            "timestamp": int(time.time())
        }
        self.execution_steps.append(step)
    
    def compute_execution_root(self) -> str:
        """Build Merkle tree from execution steps"""
        leaves = [
            Web3.keccak(text=json.dumps(step, sort_keys=True)).hex()
            for step in self.execution_steps
        ]
        return self._merkle_root(leaves)
    
    def _merkle_root(self, leaves: List[str]) -> str:
        if len(leaves) == 1:
            return leaves[0]
        
        next_level = []
        for i in range(0, len(leaves), 2):
            left = leaves[i]
            right = leaves[i + 1] if i + 1 < len(leaves) else left
            combined = Web3.keccak(hexstr=left + right[2:]).hex()
            next_level.append(combined)
        
        return self._merkle_root(next_level)
    
    async def issue_credential(self, subject: Dict) -> str:
        """Sign Verifiable Credential with DIDKit"""
        vc = {
            "@context": ["https://www.w3.org/2018/credentials/v1"],
            "type": ["VerifiableCredential"],
            "issuer": self.did,
            "issuanceDate": datetime.utcnow().isoformat() + "Z",
            "credentialSubject": subject
        }
        
        # Sign with DIDKit
        signed_vc = await DIDKit.issue_credential(
            json.dumps(vc),
            json.dumps({"proofPurpose": "assertionMethod"}),
            json.dumps(self.jwk)
        )
        return signed_vc
```

---

## 🎨 Frontend Components

### Wallet Connection (with Crossmint)
```typescript
// app/src/components/WalletConnect.tsx
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useCrossmint } from '@/hooks/useCrossmint';

export function WalletConnect() {
  const { createWallet, address } = useCrossmint();
  
  return (
    <div className="flex gap-4">
      <ConnectButton />
      <button 
        onClick={createWallet}
        className="btn-crossmint"
      >
        Login with Email
      </button>
      {address && <p>Somnia Address: {address}</p>}
    </div>
  );
}
```

### NFT Minting
```typescript
// app/src/components/NFTMinter.tsx
import { useAccessNFT } from '@/hooks/useAccessNFT';

export function NFTMinter() {
  const { mint, isLoading } = useAccessNFT();
  
  const handleMint = async (documentCID: string) => {
    const tokenId = await mint(documentCID);
    console.log('Minted NFT:', tokenId);
  };
  
  return (
    <button onClick={() => handleMint('QmXYZ...')} disabled={isLoading}>
      {isLoading ? 'Minting...' : 'Mint Access NFT'}
    </button>
  );
}
```

### Provenance Viewer
```typescript
// app/src/components/ProvenanceViewer.tsx
import { useProvenance } from '@/hooks/useProvenance';

export function ProvenanceViewer({ tokenId }: { tokenId: number }) {
  const { records } = useProvenance(tokenId);
  
  return (
    <div className="provenance-list">
      {records.map((record, i) => (
        <div key={i} className="record-card">
          <h3>Execution #{i + 1}</h3>
          <p>Input: <a href={`https://ipfs.io/ipfs/${record.inputCID}`}>{record.inputCID}</a></p>
          <p>Output: <a href={`https://ipfs.io/ipfs/${record.outputCID}`}>{record.outputCID}</a></p>
          <p>Execution Root: <code>{record.executionRoot}</code></p>
          <p>Trace: <a href={`https://ipfs.io/ipfs/${record.traceCID}`}>View full trace</a></p>
          <a href={`https://explorer.somnia.network/tx/${record.txHash}`}>
            View on Somnia Explorer
          </a>
        </div>
      ))}
    </div>
  );
}
```

---

## 🚀 Deployment Checklist

### 1. Somnia RPC Setup
- [ ] Get Somnia testnet RPC URL from official docs
- [ ] Fund deployer wallet with testnet tokens
- [ ] Configure `hardhat.config.js` with Somnia network

### 2. Smart Contracts
- [ ] Deploy `AccessNFT.sol` to Somnia
- [ ] Deploy `AgentRegistry.sol`
- [ ] Deploy `Provenance.sol`
- [ ] Verify contracts on Somnia explorer

### 3. IPFS
- [ ] Create Pinata account & get API key
- [ ] OR set up web3.storage
- [ ] Test upload/retrieval

### 4. AI Backend
- [ ] Generate DID with DIDKit: `didkit generate-key`
- [ ] Register agent DID on `AgentRegistry`
- [ ] Deploy FastAPI to Railway/Fly.io
- [ ] Set environment variables (Somnia RPC, contract addresses, IPFS keys)

### 5. Frontend
- [ ] Configure wagmi with Somnia chain
- [ ] Add Somnia to RainbowKit chains
- [ ] Set up Crossmint SDK
- [ ] Deploy to Vercel

### 6. Demo Video
- [ ] Record: wallet connect → mint NFT → upload doc → run AI → view receipt
- [ ] Show Somnia explorer with events
- [ ] Explain verifiable receipts (inputRoot, executionRoot)

---

## 🎯 Hackathon Win Factors

### ✅ What Makes This Competitive

1. **Native to Somnia**: All actions on Somnia L1, not a private chain demo
2. **NFT-centric**: Access control via ERC-721, composable with other Somnia dapps
3. **Verifiable AI**: Not just "AI did something" but "here's cryptographic proof of what it consumed and did"
4. **Real-time provenance**: Sub-second finality on Somnia means instant receipts
5. **User-friendly**: Crossmint email login, no seed phrases
6. **Composable**: Other Somnia contracts can read `Provenance` events and build on top

### 🎨 Optional Enhancements

- **Metaverse integration**: Generate 3D asset metadata from AI summaries
- **Upgradable NFTs**: AI "upgrades" 2D document NFT to 3D scene representation
- **DAO governance**: NFT holders vote on which agents can run
- **Revenue sharing**: Agent charges fee, splits with NFT holder

---

## 📚 Reference Links

- **Somnia Docs**: https://docs.somnia.network
- **Verifiable Agent Demo**: https://github.com/AkshatGada/verifiable_agent_demo
- **DIDKit**: https://github.com/spruceid/didkit
- **Crossmint**: https://docs.crossmint.com
- **wagmi**: https://wagmi.sh
- **Pinata**: https://pinata.cloud

---

## 🧪 Testing Strategy

1. **Unit tests**: Each contract function (Foundry/Hardhat)
2. **Integration tests**: Full flow (mint → upload → execute → verify)
3. **Merkle tree verification**: Ensure executionRoot recomputes correctly
4. **ZK proof (if implemented)**: Test circuit with sample traces
5. **Gas optimization**: Keep Provenance events under reasonable limits

---

## 📖 README for Judges

```markdown
# Somnia AI Agents - NFT-Gated Verifiable Knowledge Objects

AI agents that read NFT-gated documents, produce derivatives, and anchor 
cryptographic provenance on Somnia L1.

## Demo
[Link to video showing wallet → mint → upload → AI run → receipt]

## What It Does
1. User mints an Access NFT (email login via Crossmint)
2. Uploads encrypted document to IPFS, anchors CID on NFT
3. AI agent (with DID identity) executes:
   - Computes inputRoot (what it read)
   - Runs LLM, logs each step in Merkle tree
   - Computes executionRoot (what it did)
   - Anchors both on Somnia Provenance contract
4. Anyone can verify the agent provably consumed X and produced Y

## Why Somnia
- Sub-second finality → instant provenance updates
- EVM-compatible → standard Solidity
- NFT-first ecosystem → natural fit for access control
- Composable → other dapps can build on our Provenance events

## Tech Stack
- **Chain**: Somnia L1 (EVM)
- **Contracts**: AccessNFT (ERC-721), AgentRegistry (DIDs), Provenance (commitments)
- **Storage**: IPFS (Pinata)
- **AI**: FastAPI + vLLM/OpenAI
- **Verifiability**: DIDKit (W3C VCs), Merkle trees, optional ZK
- **Frontend**: Next.js + wagmi + Crossmint

## Enterprise Extension
This architecture can also run on Hyperledger Besu + Tessera for private 
organizations (see [enterprise-architecture.pdf](./docs/enterprise.pdf)).

## Run It
\`\`\`bash
# Contracts
cd contracts && npx hardhat run scripts/deploy.js --network somnia

# Backend
cd agent && pip install -r requirements.txt && uvicorn app.main:app

# Frontend
cd app && npm install && npm run dev
\`\`\`

[Link to Somnia explorer with live contract]
[Link to GitHub repo]
```

---

## 🎬 Next Steps

**Immediate**:
1. Set up local dev environment (Node, Python, Hardhat)
2. Clone `verifiable_agent_demo` and study DID/VC flow
3. Get Somnia testnet RPC and deploy first contract

**Week 1**:
- Build and test contracts locally
- Deploy to Somnia testnet
- Register agent DID

**Week 2**:
- Build FastAPI backend with vLLM
- Integrate IPFS
- Wire up Merkle tree logic

**Week 3**:
- Build Next.js UI
- Crossmint integration
- End-to-end testing

**Week 4**:
- Polish UI/UX
- Record demo video
- Write submission README

---

**This is the pragmatic, judge-proof path to a winning Somnia submission.** 🚀

The universe is EVM-shaped enough for this to work.

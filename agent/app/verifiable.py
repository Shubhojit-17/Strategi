"""
Verifiable Agent Implementation
Based on: https://github.com/AkshatGada/verifiable_agent_demo

Implements:
1. DID identity (did:key)
2. Input commitment (inputRoot)
3. Execution trace (Merkle tree → executionRoot)
4. Verifiable Credentials (W3C spec)
5. Optional ZK proofs
"""

import json
import time
import hashlib
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
from datetime import datetime, timezone

from web3 import Web3
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import base58


@dataclass
class ExecutionStep:
    """Single step in AI execution trace"""
    step_type: str  # "prompt", "tool_call", "llm_response", etc.
    data: Dict[str, Any]
    timestamp: int
    
    def hash(self) -> str:
        """Compute keccak256 hash of this step"""
        canonical = json.dumps(asdict(self), sort_keys=True)
        return Web3.keccak(text=canonical).hex()


@dataclass
class InputCommitment:
    """Commitment to inputs consumed by agent"""
    document_cid: str
    chunks: List[str]
    metadata: Dict[str, Any]
    timestamp: int
    
    def compute_root(self) -> str:
        """Compute inputRoot = keccak256(all inputs)"""
        canonical = json.dumps(asdict(self), sort_keys=True)
        return Web3.keccak(text=canonical).hex()


class DIDKey:
    """
    Minimal did:key implementation for Ed25519
    Based on: https://w3c-ccg.github.io/did-method-key/
    """
    
    def __init__(self, private_key: Optional[ed25519.Ed25519PrivateKey] = None):
        if private_key is None:
            private_key = ed25519.Ed25519PrivateKey.generate()
        
        self.private_key = private_key
        self.public_key = private_key.public_key()
    
    @property
    def did(self) -> str:
        """Generate did:key from public key"""
        public_bytes = self.public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        
        # Multicodec prefix for Ed25519 public key: 0xed01
        multicodec_key = b'\xed\x01' + public_bytes
        
        # Base58 encode
        encoded = base58.b58encode(multicodec_key).decode('utf-8')
        
        return f"did:key:z{encoded}"
    
    def to_jwk(self) -> Dict[str, str]:
        """Export as JWK for signing"""
        private_bytes = self.private_key.private_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PrivateFormat.Raw,
            encryption_algorithm=serialization.NoEncryption()
        )
        public_bytes = self.public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        )
        
        import base64
        return {
            "kty": "OKP",
            "crv": "Ed25519",
            "d": base64.urlsafe_b64encode(private_bytes).decode().rstrip('='),
            "x": base64.urlsafe_b64encode(public_bytes).decode().rstrip('='),
        }
    
    def sign(self, message: bytes) -> bytes:
        """Sign a message"""
        return self.private_key.sign(message)
    
    @classmethod
    def from_jwk(cls, jwk: Dict[str, str]) -> "DIDKey":
        """Load from JWK"""
        import base64
        
        # Decode private key
        d_bytes = base64.urlsafe_b64decode(jwk["d"] + "==")
        private_key = ed25519.Ed25519PrivateKey.from_private_bytes(d_bytes)
        
        return cls(private_key)


class MerkleTree:
    """Simple Merkle tree for execution trace"""
    
    def __init__(self, leaves: List[str]):
        """
        Args:
            leaves: List of hex-encoded hashes (with 0x prefix)
        """
        self.leaves = leaves
        self.tree = self._build_tree(leaves)
    
    def _build_tree(self, nodes: List[str]) -> List[List[str]]:
        """Build full Merkle tree"""
        if not nodes:
            return [[Web3.keccak(text="empty").hex()]]
        
        tree = [nodes]
        
        while len(tree[-1]) > 1:
            level = tree[-1]
            next_level = []
            
            for i in range(0, len(level), 2):
                left = level[i]
                right = level[i + 1] if i + 1 < len(level) else left
                
                # Combine hashes (remove 0x prefix from right)
                combined = Web3.keccak(hexstr=left + right[2:]).hex()
                next_level.append(combined)
            
            tree.append(next_level)
        
        return tree
    
    @property
    def root(self) -> str:
        """Get Merkle root"""
        return self.tree[-1][0]
    
    def get_proof(self, index: int) -> List[str]:
        """Get Merkle proof for a leaf"""
        if index >= len(self.leaves):
            raise ValueError(f"Index {index} out of range")
        
        proof = []
        
        for level in self.tree[:-1]:  # All levels except root
            if index % 2 == 0:
                # We're on the left, sibling is on right
                sibling_index = index + 1
            else:
                # We're on the right, sibling is on left
                sibling_index = index - 1
            
            if sibling_index < len(level):
                proof.append(level[sibling_index])
            
            index = index // 2
        
        return proof


class VerifiableAgent:
    """
    AI Agent with verifiable execution
    Implements input commitments + execution trace + W3C VCs
    """
    
    def __init__(self, did_key: DIDKey):
        self.did_key = did_key
        self.execution_steps: List[ExecutionStep] = []
        self.input_commitment: Optional[InputCommitment] = None
    
    @property
    def did(self) -> str:
        return self.did_key.did
    
    def commit_inputs(
        self,
        document_cid: str,
        chunks: List[str],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create input commitment
        
        Returns:
            inputRoot (hex string)
        """
        self.input_commitment = InputCommitment(
            document_cid=document_cid,
            chunks=chunks,
            metadata=metadata or {},
            timestamp=int(time.time())
        )
        
        root = self.input_commitment.compute_root()
        print(f"🔍 Input root computed: {root}")
        print(f"🔍 Input data: doc_cid={document_cid}, chunks={len(chunks)}, metadata keys={list((metadata or {}).keys())}")
        return root
    
    def log_step(self, step_type: str, data: Dict[str, Any]):
        """Log an execution step"""
        step = ExecutionStep(
            step_type=step_type,
            data=data,
            timestamp=int(time.time())
        )
        self.execution_steps.append(step)
    
    def compute_execution_root(self) -> str:
        """
        Compute Merkle root of execution trace
        
        Returns:
            executionRoot (hex string)
        """
        if not self.execution_steps:
            empty_root = Web3.keccak(text="empty").hex()
            print(f"⚠️ No execution steps! Returning empty root: {empty_root}")
            return empty_root
        
        # Hash each step
        leaves = [step.hash() for step in self.execution_steps]
        print(f"🔍 Computing execution root from {len(leaves)} steps")
        print(f"🔍 First leaf hash: {leaves[0] if leaves else 'none'}")
        
        # Build Merkle tree
        tree = MerkleTree(leaves)
        root = tree.root
        print(f"🔍 Execution root computed: {root}")
        
        return root
    
    def get_execution_trace(self) -> Dict[str, Any]:
        """
        Get full execution trace for IPFS storage
        
        Returns:
            Dictionary with all steps and Merkle proof
        """
        leaves = [step.hash() for step in self.execution_steps]
        tree = MerkleTree(leaves) if leaves else None
        
        return {
            "did": self.did,
            "input_commitment": asdict(self.input_commitment) if self.input_commitment else None,
            "steps": [asdict(step) for step in self.execution_steps],
            "step_hashes": leaves,
            "execution_root": tree.root if tree else None,
            "timestamp": int(time.time()),
        }
    
    def issue_verifiable_credential(
        self,
        subject: Dict[str, Any],
        credential_type: str = "VerifiableCredential"
    ) -> Dict[str, Any]:
        """
        Issue a W3C Verifiable Credential
        
        Args:
            subject: The credentialSubject claims
            credential_type: Type of credential
        
        Returns:
            Signed VC (JWT-like, but simpler for demo)
        """
        vc = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],
            "type": [credential_type],
            "issuer": self.did,
            "issuanceDate": datetime.now(timezone.utc).isoformat(),
            "credentialSubject": subject
        }
        
        # In production, this would be a proper JWS signature
        # For demo, we'll sign the canonical JSON
        canonical = json.dumps(vc, sort_keys=True).encode()
        signature = self.did_key.sign(canonical)
        
        vc["proof"] = {
            "type": "Ed25519Signature2020",
            "created": datetime.now(timezone.utc).isoformat(),
            "verificationMethod": f"{self.did}#key-1",
            "proofPurpose": "assertionMethod",
            "proofValue": signature.hex()
        }
        
        return vc
    
    def reset(self):
        """Clear execution state for new run"""
        self.execution_steps = []
        self.input_commitment = None


# ============ Example Usage ============

def example_usage():
    """Demonstrate verifiable agent workflow"""
    
    # 1. Create agent with DID
    agent = VerifiableAgent(DIDKey())
    print(f"Agent DID: {agent.did}\n")
    
    # 2. Commit to inputs
    input_root = agent.commit_inputs(
        document_cid="QmXYZ123...",
        chunks=["chunk1", "chunk2", "chunk3"],
        metadata={"source": "user_upload"}
    )
    print(f"Input Root: {input_root}\n")
    
    # 3. Execute AI steps
    agent.log_step("prompt", {"text": "Summarize this document"})
    agent.log_step("llm_response", {"text": "This is a summary...", "model": "gpt-4"})
    agent.log_step("tool_call", {"tool": "search", "query": "verify fact"})
    agent.log_step("llm_response", {"text": "Final answer...", "model": "gpt-4"})
    
    # 4. Compute execution root
    execution_root = agent.compute_execution_root()
    print(f"Execution Root: {execution_root}\n")
    
    # 5. Get trace
    trace = agent.get_execution_trace()
    print(f"Trace: {json.dumps(trace, indent=2)}\n")
    
    # 6. Issue VC
    vc = agent.issue_verifiable_credential({
        "inputRoot": input_root,
        "executionRoot": execution_root,
        "outputCID": "QmABC456...",
    })
    print(f"Verifiable Credential: {json.dumps(vc, indent=2)}")


if __name__ == "__main__":
    example_usage()

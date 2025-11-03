// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AccessNFT.sol";
import "./AgentRegistry.sol";

/**
 * @title Provenance
 * @notice Records verifiable AI execution provenance on Somnia L1
 * @dev Anchors inputRoot (what agent consumed) and executionRoot (what agent did)
 * 
 * Flow:
 * 1. Agent fetches document from NFT → computes inputRoot
 * 2. Agent executes LLM → builds Merkle tree → computes executionRoot
 * 3. Agent calls recordDerivative() → anchors roots + CIDs on-chain
 * 4. Anyone can verify execution by:
 *    - Fetching trace from IPFS (traceCID)
 *    - Recomputing Merkle root locally
 *    - Comparing with on-chain executionRoot
 *    - Optionally verifying ZK proof
 */
contract Provenance {
    // ============ Structs ============
    
    struct ProvenanceRecord {
        uint256 nftTokenId;           // Which document was processed
        string inputCID;              // IPFS CID of input document
        bytes32 inputRoot;            // Commitment to inputs (keccak256)
        string outputCID;             // IPFS CID of derivative output
        bytes32 executionRoot;        // Merkle root of execution trace
        string traceCID;              // IPFS CID of full execution trace (JSON)
        bytes32 agentDIDHash;         // Which agent ran this (keccak256 of DID)
        address executor;             // Address that submitted this record
        uint256 timestamp;            // When this was recorded
        string proofCID;              // Optional: IPFS CID of ZK proof
        bool verified;                // Optional: ZK proof verified on-chain
    }
    
    // ============ State Variables ============
    
    AccessNFT public immutable accessNFT;
    AgentRegistry public immutable agentRegistry;
    
    // All provenance records
    ProvenanceRecord[] public records;
    
    // NFT token ID → array of record indices
    mapping(uint256 => uint256[]) public nftToRecords;
    
    // Agent DID hash → array of record indices
    mapping(bytes32 => uint256[]) public agentToRecords;
    
    // Execution root → record ID (prevents duplicate submissions)
    mapping(bytes32 => uint256) public executionRootToRecordId;
    
    // ============ Events ============
    
    event ProvenanceRecorded(
        uint256 indexed recordId,
        uint256 indexed nftTokenId,
        bytes32 indexed agentDIDHash,
        bytes32 executionRoot,
        string outputCID,
        uint256 timestamp
    );
    
    event ProofVerified(
        uint256 indexed recordId,
        bytes32 executionRoot,
        bool isValid
    );
    
    // ============ Errors ============
    
    error NFTNotOwned(uint256 tokenId, address claimer);
    error AgentNotActive(bytes32 didHash);
    error DuplicateExecution(bytes32 executionRoot);
    error InvalidRecord();
    error Unauthorized();
    
    // ============ Constructor ============
    
    constructor(address _accessNFT, address _agentRegistry) {
        accessNFT = AccessNFT(_accessNFT);
        agentRegistry = AgentRegistry(_agentRegistry);
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Record a new provenance entry for an AI execution
     * @param nftTokenId The NFT token that grants access to the input document
     * @param inputCID IPFS CID of the input document
     * @param inputRoot Commitment to inputs (keccak256 of normalized input data)
     * @param outputCID IPFS CID of the derivative output
     * @param executionRoot Merkle root of execution trace
     * @param traceCID IPFS CID of full execution trace (for verification)
     * @param agentDID The agent's DID string (e.g., "did:key:z6Mk...")
     * @param proofCID Optional: IPFS CID of ZK proof
     * @return recordId The ID of the newly created record
     */
    function recordDerivative(
        uint256 nftTokenId,
        string calldata inputCID,
        bytes32 inputRoot,
        string calldata outputCID,
        bytes32 executionRoot,
        string calldata traceCID,
        string calldata agentDID,
        string calldata proofCID
    ) external returns (uint256) {
        // Validation
        if (bytes(inputCID).length == 0 || bytes(outputCID).length == 0) {
            revert InvalidRecord();
        }
        if (inputRoot == bytes32(0) || executionRoot == bytes32(0)) {
            revert InvalidRecord();
        }
        
        // Check NFT ownership
        address nftOwner = accessNFT.ownerOf(nftTokenId);
        if (nftOwner != msg.sender) {
            revert NFTNotOwned(nftTokenId, msg.sender);
        }
        
        // Check agent is registered and active
        bytes32 agentDIDHash = keccak256(abi.encodePacked(agentDID));
        if (!agentRegistry.isActiveAgent(agentDID)) {
            revert AgentNotActive(agentDIDHash);
        }
        
        // Prevent duplicate submissions
        if (executionRootToRecordId[executionRoot] != 0) {
            revert DuplicateExecution(executionRoot);
        }
        
        // Create record
        uint256 recordId = records.length;
        
        records.push(ProvenanceRecord({
            nftTokenId: nftTokenId,
            inputCID: inputCID,
            inputRoot: inputRoot,
            outputCID: outputCID,
            executionRoot: executionRoot,
            traceCID: traceCID,
            agentDIDHash: agentDIDHash,
            executor: msg.sender,
            timestamp: block.timestamp,
            proofCID: proofCID,
            verified: false  // ZK proof not yet verified
        }));
        
        // Index by NFT and agent
        nftToRecords[nftTokenId].push(recordId);
        agentToRecords[agentDIDHash].push(recordId);
        executionRootToRecordId[executionRoot] = recordId + 1; // +1 to distinguish from default 0
        
        // Record execution in agent registry
        agentRegistry.recordExecution(agentDID);
        
        emit ProvenanceRecorded(
            recordId,
            nftTokenId,
            agentDIDHash,
            executionRoot,
            outputCID,
            block.timestamp
        );
        
        return recordId;
    }
    
    /**
     * @notice Verify a ZK proof for a provenance record (if implementing ZK)
     * @dev This would call a Verifier contract generated by circom/snarkjs
     * @param recordId The record to verify
     * @param proof The ZK proof data
     * @return bool True if proof is valid
     */
    function verifyProof(uint256 recordId, bytes calldata proof) 
        external 
        returns (bool) 
    {
        require(recordId < records.length, "Invalid record ID");
        
        ProvenanceRecord storage record = records[recordId];
        
        // TODO: Implement actual ZK verification
        // This would call: verifier.verifyProof(proof, [record.executionRoot])
        // For now, we just mark it as verified (placeholder)
        
        record.verified = true;
        
        emit ProofVerified(recordId, record.executionRoot, true);
        
        return true;
    }
    
    /**
     * @notice Get all provenance records for an NFT
     * @param nftTokenId The NFT token ID
     * @return Array of record IDs
     */
    function getRecordsByNFT(uint256 nftTokenId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return nftToRecords[nftTokenId];
    }
    
    /**
     * @notice Get all provenance records by an agent
     * @param agentDID The agent's DID
     * @return Array of record IDs
     */
    function getRecordsByAgent(string calldata agentDID) 
        external 
        view 
        returns (uint256[] memory) 
    {
        bytes32 didHash = keccak256(abi.encodePacked(agentDID));
        return agentToRecords[didHash];
    }
    
    /**
     * @notice Get a specific provenance record
     * @param recordId The record ID
     * @return ProvenanceRecord struct
     */
    function getRecord(uint256 recordId) 
        external 
        view 
        returns (ProvenanceRecord memory) 
    {
        require(recordId < records.length, "Invalid record ID");
        return records[recordId];
    }
    
    /**
     * @notice Get total number of provenance records
     * @return uint256 Total count
     */
    function getTotalRecords() external view returns (uint256) {
        return records.length;
    }
    
    /**
     * @notice Check if an execution root has already been recorded
     * @param executionRoot The Merkle root to check
     * @return bool True if already recorded
     */
    function isExecutionRecorded(bytes32 executionRoot) 
        external 
        view 
        returns (bool) 
    {
        return executionRootToRecordId[executionRoot] != 0;
    }
    
    /**
     * @notice Get the record ID for an execution root
     * @param executionRoot The Merkle root
     * @return uint256 Record ID (0 if not found)
     */
    function getRecordIdByExecutionRoot(bytes32 executionRoot) 
        external 
        view 
        returns (uint256) 
    {
        uint256 id = executionRootToRecordId[executionRoot];
        return id > 0 ? id - 1 : 0;
    }
}

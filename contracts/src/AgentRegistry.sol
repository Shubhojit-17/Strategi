// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRegistry
 * @notice Registry for AI agent identities (DIDs) and their capabilities
 * @dev Maps agent DIDs to on-chain addresses for verifiable execution
 * 
 * Flow:
 * 1. Agent generates did:key with DIDKit off-chain
 * 2. Agent controller registers DID → address mapping on-chain
 * 3. Provenance contract checks agent DID is registered before accepting records
 * 4. Anyone can verify "this execution came from a registered agent"
 */
contract AgentRegistry is Ownable {
    // ============ Structs ============
    
    struct AgentClaim {
        bytes32 didHash;              // keccak256(did:key:...)
        address controller;           // Address that controls this agent
        string metadataURI;           // IPFS CID with agent capabilities/model info
        string name;                  // Human-readable name
        bool isActive;                // Can be deactivated without removing claim
        uint256 timestamp;            // Registration time
        uint256 executionCount;       // Number of executions by this agent
    }
    
    // ============ State Variables ============
    
    // DID hash → agent claim
    mapping(bytes32 => AgentClaim) public claims;
    
    // Controller address → list of their agent DID hashes
    mapping(address => bytes32[]) public controllerAgents;
    
    // Array of all registered DID hashes (for enumeration)
    bytes32[] public allAgents;
    
    // ============ Events ============
    
    event AgentRegistered(
        bytes32 indexed didHash,
        address indexed controller,
        string did,
        string name,
        string metadataURI,
        uint256 timestamp
    );
    
    event AgentUpdated(
        bytes32 indexed didHash,
        string metadataURI,
        uint256 timestamp
    );
    
    event AgentDeactivated(bytes32 indexed didHash, uint256 timestamp);
    event AgentReactivated(bytes32 indexed didHash, uint256 timestamp);
    
    event ExecutionRecorded(
        bytes32 indexed didHash,
        uint256 executionCount
    );
    
    // ============ Errors ============
    
    error AgentAlreadyRegistered(bytes32 didHash);
    error AgentNotRegistered(bytes32 didHash);
    error Unauthorized();
    error AgentInactive(bytes32 didHash);
    error InvalidDID();
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {}
    
    // ============ External Functions ============
    
    /**
     * @notice Register a new AI agent
     * @param did The agent's DID (e.g., "did:key:z6Mk...")
     * @param name Human-readable name
     * @param metadataURI IPFS CID with agent capabilities
     */
    function registerAgent(
        string calldata did,
        string calldata name,
        string calldata metadataURI
    ) external {
        if (bytes(did).length == 0) revert InvalidDID();
        
        bytes32 didHash = keccak256(abi.encodePacked(did));
        
        if (claims[didHash].timestamp != 0) {
            revert AgentAlreadyRegistered(didHash);
        }
        
        claims[didHash] = AgentClaim({
            didHash: didHash,
            controller: msg.sender,
            metadataURI: metadataURI,
            name: name,
            isActive: true,
            timestamp: block.timestamp,
            executionCount: 0
        });
        
        controllerAgents[msg.sender].push(didHash);
        allAgents.push(didHash);
        
        emit AgentRegistered(
            didHash,
            msg.sender,
            did,
            name,
            metadataURI,
            block.timestamp
        );
    }
    
    /**
     * @notice Update agent metadata URI
     * @param did The agent's DID
     * @param newMetadataURI New IPFS CID
     */
    function updateAgentMetadata(
        string calldata did,
        string calldata newMetadataURI
    ) external {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        AgentClaim storage claim = claims[didHash];
        
        if (claim.timestamp == 0) revert AgentNotRegistered(didHash);
        if (claim.controller != msg.sender) revert Unauthorized();
        
        claim.metadataURI = newMetadataURI;
        
        emit AgentUpdated(didHash, newMetadataURI, block.timestamp);
    }
    
    /**
     * @notice Deactivate an agent (can be reactivated)
     * @param did The agent's DID
     */
    function deactivateAgent(string calldata did) external {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        AgentClaim storage claim = claims[didHash];
        
        if (claim.timestamp == 0) revert AgentNotRegistered(didHash);
        if (claim.controller != msg.sender && msg.sender != owner()) {
            revert Unauthorized();
        }
        
        claim.isActive = false;
        
        emit AgentDeactivated(didHash, block.timestamp);
    }
    
    /**
     * @notice Reactivate an agent
     * @param did The agent's DID
     */
    function reactivateAgent(string calldata did) external {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        AgentClaim storage claim = claims[didHash];
        
        if (claim.timestamp == 0) revert AgentNotRegistered(didHash);
        if (claim.controller != msg.sender) revert Unauthorized();
        
        claim.isActive = true;
        
        emit AgentReactivated(didHash, block.timestamp);
    }
    
    /**
     * @notice Record an execution by this agent (called by Provenance contract)
     * @param did The agent's DID
     */
    function recordExecution(string calldata did) external {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        AgentClaim storage claim = claims[didHash];
        
        if (claim.timestamp == 0) revert AgentNotRegistered(didHash);
        if (!claim.isActive) revert AgentInactive(didHash);
        
        claim.executionCount++;
        
        emit ExecutionRecorded(didHash, claim.executionCount);
    }
    
    /**
     * @notice Check if an agent is registered and active
     * @param did The agent's DID
     * @return bool True if agent is active
     */
    function isActiveAgent(string calldata did) external view returns (bool) {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        AgentClaim memory claim = claims[didHash];
        return claim.timestamp != 0 && claim.isActive;
    }
    
    /**
     * @notice Get agent claim by DID
     * @param did The agent's DID
     * @return AgentClaim struct
     */
    function getAgentByDID(string calldata did) 
        external 
        view 
        returns (AgentClaim memory) 
    {
        bytes32 didHash = keccak256(abi.encodePacked(did));
        return claims[didHash];
    }
    
    /**
     * @notice Get all agent DID hashes for a controller
     * @param controller Address of the controller
     * @return Array of DID hashes
     */
    function getAgentsByController(address controller) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return controllerAgents[controller];
    }
    
    /**
     * @notice Get total number of registered agents
     * @return uint256 Total count
     */
    function getTotalAgents() external view returns (uint256) {
        return allAgents.length;
    }
    
    /**
     * @notice Get agent DID hash at index (for enumeration)
     * @param index Index in allAgents array
     * @return bytes32 DID hash
     */
    function getAgentAtIndex(uint256 index) external view returns (bytes32) {
        require(index < allAgents.length, "Index out of bounds");
        return allAgents[index];
    }
}

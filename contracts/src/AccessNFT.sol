// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AccessNFT
 * @notice ERC-721 token that grants access to documents stored on IPFS
 * @dev Each token represents ownership/access to a specific document
 * 
 * Flow:
 * 1. User mints NFT (via Crossmint wallet)
 * 2. Document uploaded to IPFS → CID stored in tokenURI
 * 3. Only NFT owner can authorize AI agents to process the document
 * 4. NFT ownership = document access control on Somnia L1
 */
contract AccessNFT is ERC721URIStorage, Ownable {
    // ============ State Variables ============
    
    uint256 private _tokenIdCounter;
    
    // Mapping from tokenId to whether it's locked (prevents transfer during AI processing)
    mapping(uint256 => bool) public isLocked;
    
    // Authorized agent registry contract (can lock/unlock tokens)
    address public agentRegistry;
    
    // ============ Events ============
    
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        string documentCID,
        uint256 timestamp
    );
    
    event TokenLocked(uint256 indexed tokenId, address indexed locker);
    event TokenUnlocked(uint256 indexed tokenId, address indexed unlocker);
    event AgentRegistryUpdated(address indexed oldRegistry, address indexed newRegistry);
    
    // ============ Errors ============
    
    error TokenIsLocked(uint256 tokenId);
    error Unauthorized();
    error InvalidAddress();
    
    // ============ Constructor ============
    
    constructor() ERC721("Somnia AI Access Pass", "SAAP") Ownable(msg.sender) {
        _tokenIdCounter = 1; // Start from 1 (0 is sentinel)
    }
    
    // ============ External Functions ============
    
    /**
     * @notice Mint a new Access NFT for a document
     * @param to Address to receive the NFT
     * @param documentCID IPFS CID of the document
     * @return tokenId The newly minted token ID
     */
    function mint(address to, string memory documentCID) 
        external 
        returns (uint256) 
    {
        if (to == address(0)) revert InvalidAddress();
        
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, documentCID);
        
        emit NFTMinted(to, tokenId, documentCID, block.timestamp);
        return tokenId;
    }
    
    /**
     * @notice Update the document CID for an existing token
     * @dev Only token owner can update
     * @param tokenId The token to update
     * @param newDocumentCID New IPFS CID
     */
    function updateDocumentCID(uint256 tokenId, string memory newDocumentCID) 
        external 
    {
        if (ownerOf(tokenId) != msg.sender) revert Unauthorized();
        if (isLocked[tokenId]) revert TokenIsLocked(tokenId);
        
        _setTokenURI(tokenId, newDocumentCID);
    }
    
    /**
     * @notice Check if an address has access to a token's document
     * @param user Address to check
     * @param tokenId Token ID to check access for
     * @return bool True if user owns the token
     */
    function hasAccess(address user, uint256 tokenId) 
        external 
        view 
        returns (bool) 
    {
        return ownerOf(tokenId) == user;
    }
    
    /**
     * @notice Lock a token to prevent transfers during AI processing
     * @dev Only callable by agent registry or token owner
     * @param tokenId Token to lock
     */
    function lockToken(uint256 tokenId) external {
        if (msg.sender != agentRegistry && ownerOf(tokenId) != msg.sender) {
            revert Unauthorized();
        }
        
        isLocked[tokenId] = true;
        emit TokenLocked(tokenId, msg.sender);
    }
    
    /**
     * @notice Unlock a token to allow transfers
     * @param tokenId Token to unlock
     */
    function unlockToken(uint256 tokenId) external {
        if (msg.sender != agentRegistry && ownerOf(tokenId) != msg.sender) {
            revert Unauthorized();
        }
        
        isLocked[tokenId] = false;
        emit TokenUnlocked(tokenId, msg.sender);
    }
    
    /**
     * @notice Set the authorized agent registry contract
     * @param _agentRegistry Address of the agent registry
     */
    function setAgentRegistry(address _agentRegistry) external onlyOwner {
        if (_agentRegistry == address(0)) revert InvalidAddress();
        
        address oldRegistry = agentRegistry;
        agentRegistry = _agentRegistry;
        
        emit AgentRegistryUpdated(oldRegistry, _agentRegistry);
    }
    
    /**
     * @notice Get the total number of tokens minted
     * @return uint256 Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Override to prevent transfers of locked tokens
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        if (isLocked[tokenId]) revert TokenIsLocked(tokenId);
        return super._update(to, tokenId, auth);
    }
}

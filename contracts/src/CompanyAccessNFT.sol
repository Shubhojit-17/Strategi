// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CompanyAccessNFT
 * @dev NFT that serves as authentication token for document storage access
 * Based on the research paper's architecture: NFT must be minted first for authentication
 */
contract CompanyAccessNFT is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to user metadata
    mapping(uint256 => string) public tokenURIs;
    
    // Mapping from user address to their token ID (one NFT per user)
    mapping(address => uint256) public userToTokenId;
    
    // Mapping to track if user has an NFT
    mapping(address => bool) public hasNFT;
    
    // Price to mint NFT (0.01 MATIC for testing)
    uint256 public constant MINT_PRICE = 0.01 ether;
    
    // Events
    event NFTMinted(address indexed user, uint256 indexed tokenId, string tokenURI);
    
    constructor() ERC721("Company Access NFT", "CANFT") Ownable(msg.sender) {}
    
    /**
     * @dev Mint NFT as authentication token
     * @param _tokenURI Metadata URI for the NFT
     */
    function mintAccessNFT(string memory _tokenURI) public payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(!hasNFT[msg.sender], "User already has an NFT");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, newTokenId);
        tokenURIs[newTokenId] = _tokenURI;
        userToTokenId[msg.sender] = newTokenId;
        hasNFT[msg.sender] = true;
        
        emit NFTMinted(msg.sender, newTokenId, _tokenURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Check if user has NFT (for authentication)
     * @param user Address to check
     */
    function isAuthenticated(address user) public view returns (bool) {
        return hasNFT[user];
    }
    
    /**
     * @dev Get user's NFT token ID
     * @param user Address to query
     */
    function getUserTokenId(address user) public view returns (uint256) {
        require(hasNFT[user], "User does not have NFT");
        return userToTokenId[user];
    }
    
    /**
     * @dev Get token URI
     * @param tokenId Token ID to query
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return tokenURIs[tokenId];
    }
    
    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Override transfer functions to prevent NFT transfers (soulbound)
     * NFT should stay with the user as authentication token
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("NFT is soulbound - cannot transfer");
        }
        return super._update(to, tokenId, auth);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title CompanyDropboxV2
 * @dev Document storage contract that works with standard ERC721 NFT
 */
contract CompanyDropboxV2 {
    
    // Reference to the NFT contract for authentication (standard ERC721)
    IERC721 public accessNFT;
    
    // Document structure
    struct Document {
        string ipfsHash;        // IPFS CID of the document
        bytes32 documentHash;   // SHA-256 hash of document for verification
        address uploader;       // Address of the uploader
        uint256 tokenId;        // NFT token ID (get from balanceOf check)
        uint256 timestamp;      // Upload timestamp
        string fileName;        // Original file name
        uint256 fileSize;       // File size in bytes
    }
    
    // Mapping from document ID to Document
    mapping(uint256 => Document) public documents;
    
    // Mapping from user address to their document IDs
    mapping(address => uint256[]) public userDocuments;
    
    // Document counter
    uint256 public documentCount;
    
    // Events
    event DocumentUploaded(
        uint256 indexed documentId,
        address indexed uploader,
        uint256 indexed tokenId,
        string ipfsHash,
        bytes32 documentHash,
        string fileName,
        uint256 fileSize,
        uint256 timestamp
    );
    
    constructor(address _accessNFTAddress) {
        accessNFT = IERC721(_accessNFTAddress);
    }
    
    /**
     * @dev Upload document (requires NFT ownership)
     * @param _ipfsHash IPFS CID of the uploaded document
     * @param _documentHash SHA-256 hash of the document content
     * @param _fileName Original file name
     * @param _fileSize File size in bytes
     */
    function uploadDocument(
        string memory _ipfsHash,
        bytes32 _documentHash,
        string memory _fileName,
        uint256 _fileSize
    ) public returns (uint256) {
        // Check if user owns at least one NFT
        require(accessNFT.balanceOf(msg.sender) > 0, "User must own NFT to upload documents");
        
        // Get first token ID (simplified - assumes token ID 1 for now)
        uint256 tokenId = 1; // In production, iterate to find actual token
        
        documentCount++;
        uint256 newDocumentId = documentCount;
        
        documents[newDocumentId] = Document({
            ipfsHash: _ipfsHash,
            documentHash: _documentHash,
            uploader: msg.sender,
            tokenId: tokenId,
            timestamp: block.timestamp,
            fileName: _fileName,
            fileSize: _fileSize
        });
        
        userDocuments[msg.sender].push(newDocumentId);
        
        emit DocumentUploaded(
            newDocumentId,
            msg.sender,
            tokenId,
            _ipfsHash,
            _documentHash,
            _fileName,
            _fileSize,
            block.timestamp
        );
        
        return newDocumentId;
    }
    
    /**
     * @dev Get documents for a user
     * @param user Address to query
     */
    function getUserDocuments(address user) public view returns (uint256[] memory) {
        return userDocuments[user];
    }
    
    /**
     * @dev Get document details
     * @param _documentId Document ID to query
     */
    function getDocument(uint256 _documentId) public view returns (
        string memory ipfsHash,
        bytes32 documentHash,
        address uploader,
        uint256 tokenId,
        uint256 timestamp,
        string memory fileName,
        uint256 fileSize
    ) {
        require(_documentId > 0 && _documentId <= documentCount, "Invalid document ID");
        Document memory doc = documents[_documentId];
        return (
            doc.ipfsHash,
            doc.documentHash,
            doc.uploader,
            doc.tokenId,
            doc.timestamp,
            doc.fileName,
            doc.fileSize
        );
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CompanyAccessNFT.sol";

/**
 * @title CompanyDropbox
 * @dev Document storage contract that requires NFT authentication
 * Architecture: NFT authentication → Document upload → Hash verification on blockchain
 */
contract CompanyDropbox {
    
    // Reference to the NFT contract for authentication
    CompanyAccessNFT public accessNFT;
    
    // Document structure
    struct Document {
        string ipfsHash;        // IPFS CID of the document
        bytes32 documentHash;   // SHA-256 hash of document for verification
        address uploader;       // Address of the uploader
        uint256 tokenId;        // NFT token ID used for authentication
        uint256 timestamp;      // Upload timestamp
        string fileName;        // Original file name
        uint256 fileSize;       // File size in bytes
    }
    
    // Mapping from document ID to Document
    mapping(uint256 => Document) public documents;
    
    // Mapping from user address to their document IDs
    mapping(address => uint256[]) public userDocuments;
    
    // Mapping from NFT token ID to document IDs
    mapping(uint256 => uint256[]) public nftDocuments;
    
    // Document counter
    uint256 public documentCount;
    
    // Events
    event DocumentUploaded(
        uint256 indexed documentId,
        address indexed uploader,
        uint256 indexed tokenId,
        string ipfsHash,
        bytes32 documentHash,
        string fileName
    );
    
    event DocumentVerified(
        uint256 indexed documentId,
        address indexed verifier,
        bool isValid
    );
    
    constructor(address _accessNFTAddress) {
        accessNFT = CompanyAccessNFT(_accessNFTAddress);
    }
    
    /**
     * @dev Upload document (requires NFT authentication)
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
        // CRITICAL: Verify NFT authentication first
        require(accessNFT.isAuthenticated(msg.sender), "User must own NFT to upload documents");
        
        uint256 tokenId = accessNFT.getUserTokenId(msg.sender);
        
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
        nftDocuments[tokenId].push(newDocumentId);
        
        emit DocumentUploaded(
            newDocumentId,
            msg.sender,
            tokenId,
            _ipfsHash,
            _documentHash,
            _fileName
        );
        
        return newDocumentId;
    }
    
    /**
     * @dev Verify document integrity by comparing hashes
     * @param _documentId Document ID to verify
     * @param _providedHash Hash to compare against
     */
    function verifyDocument(uint256 _documentId, bytes32 _providedHash) public returns (bool) {
        require(_documentId > 0 && _documentId <= documentCount, "Invalid document ID");
        
        Document memory doc = documents[_documentId];
        bool isValid = (doc.documentHash == _providedHash);
        
        emit DocumentVerified(_documentId, msg.sender, isValid);
        
        return isValid;
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
    
    /**
     * @dev Get all documents uploaded by a user
     * @param _user User address
     */
    function getUserDocuments(address _user) public view returns (uint256[] memory) {
        return userDocuments[_user];
    }
    
    /**
     * @dev Get all documents associated with an NFT
     * @param _tokenId NFT token ID
     */
    function getNFTDocuments(uint256 _tokenId) public view returns (uint256[] memory) {
        return nftDocuments[_tokenId];
    }
    
    /**
     * @dev Check if user is authenticated (has NFT)
     * @param _user User address
     */
    function isUserAuthenticated(address _user) public view returns (bool) {
        return accessNFT.isAuthenticated(_user);
    }
}

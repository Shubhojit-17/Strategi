"""
Contract configuration for blockchain interactions
Contains contract addresses and ABIs
"""

import os
from typing import Dict, Any

# Contract addresses from environment
CONTRACT_ADDRESSES = {
    "company_dropbox": os.getenv(
        "COMPANY_DROPBOX_ADDRESS",
        ""  # Will be set after deployment
    ),
    "access_nft": os.getenv(
        "ACCESS_NFT_ADDRESS",
        ""
    ),
    "agent_registry": os.getenv(
        "AGENT_REGISTRY_ADDRESS",
        ""
    ),
    "provenance": os.getenv(
        "PROVENANCE_ADDRESS",
        ""
    )
}

# CompanyDropbox contract ABI (from CompanyDropbox.sol)
COMPANY_DROPBOX_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "_accessNFTAddress", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "documentId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "uploader", "type": "address"},
            {"indexed": True, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"indexed": False, "internalType": "string", "name": "ipfsHash", "type": "string"},
            {"indexed": False, "internalType": "bytes32", "name": "documentHash", "type": "bytes32"},
            {"indexed": False, "internalType": "string", "name": "fileName", "type": "string"}
        ],
        "name": "DocumentUploaded",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "uint256", "name": "documentId", "type": "uint256"},
            {"indexed": True, "internalType": "address", "name": "verifier", "type": "address"},
            {"indexed": False, "internalType": "bool", "name": "isValid", "type": "bool"}
        ],
        "name": "DocumentVerified",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "string", "name": "_ipfsHash", "type": "string"},
            {"internalType": "bytes32", "name": "_documentHash", "type": "bytes32"},
            {"internalType": "string", "name": "_fileName", "type": "string"},
            {"internalType": "uint256", "name": "_fileSize", "type": "uint256"}
        ],
        "name": "uploadDocument",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_documentId", "type": "uint256"}],
        "name": "getDocument",
        "outputs": [
            {"internalType": "string", "name": "ipfsHash", "type": "string"},
            {"internalType": "bytes32", "name": "documentHash", "type": "bytes32"},
            {"internalType": "address", "name": "uploader", "type": "address"},
            {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
            {"internalType": "string", "name": "fileName", "type": "string"},
            {"internalType": "uint256", "name": "fileSize", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
        "name": "getUserDocuments",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_tokenId", "type": "uint256"}],
        "name": "getNFTDocuments",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "_documentId", "type": "uint256"},
            {"internalType": "bytes32", "name": "_providedHash", "type": "bytes32"}
        ],
        "name": "verifyDocument",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "accessNFT",
        "outputs": [{"internalType": "contract CompanyAccessNFT", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "documentCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]


def get_contract_address(contract_name: str) -> str:
    """Get contract address by name"""
    return CONTRACT_ADDRESSES.get(contract_name, "")


def get_contract_abi(contract_name: str) -> Any:
    """Get contract ABI by name"""
    if contract_name == "company_dropbox":
        return COMPANY_DROPBOX_ABI
    return None

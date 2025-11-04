"""
NFT-Based Authentication System
Implements the research paper's architecture:
1. User mints NFT first
2. NFT serves as authentication token
3. Only authenticated users can upload documents
"""

import os
import logging
from typing import Optional
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


class NFTAuthenticator:
    """
    Handles NFT-based authentication for document upload
    Based on: "Decentralized document storage with NFT Authentication using Blockchain technology"
    """
    
    def __init__(self):
        # Connect to Somnia L1
        rpc_url = os.getenv("SOMNIA_RPC_URL", "https://dream-rpc.somnia.network")
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        # Load contract addresses
        self.access_nft_address = os.getenv("ACCESS_NFT_ADDRESS")
        self.dropbox_address = os.getenv("DROPBOX_ADDRESS")
        
        if not self.access_nft_address:
            raise ValueError("ACCESS_NFT_ADDRESS not set in environment")
        
        # CompanyAccessNFT ABI - Custom NFT with authentication functions
        self.access_nft_abi = [
            {
                "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
                "name": "isAuthenticated",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
                "name": "getUserTokenId",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "mintAccessNFT",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "payable",
                "type": "function"
            }
        ]
        
        # Initialize contract
        self.access_nft_contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(self.access_nft_address),
            abi=self.access_nft_abi
        )
        
        logger.info(f"NFT Authenticator initialized with contract: {self.access_nft_address}")
    
    def verify_nft_authentication(self, user_address: str) -> bool:
        """
        Verify if user owns NFT authentication token
        
        Args:
            user_address: User's wallet address
            
        Returns:
            True if user has NFT, False otherwise
        """
        try:
            checksum_address = Web3.to_checksum_address(user_address)
            has_nft = self.access_nft_contract.functions.isAuthenticated(checksum_address).call()
            
            logger.info(f"NFT authentication check for {user_address}: {has_nft}")
            return has_nft
            
        except Exception as e:
            logger.error(f"Error verifying NFT authentication: {e}")
            return False
    
    def get_user_token_id(self, user_address: str) -> Optional[int]:
        """
        Get user's NFT token ID
        
        Args:
            user_address: User's wallet address
            
        Returns:
            Token ID if user has NFT, None otherwise
        """
        try:
            if not self.verify_nft_authentication(user_address):
                return None
            
            checksum_address = Web3.to_checksum_address(user_address)
            token_id = self.access_nft_contract.functions.getUserTokenId(checksum_address).call()
            
            logger.info(f"User {user_address} has NFT token ID: {token_id}")
            return token_id
            
        except Exception as e:
            logger.error(f"Error getting token ID: {e}")
            return None
    
    def require_nft_authentication(self, user_address: str) -> dict:
        """
        Check NFT authentication and return status
        
        Args:
            user_address: User's wallet address
            
        Returns:
            Dictionary with authentication status and details
        """
        has_nft = self.verify_nft_authentication(user_address)
        
        if not has_nft:
            return {
                "authenticated": False,
                "error": "NFT authentication required",
                "message": "You must mint an Access NFT before uploading documents"
            }
        
        token_id = self.get_user_token_id(user_address)
        
        return {
            "authenticated": True,
            "token_id": token_id,
            "message": "NFT authentication verified"
        }

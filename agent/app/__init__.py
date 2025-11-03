# Agent Backend - empty init
from .main import app
from .verifiable import VerifiableAgent, DIDKey
from .ipfs import IPFSClient
from .chains import SomniaClient
from .agent import AIAgent

__all__ = [
    "app",
    "VerifiableAgent",
    "DIDKey",
    "IPFSClient",
    "SomniaClient",
    "AIAgent",
]

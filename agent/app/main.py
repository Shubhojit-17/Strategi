"""
AI Agent Backend - FastAPI Server
Combines: NFT authentication + IPFS storage + Verifiable execution + Somnia anchoring
"""

import os
from typing import Optional, List, Dict, Any
from pathlib import Path
import asyncio
import logging
import time

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from .verifiable import VerifiableAgent, DIDKey
from .ipfs import IPFSClient
from .chains import SomniaClient
from .agent import AIAgent
from .crossmint import CrossmintClient
from .logging_config import setup_logging, log_transaction, log_performance

# Load environment - specify .env path explicitly
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

# Initialize logging system
audit_logger = setup_logging(log_dir="logs", log_level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)


# Background task for blockchain recording
async def record_document_async(
    cid: str,
    document_hash: str,
    filename: str,
    file_size: int,
    token_id: int,
    blockchain_client: SomniaClient
):
    """Background task to record document on blockchain without blocking upload response"""
    try:
        logger.info(f"[Background] Recording document on chain: {filename}")
        result = await blockchain_client.record_document_on_chain(
            cid=cid,
            document_hash=document_hash,
            filename=filename,
            file_size=file_size,
            token_id=token_id
        )
        logger.info(f"[Background] Document recorded successfully: {result.get('document_id')}, TX: {result.get('tx_hash')}")
    except Exception as e:
        logger.error(f"[Background] Failed to record document on chain: {e}", exc_info=True)


# Initialize FastAPI
app = FastAPI(
    title="Somnia AI Agents API",
    description="NFT-gated AI agents with verifiable execution on Somnia L1",
    version="1.0.0"
)

# CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins is "*"
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all HTTP requests with timing"""
    start_time = time.time()
    
    try:
        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path}",
            extra={
                'method': request.method,
                'endpoint': request.url.path,
                'client': request.client.host if request.client else None
            }
        )
        
        # Process request
        response = await call_next(request)
        
        # Log response
        duration_ms = (time.time() - start_time) * 1000
        logger.info(
            f"Response: {request.method} {request.url.path} - {response.status_code}",
            extra={
                'method': request.method,
                'endpoint': request.url.path,
                'status_code': response.status_code,
                'duration_ms': duration_ms
            }
        )
        
        return response
    except Exception as e:
        logger.error(f"Middleware error: {e}", exc_info=True)
        raise


# ============ Global State ============

# Load agent DID from environment
AGENT_DID_KEY = None
AGENT_DID = os.getenv("AGENT_DID")
AGENT_JWK = os.getenv("AGENT_JWK")

if AGENT_JWK:
    import json
    AGENT_DID_KEY = DIDKey.from_jwk(json.loads(AGENT_JWK))
    logger.info(f"Loaded agent DID from environment: {AGENT_DID}")
elif not AGENT_DID:
    # Generate new DID for demo
    AGENT_DID_KEY = DIDKey()
    AGENT_DID = AGENT_DID_KEY.did
    logger.warning(f"Generated new agent DID: {AGENT_DID}")
    logger.warning("Set AGENT_DID and AGENT_JWK in .env for persistence")

# Clients
ipfs_client = IPFSClient(use_pinata=True)
somnia_client = SomniaClient()

# NFT Authentication System (NEW - based on research paper architecture)
from .nft_auth import NFTAuthenticator
try:
    nft_authenticator = NFTAuthenticator()
    logger.info("✅ NFT Authentication system initialized")
except Exception as e:
    logger.warning(f"⚠️ NFT Authentication not available: {e}")
    nft_authenticator = None

logger.info("Initialized IPFS and Somnia clients")

# ============ Models ============

class ExecutionRequest(BaseModel):
    """Request to execute AI on a document"""
    nft_token_id: int = Field(..., description="NFT token ID for access control")
    user_address: str = Field(..., description="User's Ethereum address")
    document_cid: str = Field(..., description="IPFS CID of document to analyze")
    prompt: str = Field(..., description="Prompt for AI agent")
    model: str = Field(default="gemini-2.0-flash", description="AI model to use")
    provider: str = Field(default="gemini", description="AI provider (moonshot, gemini, deepseek, mistral, mai)")


class ExecutionResponse(BaseModel):
    """Response from AI execution"""
    record_id: Optional[int] = None
    output_cid: str
    execution_root: str
    trace_cid: str
    tx_hash: str
    output_text: str


class AgentInfo(BaseModel):
    """Agent information"""
    did: str
    name: str
    address: Optional[str]
    is_registered: bool


class ProvenanceRecord(BaseModel):
    """Provenance record from blockchain"""
    record_id: int
    nft_token_id: int
    input_cid: str
    input_root: str
    output_cid: str
    execution_root: str
    trace_cid: str
    timestamp: int
    executor: str


# ============ Dependencies ============

def get_verifiable_agent() -> VerifiableAgent:
    """Get verifiable agent instance"""
    if not AGENT_DID_KEY:
        raise HTTPException(status_code=500, detail="Agent DID not configured")
    return VerifiableAgent(AGENT_DID_KEY)


def get_ai_agent(provider: str = None, model: str = None) -> AIAgent:
    """Get AI agent instance with optional provider and model override"""
    return AIAgent(provider=provider, model=model)



# ============ Endpoints ============

@app.get("/")
async def root():
    """Health check"""
    return {
        "service": "Somnia AI Agents",
        "version": "1.0.0",
        "agent_did": AGENT_DID,
        "status": "operational"
    }


@app.get("/agent/info", response_model=AgentInfo)
async def get_agent_info():
    """Get agent information"""
    is_registered = await somnia_client.is_agent_active(AGENT_DID)
    
    return AgentInfo(
        did=AGENT_DID,
        name=os.getenv("AGENT_NAME", "Somnia AI Agent"),
        address=somnia_client.account.address if somnia_client.account else None,
        is_registered=is_registered
    )


@app.post("/agent/register")
async def register_agent(
    name: str,
    metadata: Optional[Dict[str, Any]] = None
):
    """Register agent on Somnia AgentRegistry"""
    
    # Upload metadata to IPFS
    metadata_to_upload = metadata or {
        "name": name,
        "model": os.getenv("OPENAI_MODEL", "gpt-4"),
        "capabilities": ["summarization", "qa", "analysis"],
        "did": AGENT_DID
    }
    
    metadata_cid = await ipfs_client.upload_json(
        metadata_to_upload,
        filename=f"agent-{AGENT_DID[:10]}.json"
    )
    
    # Register on-chain
    tx_hash = await somnia_client.register_agent(
        did=AGENT_DID,
        name=name,
        metadata_cid=metadata_cid
    )
    
    return {
        "did": AGENT_DID,
        "tx_hash": tx_hash,
        "metadata_cid": metadata_cid
    }


@app.get("/auth/check")
async def check_nft_authentication(user_address: str):
    """
    Check if user has NFT authentication token
    Part of research paper's architecture - NFT must be minted first
    """
    if not nft_authenticator:
        return {
            "authenticated": False,
            "error": "NFT authentication system not configured"
        }
    
    try:
        auth_result = nft_authenticator.require_nft_authentication(user_address)
        return auth_result
    except Exception as e:
        logger.error(f"Error checking authentication: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    return {
        "did": AGENT_DID,
        "tx_hash": tx_hash,
        "metadata_cid": metadata_cid
    }


@app.post("/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_address: str = Form(...)
):
    """
    Upload document to IPFS (requires NFT authentication FIRST)
    Architecture from research paper:
    1. Verify user has minted NFT
    2. Authenticate via NFT ownership
    3. Upload document to IPFS
    4. Record on blockchain in background (non-blocking)
    """
    
    try:
        # STEP 1: Verify NFT Authentication (CRITICAL)
        if not user_address:
            raise HTTPException(
                status_code=401,
                detail="user_address required for NFT authentication"
            )
        
        if nft_authenticator:
            auth_result = nft_authenticator.require_nft_authentication(user_address)
            
            if not auth_result["authenticated"]:
                logger.warning(f"❌ Upload blocked - User {user_address} not authenticated")
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "NFT_AUTH_REQUIRED",
                        "message": auth_result["message"],
                        "action": "Please mint an Access NFT first to upload documents"
                    }
                )
            
            token_id = auth_result["token_id"]
            logger.info(f"✅ NFT authenticated - User: {user_address}, Token ID: {token_id}")
        else:
            logger.warning("⚠️ NFT authentication not configured, allowing upload")
            token_id = None
        
        # STEP 2: Save file temporarily
        import tempfile
        import hashlib
        temp_dir = Path(tempfile.gettempdir())
        temp_path = temp_dir / file.filename
        
        logger.info(f"=== UPLOAD STARTED === File: {file.filename}, User: {user_address}")
        
        content = await file.read()
        logger.info(f"Read {len(content)} bytes from upload")
        
        # Calculate document hash for verification (SHA-256)
        document_hash = hashlib.sha256(content).hexdigest()
        logger.info(f"Document hash: {document_hash}")
        
        with open(temp_path, "wb") as f:
            f.write(content)
        
        logger.info(f"Saved to: {temp_path}")
        
        try:
            # STEP 3: Upload to IPFS
            cid = await ipfs_client.upload_file(
                temp_path,
                metadata={
                    "name": file.filename,
                    "uploader": user_address,
                    "nft_token_id": str(token_id) if token_id else "",
                    "document_hash": document_hash
                }
            )
            
            logger.info(f"=== UPLOAD SUCCESS === CID: {cid}")
            
            # STEP 4: Record on blockchain in background (non-blocking)
            if somnia_client and token_id:
                background_tasks.add_task(
                    record_document_async,
                    cid=cid,
                    document_hash=document_hash,
                    filename=file.filename,
                    file_size=len(content),
                    token_id=token_id,
                    blockchain_client=somnia_client
                )
                logger.info(f"[Background] Queued blockchain recording task for {file.filename}")
            
            # STEP 5: Return data immediately (blockchain recording happens in background)
            return {
                "success": True,
                "cid": cid,
                "filename": file.filename,
                "document_hash": document_hash,
                "token_id": token_id,
                "uploader": user_address,
                "file_size": len(content),
                "gateway_url": f"https://gateway.pinata.cloud/ipfs/{cid}",
                "message": "Document uploaded successfully. Blockchain recording in progress."
            }
        
        finally:
            if temp_path.exists():
                temp_path.unlink()
                logger.info(f"Cleaned up temp file: {temp_path}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"=== UPLOAD FAILED === Error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/documents/list")
async def list_user_documents(user_address: str):
    """
    List all documents uploaded by a user from blockchain registry
    Queries DocumentUploaded events from CompanyDropbox contract
    
    Returns document metadata sorted by most recent first
    """
    if not nft_authenticator:
        raise HTTPException(
            status_code=503,
            detail="NFT authentication system not configured"
        )
    
    try:
        # Verify user has NFT
        auth_result = nft_authenticator.require_nft_authentication(user_address)
        
        if not auth_result["authenticated"]:
            raise HTTPException(
                status_code=403,
                detail="NFT authentication required to view documents"
            )
        
        # Query blockchain for user's documents
        if not somnia_client:
            raise HTTPException(
                status_code=503,
                detail="Blockchain client not initialized"
            )
        
        logger.info(f"Fetching document history for user: {user_address}")
        documents = await somnia_client.get_user_documents(user_address)
        
        # Add gateway URLs for convenience
        for doc in documents:
            doc["gateway_url"] = f"https://gateway.pinata.cloud/ipfs/{doc['ipfs_hash']}"
        
        return {
            "user_address": user_address,
            "token_id": auth_result["token_id"],
            "documents": documents,
            "count": len(documents),
            "message": f"Found {len(documents)} documents"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing documents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/execute", response_model=ExecutionResponse)
async def execute_agent(
    request: ExecutionRequest,
    background_tasks: BackgroundTasks,
    verifiable_agent: VerifiableAgent = Depends(get_verifiable_agent)
):
    """
    Execute AI agent on NFT-gated document
    
    UPDATED: Decentralized Dropbox Model
    - NFT acts as access token (membership)
    - Users can upload/access multiple documents with one NFT
    - Each execution specifies which document CID to analyze
    
    Flow:
    1. Verify NFT ownership (access control)
    2. Fetch specified document from IPFS by CID
    3. Commit inputs (inputRoot)
    4. Execute AI with trace logging
    5. Compute executionRoot
    6. Upload trace + output to IPFS
    7. Record provenance on Somnia
    """
    
    try:
        # Create AI agent with specified provider and model
        ai_agent = AIAgent(provider=request.provider, model=request.model)
        logger.info(f"Using AI provider: {request.provider}, model: {request.model}")
        
        # 1. Verify NFT ownership (acts as access token)
        owns_nft = await somnia_client.check_nft_ownership(
            token_id=request.nft_token_id,
            user_address=request.user_address
        )
        
        if not owns_nft:
            # Audit log: Access denied
            audit_logger.log_access(
                user_id=request.user_address,
                resource=f"document:{request.document_cid}",
                action="ai_execution",
                granted=False,
                reason=f"NFT #{request.nft_token_id} not owned by user"
            )
            raise HTTPException(
                status_code=403,
                detail=f"Access denied: Address {request.user_address} does not own NFT #{request.nft_token_id}"
            )
        
        logger.info(f"✅ NFT Access Verified - User: {request.user_address}, Token: #{request.nft_token_id}, Document: {request.document_cid}")
        
        # Audit log: Access granted
        audit_logger.log_access(
            user_id=request.user_address,
            resource=f"document:{request.document_cid}",
            action="ai_execution",
            granted=True,
            reason=f"NFT #{request.nft_token_id} ownership verified"
        )
        
        # 2. Fetch specified document from IPFS
        document_content = await ipfs_client.fetch(request.document_cid)
        
        # Try to determine if it's a PDF
        is_pdf = document_content[:4] == b'%PDF'
        
        if is_pdf:
            # Extract text from PDF
            import io
            from PyPDF2 import PdfReader
            
            logger.info(f"📄 Detected PDF document: {request.document_cid}")
            pdf_file = io.BytesIO(document_content)
            pdf_reader = PdfReader(pdf_file)
            
            # Extract text from all pages
            document_text = ""
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                document_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
            
            logger.info(f"📄 Extracted text from PDF: {len(pdf_reader.pages)} pages, {len(document_text)} chars")
        else:
            # Regular text document
            document_text = document_content.decode('utf-8')
            logger.info(f"📄 Fetched text document from IPFS: {request.document_cid} ({len(document_text)} chars)")
        
        # 3. Commit inputs
        chunks = [document_text]  # In production, chunk properly
        input_root = verifiable_agent.commit_inputs(
            document_cid=request.document_cid,
            chunks=chunks,
            metadata={"prompt": request.prompt}
        )
        
        # 5. Execute AI with logging
        verifiable_agent.log_step("prompt", {"text": request.prompt})
        
        # Call AI model
        output_text = await ai_agent.execute(
            prompt=request.prompt,
            context=document_text,
            verifiable_agent=verifiable_agent  # Pass for step logging
        )
        
        verifiable_agent.log_step("llm_response", {
            "text": output_text,
            "model": request.model
        })
        
        # 6. Compute execution root
        execution_root = verifiable_agent.compute_execution_root()
        logger.info(f"🔍 Input root: {input_root}")
        logger.info(f"🔍 Execution root: {execution_root}")
        logger.info(f"🔍 Execution steps count: {len(verifiable_agent.execution_steps)}")
        
        # 7. Upload trace to IPFS
        trace = verifiable_agent.get_execution_trace()
        trace_cid = await ipfs_client.upload_json(trace, f"trace-{execution_root[:10]}.json")
        
        # 8. Upload output to IPFS
        output_data = {
            "prompt": request.prompt,
            "output": output_text,
            "model": request.model,
            "input_cid": request.document_cid
        }
        output_cid = await ipfs_client.upload_json(output_data, f"output-{execution_root[:10]}.json")
        
        # 9. Record provenance on Somnia
        result = await somnia_client.record_provenance(
            nft_token_id=request.nft_token_id,
            input_cid=request.document_cid,
            input_root=input_root,
            output_cid=output_cid,
            execution_root=execution_root,
            trace_cid=trace_cid,
            agent_did=AGENT_DID
        )
        
        # Audit log: AI execution completed
        audit_logger.log_ai_execution(
            did=AGENT_DID,
            prompt_hash=input_root[:20],
            response_hash=execution_root[:20],
            model=request.model,
            tokens=len(output_text),  # Approximate token count
            user_address=request.user_address,
            document_cid=request.document_cid,
            output_cid=output_cid,
            trace_cid=trace_cid,
            tx_hash=result["tx_hash"]
        )
        
        # Audit log: Blockchain transaction
        audit_logger.log_blockchain_tx(
            operation="record_provenance",
            tx_hash=result["tx_hash"],
            did=AGENT_DID,
            gas_used=result.get("gas_used"),
            status="success",
            nft_token_id=request.nft_token_id,
            record_id=result["record_id"]
        )
        
        logger.info(f"✅ AI Execution Complete - Output CID: {output_cid}, TX: {result['tx_hash']}")
        
        # Reset agent state
        verifiable_agent.reset()
        
        return ExecutionResponse(
            record_id=result["record_id"],
            output_cid=output_cid,
            execution_root=execution_root,
            trace_cid=trace_cid,
            tx_hash=result["tx_hash"],
            output_text=output_text
        )
    
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        # Handle all other exceptions (including RateLimitError)
        from openai import RateLimitError, APIError
        
        if isinstance(e, RateLimitError):
            logger.error(f"AI Provider rate limit exceeded: {e}")
            raise HTTPException(
                status_code=429,
                detail=f"AI provider is temporarily rate-limited. Please try again in a few moments or switch to a different AI provider (gemini, mistral, or moonshot)."
            )
        elif isinstance(e, APIError):
            logger.error(f"AI Provider API error: {e}")
            raise HTTPException(
                status_code=502,
                detail=f"AI provider error: {str(e)}"
            )
        else:
            logger.error(f"Unexpected error in /execute endpoint: {e}", exc_info=True)
            raise HTTPException(
                status_code=500,
                detail=f"An internal server error occurred: {str(e)}"
            )


@app.get("/provenance/nft/{token_id}", response_model=List[ProvenanceRecord])
async def get_provenance_by_nft(token_id: int):
    """Get all provenance records for an NFT"""
    
    record_ids = await somnia_client.get_records_by_nft(token_id)
    
    records = []
    for record_id in record_ids:
        record = await somnia_client.get_record(record_id)
        records.append(ProvenanceRecord(
            record_id=record_id,
            nft_token_id=record["nftTokenId"],
            input_cid=record["inputCID"],
            input_root=record["inputRoot"],
            output_cid=record["outputCID"],
            execution_root=record["executionRoot"],
            trace_cid=record["traceCID"],
            timestamp=record["timestamp"],
            executor=record["executor"]
        ))
    
    return records


@app.get("/provenance/trace/{cid}")
async def get_execution_trace(cid: str):
    """Fetch execution trace from IPFS"""
    try:
        trace = await ipfs_client.fetch_json(cid)
        return trace
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Trace not found: {str(e)}")


@app.get("/provenance/verify/{record_id}")
async def verify_provenance(record_id: int):
    """
    Verify a provenance record
    
    Steps:
    1. Fetch record from blockchain
    2. Fetch trace from IPFS
    3. Recompute Merkle root
    4. Compare with on-chain executionRoot
    """
    
    # Get record from blockchain
    record = await somnia_client.get_record(record_id)
    
    # Fetch trace from IPFS
    trace = await ipfs_client.fetch_json(record["traceCID"])
    
    # Recompute execution root
    from .verifiable import MerkleTree
    step_hashes = trace.get("step_hashes", [])
    
    if step_hashes:
        tree = MerkleTree(step_hashes)
        recomputed_root = tree.root
    else:
        recomputed_root = None
    
    # Compare
    matches = recomputed_root == record["executionRoot"]
    
    return {
        "record_id": record_id,
        "on_chain_root": record["executionRoot"],
        "recomputed_root": recomputed_root,
        "verified": matches,
        "trace_cid": record["traceCID"],
        "step_count": len(trace.get("steps", []))
    }


# ============ Crossmint Endpoints (Wallet-as-a-Service) ============

class CrossmintWalletRequest(BaseModel):
    """Request to create/get Crossmint wallet"""
    email: str = Field(..., description="User email address")

class CrossmintWalletResponse(BaseModel):
    """Crossmint wallet response"""
    walletAddress: str
    email: str
    isNew: bool
    message: str

@app.post("/crossmint/wallet", response_model=CrossmintWalletResponse)
async def get_or_create_crossmint_wallet(request: CrossmintWalletRequest):
    """
    Create or retrieve a custodial wallet via Crossmint
    
    Users can sign in with email/social - no MetaMask needed
    The backend will mint NFTs to this address
    
    Flow:
    1. User provides email
    2. Crossmint creates/retrieves EVM wallet
    3. Backend mints NFT to that address
    4. User can access via Crossmint UI
    """
    try:
        crossmint = CrossmintClient()
        result = await crossmint.get_or_create_wallet(request.email)
        
        return CrossmintWalletResponse(
            walletAddress=result["walletAddress"],
            email=result["email"],
            isNew=result["isNew"],
            message="Wallet created" if result["isNew"] else "Existing wallet retrieved"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crossmint error: {str(e)}")


class MintForUserRequest(BaseModel):
    """Request to mint NFT for Crossmint user"""
    email: str = Field(..., description="User email (Crossmint wallet)")
    document_cid: str = Field(..., description="IPFS CID of document")

class MintForUserResponse(BaseModel):
    """NFT minting response"""
    success: bool
    token_id: int
    wallet_address: str
    tx_hash: str
    message: str

@app.post("/crossmint/mint", response_model=MintForUserResponse)
async def mint_nft_for_crossmint_user(request: MintForUserRequest):
    """
    Mint Access NFT for a Crossmint user
    
    Backend mints NFT from deployer wallet and sends to user's Crossmint address
    This allows users without MetaMask to receive NFTs via email login
    
    Note: Crossmint doesn't natively support Somnia yet, so we mint directly
    """
    try:
        # Get user's Crossmint wallet
        crossmint = CrossmintClient()
        wallet_info = await crossmint.get_or_create_wallet(request.email)
        user_address = wallet_info["walletAddress"]
        
        # Mint NFT to that address (backend pays gas)
        tx_hash, token_id = await somnia_client.mint_access_nft(
            to_address=user_address,
            document_cid=request.document_cid
        )
        
        return MintForUserResponse(
            success=True,
            token_id=token_id,
            wallet_address=user_address,
            tx_hash=tx_hash,
            message=f"NFT #{token_id} minted to Crossmint wallet"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Minting error: {str(e)}")


# ============ Frontend Logging ============

class FrontendLog(BaseModel):
    """Frontend log entry"""
    timestamp: str
    level: str
    category: str
    action: str
    details: Optional[Dict[str, Any]] = None
    userAddress: Optional[str] = None
    txHash: Optional[str] = None
    error: Optional[Any] = None


@app.post("/logs/frontend")
async def receive_frontend_logs(log: FrontendLog):
    """
    Receive logs from frontend for centralized monitoring
    Only accepts ERROR and AUDIT level logs
    """
    try:
        # Log to backend
        log_level = log.level.upper()
        log_message = f"[FRONTEND-{log.level}] {log.category}: {log.action}"
        
        extra_data = {
            'category': log.category,
            'action': log.action,
            'userAddress': log.userAddress,
            'txHash': log.txHash
        }
        
        if log.details:
            extra_data.update(log.details)
        
        if log_level == "ERROR":
            logger.error(log_message, extra=extra_data)
        elif log_level == "AUDIT":
            audit_logger.info(log_message, extra=extra_data)
        else:
            logger.info(log_message, extra=extra_data)
        
        return {"status": "logged", "timestamp": log.timestamp}
    
    except Exception as e:
        logger.error(f"Error processing frontend log: {e}")
        # Don't raise exception - logging failures shouldn't break frontend
        return {"status": "error", "message": str(e)}


# ============ Startup ============

async def startup_event():
    """Initialize on startup"""
    print(f"🤖 Somnia AI Agent starting...")
    print(f"   DID: {AGENT_DID}")
    print(f"   Address: {somnia_client.account.address if somnia_client.account else 'Not configured'}")
    
    # Check if agent is registered
    try:
        is_registered = await somnia_client.is_agent_active(AGENT_DID)
        print(f"   Registered: {is_registered}")
        
        if not is_registered:
            if somnia_client.agent_registry:
                print(f"   ⚠️  Agent not registered. Auto-registering...")
                
                # Upload default metadata to IPFS
                metadata = {
                    "name": "Strategi AI Agent",
                    "description": "Verifiable AI agent for document processing",
                    "model": os.getenv("AI_MODEL", "mistral-7b-instruct"),
                    "provider": os.getenv("AI_PROVIDER", "mistral"),
                    "capabilities": ["document_analysis", "summarization", "qa", "pdf_processing"],
                    "did": AGENT_DID,
                    "version": "1.0.0"
                }
                
                metadata_cid = await ipfs_client.upload_json(
                    metadata,
                    filename=f"agent-{AGENT_DID[:10]}.json"
                )
                
                # Register on-chain
                tx_hash = await somnia_client.register_agent(
                    did=AGENT_DID,
                    name="Strategi AI Agent",
                    metadata_cid=metadata_cid
                )
                
                print(f"   ✅ Agent registered successfully!")
                print(f"   Transaction: {tx_hash}")
                print(f"   Metadata CID: {metadata_cid}")
            else:
                print(f"   ⚠️  AgentRegistry contract not available, skipping registration")
    except Exception as e:
        print(f"   ⚠️  Agent registration check failed: {e}")
        print(f"   Agent will still function, but blockchain features may be limited")
        logger.error(f"Startup registration error: {e}", exc_info=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

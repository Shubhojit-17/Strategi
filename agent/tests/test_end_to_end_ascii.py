# End-to-End Test - Complete workflow with LIVE services
# NO MOCKS - All services must be running and accessible

import pytest
import asyncio
import time
import tempfile
import os
from httpx import AsyncClient

API_BASE_URL = "http://localhost:8000"
TIMEOUT = 120.0  # E2E tests may take longer

@pytest.mark.asyncio
async def test_complete_workflow_live():
    """
    Complete E2E test with LIVE services:
    1. Check agent registration on Somnia 
    2. Upload document to Pinata IPFS 
    3. Create Crossmint wallet 
    4. Mint NFT on Somnia (backend mints to Crossmint address) 
    5. Execute AI with Moonshot 
    6. Record provenance on Somnia 
    7. Verify execution (Merkle tree verification) 
    8. Retrieve trace from IPFS 
    
    This is the REAL end-to-end workflow with no simulations.
    """
    
    print("\n" + "="*80)
    print(" STARTING END-TO-END LIVE SYSTEM TEST")
    print("="*80)
    
    async with AsyncClient(base_url=API_BASE_URL, timeout=TIMEOUT) as client:
        
        # ========== STEP 1: Check Agent Registration ==========
        print("\n STEP 1: Verifying agent registration on Somnia...")
        
        info_response = await client.get("/agent/info")
        assert info_response.status_code == 200
        
        agent_info = info_response.json()
        print(f"   Agent DID: {agent_info['did']}")
        print(f"   Agent Address: {agent_info['address']}")
        print(f"   Registered: {agent_info['is_registered']}")
        
        assert agent_info['is_registered'] == True, " Agent not registered! Run registration first."
        print(" STEP 1 PASSED: Agent is registered on Somnia")
        
        # ========== STEP 2: Upload Document to IPFS ==========
        print("\n STEP 2: Uploading document to Pinata IPFS...")
        
        # Create test document
        test_content = """
        BLOCKCHAIN AND AI INTEGRATION
        
        This is a test document for the Somnia AI Agents platform.
        
        Key Points:
        1. NFT-gated access to documents
        2. AI agents process documents with verifiable execution
        3. Provenance is recorded on Somnia blockchain
        4. Anyone can verify the AI's work via Merkle proofs
        
        This demonstrates the integration of:
        - IPFS for decentralized storage
        - Somnia L1 for blockchain anchoring
        - Moonshot AI for language processing
        - Crossmint for wallet-as-a-service
        
        End of test document.
        """
        
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
            f.write(test_content)
            temp_path = f.name
        
        try:
            with open(temp_path, 'rb') as f:
                upload_response = await client.post(
                    "/documents/upload",
                    files={"file": ("e2e-test-doc.txt", f, "text/plain")}
                )
            
            assert upload_response.status_code == 200
            document_cid = upload_response.json()["cid"]
            gateway_url = upload_response.json()["gateway_url"]
            
            print(f"   Document CID: {document_cid}")
            print(f"   Gateway URL: {gateway_url}")
            
            # Verify IPFS upload
            import httpx
            verify_response = httpx.get(gateway_url, timeout=30.0)
            assert verify_response.status_code == 200
            assert "BLOCKCHAIN AND AI INTEGRATION" in verify_response.text
            
            print(" STEP 2 PASSED: Document uploaded to IPFS and verified")
            
        finally:
            os.unlink(temp_path)
        
        # ========== STEP 3: Create Crossmint Wallet ==========
        print("\n STEP 3: Creating Crossmint wallet...")
        
        email = f"e2e-test-{int(time.time())}@example.com"
        
        wallet_response = await client.post("/crossmint/wallet", json={
            "email": email
        })
        
        assert wallet_response.status_code == 200
        wallet_data = wallet_response.json()
        user_address = wallet_data["walletAddress"]
        
        print(f"   Email: {email}")
        print(f"   Wallet Address: {user_address}")
        print(f"   Is New: {wallet_data['isNew']}")
        
        assert user_address.startswith("0x")
        assert len(user_address) == 42
        
        print(" STEP 3 PASSED: Crossmint wallet created")
        
        # ========== STEP 4: Mint NFT on Somnia ==========
        print("\n  STEP 4: Minting NFT on Somnia (backend mints to Crossmint address)...")
        
        mint_response = await client.post("/crossmint/mint", json={
            "email": email,
            "document_cid": document_cid
        })
        
        assert mint_response.status_code == 200
        mint_data = mint_response.json()
        
        token_id = mint_data["token_id"]
        mint_tx_hash = mint_data["tx_hash"]
        
        print(f"   Token ID: {token_id}")
        print(f"   Wallet Address: {mint_data['wallet_address']}")
        print(f"   Tx Hash: {mint_tx_hash}")
        print(f"   Explorer: https://explorer.somnia.network/tx/{mint_tx_hash}")
        
        assert mint_data["success"] == True
        assert mint_data["wallet_address"] == user_address
        assert mint_tx_hash.startswith("0x")
        
        print("    Waiting 5s for transaction confirmation...")
        await asyncio.sleep(5)
        
        print(" STEP 4 PASSED: NFT minted on Somnia")
        
        # ========== STEP 5: Execute AI Agent ==========
        print("\n STEP 5: Executing AI agent with Moonshot...")
        
        execute_response = await client.post("/execute", json={
            "nft_token_id": token_id,
            "user_address": user_address,
            "prompt": "Summarize this document in exactly 3 bullet points, each starting with a dash.",
            "model": "moonshotai/kimi-k2-0905"
        })
        
        assert execute_response.status_code == 200
        execution_data = execute_response.json()
        
        record_id = execution_data["record_id"]
        output_cid = execution_data["output_cid"]
        execution_root = execution_data["execution_root"]
        trace_cid = execution_data["trace_cid"]
        provenance_tx_hash = execution_data["tx_hash"]
        output_text = execution_data["output_text"]
        
        print(f"   Record ID: {record_id}")
        print(f"   Output CID: {output_cid}")
        print(f"   Execution Root: {execution_root}")
        print(f"   Trace CID: {trace_cid}")
        print(f"   Provenance Tx: {provenance_tx_hash}")
        print(f"\n   AI Output:\n   {'-'*60}")
        for line in output_text.split('\n'):
            print(f"   {line}")
        print(f"   {'-'*60}")
        
        # Verify response structure
        assert isinstance(record_id, int)
        assert output_cid.startswith("Qm") or output_cid.startswith("bafy")
        assert execution_root.startswith("0x")
        assert trace_cid.startswith("Qm") or trace_cid.startswith("bafy")
        assert provenance_tx_hash.startswith("0x")
        assert len(output_text) > 0
        
        print(" STEP 5 PASSED: AI execution completed")
        
        # ========== STEP 6: Verify Provenance on Somnia ==========
        print("\n STEP 6: Verifying provenance on blockchain...")
        
        print("    Waiting 5s for provenance tx confirmation...")
        await asyncio.sleep(5)
        
        verify_response = await client.get(f"/provenance/verify/{record_id}")
        
        assert verify_response.status_code == 200
        verification = verify_response.json()
        
        print(f"   Verification Status: {' VALID' if verification['is_valid'] else ' INVALID'}")
        print(f"   On-chain Root: {verification['on_chain_root']}")
        print(f"   Computed Root: {verification['computed_root']}")
        print(f"   Roots Match: {verification['computed_root'] == verification['on_chain_root']}")
        
        assert verification["is_valid"] == True, " Provenance verification failed!"
        assert verification["computed_root"] == verification["on_chain_root"]
        
        print(" STEP 6 PASSED: Provenance verified on Somnia")
        
        # ========== STEP 7: Retrieve Execution Trace from IPFS ==========
        print("\n STEP 7: Retrieving execution trace from IPFS...")
        
        trace_response = await client.get(f"/provenance/trace/{trace_cid}")
        
        assert trace_response.status_code == 200
        trace = trace_response.json()
        
        print(f"   Trace Steps: {len(trace.get('steps', []))}")
        print(f"   Execution Root: {trace.get('execution_root', 'N/A')}")
        print(f"   Agent DID: {trace.get('agent_did', 'N/A')}")
        
        # Verify trace structure
        assert "steps" in trace
        assert "execution_root" in trace
        assert len(trace["steps"]) > 0
        
        print("\n   First 3 steps:")
        for i, step in enumerate(trace["steps"][:3]):
            print(f"      {i+1}. {step.get('action', 'N/A')}")
        
        print(" STEP 7 PASSED: Execution trace retrieved from IPFS")
        
        # ========== STEP 8: Retrieve NFT Provenance Records ==========
        print("\n STEP 8: Retrieving all provenance records for NFT...")
        
        nft_records_response = await client.get(f"/provenance/nft/{token_id}")
        
        assert nft_records_response.status_code == 200
        records = nft_records_response.json()
        
        print(f"   Total Records for NFT #{token_id}: {len(records)}")
        
        # Find our record
        our_record = next((r for r in records if r["record_id"] == record_id), None)
        assert our_record is not None
        
        print(f"\n   Our Record #{record_id}:")
        print(f"      Input CID: {our_record['input_cid']}")
        print(f"      Output CID: {our_record['output_cid']}")
        print(f"      Trace CID: {our_record['trace_cid']}")
        print(f"      Executor: {our_record['executor']}")
        
        print(" STEP 8 PASSED: NFT provenance records retrieved")
        
        # ========== FINAL SUMMARY ==========
        print("\n" + "="*80)
        print(" END-TO-END TEST COMPLETED SUCCESSFULLY!")
        print("="*80)
        print(f"\n Test Summary:")
        print(f"   Document CID: {document_cid}")
        print(f"   NFT Token ID: {token_id}")
        print(f"   Crossmint Wallet: {user_address}")
        print(f"   Mint Tx: {mint_tx_hash}")
        print(f"   Provenance Record ID: {record_id}")
        print(f"   Provenance Tx: {provenance_tx_hash}")
        print(f"   Trace CID: {trace_cid}")
        print(f"   Output CID: {output_cid}")
        print(f"\n Explorer Links:")
        print(f"   Mint: https://explorer.somnia.network/tx/{mint_tx_hash}")
        print(f"   Provenance: https://explorer.somnia.network/tx/{provenance_tx_hash}")
        print(f"\n IPFS Links:")
        print(f"   Document: {gateway_url}")
        print(f"   Trace: https://gateway.pinata.cloud/ipfs/{trace_cid}")
        print(f"   Output: https://gateway.pinata.cloud/ipfs/{output_cid}")
        print("\n" + "="*80)
        print(" ALL SYSTEMS VERIFIED - PRODUCTION READY")
        print("="*80 + "\n")

if __name__ == "__main__":
    import subprocess
    subprocess.run(["pytest", __file__, "-v", "-s"])

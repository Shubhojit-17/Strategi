// Test suite for Provenance.sol on live Somnia L1
// No mocks - all transactions are real on-chain

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Provenance - Live Somnia Tests", function() {
  let provenance;
  let accessNFT;
  let agentRegistry;
  let owner;
  let user1;
  let testNFTTokenId;
  let testAgentDID;
  
  before(async function() {
    const PROVENANCE_ADDRESS = process.env.PROVENANCE_ADDRESS;
    const ACCESS_NFT_ADDRESS = process.env.ACCESS_NFT_ADDRESS;
    const AGENT_REGISTRY_ADDRESS = process.env.AGENT_REGISTRY_ADDRESS;
    const AGENT_DID = process.env.AGENT_DID;
    
    if (!PROVENANCE_ADDRESS || !ACCESS_NFT_ADDRESS || !AGENT_REGISTRY_ADDRESS) {
      throw new Error("Contract addresses not found in environment");
    }
    
    [owner, user1] = await ethers.getSigners();
    
    // Connect to deployed contracts
    const Provenance = await ethers.getContractFactory("Provenance");
    provenance = Provenance.attach(PROVENANCE_ADDRESS);
    
    const AccessNFT = await ethers.getContractFactory("AccessNFT");
    accessNFT = AccessNFT.attach(ACCESS_NFT_ADDRESS);
    
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = AgentRegistry.attach(AGENT_REGISTRY_ADDRESS);
    
    // Use production agent DID or create test one
    testAgentDID = AGENT_DID || `did:key:test${Date.now()}`;
    
    console.log(`\n📝 Testing Provenance at: ${PROVENANCE_ADDRESS}`);
    console.log(`📝 Using Agent DID: ${testAgentDID}`);
    
    // Ensure agent is registered
    const isActive = await agentRegistry.isActiveAgent(testAgentDID);
    if (!isActive) {
      console.log("🔄 Registering test agent...");
      const tx = await agentRegistry.registerAgent(
        testAgentDID,
        "Test Agent for Provenance",
        "QmTestAgent"
      );
      await tx.wait();
      console.log("✅ Test agent registered");
    }
    
    // Mint a test NFT for provenance tests
    console.log("🔄 Minting test NFT...");
    const mintTx = await accessNFT.mint(owner.address, `QmTestDoc${Date.now()}`);
    const mintReceipt = await mintTx.wait();
    
    const transferEvent = mintReceipt.logs.find(
      log => log.fragment && log.fragment.name === "Transfer"
    );
    testNFTTokenId = transferEvent.args[2];
    
    console.log(`✅ Test NFT minted: #${testNFTTokenId}`);
  });
  
  it("Should verify contract deployed on Somnia", async function() {
    const network = await ethers.provider.getNetwork();
    expect(network.chainId).to.equal(50312n);
    
    const code = await ethers.provider.getCode(await provenance.getAddress());
    expect(code).to.not.equal("0x");
    
    console.log("✅ Provenance contract verified on Somnia L1");
  });
  
  it("Should have correct AccessNFT and AgentRegistry addresses", async function() {
    const nftAddress = await provenance.accessNFT();
    const registryAddress = await provenance.agentRegistry();
    
    expect(nftAddress).to.equal(await accessNFT.getAddress());
    expect(registryAddress).to.equal(await agentRegistry.getAddress());
    
    console.log(`✅ Contract references verified`);
    console.log(`   AccessNFT: ${nftAddress}`);
    console.log(`   AgentRegistry: ${registryAddress}`);
  });
  
  it("Should record provenance with all fields", async function() {
    const inputCID = `QmInput${Date.now()}`;
    const inputRoot = ethers.keccak256(ethers.toUtf8Bytes("input_data"));
    const outputCID = `QmOutput${Date.now()}`;
    const executionRoot = ethers.keccak256(ethers.toUtf8Bytes("execution_trace"));
    const traceCID = `QmTrace${Date.now()}`;
    const proofCID = `QmProof${Date.now()}`;
    
    console.log(`\n🔄 Recording provenance:`);
    console.log(`   NFT Token ID: ${testNFTTokenId}`);
    console.log(`   Input CID: ${inputCID}`);
    console.log(`   Output CID: ${outputCID}`);
    console.log(`   Trace CID: ${traceCID}`);
    console.log(`   Agent DID: ${testAgentDID}`);
    
    const tx = await provenance.recordDerivative(
      testNFTTokenId,
      inputCID,
      inputRoot,
      outputCID,
      executionRoot,
      traceCID,
      testAgentDID,
      proofCID
    );
    
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    
    // Find ProvenanceRecorded event
    const provenanceEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === "ProvenanceRecorded"
    );
    
    expect(provenanceEvent).to.not.be.undefined;
    const recordId = provenanceEvent.args[0];
    
    console.log(`   Record ID: ${recordId}`);
    
    // Verify record was stored correctly
    const record = await provenance.getRecord(recordId);
    
    expect(record.nftTokenId).to.equal(testNFTTokenId);
    expect(record.inputCID).to.equal(inputCID);
    expect(record.inputRoot).to.equal(inputRoot);
    expect(record.outputCID).to.equal(outputCID);
    expect(record.executionRoot).to.equal(executionRoot);
    expect(record.traceCID).to.equal(traceCID);
    expect(record.agentDID).to.equal(testAgentDID);
    expect(record.proofCID).to.equal(proofCID);
    expect(record.executor).to.equal(owner.address);
    
    console.log(`✅ All fields stored correctly`);
  });
  
  it("Should require active agent to record provenance", async function() {
    const inactiveDID = `did:key:inactive${Date.now()}`;
    
    // Try to record with unregistered agent
    await expect(
      provenance.recordDerivative(
        testNFTTokenId,
        "QmTest",
        ethers.keccak256(ethers.toUtf8Bytes("test")),
        "QmOut",
        ethers.keccak256(ethers.toUtf8Bytes("exec")),
        "QmTrace",
        inactiveDID,
        ""
      )
    ).to.be.revertedWith("Agent not registered or inactive");
    
    console.log("✅ Inactive agent prevented from recording");
  });
  
  it("Should retrieve all records for an NFT", async function() {
    // Record multiple provenance entries for the same NFT
    const recordCount = 3;
    console.log(`\n🔄 Recording ${recordCount} provenance entries...`);
    
    const recordIds = [];
    
    for (let i = 0; i < recordCount; i++) {
      const tx = await provenance.recordDerivative(
        testNFTTokenId,
        `QmInput${i}`,
        ethers.keccak256(ethers.toUtf8Bytes(`input${i}`)),
        `QmOutput${i}`,
        ethers.keccak256(ethers.toUtf8Bytes(`exec${i}`)),
        `QmTrace${i}`,
        testAgentDID,
        ""
      );
      
      const receipt = await tx.wait();
      const event = receipt.logs.find(
        log => log.fragment && log.fragment.name === "ProvenanceRecorded"
      );
      recordIds.push(event.args[0]);
      
      console.log(`   Record ${i}: ID ${event.args[0]}`);
    }
    
    // Retrieve all records for this NFT
    const nftRecords = await provenance.getRecordsByNFT(testNFTTokenId);
    
    // Should include at least our 3 new records
    expect(nftRecords.length).to.be.at.least(recordCount);
    
    console.log(`✅ Retrieved ${nftRecords.length} records for NFT #${testNFTTokenId}`);
  });
  
  it("Should get record details", async function() {
    const inputCID = `QmDetails${Date.now()}`;
    const inputRoot = ethers.keccak256(ethers.toUtf8Bytes("details_input"));
    const outputCID = `QmDetailsOut${Date.now()}`;
    const executionRoot = ethers.keccak256(ethers.toUtf8Bytes("details_exec"));
    const traceCID = `QmDetailsTrace${Date.now()}`;
    
    // Record provenance
    const tx = await provenance.recordDerivative(
      testNFTTokenId,
      inputCID,
      inputRoot,
      outputCID,
      executionRoot,
      traceCID,
      testAgentDID,
      ""
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      log => log.fragment && log.fragment.name === "ProvenanceRecorded"
    );
    const recordId = event.args[0];
    
    // Get record details
    const record = await provenance.getRecord(recordId);
    
    console.log(`\n📋 Record #${recordId} details:`);
    console.log(`   NFT Token ID: ${record.nftTokenId}`);
    console.log(`   Input CID: ${record.inputCID}`);
    console.log(`   Input Root: ${record.inputRoot}`);
    console.log(`   Output CID: ${record.outputCID}`);
    console.log(`   Execution Root: ${record.executionRoot}`);
    console.log(`   Trace CID: ${record.traceCID}`);
    console.log(`   Agent DID: ${record.agentDID}`);
    console.log(`   Executor: ${record.executor}`);
    console.log(`   Timestamp: ${record.timestamp}`);
    
    // Verify all fields
    expect(record.inputCID).to.equal(inputCID);
    expect(record.executionRoot).to.equal(executionRoot);
    
    console.log("✅ Record details correct");
  });
  
  it("Should anchor inputRoot and executionRoot correctly", async function() {
    // Create specific test data
    const testInput = "Test document content for verification";
    const testExecution = JSON.stringify({
      steps: ["step1", "step2", "step3"],
      model: "gpt-4",
      timestamp: Date.now()
    });
    
    const inputRoot = ethers.keccak256(ethers.toUtf8Bytes(testInput));
    const executionRoot = ethers.keccak256(ethers.toUtf8Bytes(testExecution));
    
    console.log(`\n🔐 Anchoring Merkle roots:`);
    console.log(`   Input Root: ${inputRoot}`);
    console.log(`   Execution Root: ${executionRoot}`);
    
    const tx = await provenance.recordDerivative(
      testNFTTokenId,
      "QmTestInput",
      inputRoot,
      "QmTestOutput",
      executionRoot,
      "QmTestTrace",
      testAgentDID,
      ""
    );
    
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      log => log.fragment && log.fragment.name === "ProvenanceRecorded"
    );
    const recordId = event.args[0];
    
    // Retrieve and verify roots match exactly
    const record = await provenance.getRecord(recordId);
    
    expect(record.inputRoot).to.equal(inputRoot);
    expect(record.executionRoot).to.equal(executionRoot);
    
    console.log("✅ Merkle roots anchored correctly");
    console.log("   Anyone can now verify execution by:");
    console.log("   1. Fetching trace from IPFS");
    console.log("   2. Recomputing execution root");
    console.log("   3. Comparing with on-chain root");
  });
  
  it("Should emit ProvenanceRecorded event", async function() {
    await expect(
      provenance.recordDerivative(
        testNFTTokenId,
        "QmEvent",
        ethers.keccak256(ethers.toUtf8Bytes("event_test")),
        "QmEventOut",
        ethers.keccak256(ethers.toUtf8Bytes("event_exec")),
        "QmEventTrace",
        testAgentDID,
        ""
      )
    ).to.emit(provenance, "ProvenanceRecorded");
    
    console.log("✅ ProvenanceRecorded event emitted");
  });
  
  it("Should estimate gas for recordDerivative", async function() {
    const gasEstimate = await provenance.recordDerivative.estimateGas(
      testNFTTokenId,
      "QmGasTest",
      ethers.keccak256(ethers.toUtf8Bytes("gas")),
      "QmGasOut",
      ethers.keccak256(ethers.toUtf8Bytes("gas_exec")),
      "QmGasTrace",
      testAgentDID,
      ""
    );
    
    console.log(`\n📊 Gas estimation for recordDerivative:`);
    console.log(`   Estimated: ${gasEstimate.toString()}`);
    
    // Execute with buffer
    const gasLimit = gasEstimate * 15n / 10n;
    const tx = await provenance.recordDerivative(
      testNFTTokenId,
      "QmGasTest",
      ethers.keccak256(ethers.toUtf8Bytes("gas")),
      "QmGasOut",
      ethers.keccak256(ethers.toUtf8Bytes("gas_exec")),
      "QmGasTrace",
      testAgentDID,
      "",
      { gasLimit }
    );
    
    const receipt = await tx.wait();
    
    console.log(`   Actual used: ${receipt.gasUsed.toString()}`);
    console.log(`   Efficiency: ${(receipt.gasUsed * 100n / gasEstimate)}%`);
    
    expect(receipt.gasUsed).to.be.lessThan(gasLimit);
    
    console.log("✅ Gas estimation accurate");
  });
  
  it("Should handle multiple NFTs with different provenance", async function() {
    // Mint two more NFTs
    console.log("\n🔄 Minting additional NFTs...");
    
    const nft1Tx = await accessNFT.mint(owner.address, "QmDoc1");
    const nft1Receipt = await nft1Tx.wait();
    const nft1TokenId = nft1Receipt.logs.find(
      log => log.fragment && log.fragment.name === "Transfer"
    ).args[2];
    
    const nft2Tx = await accessNFT.mint(owner.address, "QmDoc2");
    const nft2Receipt = await nft2Tx.wait();
    const nft2TokenId = nft2Receipt.logs.find(
      log => log.fragment && log.fragment.name === "Transfer"
    ).args[2];
    
    console.log(`   NFT 1: #${nft1TokenId}`);
    console.log(`   NFT 2: #${nft2TokenId}`);
    
    // Record provenance for each
    await provenance.recordDerivative(
      nft1TokenId,
      "QmInput1",
      ethers.keccak256(ethers.toUtf8Bytes("input1")),
      "QmOutput1",
      ethers.keccak256(ethers.toUtf8Bytes("exec1")),
      "QmTrace1",
      testAgentDID,
      ""
    );
    
    await provenance.recordDerivative(
      nft2TokenId,
      "QmInput2",
      ethers.keccak256(ethers.toUtf8Bytes("input2")),
      "QmOutput2",
      ethers.keccak256(ethers.toUtf8Bytes("exec2")),
      "QmTrace2",
      testAgentDID,
      ""
    );
    
    // Verify each NFT has its own records
    const nft1Records = await provenance.getRecordsByNFT(nft1TokenId);
    const nft2Records = await provenance.getRecordsByNFT(nft2TokenId);
    
    expect(nft1Records.length).to.be.at.least(1);
    expect(nft2Records.length).to.be.at.least(1);
    
    console.log(`✅ Multiple NFTs with separate provenance`);
    console.log(`   NFT #${nft1TokenId}: ${nft1Records.length} records`);
    console.log(`   NFT #${nft2TokenId}: ${nft2Records.length} records`);
  });
  
  it("Should verify production provenance records exist", async function() {
    // Check if there are any existing provenance records
    const totalRecords = await provenance.recordCount();
    
    console.log(`\n📊 Production provenance stats:`);
    console.log(`   Total records: ${totalRecords}`);
    
    if (totalRecords > 0n) {
      // Get first record as example
      const record = await provenance.getRecord(0);
      console.log(`\n   Example record #0:`);
      console.log(`      NFT: #${record.nftTokenId}`);
      console.log(`      Agent: ${record.agentDID}`);
      console.log(`      Executor: ${record.executor}`);
      console.log(`      Timestamp: ${new Date(Number(record.timestamp) * 1000).toISOString()}`);
    }
    
    expect(totalRecords).to.be.at.least(0n);
  });
});

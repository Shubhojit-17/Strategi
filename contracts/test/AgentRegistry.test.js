// Test suite for AgentRegistry.sol on live Somnia L1
// No mocks - all transactions are real on-chain

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentRegistry - Live Somnia Tests", function() {
  let agentRegistry;
  let owner;
  let agent1;
  let agent2;
  
  before(async function() {
    const AGENT_REGISTRY_ADDRESS = process.env.AGENT_REGISTRY_ADDRESS;
    
    if (!AGENT_REGISTRY_ADDRESS) {
      throw new Error("AGENT_REGISTRY_ADDRESS not found in environment");
    }
    
    [owner, agent1, agent2] = await ethers.getSigners();
    
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = AgentRegistry.attach(AGENT_REGISTRY_ADDRESS);
    
    console.log(`\n📝 Testing AgentRegistry at: ${AGENT_REGISTRY_ADDRESS}`);
  });
  
  it("Should verify contract deployed on Somnia", async function() {
    const network = await ethers.provider.getNetwork();
    expect(network.chainId).to.equal(50312n);
    
    const code = await ethers.provider.getCode(await agentRegistry.getAddress());
    expect(code).to.not.equal("0x");
    
    console.log("✅ AgentRegistry verified on Somnia L1");
  });
  
  it("Should register new agent with DID", async function() {
    const did = `did:key:test${Date.now()}`;
    const name = "Test AI Agent";
    const metadataURI = `QmMetadata${Date.now()}`;
    
    console.log(`\n🔄 Registering agent:`);
    console.log(`   DID: ${did}`);
    console.log(`   Name: ${name}`);
    console.log(`   Metadata: ${metadataURI}`);
    
    // Check if already registered
    const wasActive = await agentRegistry.isActiveAgent(did);
    
    if (!wasActive) {
      // Register agent
      const tx = await agentRegistry.registerAgent(did, name, metadataURI);
      const receipt = await tx.wait();
      
      console.log(`✅ Transaction confirmed: ${receipt.hash}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      
      // Verify registration
      const isActive = await agentRegistry.isActiveAgent(did);
      expect(isActive).to.be.true;
      
      console.log(`✅ Agent registered and active`);
    } else {
      console.log(`⚠️  Agent already registered`);
    }
  });
  
  it("Should retrieve agent information", async function() {
    const did = `did:key:info${Date.now()}`;
    const name = "Info Test Agent";
    const metadataURI = `QmInfo${Date.now()}`;
    
    // Register first
    const tx = await agentRegistry.registerAgent(did, name, metadataURI);
    await tx.wait();
    
    // Retrieve agent info
    const agent = await agentRegistry.getAgent(did);
    
    expect(agent.did).to.equal(did);
    expect(agent.name).to.equal(name);
    expect(agent.metadataURI).to.equal(metadataURI);
    expect(agent.isActive).to.be.true;
    expect(agent.owner).to.equal(owner.address);
    
    console.log(`✅ Agent info retrieved:`);
    console.log(`   DID: ${agent.did}`);
    console.log(`   Name: ${agent.name}`);
    console.log(`   Owner: ${agent.owner}`);
    console.log(`   Active: ${agent.isActive}`);
    console.log(`   Metadata: ${agent.metadataURI}`);
  });
  
  it("Should prevent duplicate registration", async function() {
    const did = `did:key:duplicate${Date.now()}`;
    const name = "Duplicate Test";
    const metadataURI = "QmDuplicate";
    
    // Register first time
    await agentRegistry.registerAgent(did, name, metadataURI);
    
    // Try to register again
    await expect(
      agentRegistry.registerAgent(did, name, metadataURI)
    ).to.be.revertedWith("Agent already registered");
    
    console.log("✅ Duplicate registration prevented");
  });
  
  it("Should deactivate agent", async function() {
    const did = `did:key:deactivate${Date.now()}`;
    const name = "Deactivate Test";
    const metadataURI = "QmDeactivate";
    
    // Register
    await agentRegistry.registerAgent(did, name, metadataURI);
    
    // Verify active
    let isActive = await agentRegistry.isActiveAgent(did);
    expect(isActive).to.be.true;
    
    // Deactivate
    const tx = await agentRegistry.deactivateAgent(did);
    await tx.wait();
    
    // Verify inactive
    isActive = await agentRegistry.isActiveAgent(did);
    expect(isActive).to.be.false;
    
    console.log("✅ Agent deactivated successfully");
  });
  
  it("Should reactivate deactivated agent", async function() {
    const did = `did:key:reactivate${Date.now()}`;
    const name = "Reactivate Test";
    const metadataURI = "QmReactivate";
    
    // Register
    await agentRegistry.registerAgent(did, name, metadataURI);
    
    // Deactivate
    await agentRegistry.deactivateAgent(did);
    expect(await agentRegistry.isActiveAgent(did)).to.be.false;
    
    // Reactivate
    const tx = await agentRegistry.reactivateAgent(did);
    await tx.wait();
    
    // Verify active again
    const isActive = await agentRegistry.isActiveAgent(did);
    expect(isActive).to.be.true;
    
    console.log("✅ Agent reactivated successfully");
  });
  
  it("Should emit AgentRegistered event", async function() {
    const did = `did:key:event${Date.now()}`;
    const name = "Event Test";
    const metadataURI = "QmEvent";
    
    await expect(agentRegistry.registerAgent(did, name, metadataURI))
      .to.emit(agentRegistry, "AgentRegistered")
      .withArgs(did, owner.address, name);
    
    console.log("✅ AgentRegistered event emitted");
  });
  
  it("Should emit AgentDeactivated event", async function() {
    const did = `did:key:deactivateEvent${Date.now()}`;
    const name = "Deactivate Event Test";
    const metadataURI = "QmDeactivateEvent";
    
    // Register first
    await agentRegistry.registerAgent(did, name, metadataURI);
    
    // Deactivate and check event
    await expect(agentRegistry.deactivateAgent(did))
      .to.emit(agentRegistry, "AgentDeactivated")
      .withArgs(did);
    
    console.log("✅ AgentDeactivated event emitted");
  });
  
  it("Should only allow owner to deactivate their agent", async function() {
    const did = `did:key:ownerOnly${Date.now()}`;
    const name = "Owner Only Test";
    const metadataURI = "QmOwnerOnly";
    
    // Register as owner
    await agentRegistry.registerAgent(did, name, metadataURI);
    
    // Try to deactivate as different account
    const agent1Registry = agentRegistry.connect(agent1);
    
    await expect(
      agent1Registry.deactivateAgent(did)
    ).to.be.reverted; // Will revert with "Not agent owner"
    
    console.log("✅ Non-owner cannot deactivate agent");
  });
  
  it("Should estimate gas for registration", async function() {
    const did = `did:key:gas${Date.now()}`;
    const name = "Gas Test Agent";
    const metadataURI = "QmGas";
    
    const gasEstimate = await agentRegistry.registerAgent.estimateGas(
      did, name, metadataURI
    );
    
    console.log(`\n📊 Gas estimation for registerAgent:`);
    console.log(`   Estimated: ${gasEstimate.toString()}`);
    
    // Execute with buffer
    const gasLimit = gasEstimate * 15n / 10n;
    const tx = await agentRegistry.registerAgent(did, name, metadataURI, {
      gasLimit: gasLimit
    });
    const receipt = await tx.wait();
    
    console.log(`   Actual used: ${receipt.gasUsed.toString()}`);
    console.log(`   Efficiency: ${(receipt.gasUsed * 100n / gasEstimate)}%`);
    
    expect(receipt.gasUsed).to.be.lessThan(gasLimit);
    
    console.log("✅ Gas estimation accurate");
  });
  
  it("Should handle long DID strings", async function() {
    // Test with realistic DID key (base58 encoded)
    const did = `did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK`;
    const name = "Long DID Test";
    const metadataURI = "QmLongDID";
    
    // Check if already registered
    const wasActive = await agentRegistry.isActiveAgent(did);
    
    if (!wasActive) {
      const tx = await agentRegistry.registerAgent(did, name, metadataURI);
      await tx.wait();
      
      const isActive = await agentRegistry.isActiveAgent(did);
      expect(isActive).to.be.true;
      
      console.log("✅ Long DID format supported");
      console.log(`   DID: ${did}`);
    } else {
      console.log("⚠️  Long DID already registered");
    }
  });
  
  it("Should verify the actual deployed agent is registered", async function() {
    // Check the agent that's actually being used in production
    const AGENT_DID = process.env.AGENT_DID;
    
    if (AGENT_DID) {
      const isActive = await agentRegistry.isActiveAgent(AGENT_DID);
      
      console.log(`\n🔍 Production agent check:`);
      console.log(`   DID: ${AGENT_DID}`);
      console.log(`   Status: ${isActive ? "Active ✅" : "Inactive ❌"}`);
      
      if (isActive) {
        const agent = await agentRegistry.getAgent(AGENT_DID);
        console.log(`   Name: ${agent.name}`);
        console.log(`   Owner: ${agent.owner}`);
        console.log(`   Metadata: ${agent.metadataURI}`);
      }
      
      expect(isActive).to.be.true;
    } else {
      console.log("⚠️  AGENT_DID not set in environment");
    }
  });
});

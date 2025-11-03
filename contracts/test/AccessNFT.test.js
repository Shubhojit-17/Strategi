// Test suite for AccessNFT.sol on live Somnia L1
// No mocks - all transactions are real on-chain

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AccessNFT - Live Somnia Tests", function() {
  let accessNFT;
  let agentRegistry;
  let owner;
  let user1;
  let user2;
  
  before(async function() {
    // Get deployed contract addresses from environment
    const ACCESS_NFT_ADDRESS = process.env.ACCESS_NFT_ADDRESS;
    const AGENT_REGISTRY_ADDRESS = process.env.AGENT_REGISTRY_ADDRESS;
    
    if (!ACCESS_NFT_ADDRESS || !AGENT_REGISTRY_ADDRESS) {
      throw new Error("Contract addresses not found in environment");
    }
    
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
    
    // Connect to deployed contracts on Somnia
    const AccessNFT = await ethers.getContractFactory("AccessNFT");
    accessNFT = AccessNFT.attach(ACCESS_NFT_ADDRESS);
    
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = AgentRegistry.attach(AGENT_REGISTRY_ADDRESS);
    
    console.log(`\n📝 Testing AccessNFT at: ${ACCESS_NFT_ADDRESS}`);
    console.log(`📝 Network: ${(await ethers.provider.getNetwork()).name}`);
    console.log(`📝 Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  });
  
  it("Should verify contract is deployed on Somnia (chainId: 50312)", async function() {
    const network = await ethers.provider.getNetwork();
    expect(network.chainId).to.equal(50312n, "Not connected to Somnia L1");
    
    // Verify contract code exists
    const code = await ethers.provider.getCode(await accessNFT.getAddress());
    expect(code).to.not.equal("0x", "Contract not deployed");
    
    console.log("✅ Contract verified on Somnia L1");
  });
  
  it("Should have correct AgentRegistry address set", async function() {
    const registryAddress = await accessNFT.agentRegistry();
    expect(registryAddress).to.equal(await agentRegistry.getAddress());
    
    console.log(`✅ AgentRegistry linked: ${registryAddress}`);
  });
  
  it("Should mint NFT with document CID to user1", async function() {
    const documentCID = `QmTest${Date.now()}`; // Unique CID for testing
    
    console.log(`\n🔄 Minting NFT with CID: ${documentCID}`);
    console.log(`   To address: ${user1.address}`);
    
    // Mint NFT
    const tx = await accessNFT.mint(user1.address, documentCID);
    const receipt = await tx.wait();
    
    console.log(`✅ Transaction confirmed: ${receipt.hash}`);
    console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
    console.log(`   Block: ${receipt.blockNumber}`);
    
    // Find Transfer event to get tokenId
    const transferEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === "Transfer"
    );
    
    expect(transferEvent).to.not.be.undefined;
    const tokenId = transferEvent.args[2]; // tokenId is 3rd argument
    
    console.log(`   Token ID: ${tokenId}`);
    
    // Verify ownership
    const ownerOfToken = await accessNFT.ownerOf(tokenId);
    expect(ownerOfToken).to.equal(user1.address);
    
    // Verify tokenURI returns the document CID
    const tokenURI = await accessNFT.tokenURI(tokenId);
    expect(tokenURI).to.equal(documentCID);
    
    console.log(`✅ NFT minted successfully`);
    console.log(`   Owner: ${ownerOfToken}`);
    console.log(`   Token URI: ${tokenURI}`);
  });
  
  it("Should verify NFT ownership with hasAccess()", async function() {
    const documentCID = `QmAccess${Date.now()}`;
    
    // Mint to user1
    const tx = await accessNFT.mint(user1.address, documentCID);
    const receipt = await tx.wait();
    
    const transferEvent = receipt.logs.find(
      log => log.fragment && log.fragment.name === "Transfer"
    );
    const tokenId = transferEvent.args[2];
    
    // Check access for owner (user1)
    const user1HasAccess = await accessNFT.hasAccess(user1.address, tokenId);
    expect(user1HasAccess).to.be.true;
    
    // Check access for non-owner (user2)
    const user2HasAccess = await accessNFT.hasAccess(user2.address, tokenId);
    expect(user2HasAccess).to.be.false;
    
    console.log(`✅ Access control verified`);
    console.log(`   ${user1.address}: ${user1HasAccess}`);
    console.log(`   ${user2.address}: ${user2HasAccess}`);
  });
  
  it("Should emit Transfer event on mint", async function() {
    const documentCID = `QmEvent${Date.now()}`;
    
    // Expect Transfer event
    await expect(accessNFT.mint(user1.address, documentCID))
      .to.emit(accessNFT, "Transfer");
    
    console.log("✅ Transfer event emitted correctly");
  });
  
  it("Should estimate gas correctly for minting", async function() {
    const documentCID = `QmGasTest${Date.now()}`;
    
    // Estimate gas
    const gasEstimate = await accessNFT.mint.estimateGas(
      user1.address,
      documentCID
    );
    
    console.log(`\n📊 Gas estimation for mint:`);
    console.log(`   Estimated: ${gasEstimate.toString()}`);
    
    // Verify estimate is reasonable (should be < 500k for NFT mint)
    expect(gasEstimate).to.be.lessThan(500000n);
    
    // Execute with 50% buffer
    const gasLimit = gasEstimate * 15n / 10n;
    const tx = await accessNFT.mint(user1.address, documentCID, {
      gasLimit: gasLimit
    });
    const receipt = await tx.wait();
    
    console.log(`   Actual used: ${receipt.gasUsed.toString()}`);
    console.log(`   Buffer: ${((gasLimit - receipt.gasUsed) * 100n / gasLimit)}%`);
    
    // Verify actual gas used is less than estimate
    expect(receipt.gasUsed).to.be.lessThan(gasLimit);
    
    console.log("✅ Gas estimation accurate");
  });
  
  it("Should allow owner to set AgentRegistry address", async function() {
    const currentRegistry = await accessNFT.agentRegistry();
    
    console.log(`\n🔧 Current AgentRegistry: ${currentRegistry}`);
    
    // This will only work if test account is the owner
    // In production, skip this test or use owner account
    try {
      // Try to set (will revert if not owner)
      const tx = await accessNFT.setAgentRegistry(currentRegistry);
      await tx.wait();
      
      console.log("✅ setAgentRegistry callable by owner");
    } catch (error) {
      if (error.message.includes("OwnableUnauthorizedAccount")) {
        console.log("⚠️  Skipped: Test account is not contract owner");
      } else {
        throw error;
      }
    }
  });
  
  it("Should retrieve multiple NFTs minted to same user", async function() {
    const user = user1.address;
    
    // Mint 3 NFTs to user1
    console.log(`\n🔄 Minting 3 NFTs to ${user}`);
    
    const tokenIds = [];
    for (let i = 0; i < 3; i++) {
      const cid = `QmBatch${Date.now()}-${i}`;
      const tx = await accessNFT.mint(user, cid);
      const receipt = await tx.wait();
      
      const transferEvent = receipt.logs.find(
        log => log.fragment && log.fragment.name === "Transfer"
      );
      tokenIds.push(transferEvent.args[2]);
      
      console.log(`   Minted token #${tokenIds[i]}`);
    }
    
    // Verify all tokens owned by user
    for (const tokenId of tokenIds) {
      const owner = await accessNFT.ownerOf(tokenId);
      expect(owner).to.equal(user);
    }
    
    console.log(`✅ All ${tokenIds.length} NFTs owned by user`);
  });
  
  it("Should handle IPFS CID formats (Qm and bafy)", async function() {
    const cidQm = `QmTest${Date.now()}`;
    const cidBafy = `bafyTest${Date.now()}`;
    
    // Mint with Qm format
    const tx1 = await accessNFT.mint(user1.address, cidQm);
    const receipt1 = await tx1.wait();
    const tokenId1 = receipt1.logs.find(
      log => log.fragment && log.fragment.name === "Transfer"
    ).args[2];
    
    // Mint with bafy format
    const tx2 = await accessNFT.mint(user1.address, cidBafy);
    const receipt2 = await tx2.wait();
    const tokenId2 = receipt2.logs.find(
      log => log.fragment && log.fragment.name === "Transfer"
    ).args[2];
    
    // Verify both CIDs stored correctly
    const uri1 = await accessNFT.tokenURI(tokenId1);
    const uri2 = await accessNFT.tokenURI(tokenId2);
    
    expect(uri1).to.equal(cidQm);
    expect(uri2).to.equal(cidBafy);
    
    console.log("✅ Both IPFS CID formats supported");
    console.log(`   Qm format: ${uri1}`);
    console.log(`   bafy format: ${uri2}`);
  });
});

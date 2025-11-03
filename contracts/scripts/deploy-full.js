const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment on Somnia L1...\n");

  // Deploy CompanyAccessNFT (NFT Authentication Contract)
  console.log("📝 Deploying CompanyAccessNFT...");
  const CompanyAccessNFT = await hre.ethers.getContractFactory("CompanyAccessNFT");
  const accessNFT = await CompanyAccessNFT.deploy();
  await accessNFT.waitForDeployment();
  const accessNFTAddress = await accessNFT.getAddress();
  console.log("✅ CompanyAccessNFT deployed to:", accessNFTAddress);

  // Deploy CompanyDropbox (Document Storage Contract)
  console.log("\n📝 Deploying CompanyDropbox...");
  const CompanyDropbox = await hre.ethers.getContractFactory("CompanyDropbox");
  const dropbox = await CompanyDropbox.deploy(accessNFTAddress);
  await dropbox.waitForDeployment();
  const dropboxAddress = await dropbox.getAddress();
  console.log("✅ CompanyDropbox deployed to:", dropboxAddress);

  // Deploy AgentRegistry (AI Agents Registry)
  console.log("\n📝 Deploying AgentRegistry...");
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("✅ AgentRegistry deployed to:", agentRegistryAddress);

  // Deploy Provenance (Execution Tracking)
  console.log("\n📝 Deploying Provenance...");
  const Provenance = await hre.ethers.getContractFactory("Provenance");
  const provenance = await Provenance.deploy();
  await provenance.waitForDeployment();
  const provenanceAddress = await provenance.getAddress();
  console.log("✅ Provenance deployed to:", provenanceAddress);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:\n");
  console.log("CompanyAccessNFT:", accessNFTAddress);
  console.log("CompanyDropbox:  ", dropboxAddress);
  console.log("AgentRegistry:   ", agentRegistryAddress);
  console.log("Provenance:      ", provenanceAddress);
  
  console.log("\n" + "=".repeat(60));
  console.log("📝 SYSTEM ARCHITECTURE:");
  console.log("=".repeat(60));
  console.log("\n1. User mints NFT (CompanyAccessNFT) for authentication");
  console.log("2. System verifies NFT ownership");
  console.log("3. User uploads document to IPFS");
  console.log("4. Document hash stored in CompanyDropbox (requires NFT)");
  console.log("5. AI agent processes document (gated by NFT)");
  console.log("6. Execution recorded in Provenance contract\n");

  console.log("=".repeat(60));
  console.log("⚙️  Update your .env files with these addresses:");
  console.log("=".repeat(60));
  console.log(`
Frontend (.env.local):
NEXT_PUBLIC_ACCESS_NFT_ADDRESS=${accessNFTAddress}
NEXT_PUBLIC_DROPBOX_ADDRESS=${dropboxAddress}
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=${agentRegistryAddress}
NEXT_PUBLIC_PROVENANCE_ADDRESS=${provenanceAddress}

Backend (agent/.env):
ACCESS_NFT_ADDRESS=${accessNFTAddress}
DROPBOX_ADDRESS=${dropboxAddress}
AGENT_REGISTRY_ADDRESS=${agentRegistryAddress}
PROVENANCE_ADDRESS=${provenanceAddress}
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

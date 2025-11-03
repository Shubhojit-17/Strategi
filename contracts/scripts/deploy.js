const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Somnia AI Agents contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy AccessNFT
  console.log("📄 Deploying AccessNFT...");
  const AccessNFT = await hre.ethers.getContractFactory("AccessNFT");
  const accessNFT = await AccessNFT.deploy();
  await accessNFT.waitForDeployment();
  const accessNFTAddress = await accessNFT.getAddress();
  console.log("✅ AccessNFT deployed to:", accessNFTAddress);

  // Deploy AgentRegistry
  console.log("\n📄 Deploying AgentRegistry...");
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("✅ AgentRegistry deployed to:", agentRegistryAddress);

  // Deploy Provenance
  console.log("\n📄 Deploying Provenance...");
  const Provenance = await hre.ethers.getContractFactory("Provenance");
  const provenance = await Provenance.deploy(
    accessNFTAddress,
    agentRegistryAddress
  );
  await provenance.waitForDeployment();
  const provenanceAddress = await provenance.getAddress();
  console.log("✅ Provenance deployed to:", provenanceAddress);

  // Set AgentRegistry in AccessNFT
  console.log("\n🔗 Linking contracts...");
  const setRegistryTx = await accessNFT.setAgentRegistry(agentRegistryAddress);
  await setRegistryTx.wait();
  console.log("✅ AgentRegistry linked to AccessNFT");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("AccessNFT:       ", accessNFTAddress);
  console.log("AgentRegistry:   ", agentRegistryAddress);
  console.log("Provenance:      ", provenanceAddress);
  console.log("Deployer:        ", deployer.address);
  console.log("Network:         ", hre.network.name);
  console.log("=".repeat(60));

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AccessNFT: accessNFTAddress,
      AgentRegistry: agentRegistryAddress,
      Provenance: provenanceAddress,
    },
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const filename = `${deploymentsDir}/${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", filename);

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n📝 To verify contracts on Somnia explorer, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${accessNFTAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${agentRegistryAddress}`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${provenanceAddress} ${accessNFTAddress} ${agentRegistryAddress}`);
  }

  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

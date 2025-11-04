const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying CompanyDropbox contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Load existing AccessNFT address
  const fs = require("fs");
  const deploymentFiles = fs.readdirSync("./deployments")
    .filter(f => f.startsWith("somnia-"))
    .sort()
    .reverse();
  
  if (deploymentFiles.length === 0) {
    console.error("❌ No previous deployment found. Deploy main contracts first.");
    process.exit(1);
  }

  const latestDeployment = JSON.parse(
    fs.readFileSync(`./deployments/${deploymentFiles[0]}`, "utf8")
  );

  const accessNFTAddress = latestDeployment.contracts.AccessNFT;
  console.log("📌 Using existing AccessNFT at:", accessNFTAddress);

  // Deploy CompanyDropbox
  console.log("\n📄 Deploying CompanyDropbox...");
  const CompanyDropbox = await hre.ethers.getContractFactory("CompanyDropbox");
  const companyDropbox = await CompanyDropbox.deploy(accessNFTAddress);
  await companyDropbox.waitForDeployment();
  const companyDropboxAddress = await companyDropbox.getAddress();
  console.log("✅ CompanyDropbox deployed to:", companyDropboxAddress);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("CompanyDropbox:  ", companyDropboxAddress);
  console.log("AccessNFT (ref): ", accessNFTAddress);
  console.log("Deployer:        ", deployer.address);
  console.log("Network:         ", hre.network.name);
  console.log("Chain ID:        ", hre.network.config.chainId);
  console.log("=".repeat(60));

  // Save deployment info
  const deploymentInfo = {
    ...latestDeployment,
    timestamp: new Date().toISOString(),
    contracts: {
      ...latestDeployment.contracts,
      CompanyDropbox: companyDropboxAddress,
    },
  };

  const filename = `./deployments/${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", filename);

  // Verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n📝 To verify contract on Somnia explorer, run:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${companyDropboxAddress} ${accessNFTAddress}`);
  }

  // Environment variable instruction
  console.log("\n" + "=".repeat(60));
  console.log("🔧 NEXT STEPS");
  console.log("=".repeat(60));
  console.log("Add this to your .env file:\n");
  console.log(`COMPANY_DROPBOX_ADDRESS=${companyDropboxAddress}`);
  console.log("=".repeat(60));

  console.log("\n✨ Deployment complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

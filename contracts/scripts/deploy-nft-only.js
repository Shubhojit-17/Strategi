const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting OPTIMIZED deployment on Somnia L1...\n");
  console.log("⚡ Only deploying NEW contracts (AccessNFT + Dropbox)\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deployer:", await deployer.getAddress());
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(balance), "STM\n");

  // ============================================
  // 1. DEPLOY COMPANY ACCESS NFT
  // ============================================
  console.log("📝 Deploying CompanyAccessNFT...");
  const CompanyAccessNFT = await hre.ethers.getContractFactory("CompanyAccessNFT");
  const accessNFT = await CompanyAccessNFT.deploy();
  await accessNFT.waitForDeployment();
  const accessNFTAddress = await accessNFT.getAddress();
  console.log("✅ CompanyAccessNFT deployed at:", accessNFTAddress);

  // ============================================
  // 2. DEPLOY COMPANY DROPBOX (with AccessNFT address)
  // ============================================
  console.log("\n📝 Deploying CompanyDropbox...");
  const CompanyDropbox = await hre.ethers.getContractFactory("CompanyDropbox");
  const dropbox = await CompanyDropbox.deploy(accessNFTAddress);
  await dropbox.waitForDeployment();
  const dropboxAddress = await dropbox.getAddress();
  console.log("✅ CompanyDropbox deployed at:", dropboxAddress);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n" + "=".repeat(60));
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  
  console.log("\n📋 NEW Contract Addresses:");
  console.log(`  CompanyAccessNFT:  ${accessNFTAddress}`);
  console.log(`  CompanyDropbox:    ${dropboxAddress}`);

  console.log("\n📋 EXISTING Contracts (already deployed):");
  console.log(`  AgentRegistry:     ${process.env.AGENT_REGISTRY_ADDRESS || "See .env"}`);
  console.log(`  Provenance:        ${process.env.PROVENANCE_ADDRESS || "See .env"}`);

  // Show gas used
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const gasUsed = balance - finalBalance;
  console.log("\n⛽ Gas Used:", hre.ethers.formatEther(gasUsed), "STM");
  console.log("💰 Remaining Balance:", hre.ethers.formatEther(finalBalance), "STM");

  // Generate .env updates
  console.log("\n" + "=".repeat(60));
  console.log("📝 UPDATE YOUR .env FILES:");
  console.log("=".repeat(60));
  
  console.log("\n1️⃣  contracts/.env:");
  console.log(`ACCESS_NFT_ADDRESS=${accessNFTAddress}`);
  console.log(`DROPBOX_ADDRESS=${dropboxAddress}`);
  
  console.log("\n2️⃣  agent/.env:");
  console.log(`ACCESS_NFT_ADDRESS=${accessNFTAddress}`);
  console.log(`DROPBOX_ADDRESS=${dropboxAddress}`);
  
  console.log("\n3️⃣  frontend/.env.local:");
  console.log(`NEXT_PUBLIC_ACCESS_NFT_ADDRESS=${accessNFTAddress}`);
  console.log(`NEXT_PUBLIC_DROPBOX_ADDRESS=${dropboxAddress}`);

  console.log("\n" + "=".repeat(60));
  console.log("🎯 Next Steps:");
  console.log("=".repeat(60));
  console.log("1. Copy the addresses above to your .env files");
  console.log("2. Restart the backend: cd agent && venv_new\\Scripts\\python.exe -m uvicorn app.main:app --reload");
  console.log("3. Test NFT minting and document upload");
  console.log("4. Verify contracts on Somnia Explorer (optional)");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

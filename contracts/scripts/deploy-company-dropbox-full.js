const { ethers } = require("hardhat");

async function main() {
  const accessNFTAddress = "0x67460B6466974fEF10FC42FF3C74Fd1994719e16"; // CompanyAccessNFT address
  
  console.log("🚀 Deploying CompanyDropbox contract...");
  console.log("Using CompanyAccessNFT at:", accessNFTAddress);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy CompanyDropbox
  const CompanyDropbox = await ethers.getContractFactory("CompanyDropbox");
  const dropbox = await CompanyDropbox.deploy(accessNFTAddress);
  await dropbox.waitForDeployment();

  const dropboxAddress = await dropbox.getAddress();
  console.log("✅ CompanyDropbox deployed to:", dropboxAddress);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "somnia",
    timestamp: new Date().toISOString(),
    contracts: {
      CompanyAccessNFT: accessNFTAddress,
      CompanyDropbox: dropboxAddress
    },
    deployer: deployer.address
  };

  const filename = `deployments/company-dropbox-full-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to ${filename}`);

  console.log("\n📋 Update these addresses in your .env files:");
  console.log(`ACCESS_NFT_ADDRESS=${accessNFTAddress}`);
  console.log(`COMPANY_DROPBOX_ADDRESS=${dropboxAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

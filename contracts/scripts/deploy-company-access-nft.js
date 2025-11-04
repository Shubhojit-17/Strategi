const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CompanyAccessNFT contract...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy CompanyAccessNFT
  const CompanyAccessNFT = await ethers.getContractFactory("CompanyAccessNFT");
  const accessNFT = await CompanyAccessNFT.deploy();
  await accessNFT.waitForDeployment();

  const accessNFTAddress = await accessNFT.getAddress();
  console.log("✅ CompanyAccessNFT deployed to:", accessNFTAddress);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "somnia",
    timestamp: new Date().toISOString(),
    contracts: {
      CompanyAccessNFT: accessNFTAddress
    },
    deployer: deployer.address
  };

  const filename = `deployments/company-access-nft-${Date.now()}.json`;
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to ${filename}`);

  return accessNFTAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

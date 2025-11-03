const hre = require("hardhat");

async function main() {
  console.log("🔍 Checking Deployer Wallet Balance...\n");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  const address = await deployer.getAddress();

  console.log("📍 Wallet Address:", address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(address);
  const balanceInEther = hre.ethers.formatEther(balance);

  console.log("💰 Current Balance:", balanceInEther, "STM");
  console.log("💰 Balance in Wei:", balance.toString());

  // Estimate gas needed for deployment
  console.log("\n⛽ Estimated Gas Requirements:");
  
  // Typical contract deployment costs
  const estimates = {
    "CompanyAccessNFT": 0.01,      // ~0.01 STM
    "CompanyDropbox": 0.015,       // ~0.015 STM
    "AgentRegistry": 0.005,        // ~0.005 STM (already deployed)
    "Provenance": 0.005,           // ~0.005 STM (already deployed)
  };

  let totalNeeded = 0;
  console.log("\nContract Deployment Estimates:");
  for (const [contract, cost] of Object.entries(estimates)) {
    console.log(`  - ${contract}: ~${cost} STM`);
    totalNeeded += cost;
  }

  // Only need to deploy new contracts (AccessNFT and Dropbox)
  const newContractsNeeded = estimates.CompanyAccessNFT + estimates.CompanyDropbox;
  
  console.log("\n📊 Summary:");
  console.log("  Total for all 4 contracts: ~" + totalNeeded.toFixed(3) + " STM");
  console.log("  NEW contracts only (AccessNFT + Dropbox): ~" + newContractsNeeded.toFixed(3) + " STM");
  console.log("  + Safety buffer (20%): ~" + (newContractsNeeded * 1.2).toFixed(3) + " STM");
  
  const recommendedAmount = (newContractsNeeded * 1.2).toFixed(3);
  console.log("\n✅ RECOMMENDED: " + recommendedAmount + " STM");

  // Check if we have enough
  const balanceNum = parseFloat(balanceInEther);
  const neededNum = parseFloat(recommendedAmount);

  console.log("\n🎯 Balance Check:");
  if (balanceNum >= neededNum) {
    console.log("  ✅ Sufficient balance for deployment!");
    console.log("  💵 You have:", balanceInEther, "STM");
    console.log("  💸 You need:", recommendedAmount, "STM");
    console.log("  💰 Surplus:", (balanceNum - neededNum).toFixed(6), "STM");
  } else {
    console.log("  ❌ INSUFFICIENT BALANCE");
    console.log("  💵 You have:", balanceInEther, "STM");
    console.log("  💸 You need:", recommendedAmount, "STM");
    console.log("  ⚠️  Shortfall:", (neededNum - balanceNum).toFixed(6), "STM");
    console.log("\n📍 Send testnet STM to:", address);
  }

  // Network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("\n🌐 Network Info:");
  console.log("  Chain ID:", network.chainId.toString());
  console.log("  Network Name:", network.name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");

async function main() {
  const accessNFTAddress = "0x67460B6466974fEF10FC42FF3C74Fd1994719e16";
  
  console.log("Testing NFT mint...");
  console.log("Contract:", accessNFTAddress);
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Minting from:", signer.address);
  
  const AccessNFT = await hre.ethers.getContractAt("CompanyAccessNFT", accessNFTAddress);
  
  try {
    // Check current state
    const hasNFT = await AccessNFT.hasNFT(signer.address);
    console.log("Already has NFT:", hasNFT);
    
    if (hasNFT) {
      console.log("❌ User already has an NFT. Cannot mint again.");
      return;
    }
    
    // Mint NFT
    const tokenURI = `ipfs://access-nft/${signer.address}`;
    const mintPrice = await AccessNFT.MINT_PRICE();
    
    console.log("");
    console.log("Attempting to mint with:");
    console.log("- Token URI:", tokenURI);
    console.log("- Payment:", hre.ethers.formatEther(mintPrice), "STM");
    console.log("");
    
    const tx = await AccessNFT.mintAccessNFT(tokenURI, {
      value: mintPrice
    });
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ NFT minted successfully!");
    console.log("Block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    
    // Verify
    const newHasNFT = await AccessNFT.hasNFT(signer.address);
    const tokenId = await AccessNFT.getUserTokenId(signer.address);
    console.log("");
    console.log("Verification:");
    console.log("- Has NFT:", newHasNFT);
    console.log("- Token ID:", tokenId.toString());
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

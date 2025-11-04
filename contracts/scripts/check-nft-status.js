const hre = require("hardhat");

async function main() {
  const accessNFTAddress = "0x67460B6466974fEF10FC42FF3C74Fd1994719e16";
  const userAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Default hardhat address
  
  console.log("Checking NFT status...");
  console.log("Contract:", accessNFTAddress);
  console.log("User:", userAddress);
  console.log("");
  
  const AccessNFT = await hre.ethers.getContractAt("CompanyAccessNFT", accessNFTAddress);
  
  try {
    // Check if user has NFT
    const hasNFT = await AccessNFT.hasNFT(userAddress);
    console.log("Has NFT:", hasNFT);
    
    // Check if authenticated
    const isAuth = await AccessNFT.isAuthenticated(userAddress);
    console.log("Is Authenticated:", isAuth);
    
    if (hasNFT) {
      const tokenId = await AccessNFT.getUserTokenId(userAddress);
      console.log("Token ID:", tokenId.toString());
    }
    
    // Check mint price
    const mintPrice = await AccessNFT.MINT_PRICE();
    console.log("");
    console.log("Mint Price:", hre.ethers.formatEther(mintPrice), "STM");
    
    // Check user balance
    const [signer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log("Signer address:", signer.address);
    console.log("Signer balance:", hre.ethers.formatEther(balance), "STM");
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

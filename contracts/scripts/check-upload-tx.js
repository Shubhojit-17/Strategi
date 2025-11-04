const hre = require("hardhat");

async function main() {
  const txHash = "0x75d3c4972352bd5e8116c4a8b10f68205aa8714530719302bc79c4896734ff01";
  
  console.log("Looking up transaction:", txHash);
  
  const tx = await hre.ethers.provider.getTransaction(txHash);
  
  if (tx) {
    console.log("Transaction found!");
    console.log("Block Number:", tx.blockNumber);
    console.log("From:", tx.from);
    console.log("To:", tx.to);
    
    const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
    if (receipt) {
      console.log("\nReceipt:");
      console.log("Status:", receipt.status === 1 ? "Success" : "Failed");
      console.log("Logs:", receipt.logs.length);
      
      // Decode the logs
      const dropboxAddress = "0x28F66A1bcb918bc75Cbe7FAa5356B352148a879D";
      const CompanyDropbox = await hre.ethers.getContractAt("CompanyDropbox", dropboxAddress);
      
      for (let i = 0; i < receipt.logs.length; i++) {
        try {
          const parsedLog = CompanyDropbox.interface.parseLog({
            topics: receipt.logs[i].topics,
            data: receipt.logs[i].data
          });
          console.log(`\nEvent ${i}:`, parsedLog.name);
          console.log("Args:", parsedLog.args);
        } catch (e) {
          // Not a CompanyDropbox event
        }
      }
    }
  } else {
    console.log("Transaction not found!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

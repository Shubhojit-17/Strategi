require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    
    // Somnia L1 - Update with official RPC when available
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "https://dream-rpc.somnia.network",
      chainId: parseInt(process.env.SOMNIA_CHAIN_ID || "50312"), // Somnia Dream Testnet
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      gasPrice: "auto",
    },
    
    // Somnia Testnet (if available)
    somniaTestnet: {
      url: process.env.SOMNIA_TESTNET_RPC_URL || "https://testnet-rpc.somnia.network",
      chainId: parseInt(process.env.SOMNIA_TESTNET_CHAIN_ID || "5678"),
      accounts: process.env.DEPLOYER_PRIVATE_KEY 
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
  etherscan: {
    // Add Somnia explorer API key when available
    apiKey: {
      somnia: process.env.SOMNIA_EXPLORER_API_KEY || "",
    },
    customChains: [
      {
        network: "somnia",
        chainId: parseInt(process.env.SOMNIA_CHAIN_ID || "1234"),
        urls: {
          apiURL: process.env.SOMNIA_EXPLORER_API_URL || "https://api.explorer.somnia.network/api",
          browserURL: process.env.SOMNIA_EXPLORER_URL || "https://explorer.somnia.network",
        },
      },
    ],
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

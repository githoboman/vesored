require("dotenv").config({ path: "./secrets.txt" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src/backend/contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    // BOT Chain Testnet (Bohr Testnet)
    botTestnet: {
      url: process.env.BOT_CHAIN_TESTNET_RPC || "https://rpc.bohr.life",
      chainId: 968,
      accounts: process.env.DEPLOYER_PRIVATE_KEY && !process.env.DEPLOYER_PRIVATE_KEY.includes("ENTER_YOUR")
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
    // BOT Chain Mainnet
    botMainnet: {
      url: process.env.BOT_CHAIN_MAINNET_RPC || "https://rpc.botchain.ai",
      chainId: 677,
      accounts: process.env.DEPLOYER_PRIVATE_KEY && !process.env.DEPLOYER_PRIVATE_KEY.includes("ENTER_YOUR")
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
    },
  },
};

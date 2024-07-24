require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
// const ethers = require("ethers");

// const ALCHEMY_SEPOLIA_KEY = 'bfd2407a0fe6448fb524384f718844ec';
// const BSC_TESTNET_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
// const PRIVATE_KEY = '4ff10ab38b0cdca00701d5589772d711e83db2445d985921a75677915235607c';
// const BSC_PRIVATE_KEY = '9867a8b1376cf1c2e37bb26d9b7b9c537a9b109865381266107819cbbc8d06b4';

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test"
  },
  // networks: {
  //   hardhat: {
  //     chainId: 1337
  //   },
  //   sepolia: {
  //     url: `https://sepolia.infura.io/v3/${ALCHEMY_SEPOLIA_KEY}`,
  //     accounts: [`0x${PRIVATE_KEY}`],
  //     chainId: 11155111,
  //     gas: 6000000,
  //     gasPrice: 10000000000  // Directly set as numeric value (10 gwei)
  //   },
  //   bscTestnet: {
  //     url: BSC_TESTNET_URL,
  //     accounts: [`0x${BSC_PRIVATE_KEY}`],
  //     chainId: 97,
  //     gas: 6000000,
  //     gasPrice: 10000000000  // Directly set as numeric value (10 gwei)
  //   }
  // }
};

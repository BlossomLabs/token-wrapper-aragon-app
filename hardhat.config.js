require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-ethers")
require("@aragon/hardhat-aragon")

const { homedir } = require("os");
const { join } = require("path");

// get the network url and account private key from ~/.aragon/network_key.json
function getNetworkConfig(network) {
  // default to mumbai
  let url = "";
  let accounts = [];

  try {
    const networkConfig = require(join(
      homedir(),
      `.aragon/${network}_key.json`
    ));
    url = networkConfig.rpc;
    accounts = networkConfig.keys;
  } catch (_) {}

  return { url, accounts };
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.4.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 20000,
      },
    },
  },
  namedAccounts: {
    deployer: 0,
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
    },
    mainnet: getNetworkConfig("mainnet"),
    rinkeby: getNetworkConfig("rinkeby"),
    mumbai: getNetworkConfig("mumbai"),
    matic: getNetworkConfig("matic"),
    harmony: getNetworkConfig('harmony'),
    harmonyTest: getNetworkConfig('harmonyTest'),
    bsc: getNetworkConfig('bsc'),
    bscTest: getNetworkConfig('bscTest'),
    stardust: getNetworkConfig('stardust'),
    andromeda: getNetworkConfig('andromeda'),
    frame: {
      url: 'http://localhost:1248',
      httpHeaders: { origin: 'hardhat' },
      timeout: 0,
      gas: 0,
    },
  },
  mocha: {
    timeout: 30000,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

/**
 * Hardhat deployment script for VesoredPortfolio on BOT Chain
 * Supports Bohr Testnet (Chain ID 968) & BOT Chain Mainnet (Chain ID 677)
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const networkName = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;

  console.log("====================================================");
  console.log("Deploying VesoredPortfolio to BOT Chain");
  console.log("====================================================");
  console.log(`Network:   ${networkName} (Chain ID: ${chainId})`);
  console.log(`Deployer:  ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance:   ${hre.ethers.formatEther(balance)} BOT`);
  console.log("====================================================");

  const VesoredPortfolio = await hre.ethers.getContractFactory("VesoredPortfolio");
  const contract = await VesoredPortfolio.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log(`>> VesoredPortfolio deployed at: ${contractAddress}`);

  // Write deployment info to JSON
  const deploymentInfo = {
    network: networkName,
    chainId: Number(chainId),
    contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const outputDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, `${networkName}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`Deployment metadata saved to deployments/${networkName}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

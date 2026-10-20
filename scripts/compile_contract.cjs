const fs = require("fs");
const path = require("path");
let solc;
try {
  solc = require("solc");
} catch {
  solc = require(path.resolve(__dirname, "../src/frontend/node_modules/solc"));
}

const contractPath = path.resolve(__dirname, "../src/backend/contracts/VesoredPortfolio.sol");
const sourceCode = fs.readFileSync(contractPath, "utf8");

console.log("Compiling VesoredPortfolio.sol with solc 0.8.20...");

const input = {
  language: "Solidity",
  sources: {
    "VesoredPortfolio.sol": {
      content: sourceCode,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  let hasError = false;
  for (const error of output.errors) {
    console.log(error.formattedMessage);
    if (error.severity === "error") {
      hasError = true;
    }
  }
  if (hasError) {
    process.exit(1);
  }
}

const contract = output.contracts["VesoredPortfolio.sol"]["VesoredPortfolio"];
const bytecode = "0x" + contract.evm.bytecode.object;
const abi = contract.abi;

const artifactDir = path.resolve(__dirname, "../artifacts");
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

const artifactPath = path.join(artifactDir, "VesoredPortfolio.json");
fs.writeFileSync(
  artifactPath,
  JSON.stringify({ contractName: "VesoredPortfolio", abi, bytecode }, null, 2)
);

console.log("Compilation successful!");
console.log(`Bytecode size: ${bytecode.length / 2} bytes`);
console.log(`Artifact saved to: ${artifactPath}`);

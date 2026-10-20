/**
 * BOT Chain EVM Client & Network Utilities
 * Official Documentation: https://dev-docs.botchain.ai/docs/intro
 */

export interface NetworkConfig {
  chainId: string; // Hex string e.g. "0x3c8"
  chainIdDecimal: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  faucetUrl?: string;
}

export const BOT_CHAIN_TESTNET: NetworkConfig = {
  chainId: "0x3c8", // 968 in decimal
  chainIdDecimal: 968,
  chainName: "BOT Chain Testnet",
  nativeCurrency: {
    name: "Test BOT",
    symbol: "tBOT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.bohr.life"],
  blockExplorerUrls: ["https://scan.bohr.life"],
  faucetUrl: "https://faucet.botchain.ai/basic",
};

export const BOT_CHAIN_MAINNET: NetworkConfig = {
  chainId: "0x2a5", // 677 in decimal
  chainIdDecimal: 677,
  chainName: "BOT Chain Mainnet",
  nativeCurrency: {
    name: "BOT",
    symbol: "BOT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.botchain.ai"],
  blockExplorerUrls: ["https://scan.botchain.ai"],
};

export const DEFAULT_BOT_NETWORK = BOT_CHAIN_TESTNET;

export const VESORED_PORTFOLIO_ABI = [
  "function createOrUpdatePortfolio(uint256 _btcBalance, uint256 _ethBalance, uint256 _usdBalance, uint256 _botBalance) external",
  "function getPortfolio() external view returns (tuple(uint256 btcBalance, uint256 ethBalance, uint256 usdBalance, uint256 botBalance, uint256 lastUpdated))",
  "function getRiskScore(address user) external view returns (uint256)",
  "function addTransaction(string calldata asset, uint256 amount, uint8 txType) external",
  "function getTransactionHistory() external view returns (tuple(uint256 timestamp, string asset, uint256 amount, uint8 txType)[])",
  "function getCryptoPrices() external view returns (uint256, uint256, uint256)",
  "event PortfolioUpdated(address indexed user, uint256 btcBalance, uint256 ethBalance, uint256 usdBalance, uint256 botBalance, uint256 timestamp)",
  "event TransactionRecorded(address indexed user, string asset, uint256 amount, uint8 txType, uint256 timestamp)"
];

export const DEMO_WALLET_ADDRESS = "0x8b2119E6D52DCda17ce233d16Ef2313E6750028E";

/**
 * Check if an EVM provider (MetaMask, Rabby, BO Wallet, Trust) is injected
 */
export function hasEthereumProvider(): boolean {
  return typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";
}

/**
 * Get current injected provider with multi-provider and wallet type resolution
 */
export function getEthereumProvider(walletType?: string): any {
  if (typeof window === "undefined") return null;
  const eth = (window as any).ethereum;

  // Handle BO Wallet specific global if injected
  if (walletType === "bo_wallet" && (window as any).bohr) {
    return (window as any).bohr;
  }

  if (!eth) return null;

  // If multiple providers exist (e.g. MetaMask + Rabby + BO Wallet)
  if (eth.providers && Array.isArray(eth.providers)) {
    if (walletType === "metamask") {
      const mm = eth.providers.find((p: any) => p.isMetaMask && !p.isBohr && !p.isRabby);
      if (mm) return mm;
    } else if (walletType === "bo_wallet") {
      const bo = eth.providers.find((p: any) => p.isBohr || p.isBOWallet || p.isBotChain);
      if (bo) return bo;
    }
    // Default to first valid provider
    return eth.providers[0] || eth;
  }

  return eth;
}

/**
 * Switch or add BOT Chain network to wallet
 */
export async function switchToBotChain(
  targetNetwork: NetworkConfig = DEFAULT_BOT_NETWORK,
  providerOverride?: any
): Promise<void> {
  const provider = providerOverride || getEthereumProvider();
  if (!provider) {
    throw new Error("No EVM wallet detected. Please install MetaMask or BO Wallet.");
  }

  try {
    // Attempt switching to network
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetNetwork.chainId }],
    });
  } catch (switchError: any) {
    // Error code 4902 indicates that the chain has not been added yet
    if (switchError.code === 4902 || switchError?.message?.includes("Unrecognized chain")) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: targetNetwork.chainId,
            chainName: targetNetwork.chainName,
            nativeCurrency: targetNetwork.nativeCurrency,
            rpcUrls: targetNetwork.rpcUrls,
            blockExplorerUrls: targetNetwork.blockExplorerUrls,
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
}

/**
 * Connect to EVM Wallet and ensure BOT Chain network is active
 */
export async function connectEVMWallet(
  targetNetwork: NetworkConfig = DEFAULT_BOT_NETWORK,
  walletType?: string
): Promise<{ address: string; chainId: number }> {
  const provider = getEthereumProvider(walletType);
  if (!provider) {
    const name = walletType === "bo_wallet" ? "BO Wallet" : "EVM wallet (MetaMask)";
    throw new Error(`${name} not detected. Please install the extension or try Demo Mode.`);
  }

  // Request account permissions
  const accounts: string[] = await provider.request({ method: "eth_requestAccounts" });
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found. Please unlock your wallet.");
  }

  const currentChainHex = await provider.request({ method: "eth_chainId" });
  const currentChainId = parseInt(currentChainHex, 16);

  // If not on BOT Chain, prompt to switch
  if (currentChainId !== targetNetwork.chainIdDecimal) {
    try {
      await switchToBotChain(targetNetwork, provider);
    } catch {
      console.warn("User declined network switch to BOT Chain.");
    }
  }

  const updatedChainHex = await provider.request({ method: "eth_chainId" });
  return {
    address: accounts[0],
    chainId: parseInt(updatedChainHex, 16),
  };
}

/**
 * Query native BOT or tBOT balance via standard JSON-RPC
 */
export async function fetchBotBalance(
  address: string,
  rpcUrl: string = DEFAULT_BOT_NETWORK.rpcUrls[0]
): Promise<number> {
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    });

    if (!res.ok) throw new Error("RPC network error");
    const json = await res.json();
    if (json.error) throw new Error(json.error.message);

    const hexBalance = json.result;
    const wei = BigInt(hexBalance);
    // Convert wei (18 decimals) to float
    return Number(wei) / 1e18;
  } catch (err) {
    console.warn("Failed to fetch BOT balance from RPC:", err);
    return 0;
  }
}

/**
 * Live prices for BTC, ETH, and BOT
 */
export interface PricesResponse {
  btc: number;
  btcChange: number;
  eth: number;
  ethChange: number;
  bot: number;
  botChange: number;
  // Legacy alias for compatibility
  inj: number;
  injChange: number;
}

const BASE_PRICES: PricesResponse = {
  btc: 65420,
  btcChange: 2.4,
  eth: 3280.5,
  ethChange: -1.2,
  bot: 0.75,
  botChange: 5.8,
  inj: 0.75,
  injChange: 5.8,
};

export async function fetchPrices(): Promise<PricesResponse> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
      { headers: { Accept: "application/json" } }
    );

    if (res.ok) {
      const json = await res.json();
      const btc = json?.bitcoin?.usd ?? BASE_PRICES.btc;
      const btcChange = json?.bitcoin?.usd_24h_change ?? BASE_PRICES.btcChange;
      const eth = json?.ethereum?.usd ?? BASE_PRICES.eth;
      const ethChange = json?.ethereum?.usd_24h_change ?? BASE_PRICES.ethChange;

      return {
        btc: Number(btc),
        btcChange: Number(btcChange),
        eth: Number(eth),
        ethChange: Number(ethChange),
        bot: BASE_PRICES.bot,
        botChange: BASE_PRICES.botChange,
        inj: BASE_PRICES.bot,
        injChange: BASE_PRICES.botChange,
      };
    }
  } catch {
    // Use fallback
  }

  return BASE_PRICES;
}

/**
 * Generate explorer URL for a transaction hash
 */
export function getExplorerTxUrl(hash: string, isTestnet: boolean = true): string {
  const base = isTestnet ? BOT_CHAIN_TESTNET.blockExplorerUrls[0] : BOT_CHAIN_MAINNET.blockExplorerUrls[0];
  return `${base}/tx/${hash}`;
}

/**
 * Generate explorer URL for an address
 */
export function getExplorerAddressUrl(address: string, isTestnet: boolean = true): string {
  const base = isTestnet ? BOT_CHAIN_TESTNET.blockExplorerUrls[0] : BOT_CHAIN_MAINNET.blockExplorerUrls[0];
  return `${base}/address/${address}`;
}

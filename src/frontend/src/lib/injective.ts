/**
 * Backwards-compatibility bridge redirecting legacy Injective imports to BOT Chain
 */
import {
  connectEVMWallet,
  fetchBotBalance,
  fetchPrices as fetchBotPrices,
  BOT_CHAIN_TESTNET,
  DEFAULT_BOT_NETWORK,
} from "./botchain";

export const INJECTIVE_CHAIN_ID = "botchain-968";
export const INJECTIVE_CHAIN_CONFIG = {
  chainId: BOT_CHAIN_TESTNET.chainId,
  chainName: BOT_CHAIN_TESTNET.chainName,
  rpc: BOT_CHAIN_TESTNET.rpcUrls[0],
};

export async function connectKeplr(): Promise<string> {
  const result = await connectEVMWallet(DEFAULT_BOT_NETWORK);
  return result.address;
}

export async function fetchInjBalance(address: string): Promise<number> {
  return fetchBotBalance(address);
}

export const fetchPrices = fetchBotPrices;

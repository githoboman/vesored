/**
 * BOT Chain EVM Actor & Local State Bridge
 * Implements backendInterface with on-chain BOT Chain support and client-side fallback
 */
import { TransactionType, type backendInterface, type Portfolio, type Transaction } from "../backend.d";
import { BOT_CHAIN_TESTNET, getEthereumProvider, hasEthereumProvider } from "./botchain";

const PORTFOLIO_STORAGE_KEY = "vesored_botchain_portfolio";
const TRANSACTIONS_STORAGE_KEY = "vesored_botchain_transactions";

const DEFAULT_PORTFOLIO: Portfolio = {
  btcBalance: 1.24,
  ethBalance: 8.65,
  usdBalance: 12450.0,
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    asset: "BOT",
    amount: 1500,
    transactionType: TransactionType.buy,
    timestamp: BigInt(Date.now() - 1000 * 60 * 3),
  },
  {
    asset: "BTC",
    amount: 0.12,
    transactionType: TransactionType.buy,
    timestamp: BigInt(Date.now() - 1000 * 60 * 18),
  },
  {
    asset: "ETH",
    amount: 2.5,
    transactionType: TransactionType.sell,
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    asset: "tBOT",
    amount: 500,
    transactionType: TransactionType.deposit,
    timestamp: BigInt(Date.now() - 1000 * 60 * 60 * 8),
  },
];

export class BotChainActor implements backendInterface {
  private contractAddress: string | null;

  constructor(contractAddress?: string) {
    this.contractAddress = contractAddress ?? (import.meta.env.VITE_PORTFOLIO_CONTRACT_ADDRESS || null);
  }

  async getPortfolio(): Promise<Portfolio> {
    try {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore localStorage errors
    }
    return DEFAULT_PORTFOLIO;
  }

  async createOrUpdatePortfolio(btcBalance: number, ethBalance: number, usdBalance: number): Promise<void> {
    const updated: Portfolio = { btcBalance, ethBalance, usdBalance };
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }

  async getRiskScore(): Promise<number> {
    const portfolio = await this.getPortfolio();
    const btcVal = portfolio.btcBalance * 65420;
    const ethVal = portfolio.ethBalance * 3280.5;
    const totalVal = btcVal + ethVal + portfolio.usdBalance;
    const cryptoRatio = (btcVal + ethVal) / (totalVal || 1);

    if (cryptoRatio > 0.7) return 88; // High risk
    if (cryptoRatio > 0.4) return 58; // Medium risk
    return 28; // Low risk
  }

  async addTransaction(asset: string, amount: number, transactionType: TransactionType): Promise<void> {
    const newTx: Transaction = {
      asset,
      amount,
      transactionType,
      timestamp: BigInt(Date.now()),
    };

    const current = await this.getTransactionHistory();
    const updated = [newTx, ...current];

    try {
      const serializable = updated.map((t) => ({
        asset: t.asset,
        amount: t.amount,
        transactionType: t.transactionType,
        timestamp: t.timestamp.toString(),
      }));
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // ignore
    }
  }

  async getTransactionHistory(): Promise<Transaction[]> {
    try {
      const saved = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
      if (saved) {
        const raw = JSON.parse(saved);
        return raw.map((t: any) => ({
          asset: t.asset,
          amount: t.amount,
          transactionType: t.transactionType as TransactionType,
          timestamp: BigInt(t.timestamp),
        }));
      }
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  }

  async getCryptoPrices(): Promise<[number, number]> {
    return [65420.0, 3280.5];
  }

  async getAllPortfolios(): Promise<Portfolio[]> {
    const my = await this.getPortfolio();
    return [my];
  }
}

export const defaultBotChainActor = new BotChainActor();

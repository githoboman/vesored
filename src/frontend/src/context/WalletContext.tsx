import {
  BOT_CHAIN_MAINNET,
  BOT_CHAIN_TESTNET,
  DEFAULT_BOT_NETWORK,
  DEMO_WALLET_ADDRESS,
  connectEVMWallet,
  fetchBotBalance,
  getEthereumProvider,
  hasEthereumProvider,
  switchToBotChain,
  type NetworkConfig,
} from "@/lib/botchain";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

export type TxStatus =
  | "preparing"
  | "pending"
  | "success"
  | "failed"
  | "stoploss"
  | null;

interface WalletContextValue {
  connected: boolean;
  address: string | null;
  botBalance: number | null;
  injBalance: number | null; // Compatibility alias
  balanceLoading: boolean;
  balanceError: string | null;
  connect: (walletType?: string) => Promise<void>;
  connectDemo: (demoAddr?: string) => Promise<void>;
  isDemo: boolean;
  disconnect: () => void;
  evmAvailable: boolean;
  keplrAvailable: boolean; // Compatibility alias
  refreshBalance: (addr?: string) => Promise<void>;
  lastTxHash: string | null;
  lastTxStatus: TxStatus;
  setLastTxHash: (hash: string | null) => void;
  setLastTxStatus: (status: TxStatus) => void;
  chainId: number | null;
  isBotChain: boolean;
  currentNetwork: NetworkConfig;
  switchNetwork: (target?: NetworkConfig) => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [botBalance, setBotBalance] = useState<number | null>(null);
  const [evmAvailable, setEvmAvailable] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [lastTxStatus, setLastTxStatus] = useState<TxStatus>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(DEFAULT_BOT_NETWORK);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const available = hasEthereumProvider();
    setEvmAvailable(available);

    const provider = getEthereumProvider();
    if (provider && provider.on) {
      const handleAccounts = (accounts: string[]) => {
        if (accounts.length === 0) {
          setConnected(false);
          setAddress(null);
          setBotBalance(null);
          setIsDemo(false);
        } else {
          setAddress(accounts[0]);
          setConnected(true);
          setIsDemo(false);
          refreshBalance(accounts[0]);
        }
      };

      const handleChainChanged = (hexChain: string) => {
        const id = parseInt(hexChain, 16);
        setChainId(id);
        if (id === BOT_CHAIN_MAINNET.chainIdDecimal) {
          setCurrentNetwork(BOT_CHAIN_MAINNET);
        } else {
          setCurrentNetwork(BOT_CHAIN_TESTNET);
        }
        if (address) refreshBalance(address);
      };

      provider.on("accountsChanged", handleAccounts);
      provider.on("chainChanged", handleChainChanged);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccounts);
          provider.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [address]);

  const refreshBalance = useCallback(
    async (addr?: string) => {
      const target = addr ?? address;
      if (!target) return;
      setBalanceLoading(true);
      setBalanceError(null);
      try {
        const balance = await fetchBotBalance(target, currentNetwork.rpcUrls[0]);
        setBotBalance(balance);
      } catch (err: any) {
        setBalanceError(err?.message ?? "Failed to fetch BOT balance");
      } finally {
        setBalanceLoading(false);
      }
    },
    [address, currentNetwork]
  );

  const connect = useCallback(async (walletType?: string) => {
    try {
      const { address: addr, chainId: cId } = await connectEVMWallet(currentNetwork, walletType);
      setAddress(addr);
      setConnected(true);
      setIsDemo(false);
      setChainId(cId);
      toast.success("Wallet connected to BOT Chain!");
      await refreshBalance(addr);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to connect wallet");
      throw err;
    }
  }, [currentNetwork, refreshBalance]);

  const connectDemo = useCallback(async (demoAddr: string = DEMO_WALLET_ADDRESS) => {
    setAddress(demoAddr);
    setConnected(true);
    setIsDemo(true);
    setChainId(BOT_CHAIN_TESTNET.chainIdDecimal);
    setCurrentNetwork(BOT_CHAIN_TESTNET);
    toast.success("Connected to BOT Chain (Demo Account)");
    await refreshBalance(demoAddr);
  }, [refreshBalance]);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
    setBotBalance(null);
    setIsDemo(false);
    setLastTxHash(null);
    setLastTxStatus(null);
    toast("Wallet disconnected");
  }, []);

  const switchNetwork = useCallback(
    async (target: NetworkConfig = BOT_CHAIN_TESTNET) => {
      try {
        if (!isDemo) {
          await switchToBotChain(target);
        }
        setCurrentNetwork(target);
        setChainId(target.chainIdDecimal);
        toast.success(`Switched to ${target.chainName}`);
        if (address) await refreshBalance(address);
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to switch network");
      }
    },
    [address, isDemo, refreshBalance]
  );

  const isBotChain =
    chainId === BOT_CHAIN_TESTNET.chainIdDecimal ||
    chainId === BOT_CHAIN_MAINNET.chainIdDecimal;

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        botBalance,
        injBalance: botBalance, // backward compatibility
        balanceLoading,
        balanceError,
        connect,
        connectDemo,
        isDemo,
        disconnect,
        evmAvailable,
        keplrAvailable: evmAvailable, // backward compatibility
        refreshBalance,
        lastTxHash,
        lastTxStatus,
        setLastTxHash,
        setLastTxStatus,
        chainId,
        isBotChain,
        currentNetwork,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

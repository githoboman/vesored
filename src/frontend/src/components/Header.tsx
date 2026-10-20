import { PanicButton } from "@/components/PanicButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useBeginnerMode } from "@/context/BeginnerModeContext";
import { useWallet } from "@/context/WalletContext";
import {
  BOT_CHAIN_MAINNET,
  BOT_CHAIN_TESTNET,
  getExplorerAddressUrl,
} from "@/lib/botchain";
import {
  AlertCircle,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Globe,
  LogOut,
  RefreshCw,
  Wallet,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function truncateAddress(addr: string): string {
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function Header() {
  const {
    connected,
    address,
    botBalance,
    balanceLoading,
    balanceError,
    connect,
    connectDemo,
    isDemo,
    disconnect,
    evmAvailable,
    refreshBalance,
    currentNetwork,
    switchNetwork,
  } = useWallet();
  const { beginnerMode, setBeginnerMode } = useBeginnerMode();
  const [showModal, setShowModal] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (walletType?: string) => {
    setConnecting(true);
    try {
      if (walletType === "demo") {
        await connectDemo();
        setShowModal(false);
      } else {
        await connect(walletType);
        setShowModal(false);
      }
    } catch {
      // toast already shown in context
    } finally {
      setConnecting(false);
    }
  };

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDisconnect = () => {
    disconnect();
    setShowModal(false);
  };

  const isTestnet = currentNetwork.chainIdDecimal === 968;

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full glass border-b border-white/[0.07]"
        style={{ backdropFilter: "blur(24px) saturate(1.6)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.58 0.24 284), oklch(0.70 0.18 190))",
                  boxShadow: "0 0 16px oklch(0.58 0.24 284 / 0.4)",
                }}
              >
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight gradient-text">
                    Vesored
                  </span>
                  <span
                    className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      background: "oklch(0.60 0.22 180 / 0.15)",
                      color: "oklch(0.75 0.18 180)",
                      border: "1px solid oklch(0.60 0.22 180 / 0.3)",
                    }}
                  >
                    BOT Chain
                  </span>
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Beginner Mode Toggle */}
              <button
                type="button"
                onClick={() => setBeginnerMode(!beginnerMode)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 border transition-all duration-300"
                style={{
                  background: beginnerMode
                    ? "oklch(0.52 0.18 160 / 0.15)"
                    : "oklch(0.10 0.03 265 / 0.6)",
                  borderColor: beginnerMode
                    ? "oklch(0.52 0.18 160 / 0.5)"
                    : "oklch(1 0 0 / 0.1)",
                  boxShadow: beginnerMode
                    ? "0 0 16px oklch(0.52 0.18 160 / 0.3)"
                    : "none",
                }}
                data-ocid="header.beginner_mode_toggle"
                aria-pressed={beginnerMode}
                aria-label="Toggle Beginner Mode"
              >
                <motion.div
                  animate={{ rotate: beginnerMode ? 360 : 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <BookOpen
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{
                      color: beginnerMode
                        ? "oklch(0.72 0.18 160)"
                        : "oklch(0.55 0.05 265)",
                    }}
                  />
                </motion.div>
                <span
                  className="text-xs font-semibold hidden sm:block"
                  style={{
                    color: beginnerMode
                      ? "oklch(0.80 0.16 160)"
                      : "oklch(0.65 0.05 265)",
                  }}
                >
                  Beginner Mode
                </span>
                <div
                  className="relative h-5 w-9 rounded-full transition-all duration-300 flex-shrink-0"
                  style={{
                    background: beginnerMode
                      ? "oklch(0.52 0.18 160)"
                      : "oklch(0.25 0.04 265)",
                    boxShadow: beginnerMode
                      ? "0 0 8px oklch(0.52 0.18 160 / 0.6)"
                      : "none",
                  }}
                >
                  <motion.div
                    className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow"
                    animate={{ x: beginnerMode ? 16 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </div>
              </button>

              {/* Panic Button */}
              <PanicButton />

              {/* Wallet Button */}
              {connected && address ? (
                <Button
                  variant="outline"
                  className="glass rounded-full px-4 font-mono text-xs flex items-center gap-2 border-white/10 hover:border-white/20"
                  onClick={() => setShowModal(true)}
                  data-ocid="header.connected_wallet_button"
                >
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span>{truncateAddress(address)}</span>
                  {isDemo && (
                    <span
                      className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "oklch(0.60 0.22 284 / 0.2)",
                        color: "oklch(0.80 0.18 284)",
                        border: "1px solid oklch(0.60 0.22 284 / 0.35)",
                      }}
                    >
                      Demo
                    </span>
                  )}
                  {balanceLoading ? (
                    <div
                      className="h-3 w-3 animate-spin rounded-full border border-primary border-t-transparent"
                    />
                  ) : botBalance !== null ? (
                    <span
                      className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        background: "oklch(0.60 0.22 180 / 0.15)",
                        color: "oklch(0.75 0.18 180)",
                      }}
                    >
                      {botBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}{" "}
                      {currentNetwork.nativeCurrency.symbol}
                    </span>
                  ) : null}
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              ) : (
                <Button
                  className="rounded-full px-5 font-semibold text-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.22 284), oklch(0.65 0.22 200))",
                    boxShadow: "0 0 20px oklch(0.52 0.22 284 / 0.4)",
                  }}
                  onClick={() => setShowModal(true)}
                  data-ocid="header.connect_wallet_button"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Wallet Management Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent
          className="glass border-white/10 text-foreground"
          style={{ background: "oklch(0.13 0.04 265 / 0.95)" }}
          data-ocid="wallet.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {connected ? "BOT Chain Account" : "Connect EVM Wallet"}
            </DialogTitle>
          </DialogHeader>

          {connected && address ? (
            <div className="space-y-4 py-2">
              {isDemo && (
                <div
                  className="rounded-xl px-3.5 py-2.5 border flex items-center justify-between text-xs"
                  style={{
                    background: "oklch(0.55 0.22 284 / 0.12)",
                    borderColor: "oklch(0.55 0.22 284 / 0.35)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                    <span className="font-semibold text-purple-200">
                      Demo Mode Active
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Connected to Bohr Testnet (Read/Write)
                  </span>
                </div>
              )}

              {/* Address card */}
              <div
                className="rounded-xl p-4 border border-white/10"
                style={{ background: "oklch(0.16 0.05 265 / 0.6)" }}
              >
                <p className="text-xs text-muted-foreground mb-1">
                  Connected Address
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm break-all pr-2">
                    {address}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      data-ocid="wallet.copy_button"
                      title="Copy Address"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={getExplorerAddressUrl(address, isTestnet)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="View on Bohr Explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* BOT Balance section */}
              <div
                className="rounded-xl p-4 border border-white/10"
                style={{ background: "oklch(0.16 0.05 265 / 0.6)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">
                    {currentNetwork.nativeCurrency.name} ({currentNetwork.nativeCurrency.symbol}) Balance
                  </p>
                  <button
                    type="button"
                    onClick={() => refreshBalance()}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="wallet.refresh_balance_button"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </button>
                </div>

                {balanceLoading ? (
                  <div data-ocid="wallet.balance_loading_state">
                    <Skeleton className="h-7 w-36 bg-white/10" />
                  </div>
                ) : balanceError ? (
                  <div
                    className="flex items-center gap-2 text-sm"
                    data-ocid="wallet.balance_error_state"
                  >
                    <AlertCircle
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "oklch(0.65 0.22 25)" }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.22 25)" }}
                    >
                      {balanceError}
                    </span>
                  </div>
                ) : botBalance !== null ? (
                  <p
                    className="text-xl font-bold"
                    style={{ color: "oklch(0.75 0.18 180)" }}
                    data-ocid="wallet.balance_success_state"
                  >
                    {botBalance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })}{" "}
                    {currentNetwork.nativeCurrency.symbol}
                  </p>
                ) : (
                  <p className="text-xl font-bold text-muted-foreground">0.00</p>
                )}
              </div>

              {/* Network Switcher */}
              <div
                className="rounded-xl p-3 border border-white/10 flex items-center justify-between"
                style={{ background: "oklch(0.16 0.05 265 / 0.6)" }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs font-semibold">
                    {currentNetwork.chainName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    (Chain ID {currentNetwork.chainIdDecimal})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    switchNetwork(
                      isTestnet ? BOT_CHAIN_MAINNET : BOT_CHAIN_TESTNET
                    )
                  }
                  className="text-xs px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  Switch to {isTestnet ? "Mainnet" : "Testnet"}
                </button>
              </div>

              {/* Testnet Faucet Link */}
              {isTestnet && (
                <a
                  href="https://faucet.botchain.ai/basic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-primary/30 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Claim Free tBOT from Testnet Faucet
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDisconnect}
                data-ocid="wallet.disconnect_button"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              <p className="text-xs text-muted-foreground">
                Connect your preferred EVM-compatible wallet to interact with BOT Chain.
              </p>

              {[
                {
                  name: "MetaMask",
                  type: "metamask",
                  icon: "🦊",
                  desc: "Browser extension or mobile app",
                },
                {
                  name: "BO Wallet",
                  type: "bo_wallet",
                  icon: "💎",
                  desc: "Official BOT Chain Ecosystem Wallet",
                },
                {
                  name: "Browser EVM Wallet",
                  type: "browser",
                  icon: "⚡",
                  desc: "Rabby, Trust, or Injected Provider",
                },
                {
                  name: "Demo Account",
                  type: "demo",
                  icon: "🚀",
                  desc: "Instant Bohr Testnet Preview (No wallet extension needed)",
                  highlight: true,
                },
              ].map((w) => (
                <button
                  type="button"
                  key={w.name}
                  onClick={() => handleConnect(w.type)}
                  disabled={connecting}
                  className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-sm font-medium transition-all disabled:opacity-50 ${
                    w.highlight
                      ? "border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-400"
                      : "border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                  data-ocid={`wallet.${w.name.toLowerCase().replace(/\s+/g, "_")}_button`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-base"
                      style={{
                        background: w.highlight
                          ? "oklch(0.55 0.22 284 / 0.3)"
                          : "oklch(0.20 0.05 265)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {w.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {w.name}
                        {w.highlight && (
                          <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                            Instant Access
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{w.desc}</div>
                    </div>
                  </div>
                  {connecting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/50 border-t-primary" />
                  ) : (
                    <span className="text-xs text-muted-foreground">→</span>
                  )}
                </button>
              ))}

              <div className="pt-2 text-center text-xs text-muted-foreground space-y-1">
                <p>
                  Need test tokens? Visit the{" "}
                  <a
                    href="https://faucet.botchain.ai/basic"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:opacity-80"
                  >
                    BOT Chain Faucet
                  </a>
                </p>
                <p className="text-[11px] opacity-75">
                  100% EVM Compatible · ~0.75s Block Time · ~$0.06 Gas
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

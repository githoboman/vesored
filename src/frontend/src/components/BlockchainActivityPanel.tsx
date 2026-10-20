import { useBeginnerMode } from "@/context/BeginnerModeContext";
import { useWallet } from "@/context/WalletContext";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Network,
  Shield,
  Wallet,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function truncateAddr(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function truncateHash(hash: string) {
  return `${hash.slice(0, 14)}...${hash.slice(-6)}`;
}

const STATUS_CONFIG = {
  success: {
    label: "Success",
    icon: CheckCircle2,
    color: "oklch(0.72 0.19 145)",
    bg: "oklch(0.72 0.19 145 / 0.12)",
    border: "oklch(0.72 0.19 145 / 0.35)",
  },
  pending: {
    label: "Pending",
    icon: Loader2,
    color: "oklch(0.82 0.17 85)",
    bg: "oklch(0.82 0.17 85 / 0.12)",
    border: "oklch(0.82 0.17 85 / 0.35)",
  },
  preparing: {
    label: "Preparing",
    icon: Loader2,
    color: "oklch(0.68 0.18 284)",
    bg: "oklch(0.68 0.18 284 / 0.12)",
    border: "oklch(0.68 0.18 284 / 0.35)",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    color: "oklch(0.63 0.22 27)",
    bg: "oklch(0.63 0.22 27 / 0.12)",
    border: "oklch(0.63 0.22 27 / 0.35)",
  },
  stoploss: {
    label: "Stop-Loss",
    icon: XCircle,
    color: "oklch(0.82 0.17 85)",
    bg: "oklch(0.82 0.17 85 / 0.12)",
    border: "oklch(0.82 0.17 85 / 0.35)",
  },
};

export function BlockchainActivityPanel() {
  const { connected, address, lastTxHash, lastTxStatus } = useWallet();
  const { beginnerMode } = useBeginnerMode();
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    if (!lastTxHash) return;
    navigator.clipboard.writeText(lastTxHash);
    setCopied(true);
    toast("Transaction hash copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const statusCfg = lastTxStatus ? STATUS_CONFIG[lastTxStatus] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: "oklch(0.11 0.04 265 / 0.72)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid oklch(0.60 0.22 284 / 0.35)",
        boxShadow:
          "0 0 0 1px oklch(0.60 0.22 284 / 0.08), 0 0 32px oklch(0.55 0.22 284 / 0.18), inset 0 1px 0 oklch(1 0 0 / 0.06)",
      }}
      data-ocid="blockchain.panel"
    >
      {/* Glowing top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.65 0.22 284 / 0.8), oklch(0.60 0.20 300 / 0.6), transparent)",
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="p-2 rounded-xl flex-shrink-0"
          style={{
            background: "oklch(0.55 0.22 284 / 0.15)",
            border: "1px solid oklch(0.55 0.22 284 / 0.3)",
            boxShadow: "0 0 12px oklch(0.55 0.22 284 / 0.2)",
          }}
        >
          <Network
            className="h-4 w-4"
            style={{ color: "oklch(0.72 0.20 284)" }}
          />
        </div>
        <div>
          <h2
            className="text-sm font-bold tracking-wide"
            style={{ color: "oklch(0.93 0.04 265)" }}
          >
            {beginnerMode ? "My Trades" : "Blockchain Activity"}
          </h2>
          <p
            className="text-[10px] tracking-wider uppercase"
            style={{ color: "oklch(0.50 0.06 265)" }}
          >
            {beginnerMode ? "Trade history & status" : "Live network status"}
          </p>
        </div>

        {/* Live pulse indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            }}
            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
            style={{
              background: connected
                ? "oklch(0.72 0.19 145)"
                : "oklch(0.50 0.06 265)",
            }}
          />
          <span
            className="text-[10px] font-medium"
            style={{
              color: connected
                ? "oklch(0.72 0.19 145)"
                : "oklch(0.50 0.06 265)",
            }}
          >
            {connected ? "Active" : "Idle"}
          </span>
        </div>
      </div>

      {/* Beginner Mode: simplified summary card */}
      <AnimatePresence>
        {beginnerMode && (
          <motion.div
            key="beginner-blockchain-summary"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="flex items-center gap-3 rounded-xl px-3.5 py-3"
              style={{
                background: "oklch(0.52 0.18 160 / 0.10)",
                border: "1px solid oklch(0.52 0.18 160 / 0.22)",
              }}
            >
              <div
                className="p-2 rounded-lg flex-shrink-0"
                style={{ background: "oklch(0.52 0.18 160 / 0.15)" }}
              >
                <Shield
                  className="h-4 w-4"
                  style={{ color: "oklch(0.72 0.18 160)" }}
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.80 0.16 160)" }}
                >
                  Your trades are being protected
                </p>
                <p
                  className="text-[11px] mt-0.5"
                  style={{ color: "oklch(0.58 0.10 160)" }}
                >
                  Connected to BOT Chain (≈0.75s Finality)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rows */}
      <div className="space-y-2.5">
        {/* Network row */}
        <div
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
          style={{
            background: "oklch(0.08 0.025 265 / 0.6)",
            border: "1px solid oklch(1 0 0 / 0.05)",
          }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: "oklch(0.50 0.06 265)" }}
          >
            {beginnerMode ? "Network" : "Network"}
          </span>
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2.5 }}
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{
                background: "oklch(0.72 0.19 145)",
                boxShadow: "0 0 6px oklch(0.72 0.19 145 / 0.6)",
              }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.88 0.06 265)" }}
            >
              {beginnerMode ? "BOT Chain (Test)" : "BOT Chain Testnet"}
            </span>
          </div>
        </div>

        {/* Wallet address row */}
        <div
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
          style={{
            background: "oklch(0.08 0.025 265 / 0.6)",
            border: "1px solid oklch(1 0 0 / 0.05)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Wallet
              className="h-3 w-3 flex-shrink-0"
              style={{ color: "oklch(0.50 0.06 265)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.50 0.06 265)" }}
            >
              {beginnerMode ? "My Wallet" : "Wallet"}
            </span>
          </div>
          {connected && address ? (
            <span
              className="font-mono text-xs font-semibold"
              style={{ color: "oklch(0.72 0.20 284)" }}
              data-ocid="blockchain.wallet_address"
            >
              {truncateAddr(address)}
            </span>
          ) : (
            <span
              className="text-xs italic"
              style={{ color: "oklch(0.42 0.05 265)" }}
            >
              Not connected
            </span>
          )}
        </div>

        {/* Transaction status row */}
        <div
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
          style={{
            background: "oklch(0.08 0.025 265 / 0.6)",
            border: "1px solid oklch(1 0 0 / 0.05)",
          }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: "oklch(0.50 0.06 265)" }}
          >
            {beginnerMode ? "Last Trade" : "Last Status"}
          </span>
          <AnimatePresence mode="wait">
            {statusCfg ? (
              <motion.div
                key={lastTxStatus}
                initial={{ opacity: 0, scale: 0.85, x: 6 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.85, x: -6 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                style={{
                  background: statusCfg.bg,
                  border: `1px solid ${statusCfg.border}`,
                  color: statusCfg.color,
                }}
                data-ocid="blockchain.tx_status"
              >
                <statusCfg.icon
                  className={`h-3 w-3 flex-shrink-0 ${
                    lastTxStatus === "pending" || lastTxStatus === "preparing"
                      ? "animate-spin"
                      : ""
                  }`}
                />
                {statusCfg.label}
              </motion.div>
            ) : (
              <motion.span
                key="no-tx"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs italic"
                style={{ color: "oklch(0.42 0.05 265)" }}
              >
                {beginnerMode ? "No trades yet" : "No transactions yet"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Transaction hash row — simplified label in beginner mode */}
        <div
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
          style={{
            background: "oklch(0.08 0.025 265 / 0.6)",
            border: "1px solid oklch(1 0 0 / 0.05)",
          }}
        >
          <span
            className="text-xs font-medium"
            style={{ color: "oklch(0.50 0.06 265)" }}
          >
            {beginnerMode ? "Trade ID" : "Tx Hash"}
          </span>
          <AnimatePresence mode="wait">
            {lastTxHash ? (
              <motion.button
                key="hash"
                type="button"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                onClick={copyHash}
                className="flex items-center gap-1.5 group rounded-lg px-2 py-1 -mr-1 transition-colors hover:brightness-110"
                style={{
                  background: copied
                    ? "oklch(0.72 0.19 145 / 0.1)"
                    : "transparent",
                }}
                title={
                  beginnerMode
                    ? "Click to copy trade ID"
                    : "Click to copy full hash"
                }
                data-ocid="blockchain.tx_hash_button"
              >
                <span
                  className="font-mono text-xs"
                  style={{ color: "oklch(0.72 0.20 284)" }}
                >
                  {truncateHash(lastTxHash)}
                </span>
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ duration: 0.15 }}
                      className="text-[10px] font-bold"
                      style={{ color: "oklch(0.72 0.19 145)" }}
                    >
                      Copied!
                    </motion.span>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Copy
                        className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity"
                        style={{ color: "oklch(0.72 0.20 284)" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : (
              <motion.span
                key="no-hash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs"
                style={{ color: "oklch(0.42 0.05 265)" }}
              >
                --
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

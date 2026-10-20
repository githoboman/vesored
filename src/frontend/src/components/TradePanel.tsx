import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBeginnerMode } from "@/context/BeginnerModeContext";
import { useTradeInsight } from "@/context/TradeInsightContext";
import { useTradeRisk } from "@/context/TradeRiskContext";
import { useWallet } from "@/context/WalletContext";
import { useAddTransaction } from "@/hooks/useQueries";
import { analyzeTradeRisk } from "@/utils/riskAnalysis";
import { generateTradeInsight } from "@/utils/tradeInsight";
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  CheckCircle2,
  Copy,
  Info,
  Loader2,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TransactionType } from "../backend.d";

type TradeStatus =
  | null
  | "preparing"
  | "pending"
  | "success"
  | "failed"
  | "stoploss";

function truncateAddr(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

function genTxHash() {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

const RISK_COLORS = {
  Low: "oklch(0.72 0.19 145)",
  Medium: "oklch(0.82 0.17 85)",
  High: "oklch(0.63 0.22 27)",
};

const RISK_BG = {
  Low: "oklch(0.72 0.19 145 / 0.12)",
  Medium: "oklch(0.82 0.17 85 / 0.12)",
  High: "oklch(0.63 0.22 27 / 0.12)",
};

const RISK_BORDER = {
  Low: "oklch(0.72 0.19 145 / 0.35)",
  Medium: "oklch(0.82 0.17 85 / 0.35)",
  High: "oklch(0.63 0.22 27 / 0.35)",
};

// Safe suggested amounts per asset (in coins, not USD)
const SAFE_AMOUNTS: Record<string, { amount: number; usd: number }> = {
  BOT: { amount: 65, usd: 50 },
  BTC: { amount: 0.0008, usd: 50 },
  ETH: { amount: 0.015, usd: 50 },
  SOL: { amount: 0.33, usd: 50 },
};

function BeginnerHelperText({ text }: { text: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-center gap-1 mt-1 text-[11px]"
      style={{ color: "oklch(0.62 0.12 160)" }}
    >
      <Info className="h-3 w-3 flex-shrink-0" />
      {text}
    </motion.p>
  );
}

export function TradePanel() {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState("BTC");
  const [tradeStatus, setTradeStatus] = useState<TradeStatus>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [stopLossInput, setStopLossInput] = useState("");
  const [showHighRiskDialog, setShowHighRiskDialog] = useState(false);
  const { mutateAsync, isPending } = useAddTransaction();
  const { connected, address, setLastTxHash, setLastTxStatus } = useWallet();
  const { setLatestInsight } = useTradeInsight();
  const {
    setTradeInput,
    priceChanges,
    safeMode,
    setSafeMode,
    setStopLossPercent,
    stopLossPercent,
  } = useTradeRisk();
  const { beginnerMode } = useBeginnerMode();

  const PRICES: Record<string, number> = {
    BTC: 65420,
    ETH: 3280.5,
    SOL: 148.3,
  };
  const price = PRICES[asset] ?? 0;
  const amountNum = Number.parseFloat(amount) || 0;
  const total = amountNum * price;
  const fee = total * 0.003;
  const priceChange = priceChanges[asset] ?? 0;

  // Sync stop-loss to context
  useEffect(() => {
    const val = Number.parseFloat(stopLossInput);
    if (stopLossInput && !Number.isNaN(val) && val > 0) {
      setStopLossPercent(val);
    } else {
      setStopLossPercent(null);
    }
  }, [stopLossInput, setStopLossPercent]);

  // Sync trade input into context
  useEffect(() => {
    if (amountNum > 0) {
      setTradeInput({ asset, amountUSD: total, priceChange, side });
    } else {
      setTradeInput(null);
    }
  }, [asset, amountNum, total, priceChange, side, setTradeInput]);

  // Stop-loss simulation
  useEffect(() => {
    if (!stopLossPercent || tradeStatus !== "success") return;
    const delay = 8000 + Math.random() * 7000;
    const timeout = setTimeout(() => {
      if (Math.random() < 0.3) {
        toast.warning(
          `⚠ Stop-loss triggered! Auto-selling ${asset} at ${stopLossPercent}% loss.`,
        );
        setTradeStatus("stoploss");
        setLastTxStatus("stoploss");
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [tradeStatus, stopLossPercent, asset, setLastTxStatus]);

  const riskResult =
    amountNum > 0
      ? analyzeTradeRisk({ asset, amountUSD: total, priceChange, side })
      : null;

  // In beginner mode, Medium risk is treated as High
  const effectiveRiskLevel =
    beginnerMode && riskResult?.level === "Medium" ? "High" : riskResult?.level;

  // Trade Outcome Simulator calculations
  const possibleGain = total * 0.05;
  const possibleLoss = total * 0.05;
  const confidenceBase =
    !riskResult || riskResult.level === "Low"
      ? 78
      : riskResult.level === "Medium"
        ? 55
        : 35;
  const confidence = Math.round(confidenceBase + ((amountNum * 7) % 7) - 3);
  const confidenceColor =
    confidence >= 70
      ? "oklch(0.72 0.19 145)"
      : confidence >= 50
        ? "oklch(0.82 0.17 85)"
        : "oklch(0.72 0.20 27)";

  const executeTrade = async () => {
    setTxHash(null);
    setLastTxHash(null);
    setTradeStatus("preparing");
    setLastTxStatus("preparing");
    toast("Submitting transaction to BOT Chain (≈0.75s finality)...");

    await new Promise((r) => setTimeout(r, 800));
    setTradeStatus("pending");
    setLastTxStatus("pending");

    await new Promise((r) => setTimeout(r, 1200));

    const success = Math.random() < 0.98;
    if (success) {
      const hash = genTxHash();
      setTxHash(hash);
      setLastTxHash(hash);
      setTradeStatus("success");
      setLastTxStatus("success");
      try {
        await mutateAsync({
          asset,
          amount: amountNum,
          transactionType:
            side === "buy" ? TransactionType.buy : TransactionType.sell,
        });
      } catch {
        // backend record failure is non-critical
      }
      toast.success(
        `${side === "buy" ? "Bought" : "Sold"} ${amountNum} ${asset} successfully!`,
      );
      setAmount("");
      setLatestInsight(
        generateTradeInsight({
          asset,
          direction: side,
          amount: amountNum,
          riskScore: (riskResult?.level ?? "Medium") as
            | "Low"
            | "Medium"
            | "High",
          outcome: "success",
          price,
        }),
      );
    } else {
      setTxHash(null);
      setLastTxHash(null);
      setTradeStatus("failed");
      setLastTxStatus("failed");
      toast.error("Transaction failed. Please try again.");
      setLatestInsight(
        generateTradeInsight({
          asset,
          direction: side,
          amount: amountNum,
          riskScore: (riskResult?.level ?? "Medium") as
            | "Low"
            | "Medium"
            | "High",
          outcome: "failed",
          price,
        }),
      );
    }
  };

  const handleSubmit = async () => {
    if (!amountNum || amountNum <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!connected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    // Safe mode blocks high-risk trades (using effective level in beginner mode)
    if (safeMode && effectiveRiskLevel === "High") {
      toast.error("Safe Mode is ON — high-risk trades are blocked.");
      return;
    }

    // Show confirmation dialog for high-risk trades (using effective level)
    if (effectiveRiskLevel === "High") {
      setShowHighRiskDialog(true);
      return;
    }

    await executeTrade();
  };

  const copyHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      toast("Transaction hash copied!");
    }
  };

  const isSubmitting =
    tradeStatus === "preparing" || tradeStatus === "pending" || isPending;

  const safeAmt = SAFE_AMOUNTS[asset];

  return (
    <TooltipProvider>
      <div
        className="glass glass-hover glow-violet rounded-2xl p-6 animate-fade-in-up delay-200"
        data-ocid="trade.panel"
      >
        {/* Beginner Mode guidance banner */}
        <AnimatePresence>
          {beginnerMode && (
            <motion.div
              key="beginner-guide"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-start gap-2.5 rounded-xl p-3"
                style={{
                  background: "oklch(0.52 0.18 160 / 0.10)",
                  border: "1px solid oklch(0.52 0.18 160 / 0.25)",
                }}
              >
                <BookOpen
                  className="h-4 w-4 flex-shrink-0 mt-0.5"
                  style={{ color: "oklch(0.72 0.18 160)" }}
                />
                <div>
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.80 0.16 160)" }}
                  >
                    Beginner Mode
                  </p>
                  <p
                    className="text-[11px] mt-0.5"
                    style={{ color: "oklch(0.62 0.10 160)" }}
                  >
                    We've simplified this panel for you. Safe amounts are
                    suggested and medium-risk trades require confirmation.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Safe Mode Toggle */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold">Trade</h2>
          <motion.div
            className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 border"
            style={{
              background: safeMode
                ? "oklch(0.72 0.19 145 / 0.12)"
                : "oklch(0.10 0.03 265 / 0.6)",
              borderColor: safeMode
                ? "oklch(0.72 0.19 145 / 0.4)"
                : "oklch(1 0 0 / 0.1)",
              boxShadow: safeMode
                ? "0 0 12px oklch(0.72 0.19 145 / 0.2)"
                : "none",
            }}
            animate={{ scale: safeMode ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {safeMode ? (
              <ShieldCheck
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ color: "oklch(0.72 0.19 145)" }}
              />
            ) : (
              <Shield
                className="h-3.5 w-3.5 flex-shrink-0"
                style={{ color: "oklch(0.55 0.05 265)" }}
              />
            )}
            <span
              className="text-xs font-medium"
              style={{
                color: safeMode
                  ? "oklch(0.72 0.19 145)"
                  : "oklch(0.65 0.05 265)",
              }}
            >
              {beginnerMode ? "Auto-Protection (Safe Mode)" : "Safe Mode"}
            </span>
            <Switch
              checked={safeMode}
              onCheckedChange={setSafeMode}
              data-ocid="trade.safe_mode_switch"
              className="scale-75"
            />
            <AnimatePresence>
              {safeMode && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, x: -4 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: -4 }}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.72 0.19 145 / 0.2)",
                    color: "oklch(0.72 0.19 145)",
                    border: "1px solid oklch(0.72 0.19 145 / 0.4)",
                  }}
                >
                  Protected
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div
          className="flex rounded-xl overflow-hidden mb-5 border border-white/10"
          style={{ background: "oklch(0.10 0.03 265 / 0.6)" }}
        >
          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
            style={{
              background:
                side === "buy"
                  ? "linear-gradient(135deg, oklch(0.52 0.22 284), oklch(0.60 0.22 284))"
                  : "transparent",
              color: side === "buy" ? "white" : "oklch(0.65 0.05 265)",
              boxShadow:
                side === "buy" ? "0 0 16px oklch(0.52 0.22 284 / 0.4)" : "none",
            }}
            onClick={() => setSide("buy")}
            data-ocid="trade.buy_toggle"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {beginnerMode ? "Buy (Invest)" : "Buy"}
          </button>
          <button
            type="button"
            className="flex-1 py-2.5 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-1.5"
            style={{
              background:
                side === "sell" ? "oklch(0.63 0.22 27 / 0.8)" : "transparent",
              color: side === "sell" ? "white" : "oklch(0.65 0.05 265)",
              boxShadow:
                side === "sell"
                  ? "0 0 16px oklch(0.63 0.22 27 / 0.35)"
                  : "none",
            }}
            onClick={() => setSide("sell")}
            data-ocid="trade.sell_toggle"
          >
            <TrendingDown className="h-3.5 w-3.5" />
            {beginnerMode ? "Sell (Cash Out)" : "Sell"}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Asset
            </Label>
            <Select value={asset} onValueChange={setAsset}>
              <SelectTrigger
                className="border-white/10 bg-white/5 text-foreground"
                data-ocid="trade.asset_select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "oklch(0.15 0.045 265)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                }}
              >
                <SelectItem value="BOT">BOT Token (BOT)</SelectItem>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="SOL">Solana (SOL)</SelectItem>
              </SelectContent>
            </Select>
            <AnimatePresence>
              {beginnerMode && (
                <BeginnerHelperText text="Choose which cryptocurrency you want to trade" />
              )}
            </AnimatePresence>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Amount
            </Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground text-lg font-semibold"
              data-ocid="trade.amount_input"
            />
            <AnimatePresence>
              {beginnerMode && (
                <BeginnerHelperText text="Enter how many coins you want to buy or sell" />
              )}
            </AnimatePresence>

            {/* Safe Amount Suggestion (Beginner Mode) */}
            <AnimatePresence>
              {beginnerMode && safeAmt && (
                <motion.div
                  key="safe-amt"
                  initial={{ opacity: 0, y: -6, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -6, height: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                  className="overflow-hidden mt-2"
                >
                  <button
                    type="button"
                    onClick={() => setAmount(safeAmt.amount.toString())}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 transition-all hover:brightness-110"
                    style={{
                      background: "oklch(0.52 0.18 160 / 0.12)",
                      border: "1px solid oklch(0.52 0.18 160 / 0.30)",
                    }}
                    data-ocid="trade.safe_amount_button"
                  >
                    <div className="flex items-center gap-2">
                      <Shield
                        className="h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: "oklch(0.72 0.18 160)" }}
                      />
                      <div className="text-left">
                        <span
                          className="text-xs font-semibold block"
                          style={{ color: "oklch(0.80 0.16 160)" }}
                        >
                          Suggested safe amount
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "oklch(0.62 0.10 160)" }}
                        >
                          Recommended for beginners
                        </span>
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold font-mono"
                      style={{ color: "oklch(0.78 0.16 160)" }}
                    >
                      {safeAmt.amount} {asset}
                      <span
                        className="text-[10px] font-normal ml-1"
                        style={{ color: "oklch(0.60 0.10 160)" }}
                      >
                        (~${safeAmt.usd})
                      </span>
                    </span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stop-Loss Input — hidden in beginner mode, replaced by summary */}
          <AnimatePresence>
            {amountNum > 0 && !beginnerMode && (
              <motion.div
                key="stop-loss"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Stop-Loss (%)
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info
                        className="h-3 w-3 cursor-help"
                        style={{ color: "oklch(0.55 0.05 265)" }}
                      />
                    </TooltipTrigger>
                    <TooltipContent
                      style={{
                        background: "oklch(0.15 0.045 265)",
                        border: "1px solid oklch(1 0 0 / 0.15)",
                        color: "oklch(0.85 0.04 265)",
                      }}
                    >
                      Auto-sell if price drops by this %
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="e.g. 5"
                    value={stopLossInput}
                    onChange={(e) => setStopLossInput(e.target.value)}
                    className="border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground pr-20"
                    data-ocid="trade.stop_loss_input"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                    style={{ color: "oklch(0.55 0.05 265)" }}
                  >
                    %
                  </span>
                </div>
                <AnimatePresence>
                  {stopLossPercent !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="mt-2 flex items-center gap-1.5"
                    >
                      <motion.span
                        animate={{ opacity: [1, 0.6, 1] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 2,
                        }}
                        className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: "oklch(0.82 0.17 85 / 0.15)",
                          color: "oklch(0.82 0.17 85)",
                          border: "1px solid oklch(0.82 0.17 85 / 0.4)",
                        }}
                        data-ocid="trade.stop_loss_badge"
                      >
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Stop-Loss Active at {stopLossPercent}%
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Beginner Mode: simplified protection summary */}
          <AnimatePresence>
            {amountNum > 0 && beginnerMode && (
              <motion.div
                key="beginner-protection"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-3"
                  style={{
                    background: "oklch(0.52 0.18 160 / 0.08)",
                    border: "1px solid oklch(0.52 0.18 160 / 0.20)",
                  }}
                >
                  <ShieldCheck
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: "oklch(0.72 0.18 160)" }}
                  />
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.80 0.16 160)" }}
                    >
                      Your trades are being protected
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: "oklch(0.58 0.10 160)" }}
                    >
                      Auto-protection watches for large losses and alerts you
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {amountNum > 0 && (
            <div
              className="rounded-xl border border-white/10 p-3 space-y-1.5 text-sm"
              style={{ background: "oklch(0.10 0.03 265 / 0.5)" }}
            >
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">${price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-medium">
                  $
                  {total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/[0.06] pt-1.5">
                <span className="text-muted-foreground">Est. Fee (0.3%)</span>
                <span className="font-medium text-warning">
                  ${fee.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Trade Outcome Simulator */}
          <AnimatePresence>
            {amountNum > 0 && (
              <motion.div
                key="outcome-simulator"
                initial={{ opacity: 0, scale: 0.97, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-xl border p-3.5 space-y-3"
                style={{
                  background: "oklch(0.10 0.04 265 / 0.6)",
                  borderColor: "oklch(1 0 0 / 0.10)",
                }}
                data-ocid="trade.outcome_simulator"
              >
                {/* Title row */}
                <div className="flex items-center gap-1.5">
                  <BarChart2
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: "oklch(0.65 0.12 265)" }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "oklch(0.55 0.06 265)" }}
                  >
                    Trade Outcome Simulator
                  </span>
                </div>

                {/* Loss / Gain columns */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="rounded-lg px-3 py-2.5 space-y-0.5"
                    style={{
                      background: "oklch(0.72 0.20 27 / 0.07)",
                      border: "1px solid oklch(0.72 0.20 27 / 0.18)",
                    }}
                  >
                    <p
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: "oklch(0.60 0.10 27)" }}
                    >
                      Possible Loss
                    </p>
                    <p
                      className="text-sm font-bold font-mono"
                      style={{ color: "oklch(0.72 0.20 27)" }}
                    >
                      -$
                      {possibleLoss.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "oklch(0.52 0.08 27)" }}
                    >
                      −5% scenario
                    </p>
                  </div>

                  <div
                    className="rounded-lg px-3 py-2.5 space-y-0.5"
                    style={{
                      background: "oklch(0.72 0.19 145 / 0.07)",
                      border: "1px solid oklch(0.72 0.19 145 / 0.18)",
                    }}
                  >
                    <p
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: "oklch(0.60 0.10 145)" }}
                    >
                      Possible Gain
                    </p>
                    <p
                      className="text-sm font-bold font-mono"
                      style={{ color: "oklch(0.72 0.19 145)" }}
                    >
                      +$
                      {possibleGain.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "oklch(0.52 0.08 145)" }}
                    >
                      +5% scenario
                    </p>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: "oklch(0.55 0.06 265)" }}
                    >
                      Confidence
                    </span>
                    <span
                      className="text-xs font-bold font-mono"
                      style={{ color: confidenceColor }}
                    >
                      {confidence}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full rounded-full overflow-hidden"
                    style={{ background: "oklch(0.20 0.04 265 / 0.6)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: confidenceColor }}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <p
                    className="text-[10px]"
                    style={{ color: "oklch(0.48 0.05 265)" }}
                  >
                    Based on current risk analysis and market conditions
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* AI Risk Analysis */}
          <AnimatePresence>
            {riskResult && (
              <motion.div
                key="risk-analysis"
                initial={{ opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="rounded-xl border p-3.5"
                style={{
                  background: RISK_BG[riskResult.level],
                  borderColor: RISK_BORDER[riskResult.level],
                  boxShadow:
                    effectiveRiskLevel === "High"
                      ? "0 0 18px oklch(0.63 0.22 27 / 0.25)"
                      : "none",
                }}
                data-ocid="trade.risk_panel"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{ color: RISK_COLORS[riskResult.level] }}
                  />
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: RISK_COLORS[riskResult.level] }}
                  >
                    {beginnerMode ? "Trade Safety Check" : "AI Risk Analysis"}
                  </span>

                  <span
                    className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: RISK_BG[riskResult.level],
                      color: RISK_COLORS[riskResult.level],
                      border: `1px solid ${RISK_BORDER[riskResult.level]}`,
                      ...(effectiveRiskLevel === "High"
                        ? {
                            animation:
                              "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                          }
                        : {}),
                    }}
                    data-ocid="trade.risk_badge"
                  >
                    {riskResult.level}
                    {beginnerMode &&
                      riskResult.level === "Low" &&
                      " — Safe to trade"}
                  </span>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "oklch(0.80 0.04 265)" }}
                >
                  {riskResult.explanation}
                </p>

                {/* Beginner mode: medium treated as high notice */}
                <AnimatePresence>
                  {beginnerMode && riskResult.level === "Medium" && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg"
                      style={{
                        background: "oklch(0.63 0.22 27 / 0.1)",
                        border: "1px solid oklch(0.63 0.22 27 / 0.3)",
                        color: "oklch(0.63 0.22 27)",
                      }}
                      data-ocid="trade.beginner_medium_notice"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      Medium risk is treated as High in Beginner Mode
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Safe mode blocked indicator */}
                {safeMode && effectiveRiskLevel === "High" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg"
                    style={{
                      background: "oklch(0.72 0.19 145 / 0.1)",
                      border: "1px solid oklch(0.72 0.19 145 / 0.3)",
                      color: "oklch(0.72 0.19 145)",
                    }}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {beginnerMode
                      ? "Auto-protection will block this trade"
                      : "Safe Mode will block this trade"}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            className="w-full py-6 text-base font-bold rounded-xl"
            style={{
              background:
                safeMode && effectiveRiskLevel === "High"
                  ? "oklch(0.35 0.05 265)"
                  : side === "buy"
                    ? "linear-gradient(135deg, oklch(0.52 0.22 284), oklch(0.60 0.22 284))"
                    : "oklch(0.63 0.22 27 / 0.9)",
              boxShadow:
                safeMode && effectiveRiskLevel === "High"
                  ? "none"
                  : side === "buy"
                    ? "0 0 24px oklch(0.52 0.22 284 / 0.4)"
                    : "0 0 24px oklch(0.63 0.22 27 / 0.3)",
            }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            data-ocid="trade.submit_button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tradeStatus === "preparing" ? "Preparing..." : "Executing..."}
              </>
            ) : safeMode && effectiveRiskLevel === "High" ? (
              <>
                <Shield className="mr-2 h-4 w-4" />
                {beginnerMode ? "Blocked (Too Risky)" : "Blocked by Safe Mode"}
              </>
            ) : (
              `${side === "buy" ? "Buy" : "Sell"} ${asset}`
            )}
          </Button>

          {/* Transaction Status Panel */}
          <AnimatePresence>
            {tradeStatus && (
              <motion.div
                key={tradeStatus}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-xl border p-4 space-y-3 text-sm"
                style={{
                  background: "oklch(0.11 0.035 265 / 0.7)",
                  backdropFilter: "blur(12px)",
                  borderColor:
                    tradeStatus === "success"
                      ? "oklch(0.72 0.19 145 / 0.4)"
                      : tradeStatus === "failed"
                        ? "oklch(0.63 0.22 27 / 0.4)"
                        : tradeStatus === "stoploss"
                          ? "oklch(0.82 0.17 85 / 0.5)"
                          : tradeStatus === "pending"
                            ? "oklch(0.78 0.18 80 / 0.4)"
                            : "oklch(0.52 0.22 284 / 0.35)",
                }}
                data-ocid={`trade.${tradeStatus}_state`}
              >
                {tradeStatus === "preparing" && (
                  <>
                    <div className="flex items-center gap-2.5">
                      <Loader2
                        className="h-4 w-4 animate-spin flex-shrink-0"
                        style={{ color: "oklch(0.68 0.18 284)" }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: "oklch(0.88 0.08 265)" }}
                      >
                        {beginnerMode
                          ? "Setting up your trade..."
                          : "Submitting transaction to BOT Chain..."}
                      </span>
                    </div>
                    {address && (
                      <div
                        className="rounded-lg px-3 py-2 flex items-center justify-between"
                        style={{ background: "oklch(0.08 0.025 265 / 0.6)" }}
                      >
                        <span className="text-muted-foreground text-xs">
                          Wallet
                        </span>
                        <span
                          className="font-mono text-xs"
                          style={{ color: "oklch(0.72 0.14 284)" }}
                        >
                          {truncateAddr(address)}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {tradeStatus === "pending" && (
                  <>
                    <div className="flex items-center gap-2.5">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-t-transparent"
                        style={{
                          borderColor: "oklch(0.78 0.18 80)",
                          borderTopColor: "transparent",
                        }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: "oklch(0.88 0.08 265)" }}
                      >
                        {beginnerMode
                          ? "Processing your trade..."
                          : "Transaction Pending..."}
                      </span>
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "oklch(0.78 0.18 80 / 0.15)",
                          color: "oklch(0.78 0.18 80)",
                        }}
                      >
                        PENDING
                      </span>
                    </div>
                    <div
                      className="rounded-lg px-3 py-2 space-y-1"
                      style={{ background: "oklch(0.08 0.025 265 / 0.6)" }}
                    >
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {beginnerMode ? "Action" : "Side"}
                        </span>
                        <span
                          className="font-semibold uppercase"
                          style={{
                            color:
                              side === "buy"
                                ? "oklch(0.68 0.18 284)"
                                : "oklch(0.72 0.20 27)",
                          }}
                        >
                          {side}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-mono">
                          {amountNum} {asset}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Value</span>
                        <span className="font-mono">
                          $
                          {total.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {tradeStatus === "success" && (
                  <>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: "oklch(0.72 0.19 145)" }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: "oklch(0.88 0.08 265)" }}
                      >
                        {beginnerMode
                          ? "Trade Completed! 🎉"
                          : "Transaction Successful"}
                      </span>
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "oklch(0.72 0.19 145 / 0.15)",
                          color: "oklch(0.72 0.19 145)",
                        }}
                      >
                        SUCCESS
                      </span>
                    </div>
                    {txHash && (
                      <button
                        type="button"
                        onClick={copyHash}
                        className="w-full rounded-lg px-3 py-2 flex items-center justify-between gap-2 transition-colors hover:brightness-110"
                        style={{ background: "oklch(0.08 0.025 265 / 0.6)" }}
                        title="Copy transaction hash"
                        data-ocid="trade.tx_hash_button"
                      >
                        <span className="text-muted-foreground text-xs">
                          {beginnerMode ? "Trade ID" : "Tx Hash"}
                        </span>
                        <span
                          className="font-mono text-xs flex items-center gap-1.5"
                          style={{ color: "oklch(0.72 0.19 145)" }}
                        >
                          {txHash}
                          <Copy className="h-3 w-3 opacity-60" />
                        </span>
                      </button>
                    )}
                    <div
                      className="rounded-lg px-3 py-2 space-y-1"
                      style={{ background: "oklch(0.08 0.025 265 / 0.6)" }}
                    >
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {beginnerMode ? "Action" : "Side"}
                        </span>
                        <span
                          className="font-semibold uppercase"
                          style={{
                            color:
                              side === "buy"
                                ? "oklch(0.68 0.18 284)"
                                : "oklch(0.72 0.20 27)",
                          }}
                        >
                          {side}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Amount</span>
                        <span className="font-mono">
                          {amountNum} {asset}
                        </span>
                      </div>
                    </div>
                    {stopLossPercent && (
                      <div
                        className="flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg"
                        style={{
                          background: "oklch(0.82 0.17 85 / 0.1)",
                          border: "1px solid oklch(0.82 0.17 85 / 0.3)",
                          color: "oklch(0.82 0.17 85)",
                        }}
                      >
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        Monitoring for stop-loss at {stopLossPercent}% drop
                      </div>
                    )}
                  </>
                )}

                {tradeStatus === "failed" && (
                  <>
                    <div className="flex items-center gap-2.5">
                      <XCircle
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: "oklch(0.63 0.22 27)" }}
                      />
                      <span
                        className="font-semibold"
                        style={{ color: "oklch(0.88 0.08 265)" }}
                      >
                        {beginnerMode
                          ? "Trade Didn't Go Through"
                          : "Transaction Failed"}
                      </span>
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "oklch(0.63 0.22 27 / 0.15)",
                          color: "oklch(0.63 0.22 27)",
                        }}
                      >
                        FAILED
                      </span>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.05 265)" }}
                    >
                      {beginnerMode
                        ? "Don't worry — no funds were moved. Check your wallet is connected and try again."
                        : "The transaction could not be processed. Please check your balance and try again."}
                    </p>
                  </>
                )}

                {tradeStatus === "stoploss" && (
                  <>
                    <div className="flex items-center gap-2.5">
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ repeat: 3, duration: 0.4 }}
                      >
                        <AlertTriangle
                          className="h-5 w-5 flex-shrink-0"
                          style={{ color: "oklch(0.82 0.17 85)" }}
                        />
                      </motion.div>
                      <span
                        className="font-semibold"
                        style={{ color: "oklch(0.88 0.08 265)" }}
                      >
                        {beginnerMode
                          ? "Auto-Protection Triggered"
                          : "Stop-Loss Triggered"}
                      </span>
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: "oklch(0.82 0.17 85 / 0.15)",
                          color: "oklch(0.82 0.17 85)",
                          border: "1px solid oklch(0.82 0.17 85 / 0.4)",
                        }}
                      >
                        AUTO-SELL
                      </span>
                    </div>
                    <div
                      className="rounded-lg px-3 py-2 space-y-1"
                      style={{ background: "oklch(0.08 0.025 265 / 0.6)" }}
                    >
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Asset</span>
                        <span className="font-mono font-semibold">{asset}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Threshold</span>
                        <span
                          className="font-semibold"
                          style={{ color: "oklch(0.82 0.17 85)" }}
                        >
                          -{stopLossPercent}%
                        </span>
                      </div>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.65 0.05 265)" }}
                    >
                      {beginnerMode
                        ? "Your auto-protection sold your position to limit losses. This is normal and helps keep you safe."
                        : `Your stop-loss protection auto-sold ${asset} to limit losses. Position closed.`}
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* High Risk Confirmation Dialog */}
      <AlertDialog
        open={showHighRiskDialog}
        onOpenChange={setShowHighRiskDialog}
      >
        <AlertDialogContent
          style={{
            background: "oklch(0.12 0.04 265)",
            border: "1px solid oklch(0.63 0.22 27 / 0.5)",
            boxShadow: "0 0 40px oklch(0.63 0.22 27 / 0.2)",
          }}
          data-ocid="trade.high_risk_dialog"
        >
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="p-2.5 rounded-xl"
                style={{ background: "oklch(0.63 0.22 27 / 0.15)" }}
              >
                <AlertTriangle
                  className="h-5 w-5"
                  style={{ color: "oklch(0.63 0.22 27)" }}
                />
              </div>
              <AlertDialogTitle
                className="text-lg font-bold"
                style={{ color: "oklch(0.92 0.05 265)" }}
              >
                {beginnerMode ? "This Trade Has Risk" : "High Risk Trade"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription
              className="text-sm leading-relaxed"
              style={{ color: "oklch(0.70 0.05 265)" }}
            >
              {beginnerMode
                ? "As a beginner, we recommend skipping this trade. This trade has a higher chance of loss. Are you sure you want to continue?"
                : "This trade is risky. Do you want to continue?"}
              {riskResult && (
                <span
                  className="block mt-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: "oklch(0.63 0.22 27 / 0.1)",
                    border: "1px solid oklch(0.63 0.22 27 / 0.25)",
                    color: "oklch(0.75 0.08 265)",
                  }}
                >
                  {riskResult.explanation}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-2">
            <AlertDialogCancel
              className="flex-1 border-white/15 bg-white/5 text-foreground hover:bg-white/10"
              data-ocid="trade.high_risk_cancel_button"
            >
              {beginnerMode ? "Skip This Trade" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 font-semibold"
              style={{
                background: "oklch(0.63 0.22 27)",
                color: "white",
                boxShadow: "0 0 16px oklch(0.63 0.22 27 / 0.4)",
              }}
              onClick={async () => {
                setShowHighRiskDialog(false);
                await executeTrade();
              }}
              data-ocid="trade.high_risk_confirm_button"
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

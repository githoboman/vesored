import { useBeginnerMode } from "@/context/BeginnerModeContext";
import { useTradeRisk } from "@/context/TradeRiskContext";
import { useRiskScore } from "@/hooks/useQueries";
import { analyzeTradeRisk } from "@/utils/riskAnalysis";
import {
  AlertOctagon,
  AlertTriangle,
  BookOpen,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type RiskLevel = "low" | "medium" | "high";

const RISK_CONFIG: Record<
  RiskLevel,
  {
    label: string;
    color: string;
    bgColor: string;
    glowClass: string;
    icon: React.ElementType;
    description: string;
    beginnerDescription: string;
  }
> = {
  low: {
    label: "Low Risk",
    color: "oklch(0.70 0.17 145)",
    bgColor: "oklch(0.70 0.17 145 / 0.12)",
    glowClass: "glow-green",
    icon: Shield,
    description:
      "Market conditions are stable. Your portfolio is well-diversified with minimal exposure to volatile assets.",
    beginnerDescription:
      "The market looks calm right now — a good time for beginners to consider small, careful trades.",
  },
  medium: {
    label: "Medium Risk",
    color: "oklch(0.82 0.17 85)",
    bgColor: "oklch(0.82 0.17 85 / 0.12)",
    glowClass: "glow-amber",
    icon: AlertTriangle,
    description:
      "Moderate market volatility detected. Consider rebalancing your portfolio to reduce concentrated positions.",
    beginnerDescription:
      "The market has some ups and downs. As a beginner, consider waiting for calmer conditions.",
  },
  high: {
    label: "High Risk",
    color: "oklch(0.63 0.22 27)",
    bgColor: "oklch(0.63 0.22 27 / 0.12)",
    glowClass: "glow-red",
    icon: AlertOctagon,
    description:
      "Elevated market risk detected. High volatility and correlation across assets. Review exposure immediately.",
    beginnerDescription:
      "The market is very unpredictable right now. We recommend waiting before placing trades.",
  },
};

const TRADE_RISK_CONFIG: Record<
  "Low" | "Medium" | "High",
  { level: RiskLevel; color: string; bgColor: string; icon: React.ElementType }
> = {
  Low: {
    level: "low",
    color: "oklch(0.70 0.17 145)",
    bgColor: "oklch(0.70 0.17 145 / 0.12)",
    icon: Shield,
  },
  Medium: {
    level: "medium",
    color: "oklch(0.82 0.17 85)",
    bgColor: "oklch(0.82 0.17 85 / 0.12)",
    icon: AlertTriangle,
  },
  High: {
    level: "high",
    color: "oklch(0.63 0.22 27)",
    bgColor: "oklch(0.63 0.22 27 / 0.12)",
    icon: AlertOctagon,
  },
};

function getRiskLevel(score: number): RiskLevel {
  if (score < 40) return "low";
  if (score < 70) return "medium";
  return "high";
}

export function RiskScore() {
  const { data: rawScore } = useRiskScore();
  const score = rawScore ?? 42;
  const level = getRiskLevel(score);
  const config = RISK_CONFIG[level];
  const Icon = config.icon;

  const { tradeInput } = useTradeRisk();
  const { beginnerMode } = useBeginnerMode();
  const tradeRisk = tradeInput ? analyzeTradeRisk(tradeInput) : null;
  const tradeCfg = tradeRisk ? TRADE_RISK_CONFIG[tradeRisk.level] : null;
  const _TradeIcon = tradeCfg?.icon ?? Shield;

  // In beginner mode, Medium trade risk is treated as High
  const effectiveTradeLevelKey =
    beginnerMode && tradeRisk?.level === "Medium" ? "High" : tradeRisk?.level;
  const effectiveTradeCfg = effectiveTradeLevelKey
    ? TRADE_RISK_CONFIG[effectiveTradeLevelKey]
    : tradeCfg;
  const EffectiveTradeIcon = effectiveTradeCfg?.icon ?? Shield;

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setDisplayScore(score), 300);
    return () => clearTimeout(id);
  }, [score]);

  const circumference = Math.PI * 54;
  const dashOffset = circumference * (1 - displayScore / 100);

  const panelGlow = tradeRisk
    ? effectiveTradeCfg?.level === "high"
      ? "glow-red"
      : effectiveTradeCfg?.level === "medium"
        ? "glow-amber"
        : "glow-green"
    : config.glowClass;

  return (
    <div
      className={`glass glass-hover ${panelGlow} rounded-2xl p-6 animate-fade-in-up delay-300 relative overflow-hidden`}
      data-ocid="risk.panel"
    >
      <div
        className="absolute -top-6 -left-6 h-32 w-32 rounded-full opacity-20 blur-2xl transition-all duration-700"
        style={{
          background:
            tradeRisk && effectiveTradeCfg
              ? effectiveTradeCfg.color
              : config.color,
        }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold">
          {beginnerMode ? "Market Safety" : "AI Risk Score"}
        </h2>
        <AnimatePresence>
          {beginnerMode && (
            <motion.div
              key="beginner-badge"
              initial={{ opacity: 0, scale: 0.8, x: 8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 8 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{
                background: "oklch(0.52 0.18 160 / 0.15)",
                border: "1px solid oklch(0.52 0.18 160 / 0.3)",
              }}
            >
              <BookOpen
                className="h-3 w-3"
                style={{ color: "oklch(0.72 0.18 160)" }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: "oklch(0.75 0.15 160)" }}
              >
                Beginner Mode
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trade Analysis Section */}
      <AnimatePresence>
        {tradeRisk && effectiveTradeCfg && (
          <motion.div
            key="trade-analysis"
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="rounded-xl border p-3.5 mb-4"
              style={{
                background: effectiveTradeCfg.bgColor,
                borderColor: `${effectiveTradeCfg.color.replace(")", " / 0.4)").replace("oklch(", "oklch(")}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles
                  className="h-3.5 w-3.5"
                  style={{ color: effectiveTradeCfg.color }}
                />
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: effectiveTradeCfg.color }}
                >
                  {beginnerMode ? "Trade Safety" : "Trade Analysis"}
                </span>
                <div
                  className="ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{
                    background: effectiveTradeCfg.bgColor,
                    color: effectiveTradeCfg.color,
                  }}
                  data-ocid="risk.trade_level_badge"
                >
                  <EffectiveTradeIcon className="h-3 w-3" />
                  {effectiveTradeLevelKey} Risk
                </div>
              </div>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(0.80 0.04 265)" }}
              >
                {tradeRisk.explanation}
              </p>

              {/* Beginner mode: Medium treated as High notice in risk score */}
              <AnimatePresence>
                {beginnerMode && tradeRisk.level === "Medium" && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg"
                    style={{
                      background: "oklch(0.63 0.22 27 / 0.10)",
                      border: "1px solid oklch(0.63 0.22 27 / 0.25)",
                      color: "oklch(0.63 0.22 27)",
                    }}
                    data-ocid="risk.beginner_medium_notice"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Medium risk is treated as High in Beginner Mode
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-2.5 flex items-center gap-1.5">
                <div
                  className="h-1.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: "oklch(1 0 0 / 0.08)" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${tradeRisk.score}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ background: effectiveTradeCfg.color }}
                  />
                </div>
                <span
                  className="text-xs font-mono"
                  style={{ color: effectiveTradeCfg.color }}
                >
                  {tradeRisk.score}
                </span>
              </div>
            </div>

            <div
              className="flex items-center gap-2 mb-3"
              style={{ color: "oklch(0.55 0.04 265)" }}
            >
              <div
                className="flex-1 h-px"
                style={{ background: "oklch(1 0 0 / 0.07)" }}
              />
              <span className="text-xs">
                {beginnerMode ? "Overall Market" : "Portfolio"}
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "oklch(1 0 0 / 0.07)" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio Gauge */}
      <div
        className="flex flex-col items-center mb-5"
        style={
          tradeRisk
            ? {
                transform: "scale(0.88)",
                transformOrigin: "top center",
                marginBottom: "8px",
              }
            : {}
        }
      >
        <div className="relative">
          <svg
            width="140"
            height="80"
            viewBox="-10 0 140 80"
            role="img"
            aria-label={`Risk score gauge showing ${displayScore} out of 100`}
          >
            <path
              d="M 5 75 A 55 55 0 0 1 115 75"
              stroke="oklch(1 0 0 / 0.08)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 5 75 A 55 55 0 0 1 115 75"
              stroke={config.color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{
                filter: `drop-shadow(0 0 6px ${config.color})`,
                transition:
                  "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), stroke 0.4s ease",
              }}
            />
            <text
              x="60"
              y="68"
              textAnchor="middle"
              style={{
                fill: config.color,
                fontSize: "22px",
                fontWeight: 800,
                fontFamily: "Inter",
              }}
            >
              {displayScore}
            </text>
          </svg>
        </div>

        <div
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold mt-1 transition-all duration-500"
          style={{ color: config.color, background: config.bgColor }}
          data-ocid="risk.level_badge"
        >
          <Icon className="h-4 w-4" />
          {config.label}
        </div>
      </div>

      {/* Description */}
      {!tradeRisk && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {beginnerMode ? config.beginnerDescription : config.description}
        </p>
      )}

      {/* Beginner Mode: simplified protection summary */}
      <AnimatePresence>
        {beginnerMode && (
          <motion.div
            key="beginner-protection-summary"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5"
            style={{
              background: "oklch(0.52 0.18 160 / 0.08)",
              border: "1px solid oklch(0.52 0.18 160 / 0.20)",
            }}
          >
            <ShieldCheck
              className="h-4 w-4 flex-shrink-0"
              style={{ color: "oklch(0.72 0.18 160)" }}
            />
            <p
              className="text-[11px] leading-snug"
              style={{ color: "oklch(0.62 0.10 160)" }}
            >
              Your trades are being protected. Medium-risk trades require your
              confirmation before proceeding.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex justify-between text-xs text-muted-foreground border-t border-white/[0.07] pt-3">
        <span style={{ color: "oklch(0.70 0.17 145)" }}>
          {beginnerMode ? "Safe" : "Low"}
        </span>
        <span style={{ color: "oklch(0.82 0.17 85)" }}>
          {beginnerMode ? "Caution" : "Medium"}
        </span>
        <span style={{ color: "oklch(0.63 0.22 27)" }}>
          {beginnerMode ? "Risky" : "High"}
        </span>
      </div>
    </div>
  );
}

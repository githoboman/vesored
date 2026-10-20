import { useEffect, useRef, useState } from "react";

interface Prices {
  btc: number;
  eth: number;
  bot?: number;
  inj?: number;
}

interface Props {
  prices: Prices | null;
  loading?: boolean;
}

const HOLDINGS = {
  BTC: 0.05,
  ETH: 1.2,
  BOT: 1500,
};

const COST_BASIS_DISCOUNT = 0.1;

const ASSET_TAILWIND: Record<string, string> = {
  BTC: "#F59E0B",
  ETH: "#8B5CF6",
  BOT: "#06B6D4",
};

function formatUSD(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function DonutChart({
  segments,
}: { segments: { pct: number; color: string; label: string }[] }) {
  const [animated, setAnimated] = useState(false);
  const radius = 72;
  const stroke = 18;
  const cx = 90;
  const cy = 90;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  let offset = 0;
  const arcs = segments.map((seg) => {
    const len = (seg.pct / 100) * circumference;
    const dasharray = `${len} ${circumference - len}`;
    const dashoffset = -offset;
    offset += len;
    return { ...seg, dasharray, dashoffset };
  });

  return (
    <svg
      width={180}
      height={180}
      viewBox="0 0 180 180"
      className="overflow-visible"
      role="img"
      aria-label="Asset distribution donut chart"
    >
      <title>Asset distribution donut chart</title>
      <defs>
        {arcs.map((arc) => (
          <filter
            key={`filter-${arc.label}`}
            id={`glow-${arc.label}`}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="none"
        stroke="oklch(1 0 0 / 0.06)"
        strokeWidth={stroke}
      />
      {arcs.map((arc, i) => (
        <circle
          key={arc.label}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeDasharray={animated ? arc.dasharray : `0 ${circumference}`}
          strokeDashoffset={arc.dashoffset}
          strokeLinecap="round"
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: "rotate(-90deg)",
            transition: `stroke-dasharray 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.15}s`,
            filter: `drop-shadow(0 0 6px ${arc.color})`,
          }}
        />
      ))}
      {/* Center label */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="oklch(0.95 0.02 265)"
        fontSize={11}
        fontWeight={600}
        opacity={0.7}
      >
        BOT Chain
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        fill="oklch(0.95 0.02 265)"
        fontSize={11}
        fontWeight={700}
      >
        Allocation
      </text>
    </svg>
  );
}

type InsightSeverity = "warning" | "caution" | "positive" | "info";

interface Insight {
  icon: string;
  text: string;
  severity: InsightSeverity;
}

function generateInsights(weights: Record<string, number>): Insight[] {
  const insights: Insight[] = [];

  if (weights.ETH > 50) {
    insights.push({
      icon: "⚠️",
      text: "You are overexposed to ETH",
      severity: "warning",
    });
  }
  const maxAsset = Object.entries(weights).sort((a, b) => b[1] - a[1])[0];
  if (maxAsset && maxAsset[1] > 60) {
    insights.push({
      icon: "📊",
      text: "Consider diversification — one asset dominates your portfolio",
      severity: "caution",
    });
  }
  if (weights.BTC < 20) {
    insights.push({
      icon: "₿",
      text: "Low BTC allocation — consider adding a stable anchor",
      severity: "caution",
    });
  }
  if (weights.BOT > 40) {
    insights.push({
      icon: "🔥",
      text: "High BOT concentration — native Layer 1 token; manage risk accordingly",
      severity: "warning",
    });
  }
  if (insights.length === 0) {
    insights.push({
      icon: "✅",
      text: "Portfolio looks balanced across BOT Chain assets",
      severity: "positive",
    });
    insights.push({
      icon: "💡",
      text: "Continue monitoring market conditions for rebalancing signals",
      severity: "info",
    });
  }
  return insights;
}

const severityStyles: Record<InsightSeverity, string> = {
  warning:
    "border-l-[3px] border-l-[oklch(0.63_0.22_27)] bg-[oklch(0.63_0.22_27/0.08)] text-[oklch(0.82_0.14_40)]",
  caution:
    "border-l-[3px] border-l-[oklch(0.82_0.17_85)] bg-[oklch(0.82_0.17_85/0.07)] text-[oklch(0.88_0.13_85)]",
  positive:
    "border-l-[3px] border-l-[oklch(0.70_0.17_145)] bg-[oklch(0.70_0.17_145/0.08)] text-[oklch(0.80_0.14_145)]",
  info: "border-l-[3px] border-l-[oklch(0.75_0.14_200)] bg-[oklch(0.75_0.14_200/0.07)] text-[oklch(0.82_0.12_200)]",
};

function InsightRow({ insight, delay }: { insight: Insight; delay: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium ${severityStyles[insight.severity]}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-12px)",
        transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}
    >
      <span className="text-base leading-tight mt-0.5 shrink-0">
        {insight.icon}
      </span>
      <span className="leading-snug">{insight.text}</span>
    </div>
  );
}

export function PortfolioAnalytics({ prices }: Props) {
  const fallbackPrices = { btc: 65420, eth: 3280.5, bot: 0.75, inj: 0.75 };
  const p = prices ?? fallbackPrices;
  const botPrice = (p as any).bot ?? (p as any).inj ?? 0.75;

  const values = {
    BTC: HOLDINGS.BTC * p.btc,
    ETH: HOLDINGS.ETH * p.eth,
    BOT: HOLDINGS.BOT * botPrice,
  };

  const totalValue = values.BTC + values.ETH + values.BOT;
  const costBasis = totalValue * (1 - COST_BASIS_DISCOUNT);
  const pnl = totalValue - costBasis;
  const pnlPct = (pnl / costBasis) * 100;

  const weights = {
    BTC: (values.BTC / totalValue) * 100,
    ETH: (values.ETH / totalValue) * 100,
    BOT: (values.BOT / totalValue) * 100,
  };

  const segments = (Object.keys(weights) as Array<keyof typeof weights>).map(
    (k) => ({
      label: k,
      pct: weights[k],
      color: ASSET_TAILWIND[k] || "#06B6D4",
    }),
  );

  const insights = generateInsights(weights);

  return (
    <section
      className="glass rounded-2xl p-6 animate-fade-in-up delay-200"
      data-ocid="portfolio_analytics.section"
      aria-label="Portfolio Analytics"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-lg">📈</span>
        <h2 className="text-base font-semibold tracking-wide gradient-text">
          Portfolio Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col: summary cards */}
        <div className="flex flex-col gap-4">
          {/* Total Balance */}
          <div
            className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4 flex flex-col gap-1 glass-hover"
            data-ocid="portfolio_analytics.card"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Total Balance
            </div>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatUSD(totalValue)}
            </div>
            <div className="text-xs text-muted-foreground">
              Cost basis: {formatUSD(costBasis)}
            </div>
          </div>

          {/* Unrealized PnL */}
          <div
            className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4 flex flex-col gap-1 glass-hover"
            data-ocid="portfolio_analytics.card"
          >
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
              Unrealized P&amp;L
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl font-bold tracking-tight ${pnl >= 0 ? "text-[oklch(0.70_0.17_145)]" : "text-[oklch(0.63_0.22_27)]"}`}
              >
                {pnl >= 0 ? "+" : ""}
                {formatUSD(pnl)}
              </span>
              <span
                className={`text-xs font-semibold px-1.5 py-0.5 rounded ${pnl >= 0 ? "bg-[oklch(0.70_0.17_145/0.15)] text-[oklch(0.70_0.17_145)]" : "bg-[oklch(0.63_0.22_27/0.15)] text-[oklch(0.63_0.22_27)]"}`}
              >
                {pnl >= 0 ? "+" : ""}
                {pnlPct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Asset Breakdown mini table */}
          <div className="rounded-xl bg-white/[0.04] border border-white/[0.07] p-4 flex flex-col gap-2.5">
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
              Asset Allocation
            </div>
            {(Object.keys(values) as Array<keyof typeof values>).map(
              (asset) => (
                <div key={asset} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: ASSET_TAILWIND[asset],
                      boxShadow: `0 0 6px ${ASSET_TAILWIND[asset]}`,
                    }}
                  />
                  <span
                    className="text-xs font-semibold w-8"
                    style={{ color: ASSET_TAILWIND[asset] }}
                  >
                    {asset}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${weights[asset].toFixed(1)}%`,
                        background: ASSET_TAILWIND[asset],
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {weights[asset].toFixed(1)}%
                  </span>
                  <span
                    className="text-xs font-medium w-20 text-right"
                    style={{ color: "oklch(0.88 0.05 265)" }}
                  >
                    {formatUSD(values[asset])}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Middle col: donut chart */}
        <div className="flex flex-col items-center justify-center gap-4">
          <DonutChart segments={segments} />
          {/* Legend */}
          <div className="flex flex-col gap-2 w-full max-w-[200px]">
            {segments.map((seg) => (
              <div
                key={seg.label}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{
                      background: seg.color,
                      boxShadow: `0 0 6px ${seg.color}`,
                    }}
                  />
                  <span className="font-semibold" style={{ color: seg.color }}>
                    {seg.label}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {seg.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right col: actionable insights */}
        <div className="flex flex-col gap-3">
          <div className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
            Portfolio Health &amp; Insights
          </div>
          {insights.map((insight, idx) => (
            <InsightRow
              key={insight.text}
              insight={insight}
              delay={idx * 120}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PriceCardProps {
  symbol: string;
  name: string;
  basePrice: number;
  color?: string;
  livePrice?: number;
  liveChange?: number;
  loading?: boolean;
  error?: string | null;
}

const TREND_POINTS = 20;

function generatePath(prices: number[]): string {
  if (prices.length < 2) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 100;
  const h = 40;
  return prices
    .map((p, i) => {
      const x = (i / (prices.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function PriceCard({
  symbol,
  name,
  basePrice,
  color = "oklch(0.52 0.22 284)",
  livePrice,
  liveChange,
  loading = false,
  error = null,
}: PriceCardProps) {
  const [simulatedPrice, setSimulatedPrice] = useState(basePrice);
  const [history, setHistory] = useState<number[]>(() =>
    Array.from(
      { length: TREND_POINTS },
      () => basePrice + (Math.random() - 0.5) * basePrice * 0.01,
    ),
  );
  const [tick, setTick] = useState(0);
  const prevPrice = useRef(basePrice);
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => {
    if (livePrice !== undefined) return;
    const id = setInterval(() => {
      const delta = (Math.random() - 0.48) * basePrice * 0.004;
      setSimulatedPrice((p) => {
        prevPrice.current = p;
        return p + delta;
      });
      setTick((t) => t + 1);
    }, 3500);
    return () => clearInterval(id);
  }, [basePrice, livePrice]);

  useEffect(() => {
    if (livePrice === undefined) return;
    const h = historyRef.current;
    prevPrice.current = h[h.length - 1] ?? livePrice;
    setHistory((prev) => [...prev.slice(1), livePrice]);
    setTick((t) => t + 1);
  }, [livePrice]);

  const displayPrice = livePrice !== undefined ? livePrice : simulatedPrice;
  const change24h =
    liveChange !== undefined ? liveChange : symbol === "BTC" ? 3.2 : -1.7;
  const isUp = displayPrice >= prevPrice.current;

  return (
    <div
      className="glass glass-hover rounded-2xl p-5 animate-fade-in-up relative overflow-hidden"
      data-ocid={`${symbol.toLowerCase()}_price.card`}
    >
      <div
        className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full opacity-15 blur-2xl"
        style={{ background: color }}
        aria-hidden="true"
      />

      {/* Loading overlay */}
      {loading && (
        <div
          className="absolute inset-0 rounded-2xl z-10 flex flex-col gap-3 p-5"
          style={{ background: "oklch(0.13 0.03 265 / 0.85)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full animate-pulse bg-white/10" />
              <div className="flex flex-col gap-1">
                <div className="h-3 w-10 rounded animate-pulse bg-white/10" />
                <div className="h-2.5 w-16 rounded animate-pulse bg-white/10" />
              </div>
            </div>
            <div className="h-5 w-14 rounded-full animate-pulse bg-white/10" />
          </div>
          <div className="h-7 w-32 rounded animate-pulse bg-white/10 mt-1" />
          <div className="h-10 w-full rounded animate-pulse bg-white/10 mt-1" />
          <p className="text-xs text-muted-foreground text-center mt-auto">
            Fetching from BOT Chain...
          </p>
        </div>
      )}

      {/* Error banner */}
      {!loading && error && (
        <div
          className="absolute top-2 right-2 z-10 flex items-center gap-1 text-xs px-2 py-1 rounded-full"
          style={{
            color: "oklch(0.63 0.22 27)",
            background: "oklch(0.63 0.22 27 / 0.15)",
            border: "1px solid oklch(0.63 0.22 27 / 0.3)",
          }}
          title={error}
        >
          <AlertCircle className="h-3 w-3" />
          Live data unavailable
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: color }}
          >
            {symbol[0]}
          </div>
          <div>
            <p className="text-sm font-semibold">{symbol}</p>
            <p className="text-xs text-muted-foreground">{name}</p>
          </div>
        </div>
        <div
          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
          style={{
            color:
              change24h >= 0 ? "oklch(0.70 0.17 145)" : "oklch(0.63 0.22 27)",
            background:
              change24h >= 0
                ? "oklch(0.70 0.17 145 / 0.12)"
                : "oklch(0.63 0.22 27 / 0.12)",
          }}
        >
          {change24h >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {change24h >= 0 ? "+" : ""}
          {change24h.toFixed(2)}%
        </div>
      </div>

      <div
        key={tick}
        className="text-2xl font-bold tracking-tight animate-number-tick"
        style={{
          color: isUp ? color : "oklch(0.63 0.22 27)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        $
        {displayPrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>

      <div className="mt-3">
        <svg
          width="100%"
          height="40"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${symbol} price trend chart`}
        >
          <defs>
            <linearGradient id={`grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${generatePath(history)} L 100 40 L 0 40 Z`}
            fill={`url(#grad-${symbol})`}
          />
          <path
            d={generatePath(history)}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";
import { useWallet } from "@/context/WalletContext";
import { usePortfolio } from "@/hooks/useQueries";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";

const SPARKLINE_POINTS = [
  [0, 60],
  [10, 52],
  [20, 58],
  [30, 45],
  [40, 50],
  [50, 38],
  [60, 42],
  [70, 30],
  [80, 35],
  [90, 22],
  [100, 18],
];

const sparklinePath = SPARKLINE_POINTS.map(
  ([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`,
).join(" ");

interface PortfolioCardProps {
  botPrice?: number;
  injPrice?: number; // legacy prop compatibility
}

export function PortfolioCard({ botPrice = 0.75, injPrice }: PortfolioCardProps) {
  const activePrice = botPrice || injPrice || 0.75;
  const { data: portfolio } = usePortfolio();
  const { connected, botBalance, balanceLoading, balanceError, currentNetwork } = useWallet();

  const btcValue = (portfolio?.btcBalance ?? 1.24) * 65420;
  const ethValue = (portfolio?.ethBalance ?? 8.65) * 3280.5;
  const usdBalance = portfolio?.usdBalance ?? 12450;
  const nativeValue =
    connected && botBalance !== null ? botBalance * activePrice : null;

  const total = btcValue + ethValue + usdBalance + (nativeValue ?? 0);

  const change = +4.8;
  const isPositive = change >= 0;

  const symbol = currentNetwork?.nativeCurrency?.symbol ?? "BOT";

  const breakdown = [
    { label: "BTC", value: btcValue, color: "oklch(0.82 0.17 85)" },
    { label: "ETH", value: ethValue, color: "oklch(0.75 0.14 200)" },
    ...(connected
      ? [
          {
            label: symbol,
            value: nativeValue,
            color: "oklch(0.60 0.22 180)",
            isNative: true,
          },
        ]
      : [
          {
            label: "USD",
            value: usdBalance,
            color: "oklch(0.52 0.22 284)",
            isNative: false,
          },
        ]),
  ];

  return (
    <div
      className="glass glass-hover glow-violet rounded-2xl p-6 animate-fade-in-up relative overflow-hidden"
      data-ocid="portfolio.card"
    >
      <div
        className="absolute -top-10 -right-10 h-40 w-40 rounded-full opacity-20 blur-2xl"
        style={{ background: "oklch(0.52 0.22 284)" }}
        aria-hidden="true"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
          Total Portfolio Value (BOT Chain)
        </p>
        <span
          className="text-[10px] font-mono px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.60 0.22 180 / 0.12)",
            color: "oklch(0.75 0.18 180)",
          }}
        >
          ≈0.75s Finality
        </span>
      </div>

      <div className="flex items-end justify-between gap-4 mt-2">
        <div>
          <div
            className="text-4xl font-extrabold tracking-tight text-foreground"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            $
            {total.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div
            className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${
              isPositive ? "text-success" : "text-destructive"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>
              {isPositive ? "+" : ""}
              {change}% 24h
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <div className="h-12 w-28 flex-shrink-0">
          <svg
            viewBox="0 0 100 65"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <path
              d={sparklinePath}
              fill="none"
              stroke="oklch(0.60 0.22 180)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="mt-6 pt-5 border-t border-white/[0.07] grid grid-cols-3 gap-3">
        {breakdown.map((item) => (
          <div
            key={item.label}
            className="rounded-xl p-3 border border-white/[0.05]"
            style={{ background: "oklch(0.10 0.03 265 / 0.5)" }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-xs font-semibold text-muted-foreground">
                {item.label}
              </span>
            </div>
            {item.isNative && balanceLoading ? (
              <Skeleton className="h-5 w-16 bg-white/10 mt-1" />
            ) : item.isNative && balanceError ? (
              <div className="flex items-center gap-1 text-[11px] text-destructive mt-1">
                <AlertCircle className="h-3 w-3" />
                <span>Error</span>
              </div>
            ) : (
              <div
                className="text-sm font-bold text-foreground"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {item.value !== null && item.value !== undefined
                  ? `$${item.value.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}`
                  : "—"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export type RiskScore = "Low" | "Medium" | "High";
export type TradeOutcome = "success" | "failed";

export interface TradeInsightInput {
  asset: string;
  direction: "buy" | "sell";
  amount: number;
  riskScore: RiskScore;
  outcome: TradeOutcome;
  price: number;
}

export interface TradeInsight {
  why: string;
  improve: string;
  asset: string;
  direction: "buy" | "sell";
  amount: number;
  outcome: TradeOutcome;
}

const LARGE_THRESHOLD: Record<string, number> = {
  BTC: 0.1,
  ETH: 1.5,
  SOL: 20,
  INJ: 100,
};

function isLargePosition(asset: string, amount: number): boolean {
  const threshold = LARGE_THRESHOLD[asset] ?? 10;
  return amount >= threshold;
}

export function generateTradeInsight(input: TradeInsightInput): TradeInsight {
  const { asset, direction, amount, riskScore, outcome, price } = input;
  const large = isLargePosition(asset, amount);
  const usdValue = (amount * price).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  let why: string;
  let improve: string;

  if (riskScore === "High" && outcome === "success") {
    why = large
      ? `You entered ${asset} with a large ${direction} position (${usdValue}) during high volatility — it paid off this time, but the risk was elevated.`
      : `You ${direction === "buy" ? "bought" : "sold"} ${asset} in a high-volatility window. The move succeeded, but conditions were risky.`;
    improve =
      "Consider reducing position size in volatile markets to lock in gains and limit downside on future trades.";
  } else if (riskScore === "High" && outcome === "failed") {
    why = large
      ? `The ${direction} on ${asset} failed in a high-volatility environment with an oversized position (${usdValue}), amplifying the loss.`
      : `High volatility worked against your ${asset} ${direction} — the market moved against the position before it could recover.`;
    improve =
      "Activate stop-loss and reduce trade size when risk is High to protect capital on adverse moves.";
  } else if (riskScore === "Medium" && outcome === "success") {
    why = `Your ${asset} ${direction} hit at a reasonable entry point with moderate market conditions — a solid, balanced trade.`;
    improve = large
      ? "The position size is on the higher side for medium risk. You could trim slightly to keep exposure manageable."
      : "A slightly tighter entry timing or a trailing stop could help you capture even more upside next time.";
  } else if (riskScore === "Medium" && outcome === "failed") {
    why = `Market conditions shifted against your ${asset} ${direction} mid-trade — a moderate-risk move that didn\'t work out this time.`;
    improve =
      "Watch for trend reversals before entering and set a tighter stop-loss to cut losses earlier.";
  } else if (riskScore === "Low" && outcome === "success") {
    why = `You traded ${asset} conservatively with good market conditions on your side — a clean, low-risk execution.`;
    improve = large
      ? "Well-sized position and good conditions. Keep this discipline while monitoring for volatility spikes."
      : "You could increase position size slightly when conditions are this favorable to capture more upside.";
  } else {
    // Low risk + failed
    why = `Even with low-risk conditions, the ${asset} ${direction} didn\'t go as planned — likely a short-term price spike or liquidity issue.`;
    improve =
      "Low-risk setups rarely fail; review your entry timing and consider a small buffer above/below key price levels.";
  }

  return { why, improve, asset, direction, amount, outcome };
}

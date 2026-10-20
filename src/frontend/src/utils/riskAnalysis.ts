export type RiskLevel = "Low" | "Medium" | "High";

export interface TradeRiskResult {
  level: RiskLevel;
  score: number;
  explanation: string;
}

export interface TradeRiskInput {
  asset: string;
  amountUSD: number;
  priceChange: number;
  side: "buy" | "sell";
}

export function analyzeTradeRisk(input: TradeRiskInput): TradeRiskResult {
  const { asset, amountUSD, priceChange, side } = input;

  // Trade size score (0–40)
  let sizeScore: number;
  if (amountUSD < 200) sizeScore = 8;
  else if (amountUSD < 1000) sizeScore = 18;
  else if (amountUSD < 5000) sizeScore = 28;
  else if (amountUSD < 20000) sizeScore = 35;
  else sizeScore = 40;

  // Asset volatility score (0–35)
  let volatilityScore: number;
  if (asset === "BTC") volatilityScore = 12;
  else if (asset === "ETH") volatilityScore = 18;
  else if (asset === "SOL") volatilityScore = 28;
  else volatilityScore = 22;

  // Market trend score (0–25)
  let trendScore: number;
  if (side === "buy") {
    if (priceChange < -5) trendScore = 22;
    else if (priceChange < -2) trendScore = 15;
    else if (priceChange < 2) trendScore = 10;
    else trendScore = 5;
  } else {
    if (priceChange > 5) trendScore = 22;
    else if (priceChange > 2) trendScore = 15;
    else if (priceChange > -2) trendScore = 10;
    else trendScore = 5;
  }

  const score = sizeScore + volatilityScore + trendScore;

  let level: RiskLevel;
  if (score < 40) level = "Low";
  else if (score < 70) level = "Medium";
  else level = "High";

  // Build reason phrases
  const reasons: string[] = [];

  if (side === "buy") {
    if (priceChange < -5) reasons.push("market is trending sharply down");
    else if (priceChange < -2) reasons.push("market is trending down");
    else if (priceChange >= 2) reasons.push("market is bullish");
    else reasons.push("market is range-bound");
  } else {
    if (priceChange > 5) reasons.push("market is strongly bullish");
    else if (priceChange > 2) reasons.push("market is trending up");
    else if (priceChange <= -2) reasons.push("market is trending down");
    else reasons.push("market is range-bound");
  }

  if (asset === "SOL") reasons.push("asset is highly volatile");
  else if (asset === "ETH") reasons.push("asset has moderate volatility");
  else if (asset !== "BTC") reasons.push("asset volatility is elevated");
  else reasons.push("asset is relatively stable");

  if (amountUSD >= 20000) reasons.push("trade size is very large");
  else if (amountUSD >= 5000) reasons.push("trade size is large");
  else if (amountUSD >= 1000) reasons.push("trade size is moderate");
  else reasons.push("trade size is small");

  const explanation = `${level} Risk: ${reasons[0]} and ${reasons[1]}, ${reasons[2]}`;

  return { level, score, explanation };
}

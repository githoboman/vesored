import type { TradeInsight } from "@/utils/tradeInsight";
import { createContext, useContext, useState } from "react";

interface TradeInsightContextValue {
  latestInsight: TradeInsight | null;
  setLatestInsight: (insight: TradeInsight | null) => void;
}

const TradeInsightContext = createContext<TradeInsightContextValue | null>(
  null,
);

export function TradeInsightProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [latestInsight, setLatestInsight] = useState<TradeInsight | null>(null);

  return (
    <TradeInsightContext.Provider value={{ latestInsight, setLatestInsight }}>
      {children}
    </TradeInsightContext.Provider>
  );
}

export function useTradeInsight() {
  const ctx = useContext(TradeInsightContext);
  if (!ctx)
    throw new Error("useTradeInsight must be used within TradeInsightProvider");
  return ctx;
}

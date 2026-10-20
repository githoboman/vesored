import type { TradeRiskInput } from "@/utils/riskAnalysis";
import { createContext, useContext, useState } from "react";

interface TradeRiskContextValue {
  tradeInput: TradeRiskInput | null;
  setTradeInput: (input: TradeRiskInput | null) => void;
  priceChanges: Record<string, number>;
  setPriceChanges: (changes: Record<string, number>) => void;
  safeMode: boolean;
  setSafeMode: (v: boolean) => void;
  stopLossPercent: number | null;
  setStopLossPercent: (v: number | null) => void;
}

const TradeRiskContext = createContext<TradeRiskContextValue | null>(null);

export function TradeRiskProvider({ children }: { children: React.ReactNode }) {
  const [tradeInput, setTradeInput] = useState<TradeRiskInput | null>(null);
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [safeMode, setSafeMode] = useState(false);
  const [stopLossPercent, setStopLossPercent] = useState<number | null>(null);

  return (
    <TradeRiskContext.Provider
      value={{
        tradeInput,
        setTradeInput,
        priceChanges,
        setPriceChanges,
        safeMode,
        setSafeMode,
        stopLossPercent,
        setStopLossPercent,
      }}
    >
      {children}
    </TradeRiskContext.Provider>
  );
}

export function useTradeRisk() {
  const ctx = useContext(TradeRiskContext);
  if (!ctx)
    throw new Error("useTradeRisk must be used within TradeRiskProvider");
  return ctx;
}

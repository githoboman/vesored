import { useTradeInsight } from "@/context/TradeInsightContext";
import { Lightbulb } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function TradeInsightCard() {
  const { latestInsight } = useTradeInsight();

  return (
    <AnimatePresence>
      {latestInsight && (
        <motion.div
          key={`${latestInsight.asset}-${latestInsight.direction}-${latestInsight.outcome}`}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5"
          data-ocid="trade_insight.card"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.18 0.04 265 / 0.65)",
              border: "1px solid oklch(0.60 0.22 230 / 0.25)",
              backdropFilter: "blur(16px)",
              boxShadow:
                "0 0 24px -4px oklch(0.60 0.22 230 / 0.15), inset 0 1px 0 oklch(1 0 0 / 0.05)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center gap-2.5 border-b"
              style={{ borderColor: "oklch(0.60 0.22 230 / 0.18)" }}
            >
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg"
                style={{
                  background: "oklch(0.55 0.22 230 / 0.20)",
                  border: "1px solid oklch(0.60 0.22 230 / 0.30)",
                }}
              >
                <Lightbulb
                  size={14}
                  style={{ color: "oklch(0.72 0.20 230)" }}
                />
              </span>
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "oklch(0.72 0.20 230)" }}
              >
                AI Insight
              </span>
              <span
                className="ml-auto text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  color:
                    latestInsight.outcome === "success"
                      ? "oklch(0.72 0.19 145)"
                      : "oklch(0.63 0.22 27)",
                  background:
                    latestInsight.outcome === "success"
                      ? "oklch(0.72 0.19 145 / 0.12)"
                      : "oklch(0.63 0.22 27 / 0.12)",
                  border: `1px solid ${
                    latestInsight.outcome === "success"
                      ? "oklch(0.72 0.19 145 / 0.25)"
                      : "oklch(0.63 0.22 27 / 0.25)"
                  }`,
                }}
              >
                {latestInsight.asset} · {latestInsight.direction.toUpperCase()}{" "}
                · {latestInsight.amount} —{" "}
                {latestInsight.outcome === "success" ? "✓ Success" : "✗ Failed"}
              </span>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-3">
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.88 0.03 230)" }}
                data-ocid="trade_insight.panel"
              >
                {latestInsight.why}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "oklch(0.60 0.05 230)" }}
              >
                <span
                  className="inline-block mr-1.5 text-xs"
                  style={{ color: "oklch(0.72 0.20 230)" }}
                >
                  ✦
                </span>
                {latestInsight.improve}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

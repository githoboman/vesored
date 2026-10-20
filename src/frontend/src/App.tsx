import { Toaster } from "@/components/ui/sonner";
import { BeginnerModeProvider } from "@/context/BeginnerModeContext";
import { TradeInsightProvider } from "@/context/TradeInsightContext";
import { TradeRiskProvider, useTradeRisk } from "@/context/TradeRiskContext";
import { WalletProvider } from "@/context/WalletContext";
import { useBotChainPrices } from "@/hooks/useBotChainPrices";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { AuroraBackground } from "./components/AuroraBackground";
import { BlockchainActivityPanel } from "./components/BlockchainActivityPanel";
import { Header } from "./components/Header";
import { PortfolioAnalytics } from "./components/PortfolioAnalytics";
import { PortfolioCard } from "./components/PortfolioCard";
import { PriceCard } from "./components/PriceCard";
import { RiskScore } from "./components/RiskScore";
import { TradeInsightCard } from "./components/TradeInsightCard";
import { TradePanel } from "./components/TradePanel";
import { TransactionsTable } from "./components/TransactionsTable";

const queryClient = new QueryClient();

const currentYear = new Date().getFullYear();

function Dashboard() {
  const { prices, loading, error } = useBotChainPrices();
  const { setPriceChanges } = useTradeRisk();

  useEffect(() => {
    setPriceChanges({
      BTC: prices?.btcChange ?? 0,
      ETH: prices?.ethChange ?? 0,
      BOT: prices?.botChange ?? 0,
      INJ: prices?.botChange ?? prices?.injChange ?? 0,
      SOL: 0,
    });
  }, [prices, setPriceChanges]);

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />

      <div className="relative z-10">
        <Header />

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Top row: Portfolio Overview & Price Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2">
              <PortfolioCard botPrice={prices?.bot ?? prices?.inj ?? 0.75} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
              <PriceCard
                symbol="BTC"
                name="Bitcoin"
                basePrice={65420}
                color="oklch(0.82 0.17 85)"
                livePrice={prices?.btc}
                liveChange={prices?.btcChange}
                loading={loading}
                error={error}
              />
              <PriceCard
                symbol="ETH"
                name="Ethereum"
                basePrice={3280.5}
                color="oklch(0.75 0.14 200)"
                livePrice={prices?.eth}
                liveChange={prices?.ethChange}
                loading={loading}
                error={error}
              />
              <PriceCard
                symbol="BOT"
                name="BOT Token"
                basePrice={0.75}
                color="oklch(0.60 0.22 180)"
                livePrice={prices?.bot ?? prices?.inj}
                liveChange={prices?.botChange ?? prices?.injChange}
              />
            </div>
          </div>

          {/* Portfolio Analytics + Blockchain Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            <div className="lg:col-span-2">
              <PortfolioAnalytics prices={prices} loading={loading} />
            </div>
            <div>
              <BlockchainActivityPanel />
            </div>
          </div>

          {/* Middle row: Execution Panel + Risk Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <TradePanel />
            <RiskScore />
          </div>

          {/* Bottom: Transaction Ledger & AI Insights */}
          <TransactionsTable />
          <TradeInsightCard />
        </main>

        <footer className="relative z-10 mt-12 border-t border-white/[0.07] py-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-muted-foreground">
            <p>© {currentYear} Vesored. All rights reserved.</p>
            <span className="hidden sm:inline">·</span>
            <p>
              Powered by{" "}
              <a
                href="https://dev-docs.botchain.ai/docs/intro"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                BOT Chain
              </a>{" "}
              (EVM Layer 1 for DePIN & AI)
            </p>
            <span className="hidden sm:inline">·</span>
            <a
              href="https://scan.bohr.life"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              Bohr Explorer
            </a>
            <span className="hidden sm:inline">·</span>
            <a
              href="https://faucet.botchain.ai/basic"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors underline"
            >
              Testnet Faucet
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <BeginnerModeProvider>
          <TradeRiskProvider>
            <TradeInsightProvider>
              <Dashboard />
              <Toaster
                theme="dark"
                toastOptions={{
                  style: {
                    background: "oklch(0.15 0.045 265)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    color: "oklch(0.95 0.02 265)",
                  },
                }}
              />
            </TradeInsightProvider>
          </TradeRiskProvider>
        </BeginnerModeProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

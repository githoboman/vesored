import { fetchPrices, type PricesResponse } from "@/lib/botchain";
import { useEffect, useState } from "react";

export function useBotChainPrices() {
  const [prices, setPrices] = useState<PricesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchPrices();
        if (mounted) {
          setPrices(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message ?? "Failed to fetch prices");
          setLoading(false);
        }
      }
    }

    load();
    const interval = setInterval(load, 30_000); // Poll every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { prices, loading, error };
}

// Re-export for legacy compatibility
export const useInjectivePrices = useBotChainPrices;

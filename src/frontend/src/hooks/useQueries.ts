import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransactionType } from "../backend.d";
import { useActor } from "./useActor";

export function usePortfolio() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      if (!actor)
        return { btcBalance: 1.24, ethBalance: 8.65, usdBalance: 12450.0 };
      return actor.getPortfolio();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useCryptoPrices() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["cryptoPrices"],
    queryFn: async () => {
      if (!actor) return [65420.0, 3280.5] as [number, number];
      return actor.getCryptoPrices();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10_000,
  });
}

export function useRiskScore() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["riskScore"],
    queryFn: async () => {
      if (!actor) return 42;
      return actor.getRiskScore();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useTransactionHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionHistory();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      asset,
      amount,
      transactionType,
    }: {
      asset: string;
      amount: number;
      transactionType: TransactionType;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTransaction(asset, amount, transactionType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
}

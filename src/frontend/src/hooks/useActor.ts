import { defaultBotChainActor } from "@/lib/botchainActor";
import type { backendInterface } from "../backend";

/**
 * Hook providing backend actor backed by BOT Chain
 */
export function useActor(): { actor: backendInterface; isFetching: boolean } {
  return {
    actor: defaultBotChainActor,
    isFetching: false,
  };
}

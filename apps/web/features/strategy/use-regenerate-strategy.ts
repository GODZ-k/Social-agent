import { regenerateStrategy } from "@/lib/api/actions";
import { useServerAction } from "@/lib/api/use-server-action";

/** Asks the agent to rewrite the strategy from the latest results. */
export function useRegenerateStrategy(clientId: string) {
  const { run, isPending } = useServerAction(regenerateStrategy, {
    success: (strategy) => `Strategy updated to version ${strategy.version}`,
  });
  return { regenerate: () => run(clientId), isPending };
}

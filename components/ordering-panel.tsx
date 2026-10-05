import { orderingFacts } from "@/lib/ordering";
import type { Settings } from "@/lib/types";

export function OrderingPanel({ settings }: { settings: Settings }) {
  const facts = orderingFacts(settings);
  return (
    <div className="grid gap-6 bg-paper p-6 sm:grid-cols-2 sm:p-8">
      {facts.map((fact) => (
        <div key={fact.title}>
          <h2 className="font-display text-2xl font-medium">{fact.title}</h2>
          <p className="mt-2 text-sm leading-6">{fact.body}</p>
        </div>
      ))}
    </div>
  );
}

import type { Accent, DesignDecision } from "@/lib/projects";

const ACCENT_BAR: Record<Accent, string> = {
  indigo: "bg-indigo-400",
  emerald: "bg-emerald-400",
  amber: "bg-amber-400",
  rose: "bg-rose-400",
  sky: "bg-sky-400",
};

export function DesignDecisionBlock({
  decisions,
  accent,
}: {
  decisions: DesignDecision[];
  accent: Accent;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {decisions.map((decision) => (
        <div
          key={decision.title}
          className="overflow-hidden rounded-lg border border-border bg-surface"
        >
          <div className={`h-1.5 w-full ${ACCENT_BAR[accent]}`} />
          <div className="p-5">
            <h4 className="font-semibold text-foreground">
              {decision.title}
            </h4>
            <p className="mt-2 text-sm text-muted">{decision.rationale}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

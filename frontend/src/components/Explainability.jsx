export default function Explainability({ explanation, activeType }) {
  if (!explanation) return null;
  const hasEvent = activeType && activeType !== "none";

  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-4 shadow-panel">
      <p className="text-[11px] uppercase tracking-wide text-ops-muted">Explainability</p>
      <h2 className="mt-1 font-display text-lg font-semibold text-ops-text">
        Why did the ETA change?
      </h2>
      <div className="mt-3 space-y-3 rounded-md border border-ops-border bg-ops-panel2 p-3 text-sm">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Active scenario</p>
          <p className="mt-1 font-semibold">{explanation.activeScenario}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Impact</p>
          <p className="mt-1 text-ops-muted">{explanation.impact}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Reason</p>
          <p className="mt-1 text-ops-muted">{explanation.reason}</p>
        </div>
        {!hasEvent ? (
          <p className="text-xs text-ops-muted">
            Select an operational event to simulate additional delay.
          </p>
        ) : null}
      </div>
    </section>
  );
}

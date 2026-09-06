export default function SystemStatus({ dataStatus, futureNote, confidenceNote }) {
  return (
    <section className="rounded-lg border border-ops-warn/30 bg-ops-warn/5 p-4">
      <p className="text-[11px] uppercase tracking-wide text-ops-warn">System Status</p>
      <h2 className="mt-1 font-display text-lg font-semibold text-ops-text">
        {dataStatus || "Simulation / Demonstration Data"}
      </h2>
      <p className="mt-2 text-sm text-ops-muted">
        {futureNote ||
          "Real-time railway data integration is planned for future deployment."}
      </p>
      {confidenceNote ? (
        <p className="mt-2 font-mono text-xs text-ops-muted">{confidenceNote}</p>
      ) : null}
    </section>
  );
}

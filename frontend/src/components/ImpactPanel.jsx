export default function ImpactPanel({ impactSummary, dataStatus }) {
  if (!impactSummary) return null;

  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-4 shadow-panel">
      <p className="text-[11px] uppercase tracking-wide text-ops-muted">
        Current Operational Condition
      </p>
      <h2 className="mt-1 font-display text-lg font-semibold text-ops-text">
        {impactSummary.condition}
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        <Row label="Estimated Impact" value={`+${impactSummary.estimatedImpactMinutes} min`} />
        <Row label="Affected Train" value={impactSummary.affectedTrain} />
        <Row label="Affected Section" value={impactSummary.affectedSection} />
        <Row label="Confidence" value={`${impactSummary.confidencePercent}%`} />
      </dl>
      <p className="mt-4 text-xs text-ops-muted">{dataStatus}</p>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-ops-border/60 pb-2">
      <dt className="text-ops-muted">{label}</dt>
      <dd className="text-right font-medium text-ops-text">{value}</dd>
    </div>
  );
}

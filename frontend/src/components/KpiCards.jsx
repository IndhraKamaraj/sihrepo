export default function KpiCards({ kpis }) {
  if (!kpis) return null;
  const items = [
    { label: "Active Trains", value: kpis.activeTrains },
    { label: "Delayed Trains", value: kpis.delayedTrains },
    { label: "Average Delay", value: `${kpis.averageDelayMinutes} min` },
    { label: "Network Health", value: kpis.networkHealth },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-ops-border bg-ops-panel px-4 py-3 shadow-panel"
        >
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">{item.label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-ops-text">{item.value}</p>
        </div>
      ))}
    </section>
  );
}

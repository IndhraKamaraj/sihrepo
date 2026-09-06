function statusStyles(status) {
  switch (status) {
    case "Completed":
      return "bg-slate-700/50 text-slate-300";
    case "Current":
      return "bg-ops-accent/20 text-ops-accent";
    case "Delayed":
      return "bg-ops-warn/20 text-ops-warn";
    case "Upcoming":
      return "bg-ops-line/20 text-sky-300";
    default:
      return "bg-ops-panel2 text-ops-muted";
  }
}

export default function StationTimeline({ stations }) {
  if (!stations?.length) return null;

  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-4 shadow-panel">
      <div className="mb-3">
        <p className="text-[11px] uppercase tracking-wide text-ops-muted">Station-wise ETA</p>
        <h2 className="mt-1 font-display text-lg font-semibold text-ops-text">Route Timeline</h2>
        <p className="mt-1 text-xs text-ops-muted">
          Downstream stations inherit predicted delay from the active scenario.
        </p>
      </div>

      <div className="max-h-[420px] overflow-auto rounded-md border border-ops-border scrollbar-thin">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-ops-panel2 text-ops-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Station</th>
              <th className="px-3 py-2 font-medium">Code</th>
              <th className="px-3 py-2 font-medium">Scheduled</th>
              <th className="px-3 py-2 font-medium">Predicted</th>
              <th className="px-3 py-2 font-medium">Delay</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((station) => (
              <tr
                key={station.code}
                className={`border-t border-ops-border/70 ${
                  station.status === "Current" ? "bg-ops-accent/10" : ""
                }`}
              >
                <td className="px-3 py-2.5 font-medium text-ops-text">{station.name}</td>
                <td className="px-3 py-2.5 font-mono text-ops-muted">{station.code}</td>
                <td className="px-3 py-2.5 font-mono">
                  {station.scheduledArrival ?? "—"}
                </td>
                <td className="px-3 py-2.5 font-mono font-semibold text-ops-accent">
                  {station.predictedArrival ?? "—"}
                </td>
                <td className="px-3 py-2.5 font-mono">
                  {station.delayMinutes == null
                    ? "—"
                    : station.delayMinutes === 0
                      ? "0"
                      : `+${station.delayMinutes}`}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusStyles(
                      station.status
                    )}`}
                  >
                    {station.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

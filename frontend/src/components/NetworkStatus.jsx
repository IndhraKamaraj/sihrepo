export default function NetworkStatus({ network, trains }) {
  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-4 shadow-panel">
      <p className="text-[11px] uppercase tracking-wide text-ops-muted">Network Status</p>
      <h2 className="mt-1 font-display text-lg font-semibold text-ops-text">
        Corridor Conditions
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {["Normal", "Congested", "Restricted", "Delayed"].map((condition) => {
          const active = network?.condition === condition;
          return (
            <div
              key={condition}
              className={`rounded-md border px-3 py-3 ${
                active
                  ? "border-ops-accent bg-ops-accent/10 text-ops-accent"
                  : "border-ops-border bg-ops-panel2 text-ops-muted"
              }`}
            >
              <p className="text-sm font-semibold">{condition}</p>
              <p className="mt-1 text-[11px]">{active ? "Active on selected train section" : "—"}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-md border border-ops-border bg-ops-panel2 p-3 text-sm">
        <p className="text-ops-muted">Affected section</p>
        <p className="mt-1 font-mono text-ops-text">{network?.affectedSection || "None"}</p>
      </div>

      {trains?.length ? (
        <div className="mt-4 max-h-56 overflow-auto scrollbar-thin">
          <table className="min-w-full text-left text-xs">
            <thead className="text-ops-muted">
              <tr>
                <th className="py-1 pr-2">Train</th>
                <th className="py-1 pr-2">Location</th>
                <th className="py-1 pr-2">Delay</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((t) => (
                <tr key={t.trainNumber} className="border-t border-ops-border/50">
                  <td className="py-1.5 pr-2 font-mono">{t.trainNumber}</td>
                  <td className="py-1.5 pr-2">{t.currentLocation?.code}</td>
                  <td className="py-1.5 pr-2">+{t.predictedDelayMinutes}</td>
                  <td className="py-1.5">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="mt-3 text-xs text-ops-muted">Simulation / Demonstration Data</p>
    </section>
  );
}

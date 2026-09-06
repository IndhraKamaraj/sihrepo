export default function TrainMonitor({ train }) {
  if (!train) return null;
  const cs = train.currentState;

  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-5 shadow-panel">
      <p className="text-[11px] uppercase tracking-wide text-ops-muted">Train Monitor</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-ops-text">
        {train.trainNumber}{" "}
        <span className="text-ops-muted">·</span> {train.trainName}
      </h2>
      <p className="mt-1 text-sm text-ops-muted">
        Route: {train.source.name} → {train.destination.name}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Current Location" value={`${cs.location.code} · ${cs.location.name}`} />
        <Metric
          label="Next Station"
          value={
            cs.nextStation
              ? `${cs.nextStation.code} · ${cs.nextStation.name}`
              : "Destination reached"
          }
        />
        <Metric label="Speed" value={`${cs.speedKmh} km/h`} />
        <Metric label="Current Delay" value={`+${cs.delayMinutes} min`} />
        <Metric label="Status" value={cs.status} accent />
        <Metric
          label="Active Scenario"
          value={train.activeScenario?.label || "No Active Event"}
        />
      </div>
    </section>
  );
}

function Metric({ label, value, accent }) {
  return (
    <div className="rounded-md border border-ops-border bg-ops-panel2 px-3 py-3">
      <p className="text-[11px] uppercase tracking-wide text-ops-muted">{label}</p>
      <p
        className={`mt-1 font-mono text-base font-semibold ${
          accent ? "text-ops-accent" : "text-ops-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

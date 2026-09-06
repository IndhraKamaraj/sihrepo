function Metric({ label, value, hint }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-rail-ink">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function TrainSummary({ train }) {
  if (!train) return null;

  return (
    <section className="animate-fade-up rounded-xl bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Train Summary</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-rail-ink">
            {train.trainNumber} · {train.trainName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {train.source.code} {train.source.name} → {train.destination.code}{" "}
            {train.destination.name}
          </p>
        </div>
        <div className="rounded-md bg-rail-chalk px-3 py-1.5 font-mono text-xs text-rail-navy">
          Scheduled {train.scheduledJourney.departure} → {train.scheduledJourney.arrival}
        </div>
      </div>

      <div className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-3">
        <Metric
          label="Current Location"
          value={`${train.currentState.location.code} · ${train.currentState.location.name}`}
        />
        <Metric
          label="Current Speed"
          value={`${train.currentState.speedKmh} km/h`}
          hint="Simulation value"
        />
        <Metric
          label="Current Delay"
          value={`+${train.currentState.delayMinutes} min`}
          hint="Baseline operational delay"
        />
      </div>
    </section>
  );
}

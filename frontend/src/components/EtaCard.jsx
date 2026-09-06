export default function EtaCard({ prediction, activeScenario }) {
  if (!prediction) return null;

  return (
    <section className="rounded-lg border border-ops-accent/30 bg-gradient-to-br from-ops-panel to-ops-panel2 p-5 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-ops-accent">ETA Prediction</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-ops-text">
            Destination Arrival Focus
          </h2>
        </div>
        <div className="rounded border border-ops-border bg-ops-bg/40 px-3 py-1 text-xs text-ops-muted">
          Scenario: {activeScenario?.label || "No Active Event"}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <FocusStat label="Scheduled Arrival" value={prediction.scheduledArrival} />
        <FocusStat
          label="Predicted Arrival"
          value={prediction.predictedArrival}
          emphasize
        />
        <FocusStat
          label="Predicted Delay"
          value={`+${prediction.predictedDelayMinutes} min`}
          warn
        />
        <FocusStat label="Confidence" value={`${prediction.confidencePercent}%`} />
      </div>

      <div className="mt-5 space-y-2 rounded-md border border-ops-border bg-ops-bg/30 p-4 font-mono text-sm">
        <div className="flex items-center gap-3">
          <span className="w-24 text-ops-muted">Scheduled</span>
          <div className="h-1.5 flex-1 rounded bg-ops-border">
            <div className="h-1.5 w-[72%] rounded bg-ops-muted/60" />
          </div>
          <span className="w-14 text-right text-ops-text">{prediction.scheduledArrival}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-24 text-ops-accent">Predicted</span>
          <div className="h-1.5 flex-1 rounded bg-ops-border">
            <div className="h-1.5 w-[86%] rounded bg-ops-accent transition-all duration-500" />
          </div>
          <span className="w-14 text-right text-ops-accent">{prediction.predictedArrival}</span>
        </div>
        <p className="pt-1 text-[11px] text-ops-muted">
          {prediction.baselineDelayMinutes} min baseline
          {prediction.eventDelayMinutes > 0
            ? ` + ${prediction.eventDelayMinutes} min event`
            : ""}{" "}
          · Demonstration confidence score
        </p>
      </div>
    </section>
  );
}

function FocusStat({ label, value, emphasize, warn }) {
  return (
    <div className="rounded-md border border-ops-border bg-ops-bg/40 p-3">
      <p className="text-[11px] uppercase tracking-wide text-ops-muted">{label}</p>
      <p
        className={`mt-1 font-mono text-3xl font-semibold transition-all duration-300 ${
          emphasize ? "text-ops-accent" : warn ? "text-ops-warn" : "text-ops-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

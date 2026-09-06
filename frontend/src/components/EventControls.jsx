const EVENTS = [
  { type: "speed_restriction", label: "Speed Restriction", detail: "+8 min" },
  { type: "congestion", label: "Track Congestion", detail: "+5 min" },
  { type: "unexpected_stoppage", label: "Unexpected Stoppage", detail: "+12 min" },
];

export default function EventControls({
  activeType,
  activeScenario,
  explanation,
  onEvent,
  onReset,
  disabled,
}) {
  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-4 shadow-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Operational Events</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ops-text">
            Scenario Simulation
          </h2>
          <p className="mt-1 text-xs text-ops-muted">
            Each button sets the current scenario. Events replace one another — they do not accumulate.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {EVENTS.map((event) => {
          const isActive = activeType === event.type;
          return (
            <button
              key={event.type}
              type="button"
              disabled={disabled}
              onClick={() => onEvent(event.type)}
              className={`rounded-md border px-4 py-3 text-left transition disabled:opacity-50 ${
                isActive
                  ? "border-ops-accent bg-ops-accent/15 text-ops-accent"
                  : "border-ops-border bg-ops-panel2 text-ops-text hover:border-ops-accent/40"
              }`}
            >
              <span className="block text-sm font-semibold">{event.label}</span>
              <span className="mt-1 block font-mono text-xs opacity-80">{event.detail}</span>
            </button>
          );
        })}
        <button
          type="button"
          disabled={disabled}
          onClick={onReset}
          className="rounded-md border border-ops-border bg-ops-bg px-4 py-3 text-left text-ops-text hover:border-ops-muted disabled:opacity-50"
        >
          <span className="block text-sm font-semibold">Reset Scenario</span>
          <span className="mt-1 block font-mono text-xs text-ops-muted">Clear active event</span>
        </button>
      </div>

      <div className="mt-4 grid gap-3 rounded-md border border-ops-border bg-ops-panel2 p-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Active Event</p>
          <p className="mt-1 font-semibold text-ops-text">
            {activeScenario?.label || "No Active Event"}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Impact</p>
          <p className="mt-1 font-mono text-ops-warn">
            +{activeScenario?.additionalDelayMinutes ?? 0} minutes
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Reason</p>
          <p className="mt-1 text-sm text-ops-muted">{explanation?.reason || "—"}</p>
        </div>
      </div>
    </section>
  );
}

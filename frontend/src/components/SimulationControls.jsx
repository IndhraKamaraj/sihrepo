export default function SimulationControls({
  simulation,
  onStart,
  onPause,
  onReset,
  onSpeed,
  disabled,
}) {
  if (!simulation) return null;
  const speeds = [1, 5, 10];

  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-4 shadow-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-accent">
            {simulation.modeLabel || "SIMULATION MODE"}
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ops-text">
            Demo Simulation Control
          </h2>
          <p className="mt-1 font-mono text-sm text-ops-muted">
            Journey {simulation.journeyStart} → {simulation.journeyEnd}
          </p>
        </div>
        <div className="rounded-md border border-ops-border bg-ops-panel2 px-4 py-2 text-right">
          <p className="text-[10px] uppercase tracking-wide text-ops-muted">Current simulated time</p>
          <p className="font-mono text-2xl font-semibold text-ops-accent">
            {simulation.currentTime}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={disabled || simulation.running}
          onClick={onStart}
          className="rounded-md bg-ops-accent px-4 py-2 text-sm font-semibold text-ops-bg disabled:opacity-50"
        >
          ▶ Start
        </button>
        <button
          type="button"
          disabled={disabled || !simulation.running}
          onClick={onPause}
          className="rounded-md border border-ops-border bg-ops-panel2 px-4 py-2 text-sm text-ops-text disabled:opacity-50"
        >
          Ⅱ Pause
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onReset}
          className="rounded-md border border-ops-border bg-ops-panel2 px-4 py-2 text-sm text-ops-text disabled:opacity-50"
        >
          ↻ Reset
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-ops-muted">Simulation speed</span>
          {speeds.map((speed) => (
            <button
              key={speed}
              type="button"
              disabled={disabled}
              onClick={() => onSpeed(speed)}
              className={`rounded border px-2.5 py-1 font-mono text-xs ${
                simulation.speed === speed
                  ? "border-ops-accent bg-ops-accent/15 text-ops-accent"
                  : "border-ops-border text-ops-muted hover:text-ops-text"
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-xs text-ops-muted">
        Pure demonstration clock — not live railway tracking.
      </p>
    </section>
  );
}

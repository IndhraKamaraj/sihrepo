export default function Header({ dataStatus, simulation }) {
  return (
    <header className="border-b border-ops-border bg-ops-panel/90 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-semibold tracking-tight text-ops-text sm:text-2xl">
              ETA Intelligence
            </h1>
            <span className="rounded border border-ops-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ops-muted">
              SIH26028
            </span>
            {simulation?.running ? (
              <span className="rounded bg-ops-accent/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ops-accent">
                {simulation.modeLabel || "SIMULATION MODE"}
              </span>
            ) : (
              <span className="rounded bg-ops-panel2 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ops-muted">
                SIMULATION MODE
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ops-muted">
            Dynamic Expected Time of Arrival Prediction System
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {simulation ? (
            <div className="rounded-md border border-ops-border bg-ops-panel2 px-3 py-1.5 font-mono text-xs text-ops-text">
              Sim clock <span className="text-ops-accent">{simulation.currentTime}</span>
              <span className="mx-2 text-ops-muted">·</span>
              {simulation.speed}x
            </div>
          ) : null}
          <div className="rounded-md border border-ops-warn/40 bg-ops-warn/10 px-3 py-1.5 text-xs text-ops-warn">
            {dataStatus || "Simulation / Demonstration Data"}
          </div>
        </div>
      </div>
    </header>
  );
}

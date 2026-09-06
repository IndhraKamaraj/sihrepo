export default function TrainSelector({ trains, selectedTrainNumber, onSelect, disabled }) {
  if (!trains?.length) return null;

  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-4 shadow-panel">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Train Selection</p>
          <h2 className="mt-1 text-sm font-semibold text-ops-text">Selected Train</h2>
        </div>
        <select
          className="min-w-[240px] rounded-md border border-ops-border bg-ops-panel2 px-3 py-2 font-mono text-sm text-ops-text outline-none focus:border-ops-accent"
          value={selectedTrainNumber || ""}
          disabled={disabled}
          onChange={(e) => onSelect(e.target.value)}
        >
          {trains.map((train) => (
            <option key={train.trainNumber} value={train.trainNumber}>
              {train.trainNumber} · {train.trainName}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-2 text-xs text-ops-muted">
        Dashboard, network marker, ETA, timeline, and events update for the selected demo train.
      </p>
    </section>
  );
}

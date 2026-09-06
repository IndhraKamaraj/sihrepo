/**
 * Schematic MAS → CBE corridor visualization (not a GIS map).
 */
export default function NetworkMap({ network, selectedTrainNumber }) {
  if (!network?.stations?.length) return null;

  const stations = network.stations;
  const count = stations.length;
  const width = 960;
  const height = 220;
  const padX = 40;
  const usable = width - padX * 2;
  const y = 110;

  const xAt = (index) => padX + (usable * index) / Math.max(count - 1, 1);

  const markers = network.markers || [];

  return (
    <section className="rounded-lg border border-ops-border bg-ops-panel p-4 shadow-panel">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ops-muted">Network Overview</p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ops-text">
            {network.corridor?.name || "Chennai → Coimbatore Corridor"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded border border-ops-border px-2 py-1 text-ops-muted">
            Condition: <span className="text-ops-text">{network.condition}</span>
          </span>
          {network.affectedSection ? (
            <span className="rounded border border-ops-warn/30 bg-ops-warn/10 px-2 py-1 text-ops-warn">
              Affected: {network.affectedSection}
            </span>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[720px] w-full">
          <line
            x1={padX}
            y1={y}
            x2={width - padX}
            y2={y}
            stroke="#243246"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {network.condition !== "Normal" ? (
            <line
              x1={xAt(Math.max(0, (markers.find((m) => m.selected)?.stationIndex ?? 8)))}
              y1={y}
              x2={xAt(Math.min(count - 1, (markers.find((m) => m.selected)?.stationIndex ?? 8) + 1))}
              y2={y}
              stroke={
                network.condition === "Congested"
                  ? "#f59e0b"
                  : network.condition === "Restricted"
                    ? "#38bdf8"
                    : "#f87171"
              }
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.85"
            />
          ) : null}

          {stations.map((station, index) => {
            const x = xAt(index);
            return (
              <g key={station.code}>
                <circle cx={x} cy={y} r="7" fill="#172231" stroke="#8b9bb0" strokeWidth="2" />
                <text
                  x={x}
                  y={y + 28}
                  textAnchor="middle"
                  fill="#8b9bb0"
                  fontSize="11"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {station.code}
                </text>
              </g>
            );
          })}

          {markers.map((marker, idx) => {
            const base = marker.stationIndex ?? 0;
            const progress = Math.min(Math.max(marker.progressToNext || 0, 0), 0.98);
            const x =
              marker.direction === "reverse"
                ? xAt(base) - (xAt(base) - xAt(Math.max(base - 1, 0))) * progress
                : xAt(base) + (xAt(Math.min(base + 1, count - 1)) - xAt(base)) * progress;
            const selected = marker.trainNumber === selectedTrainNumber || marker.selected;
            const offsetY = selected ? -18 : idx % 2 === 0 ? -28 : 28;
            return (
              <g key={marker.trainNumber}>
                <circle
                  cx={x}
                  cy={y + (selected ? 0 : offsetY > 0 ? 14 : -14)}
                  r={selected ? 10 : 7}
                  fill={selected ? "#2dd4bf" : marker.delayed ? "#f59e0b" : "#3b82f6"}
                  stroke="#0c1219"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={y + (selected ? -22 : offsetY)}
                  textAnchor="middle"
                  fill={selected ? "#2dd4bf" : "#e8eef6"}
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                >
                  {marker.trainNumber}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-xs text-ops-muted">
        Schematic corridor view for demonstration — not a geographic map.
      </p>
    </section>
  );
}

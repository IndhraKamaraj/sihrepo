const NAV = [
  { id: "overview", label: "Overview" },
  { id: "simulation", label: "Live Simulation" },
  { id: "monitor", label: "Train Monitor" },
  { id: "eta", label: "ETA Prediction" },
  { id: "network", label: "Network Status" },
  { id: "events", label: "Operational Events" },
];

export default function Sidebar({ active, onChange, collapsed, onToggle }) {
  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-ops-border bg-ops-panel transition-all ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between border-b border-ops-border px-3 py-4">
        {!collapsed ? (
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ops-accent">
              SIH26028
            </p>
            <p className="mt-1 text-sm font-semibold text-ops-text">Control Deck</p>
          </div>
        ) : (
          <p className="mx-auto font-mono text-[10px] text-ops-accent">SIH</p>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded border border-ops-border px-2 py-1 text-xs text-ops-muted hover:text-ops-text"
          aria-label="Toggle sidebar"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-md px-3 py-2.5 text-left text-sm transition ${
                isActive
                  ? "bg-ops-accent/15 text-ops-accent"
                  : "text-ops-muted hover:bg-ops-panel2 hover:text-ops-text"
              }`}
              title={item.label}
            >
              {collapsed ? item.label.slice(0, 1) : item.label}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-ops-border p-3 text-[11px] text-ops-muted">
        {!collapsed ? "Simulation / Demonstration Data" : "SIM"}
      </div>
    </aside>
  );
}

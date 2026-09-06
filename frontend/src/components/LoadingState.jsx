export default function LoadingState() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="rounded-lg border border-ops-border bg-ops-panel px-8 py-10 text-center shadow-panel">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-ops-accent border-t-transparent" />
        <p className="mt-4 font-medium text-ops-text">Loading ETA Intelligence…</p>
        <p className="mt-1 text-sm text-ops-muted">Fetching simulation state from the API</p>
      </div>
    </div>
  );
}

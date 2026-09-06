export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <div className="max-w-lg rounded-lg border border-ops-danger/40 bg-ops-panel px-8 py-10 text-center shadow-panel">
        <p className="text-[11px] uppercase tracking-wide text-ops-danger">Connection Error</p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ops-text">
          Unable to load dashboard
        </h2>
        <p className="mt-3 text-sm text-ops-muted">
          {message ||
            "Backend unavailable. Start the ETA simulation server and try again."}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-md bg-ops-accent px-5 py-2.5 text-sm font-semibold text-ops-bg"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

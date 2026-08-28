export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-200">
      <div className="text-lg font-semibold">Something went wrong</div>
      <div className="mt-2 text-sm text-rose-100/80">Unable to load this section.</div>
      {onRetry ? (
        <button onClick={onRetry} className="mt-4 rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white">
          Retry
        </button>
      ) : null}
    </div>
  );
}

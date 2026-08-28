import type { Signal } from '@/types';

export function SignalCard({ signal }: { signal: Signal }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-white">{signal.title}</div>
        <span className="text-xs text-cyan-300">{signal.market}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
        <span>Odds</span>
        <span className="font-bold text-emerald-400">{signal.odds.toFixed(2)}</span>
      </div>
      <div className="mt-2 text-xs text-slate-400">Entry: {signal.entry ?? '—'} · Target: {signal.target ?? '—'}</div>
    </div>
  );
}

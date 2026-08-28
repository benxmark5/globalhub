import type { StadiumEvent } from '@/types';

export function EventCard({ event }: { event: StadiumEvent }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div className="text-lg font-semibold text-white">{event.name}</div>
      <div className="mt-2 text-sm text-slate-400">{event.venue}</div>
      <div className="mt-3 text-xs text-cyan-300">{new Date(event.kickoff_time).toLocaleString()}</div>
    </div>
  );
}

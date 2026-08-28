import type { Ticket } from '@/types';

export function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-white">{ticket.event_name}</div>
        <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{ticket.status}</span>
      </div>
      <div className="mt-3 text-sm text-slate-400">Ticket #{ticket.id}</div>
      <div className="mt-4 text-xl font-bold text-cyan-300">${ticket.total_amount.toFixed(2)}</div>
    </div>
  );
}

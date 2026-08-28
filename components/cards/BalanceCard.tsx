import type { Wallet } from '@/types';

export function BalanceCard(
  props: Partial<Wallet> & { availableBalance?: number; pendingBalance?: number; currency?: string }
) {
  const availableBalance = props.availableBalance ?? props.available_balance ?? 0;
  const pendingBalance = props.pendingBalance ?? props.pending_balance ?? 0;
  const currency = props.currency ?? props.currency ?? 'USD';

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-sm">
      <div className="text-sm text-slate-300">Wallet</div>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-white">{currency} {availableBalance.toFixed(2)}</div>
          <div className="text-sm text-slate-400">Available balance</div>
        </div>
        <div className="text-right text-sm text-slate-300">
          <div>Pending</div>
          <div className="font-semibold text-amber-400">{currency} {pendingBalance.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}

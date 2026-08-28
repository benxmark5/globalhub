import type { Transaction } from '@/types';

export function TransactionItem({ transaction, className = '' }: { transaction: Transaction; className?: string }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 p-3 ${className}`}>
      <div>
        <div className="font-medium text-white">{transaction.description ?? transaction.type}</div>
        <div className="text-xs text-slate-400">{new Date(transaction.created_at).toLocaleString()}</div>
      </div>
      <div className={transaction.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
        {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
      </div>
    </div>
  );
}

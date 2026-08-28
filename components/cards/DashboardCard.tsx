import type { ReactNode } from 'react';

export function DashboardCard({
  title,
  value,
  icon,
  color = 'accent',
  href,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'success' | 'warning' | 'accent' | 'purple';
  href?: string;
}) {
  const tone = {
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    accent: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
    purple: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
  }[color];

  const card = (
    <div className={`rounded-2xl border p-4 ${tone}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-300">{title}</div>
          <div className="mt-2 text-2xl font-bold text-white">{value}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );

  if (!href) return card;
  return <a href={href}>{card}</a>;
}

'use client';

import { useState } from 'react';

export function Tabs<T extends { id: string; label: string; badge?: number | string; content: React.ReactNode }>({
  tabs,
  defaultTab,
  variant = 'underline',
}: {
  tabs: T[];
  defaultTab?: string;
  variant?: 'underline' | 'pills';
}) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const activeItem = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={
              variant === 'underline'
                ? `rounded-t-lg border-b-2 px-3 py-2 text-sm ${activeTab === tab.id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-400'}`
                : `rounded-full border px-3 py-2 text-sm ${activeTab === tab.id ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300' : 'border-slate-700 bg-slate-900 text-slate-300'}`
            }
          >
            {tab.label}
            {tab.badge !== undefined ? <span className="ml-2 text-xs">{tab.badge}</span> : null}
          </button>
        ))}
      </div>
      <div>{activeItem?.content}</div>
    </div>
  );
}

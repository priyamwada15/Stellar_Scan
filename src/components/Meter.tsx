import React from 'react';

export const Meter: React.FC<{
  label: string;
  value: string;
  percent: number;
}> = ({ label, value, percent }) => {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="mb-3">
      <div className="font-body text-label uppercase tracking-widest text-phosphor/50 mb-1">
        {label}
      </div>
      <div className="flex items-center gap-1">
        <div className="w-1.5 self-stretch border-t border-b border-l border-phosphor/25" aria-hidden="true" />
        <div className="flex-1 h-4 bg-void-dark overflow-hidden">
          <div
            className="h-full transition-[width] duration-150 ease-out"
            style={{
              width: `${clamped}%`,
              opacity: 0.85,
              backgroundImage:
                'repeating-linear-gradient(45deg, var(--color-phosphor) 0, var(--color-phosphor) 2px, transparent 2px, transparent 4px)',
            }}
          />
        </div>
        <div className="w-1.5 self-stretch border-t border-b border-r border-phosphor/25" aria-hidden="true" />
        <span className="font-body text-body-sm text-accent w-16 text-right flex-shrink-0">
          {value}
        </span>
      </div>
    </div>
  );
};

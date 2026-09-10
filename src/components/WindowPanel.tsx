import React from 'react';

export const WindowPanel: React.FC<{
  title: string;
  className?: string;
  children: React.ReactNode;
}> = ({ title, className = '', children }) => (
  <div className={`relative border-[3px] border-double border-phosphor/25 ${className}`}>
    <div className="flex items-center justify-between gap-2 px-2 py-1 bg-phosphor/10 border-b border-phosphor/25">
      <span
        aria-hidden="true"
        className="w-3 h-3 flex-shrink-0 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70"
      >
        &#8598;
      </span>
      <span className="font-body text-label uppercase tracking-widest text-phosphor/70 truncate">
        {title}
      </span>
      <span
        aria-hidden="true"
        className="w-3 h-3 flex-shrink-0 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70"
      >
        ?
      </span>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

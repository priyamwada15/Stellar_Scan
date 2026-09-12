import React from 'react';

export const WindowPanel: React.FC<{
  title: string;
  className?: string;
  children: React.ReactNode;
  onClose?: () => void;
  titleFontSize?: number;
}> = ({ title, className = '', children, onClose, titleFontSize = 10 }) => (
  <div className={`relative border-[2.4px] border-solid border-phosphor/25 ${className}`}>
    <div className="flex items-center justify-between gap-2 px-2 py-1 bg-phosphor/10 border-b border-phosphor/25">
      {onClose ? (
        <span className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      ) : (
        <span
          aria-hidden="true"
          className="w-3 h-3 flex-shrink-0 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70"
        >
          &#8598;
        </span>
      )}
      <span
        className="font-body uppercase tracking-widest text-phosphor/70 truncate"
        style={{ fontSize: `${titleFontSize}px` }}
      >
        {title}
      </span>
      {onClose ? (
        <button
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="w-3 h-3 flex-shrink-0 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70 hover:text-phosphor hover:border-phosphor/50"
        >
          &#10005;
        </button>
      ) : (
        <span
          aria-hidden="true"
          className="w-3 h-3 flex-shrink-0 border border-phosphor/25 flex items-center justify-center text-[8px] leading-none text-phosphor/70"
        >
          ?
        </span>
      )}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

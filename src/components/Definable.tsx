import React, { useState, useRef, useEffect } from 'react';

const DEFAULT_BUTTON_CLASSES =
  'font-body text-phosphor underline decoration-dotted decoration-phosphor/40 underline-offset-4 hover:bg-phosphor/10';

export const Definable: React.FC<{
  label: string;
  definition: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ label, definition, className, style }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={className || DEFAULT_BUTTON_CLASSES}
        style={style}
      >
        {label}
      </button>
      {open && (
        <div className="absolute z-30 right-0 top-full mt-2 w-56 p-3 bg-void-dark border border-phosphor/30 text-label text-phosphor/75 leading-relaxed font-body shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          {definition}
        </div>
      )}
    </span>
  );
};

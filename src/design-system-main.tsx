import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DialRoot, useDialKit } from 'dialkit';
import { Agentation } from 'agentation';
import 'dialkit/styles.css';
import { DesignSystem } from './components/DesignSystem';
import './index.css';

function Root() {
  const typeScale = useDialKit('Type Scale', {
    display: [56, 24, 96],
    title: [24, 14, 48],
    heading: [20, 12, 36],
    body: [14, 10, 28],
    bodySm: [12, 9, 24],
    label: [10, 7, 18],
  });

  return (
    <div
      className="min-h-screen relative"
      style={{
        ['--text-display' as string]: `${typeScale.display}px`,
        ['--text-title' as string]: `${typeScale.title}px`,
        ['--text-heading' as string]: `${typeScale.heading}px`,
        ['--text-body' as string]: `${typeScale.body}px`,
        ['--text-body-sm' as string]: `${typeScale.bodySm}px`,
        ['--text-label' as string]: `${typeScale.label}px`,
      } as React.CSSProperties}
    >
      {import.meta.env.DEV && <DialRoot position="top-right" theme="dark" />}
      {import.meta.env.DEV && <Agentation />}
      <DesignSystem />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

'use client';

import { ReactNode } from 'react';

interface Props {
  label?: string;
  children: ReactNode;
  onMore?: () => void;
  moreLabel?: string;
}

export default function InsightCard({
  label = 'AI 建议',
  children,
  onMore,
  moreLabel = '查看更多建议',
}: Props) {
  return (
    <div style={{
      marginTop: 20,
      background: 'linear-gradient(180deg, rgba(255,186,92,0.05), rgba(255,186,92,0.02))',
      borderLeft: '2px solid var(--amber)',
      borderRadius: '4px 10px 10px 4px',
      padding: '14px 18px',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 11, color: 'var(--amber)', fontWeight: 500,
        letterSpacing: '0.08em', textTransform: 'uppercase',
      }}>
        <svg width="11" height="11" viewBox="0 0 12 12">
          <path d="M6 1l1.2 3.3L10.5 5.5 7.2 6.7 6 10l-1.2-3.3L1.5 5.5l3.3-1.2z" fill="currentColor" opacity="0.9"/>
        </svg>
        {label}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--fg-1)' }}>
        {children}
      </div>
      {onMore && (
        <button
          onClick={onMore}
          style={{
            alignSelf: 'flex-start', marginTop: 4,
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            fontSize: 12, color: 'var(--amber)', fontWeight: 500,
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          {moreLabel} <span style={{ fontSize: 14 }}>→</span>
        </button>
      )}
    </div>
  );
}

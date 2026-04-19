'use client';

import { TimeCategory } from '@/lib/types';

interface Props {
  categories: TimeCategory[];
  onChange: (cats: TimeCategory[]) => void;
}

export default function TimePanel({ categories, onChange }: Props) {
  const data = categories.map(c => ({ ...c, monthHours: c.hoursPerWeek * 4.3 }));
  const totalWeek = categories.reduce((s, c) => s + c.hoursPerWeek, 0);
  const totalMonth = totalWeek * 4.3;
  const serviceWeek = categories.find(c => c.id === 'service')?.hoursPerWeek ?? 0;
  const incomePct = totalWeek > 0 ? (serviceWeek / totalWeek) * 100 : 0;

  const handleChange = (id: string, value: number) => {
    onChange(categories.map(c => c.id === id ? { ...c, hoursPerWeek: Math.max(0, value) } : c));
  };

  return (
    <section style={{
      background: 'var(--bg-1)',
      border: '1px solid var(--line)',
      borderRadius: 16, padding: 28,
    }}>
      {/* Header */}
      <header style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 20, gap: 16,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--fg-0)' }}>
            时间花在哪了
          </h2>
          <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--fg-2)' }}>
            填写每周投入小时数，自动计算时间分配比例
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em' }}>每周 / 每月</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="serif" style={{ fontSize: 28, color: 'var(--fg-0)', lineHeight: 1 }}>
              {totalWeek}h
            </span>
            <span style={{ fontSize: 14, color: 'var(--fg-2)' }}>
              / {totalMonth.toFixed(0)}h
            </span>
          </div>
        </div>
      </header>

      {/* Stacked bar */}
      {totalWeek > 0 && (
        <div style={{
          display: 'flex', height: 44, borderRadius: 8, overflow: 'hidden',
          border: '1px solid var(--line)',
          marginBottom: 8,
        }}>
          {data.map((t, i) => {
            const pct = (t.hoursPerWeek / totalWeek) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={t.id}
                title={`${t.name} · ${t.hoursPerWeek}h/周 (${pct.toFixed(1)}%)`}
                style={{
                  width: `${pct}%`,
                  background: t.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRight: i < data.length - 1 ? '1px solid rgba(0,0,0,0.25)' : 'none',
                  transition: 'width .4s ease',
                  minWidth: pct > 3 ? undefined : 0,
                }}
              >
                {pct > 10 && (
                  <span className="mono" style={{
                    fontSize: 11, color: 'rgba(0,0,0,0.7)', fontWeight: 500,
                  }}>
                    {t.hoursPerWeek}h
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Category rows with inputs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {data.map(t => {
          const pct = totalWeek > 0 ? (t.hoursPerWeek / totalWeek) * 100 : 0;
          return (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: '10px 1fr 100px 60px',
              alignItems: 'center', gap: 14,
              padding: '12px 0',
              borderBottom: '1px solid var(--line)',
            }}>
              {/* Color dot */}
              <span style={{
                display: 'inline-block', width: 8, height: 8,
                borderRadius: '50%', background: t.color,
              }} />

              {/* Name */}
              <div style={{ fontSize: 13, color: 'var(--fg-0)' }}>{t.name}</div>

              {/* Input */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--bg-2)',
                border: '1px solid var(--line)',
                borderRadius: 6, padding: '4px 8px',
              }}>
                <input
                  type="number"
                  value={t.hoursPerWeek || ''}
                  onChange={e => handleChange(t.id, Number(e.target.value) || 0)}
                  placeholder="0"
                  className="mono"
                  style={{
                    width: '100%', background: 'transparent', border: 'none',
                    fontSize: 13, color: 'var(--fg-0)', outline: 'none',
                    textAlign: 'right',
                  }}
                />
                <span style={{ fontSize: 11, color: 'var(--fg-3)', whiteSpace: 'nowrap' }}>h/周</span>
              </div>

              {/* Percentage */}
              <div className="mono" style={{
                fontSize: 11, color: 'var(--fg-3)', textAlign: 'right',
              }}>
                {pct > 0 ? `${pct.toFixed(1)}%` : '—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      {totalWeek > 0 && (
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
            时间洞察
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--fg-1)' }}>
            每周{' '}
            <span className="mono" style={{ color: 'var(--fg-0)' }}>{totalWeek}h</span> 中，
            直接产生收入的时间占{' '}
            <span className="mono" style={{ color: 'var(--amber)' }}>{incomePct.toFixed(1)}%</span>。
            {serviceWeek < 8 && (
              <>
                建议将 &ldquo;接单 / 服务&rdquo; 提高到每周{' '}
                <span className="mono" style={{ color: 'var(--fg-0)' }}>8h</span> 以上。
              </>
            )}
          </div>
        </div>
      )}

      {/* Empty guide */}
      {totalWeek === 0 && (
        <div style={{
          textAlign: 'center', padding: '20px 0', color: 'var(--fg-3)', fontSize: 13,
        }}>
          在右侧输入框填写每周小时数，开始追踪你的时间分配
        </div>
      )}
    </section>
  );
}

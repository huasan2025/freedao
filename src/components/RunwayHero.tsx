'use client';

import { useState, useEffect } from 'react';

function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const fmt = (n: number) => '¥' + Math.abs(Math.round(n)).toLocaleString('zh-CN');

interface Props {
  savings: number;
  monthlyExpense: number;
  monthlyIncome: number;
  passiveIncome: number;
  onSavingsChange: (v: number) => void;
}

export default function RunwayHero({ savings, monthlyExpense, monthlyIncome, passiveIncome, onSavingsChange }: Props) {
  const gap = Math.max(0, monthlyExpense - monthlyIncome);
  const runwayMonths = gap > 0 ? savings / gap : Infinity;

  // Freedom: passive income vs total expense
  const freedomGap = Math.max(0, monthlyExpense - passiveIncome);
  const freedomPct = monthlyExpense > 0
    ? Math.max(0.01, Math.min(1, passiveIncome / monthlyExpense))
    : 0;
  const freedomPctDisplay = freedomPct * 100;
  const isFree = passiveIncome >= monthlyExpense && monthlyExpense > 0;

  const freedomGapValue = useCountUp(freedomGap, 1100);
  const runwayValue = useCountUp(runwayMonths === Infinity ? 0 : runwayMonths, 1100);

  const isEmpty = monthlyExpense === 0 && monthlyIncome === 0 && passiveIncome === 0;

  const now = new Date();
  const dateStr = now
    .toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    .replace('星期', '周');

  const [editingSavings, setEditingSavings] = useState(false);
  const [savingsInput, setSavingsInput] = useState(String(savings));
  useEffect(() => { setSavingsInput(String(savings)); }, [savings]);

  const commitSavings = () => {
    onSavingsChange(Number(savingsInput) || 0);
    setEditingSavings(false);
  };

  if (isEmpty) {
    return (
      <section style={{
        position: 'relative',
        background: 'linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)',
        border: '1px solid var(--line)',
        borderRadius: 20,
        padding: '60px 48px',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(255,186,92,0.08), transparent 50%)',
          pointerEvents: 'none',
        }} />
        {/* Grid texture */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            marginBottom: 32, fontSize: 11.5, color: 'var(--fg-2)', letterSpacing: '0.04em',
          }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
            <span className="mono" style={{ textTransform: 'uppercase', marginLeft: 10 }}>FREEDOM COUNTDOWN</span>
          </div>

          <div className="serif" style={{
            fontSize: 32, color: 'var(--fg-0)', fontStyle: 'italic', marginBottom: 16,
          }}>
            开始你的自由之旅
          </div>
          <div style={{ fontSize: 14, color: 'var(--fg-1)', lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
            在下方添加你的第一笔收支，开始追踪自由进度。
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-2)', marginTop: 8 }}>
            跑道（Runway）= 存款还能撑多少月 · 自由进度 = 被动收入 / 月支出
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 10,
            background: 'var(--overlay-subtle)',
            border: '1px solid var(--line)',
            fontSize: 13, color: 'var(--fg-1)',
            marginTop: 28,
          }}>
            <span>现金储备：</span>
            {editingSavings ? (
              <input
                type="number"
                value={savingsInput}
                onChange={e => setSavingsInput(e.target.value)}
                onBlur={commitSavings}
                onKeyDown={e => e.key === 'Enter' && commitSavings()}
                autoFocus
                className="mono"
                style={{
                  background: 'var(--overlay-input)',
                  border: '1px solid var(--amber)',
                  borderRadius: 4, padding: '2px 8px',
                  color: 'var(--fg-0)', fontSize: 12.5,
                  width: 120, textAlign: 'right', outline: 'none',
                }}
              />
            ) : (
              <button
                onClick={() => setEditingSavings(true)}
                className="mono"
                style={{
                  background: 'transparent', border: 'none',
                  color: 'var(--fg-1)', cursor: 'pointer',
                  fontSize: 12.5, padding: '2px 4px',
                  borderBottom: '1px dashed var(--fg-3)',
                }}
              >
                ¥{savings.toLocaleString('zh-CN')}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{
      position: 'relative',
      background: 'linear-gradient(180deg, var(--bg-1) 0%, var(--bg-0) 100%)',
      border: '1px solid var(--line)',
      borderRadius: 20,
      padding: '44px 48px 40px',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 85% 20%, rgba(255,186,92,0.10), transparent 40%)',
        pointerEvents: 'none',
      }} />
      {/* Grid texture */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        {/* Header meta */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 28, fontSize: 11.5, color: 'var(--fg-2)', letterSpacing: '0.04em',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} />
            <span className="mono" style={{ textTransform: 'uppercase' }}>FREEDOM COUNTDOWN</span>
          </div>
          <div className="mono">{dateStr}</div>
        </div>

        {/* Main figure + Right cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 56,
          alignItems: 'end', marginBottom: 44,
        }}>
          {/* Left: freedom gap figure */}
          <div>
            <div style={{ fontSize: 14, color: 'var(--fg-1)', marginBottom: 14 }}>
              {isFree ? '被动收入已覆盖支出' : '距离自由还差（被动收入缺口）'}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="serif" style={{
                fontSize: 96, lineHeight: 0.95, letterSpacing: '-0.02em',
                color: isFree ? 'var(--ok)' : 'var(--fg-0)', fontWeight: 400,
              }}>
                {isFree ? '✓' : `¥${Math.round(freedomGapValue).toLocaleString('zh-CN')}`}
              </span>
              {!isFree && (
                <span className="serif" style={{
                  fontSize: 28, color: 'var(--fg-2)', fontStyle: 'italic',
                }}>/ 月</span>
              )}
            </div>
            <div style={{ marginTop: 18, fontSize: 13.5, color: 'var(--fg-1)', lineHeight: 1.65 }}>
              月支出{' '}
              <span className="mono" style={{ color: 'var(--fg-0)' }}>{fmt(monthlyExpense)}</span>
              <span style={{ color: 'var(--fg-3)', margin: '0 10px' }}>−</span>
              被动收入{' '}
              <span className="mono" style={{ color: 'var(--fg-0)' }}>{fmt(passiveIncome)}</span>
              <span style={{ color: 'var(--fg-3)', margin: '0 10px' }}>=</span>
              <span className="mono" style={{ color: isFree ? 'var(--ok)' : 'var(--amber)' }}>
                {isFree ? '已覆盖' : fmt(freedomGap)}
              </span>
            </div>
            {monthlyIncome > passiveIncome && (
              <div style={{ marginTop: 8, fontSize: 12, color: 'var(--fg-2)' }}>
                劳动收入{' '}
                <span className="mono" style={{ color: 'var(--fg-1)' }}>{fmt(monthlyIncome - passiveIncome)}</span>
                {' '}维持着跑道，但还不是自由
              </div>
            )}
          </div>

          {/* Right: runway card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Runway */}
            <div style={{
              background: 'var(--overlay-subtle)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: '22px 24px',
            }}>
              <div style={{
                fontSize: 11.5, color: 'var(--fg-2)', letterSpacing: '0.04em',
                textTransform: 'uppercase', marginBottom: 12,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>按当前节奏 · 跑道</span>
                <span className="mono">RUNWAY</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="serif" style={{ fontSize: 54, lineHeight: 1, color: 'var(--fg-0)' }}>
                  {runwayMonths === Infinity ? '∞' : runwayValue.toFixed(1)}
                </span>
                <span style={{ fontSize: 16, color: 'var(--fg-1)' }}>个月</span>
              </div>
              <div style={{
                marginTop: 10, fontSize: 12.5, color: 'var(--fg-2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span>现金储备</span>
                {editingSavings ? (
                  <input
                    type="number"
                    value={savingsInput}
                    onChange={e => setSavingsInput(e.target.value)}
                    onBlur={commitSavings}
                    onKeyDown={e => e.key === 'Enter' && commitSavings()}
                    autoFocus
                    className="mono"
                    style={{
                      background: 'var(--overlay-input)',
                      border: '1px solid var(--amber)',
                      borderRadius: 4, padding: '2px 8px',
                      color: 'var(--fg-0)', fontSize: 12.5,
                      width: 120, textAlign: 'right', outline: 'none',
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setEditingSavings(true)}
                    className="mono"
                    style={{
                      background: 'transparent', border: 'none',
                      color: 'var(--fg-1)', cursor: 'pointer',
                      fontSize: 12.5, padding: '2px 4px',
                      borderBottom: '1px dashed var(--fg-3)',
                    }}
                  >
                    ¥{savings.toLocaleString('zh-CN')}
                  </button>
                )}
              </div>
            </div>

            {/* Freedom progress mini card */}
            <div style={{
              background: isFree ? 'rgba(116,195,149,0.06)' : 'rgba(255,186,92,0.06)',
              border: `1px solid ${isFree ? 'rgba(116,195,149,0.2)' : 'rgba(255,186,92,0.2)'}`,
              borderRadius: 14,
              padding: '16px 24px',
            }}>
              <div style={{
                fontSize: 11.5, color: 'var(--fg-2)', letterSpacing: '0.04em',
                textTransform: 'uppercase', marginBottom: 8,
              }}>
                FREEDOM PROGRESS · 自由进度
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span className="serif" style={{
                  fontSize: 36, lineHeight: 1,
                  color: isFree ? 'var(--ok)' : 'var(--amber)',
                }}>
                  {freedomPctDisplay.toFixed(1)}%
                </span>
                <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>
                  被动收入 / 月支出
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar — passive income toward freedom */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11.5, color: 'var(--fg-2)', marginBottom: 10,
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)' }} />
              <span className="mono">现在</span>
            </span>
            <span className="mono" style={{ color: 'var(--fg-1)' }}>
              被动收入 {fmt(passiveIncome)} · 覆盖支出的 {freedomPctDisplay.toFixed(1)}%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="mono">自由</span>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--ok)' }} />
            </span>
          </div>
          <div style={{
            position: 'relative', height: 10,
            background: 'var(--bar-bg)',
            borderRadius: 99, overflow: 'visible',
          }}>
            {/* Full gradient (dimmed) */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 99,
              background: 'linear-gradient(90deg, oklch(0.68 0.18 25) 0%, oklch(0.80 0.16 75) 50%, oklch(0.72 0.15 155) 100%)',
              opacity: 0.28,
            }} />
            {/* Active portion */}
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${freedomPctDisplay}%`,
              borderRadius: 99,
              background: isFree
                ? 'linear-gradient(90deg, oklch(0.60 0.15 155) 0%, oklch(0.72 0.15 155) 100%)'
                : 'linear-gradient(90deg, oklch(0.68 0.18 25) 0%, oklch(0.80 0.16 75) 100%)',
              boxShadow: isFree
                ? '0 0 18px oklch(0.72 0.15 155 / 0.4)'
                : '0 0 18px oklch(0.80 0.16 75 / 0.4)',
              transition: 'width .9s cubic-bezier(.2,.8,.2,1)',
            }} />
            {/* "You are here" marker */}
            <div style={{
              position: 'absolute', left: `${Math.min(freedomPctDisplay, 100)}%`, top: '50%',
              transform: 'translate(-50%, -50%)',
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                background: isFree ? 'var(--ok)' : 'var(--amber)',
                border: '3px solid var(--bg-0)',
                boxShadow: `0 0 0 1px ${isFree ? 'var(--ok)' : 'var(--amber)'}, 0 0 20px ${isFree ? 'rgba(116,195,149,0.5)' : 'rgba(255,186,92,0.5)'}`,
              }} />
            </div>
            {/* Label above marker */}
            <div style={{
              position: 'absolute', left: `${Math.min(freedomPctDisplay, 100)}%`, top: -34,
              transform: 'translateX(-50%)', pointerEvents: 'none',
            }}>
              <div style={{
                fontSize: 10.5, color: isFree ? 'var(--ok)' : 'var(--amber)', fontWeight: 500,
                letterSpacing: '0.06em', whiteSpace: 'nowrap',
                padding: '3px 8px', borderRadius: 4,
                background: isFree ? 'rgba(116,195,149,0.10)' : 'rgba(255,186,92,0.10)',
                border: `1px solid ${isFree ? 'rgba(116,195,149,0.25)' : 'rgba(255,186,92,0.25)'}`,
              }}>{isFree ? '已自由' : '你在这里'}</div>
            </div>
          </div>
          <div className="mono" style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: 'var(--fg-3)', marginTop: 10,
          }}>
            <span>¥0</span>
            <span>{monthlyExpense > 0 ? fmt(Math.round(monthlyExpense / 2)) : '—'}</span>
            <span>{monthlyExpense > 0 ? fmt(monthlyExpense) : '—'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

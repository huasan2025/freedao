'use client';

import { useState, useMemo } from 'react';

const fmt = (n: number) => '¥' + Math.abs(Math.round(n)).toLocaleString('zh-CN');

/* ── Slider ──────────────────────────────────────────────────────────── */

function Slider({ label, value, onChange, min, max, step = 1, unit = '', format, accent = 'var(--amber)' }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
  format?: (v: number) => string; accent?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : String(value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 12, color: 'var(--fg-1)' }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span className="mono" style={{ fontSize: 16, color: 'var(--fg-0)' }}>{display}</span>
          {unit && <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>{unit}</span>}
        </div>
      </div>
      <div style={{ position: 'relative', height: 22, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 4,
          background: 'var(--bar-bg)', borderRadius: 99,
        }} />
        <div style={{
          position: 'absolute', left: 0, height: 4,
          width: `${pct}%`,
          background: accent, borderRadius: 99,
        }} />
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            position: 'absolute', inset: 0, width: '100%',
            appearance: 'none', background: 'transparent',
            margin: 0, padding: 0, cursor: 'pointer',
          }}
        />
        <div style={{
          position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)',
          width: 14, height: 14, borderRadius: '50%',
          background: accent, border: '2px solid var(--bg-0)',
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--fg-3)' }} className="mono">
        <span>{format ? format(min) : min}{unit}</span>
        <span>{format ? format(max) : max}{unit}</span>
      </div>
    </div>
  );
}

/* ── Runway Track ────────────────────────────────────────────────────── */

function MilestoneMarker({ pctOnTrack, label, icon, color, sideBottom = false }: {
  pctOnTrack: number; label: string; icon: string; color: string; sideBottom?: boolean;
}) {
  return (
    <div style={{
      position: 'absolute',
      left: `${pctOnTrack}%`,
      top: sideBottom ? 'auto' : -48,
      bottom: sideBottom ? -48 : 'auto',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      pointerEvents: 'none',
    }}>
      {!sideBottom && (
        <>
          <div style={{
            fontSize: 10.5, color, fontWeight: 500, whiteSpace: 'nowrap',
            padding: '3px 8px', borderRadius: 4,
            background: 'var(--bg-1)',
            border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
          }}>
            {icon} {label}
          </div>
          <div style={{ width: 1, height: 14, background: color, opacity: 0.5 }} />
        </>
      )}
      {sideBottom && (
        <>
          <div style={{ width: 1, height: 14, background: color, opacity: 0.5 }} />
          <div style={{
            fontSize: 10.5, color, fontWeight: 500, whiteSpace: 'nowrap',
            padding: '3px 8px', borderRadius: 4,
            background: 'var(--bg-1)',
            border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
          }}>
            {icon} {label}
          </div>
        </>
      )}
    </div>
  );
}

function RunwayTrack({ currentMonths, simulatedMonths }: {
  currentMonths: number; simulatedMonths: number;
}) {
  const cappedSim = Math.min(simulatedMonths, 99);
  const maxMonths = Math.max(18, Math.min(60, Math.ceil(Math.max(currentMonths, cappedSim, 14) + 4)));
  const pct = (m: number) => Math.min(100, Math.max(0, (m / maxMonths) * 100));

  const tickMonths: number[] = [];
  const step = maxMonths <= 18 ? 3 : maxMonths <= 36 ? 6 : 12;
  for (let m = 0; m <= maxMonths; m += step) tickMonths.push(m);

  return (
    <div style={{ padding: '60px 16px 60px', position: 'relative' }}>
      <div style={{
        position: 'relative', height: 12,
        background: 'linear-gradient(90deg, oklch(0.55 0.18 25 / 0.35), oklch(0.68 0.16 75 / 0.3), oklch(0.68 0.15 155 / 0.3))',
        borderRadius: 99,
        border: '1px solid var(--line)',
      }}>
        <MilestoneMarker pctOnTrack={pct(6)} label="6 个月安全线" icon="⛨" color="oklch(0.80 0.14 55)" />
        <MilestoneMarker pctOnTrack={pct(12)} label="12 个月缓冲线" icon="★" color="oklch(0.72 0.15 155)" />

        {/* Current position */}
        <div style={{
          position: 'absolute',
          left: `${pct(currentMonths)}%`,
          top: '50%', transform: 'translate(-50%, -50%)', zIndex: 2,
        }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            background: 'var(--fg-1)',
            border: '3px solid var(--bg-0)',
            boxShadow: '0 0 0 1px var(--fg-1)',
          }} />
        </div>
        <div style={{
          position: 'absolute', left: `${pct(currentMonths)}%`,
          top: -26, transform: 'translateX(-50%)',
          fontSize: 10.5, color: 'var(--fg-1)', whiteSpace: 'nowrap',
        }} className="mono">
          当前 {currentMonths.toFixed(1)}mo
        </div>

        {/* Simulated position */}
        <div style={{
          position: 'absolute',
          left: `${pct(cappedSim)}%`,
          top: '50%', transform: 'translate(-50%, -50%)',
          transition: 'left .3s cubic-bezier(.2,.8,.2,1)', zIndex: 3,
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--amber)',
            border: '3px solid var(--bg-0)',
            boxShadow: '0 0 0 1px var(--amber), 0 0 22px rgba(255,186,92,0.55)',
          }} />
        </div>
        <div style={{
          position: 'absolute', left: `${pct(cappedSim)}%`,
          top: -26, transform: 'translateX(-50%)',
          transition: 'left .3s cubic-bezier(.2,.8,.2,1)',
          fontSize: 11, color: 'var(--amber)', fontWeight: 500, whiteSpace: 'nowrap',
        }} className="mono">
          模拟 {simulatedMonths === Infinity ? '∞' : simulatedMonths.toFixed(1) + 'mo'}
        </div>

        {/* Connecting line */}
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: `${Math.min(pct(currentMonths), pct(cappedSim))}%`,
          width: `${Math.abs(pct(cappedSim) - pct(currentMonths))}%`,
          height: 2,
          background: cappedSim >= currentMonths
            ? 'linear-gradient(90deg, transparent, var(--amber))'
            : 'linear-gradient(90deg, oklch(0.72 0.14 25), transparent)',
          zIndex: 1, transition: 'all .3s',
        }} />
      </div>

      <div style={{
        position: 'relative', marginTop: 14,
        display: 'flex', fontSize: 10, color: 'var(--fg-3)',
      }} className="mono">
        {tickMonths.map(m => (
          <div key={m} style={{
            position: 'absolute', left: `${pct(m)}%`, transform: 'translateX(-50%)',
          }}>
            {m}mo
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Scenario Card ───────────────────────────────────────────────────── */

function ScenarioCard({ name, icon, active, delta, runway, onClick }: {
  name: string; icon: string; active: boolean; delta: number; runway: number; onClick: () => void;
}) {
  const runwayDisplay = runway === Infinity ? '∞' : runway.toFixed(1);
  return (
    <div
      onClick={onClick}
      style={{
        padding: 14, borderRadius: 10, cursor: 'pointer',
        background: active ? 'rgba(255,186,92,0.08)' : 'var(--bg-2)',
        border: `1px solid ${active ? 'rgba(255,186,92,0.3)' : 'var(--line)'}`,
        transition: 'all .15s',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 13, color: 'var(--fg-0)', flex: 1 }}>{name}</span>
        {active && <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)',
        }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span className="serif" style={{ fontSize: 24, color: 'var(--fg-0)', lineHeight: 1 }}>{runwayDisplay}</span>
        <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>mo</span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{
          fontSize: 11,
          color: delta >= 0 ? 'var(--ok)' : 'oklch(0.72 0.14 25)',
        }}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}mo
        </span>
      </div>
    </div>
  );
}

/* ── Compute ─────────────────────────────────────────────────────────── */

function computeScenario(base: { totalExpense: number; incomeTotal: number; cashReserve: number }, params: { expenseReduce: number; incomeAdd: number; cashAdd: number }) {
  const newExpense = base.totalExpense * (1 - params.expenseReduce / 100);
  const newIncome = base.incomeTotal + params.incomeAdd;
  const newCash = base.cashReserve + params.cashAdd;
  const gap = Math.max(0, newExpense - newIncome);
  const runway = gap === 0 ? Infinity : newCash / gap;
  return { newExpense, newIncome, newCash, gap, runway };
}

/* ── Main component ──────────────────────────────────────────────────── */

interface Props {
  savings: number;
  monthlyExpense: number;
  monthlyIncome: number;
}

type Scenario = {
  id: string; name: string; icon: string;
  expenseReduce: number; incomeAdd: number; cashAdd: number;
};

export default function PlanPanel({ savings, monthlyExpense, monthlyIncome }: Props) {
  const gap = Math.max(0, monthlyExpense - monthlyIncome);
  const runwayMonths = gap > 0 ? savings / gap : Infinity;
  const base = { totalExpense: monthlyExpense, incomeTotal: monthlyIncome, cashReserve: savings };

  const [expenseReduce, setExpenseReduce] = useState(10);
  const [incomeAdd, setIncomeAdd] = useState(2000);
  const [cashAdd, setCashAdd] = useState(0);

  const sim = useMemo(
    () => computeScenario(base, { expenseReduce, incomeAdd, cashAdd }),
    [expenseReduce, incomeAdd, cashAdd, monthlyExpense, monthlyIncome, savings],
  );

  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: 's0', name: '现状（不干预）', icon: '◐', expenseReduce: 0, incomeAdd: 0, cashAdd: 0 },
    { id: 's1', name: '接 1 笔大单', icon: '◉', expenseReduce: 0, incomeAdd: 0, cashAdd: 10000 },
    { id: 's2', name: '激进省钱 + 接单', icon: '◆', expenseReduce: 25, incomeAdd: 2000, cashAdd: 0 },
  ]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const applyScenario = (s: Scenario) => {
    setExpenseReduce(s.expenseReduce);
    setIncomeAdd(s.incomeAdd);
    setCashAdd(s.cashAdd);
    setActiveScenario(s.id);
  };

  const saveCurrent = () => {
    const id = 's' + Date.now();
    setScenarios(prev => [...prev, { id, name: `假设 ${prev.length}`, icon: '◈', expenseReduce, incomeAdd, cashAdd }]);
    setActiveScenario(id);
  };

  const deltaFromCurrent = (sim.runway === Infinity ? 999 : sim.runway) - (runwayMonths === Infinity ? 999 : runwayMonths);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em' }}>
            PLAN · 规划 · WHAT-IF
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
            如果 · <span className="serif" style={{ fontStyle: 'italic', color: 'var(--fg-1)' }}>What if…</span>
          </h1>
          <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 6, maxWidth: 560 }}>
            拖动滑块模拟不同决策对跑道的影响。一眼看见每一步带来的时间。
          </div>
        </div>
        <button
          onClick={saveCurrent}
          style={{
            padding: '8px 14px', fontSize: 12.5, borderRadius: 8, cursor: 'pointer',
            background: 'rgba(255,186,92,0.08)', border: '1px solid rgba(255,186,92,0.3)',
            color: 'var(--amber)', fontWeight: 500,
          }}
        >
          + 保存当前假设
        </button>
      </div>

      {/* Track visualization */}
      <section style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 16, padding: 20,
      }}>
        <header style={{ marginBottom: 0 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--fg-0)' }}>跑道时间轴</h2>
          <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--fg-2)' }}>Runway Timeline · 当前 ← → 模拟结果</div>
        </header>

        <RunwayTrack
          currentMonths={runwayMonths === Infinity ? 99 : runwayMonths}
          simulatedMonths={sim.runway === Infinity ? 99 : sim.runway}
        />

        {/* Summary row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
          marginTop: 20, background: 'var(--line)',
          borderRadius: 10, overflow: 'hidden',
        }}>
          {[
            { label: '模拟跑道', value: sim.runway === Infinity ? '∞' : sim.runway.toFixed(1), unit: '个月', accent: 'var(--amber)', big: true },
            { label: '跑道变化', value: (deltaFromCurrent >= 0 ? '+' : '') + deltaFromCurrent.toFixed(1), unit: '个月', accent: deltaFromCurrent >= 0 ? 'var(--ok)' : 'oklch(0.72 0.14 25)' },
            { label: '新缺口', value: fmt(sim.gap), unit: '/ 月' },
            { label: '新支出', value: fmt(sim.newExpense), unit: '/ 月' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '16px 18px', background: 'var(--bg-1)',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <div style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {s.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span
                  className={s.big ? 'serif' : 'mono'}
                  style={{
                    fontSize: s.big ? 28 : 16,
                    color: s.accent || 'var(--fg-0)',
                    lineHeight: 1,
                  }}
                >
                  {s.value}
                </span>
                {s.unit && <span style={{ fontSize: 11, color: 'var(--fg-2)' }}>{s.unit}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sliders + Scenarios */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
        {/* Sliders */}
        <section style={{
          background: 'var(--bg-1)', border: '1px solid var(--line)',
          borderRadius: 16, padding: 28,
        }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 500, color: 'var(--fg-0)' }}>调整参数</h2>
          <div style={{ marginBottom: 24, fontSize: 12.5, color: 'var(--fg-2)' }}>Parameters · 任意拖动，即时计算</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <Slider
                label="月支出减少" value={expenseReduce} onChange={setExpenseReduce}
                min={0} max={50} step={1} unit="%" accent="oklch(0.72 0.14 25)"
              />
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fg-3)' }}>
                从 <span className="mono" style={{ color: 'var(--fg-2)' }}>{fmt(monthlyExpense)}</span> →
                <span className="mono" style={{ color: 'var(--fg-0)' }}> {fmt(sim.newExpense)}</span>
                <span style={{ color: 'var(--ok)' }}> (月省 {fmt(monthlyExpense - sim.newExpense)})</span>
              </div>
            </div>

            <div>
              <Slider
                label="月收入增加" value={incomeAdd} onChange={setIncomeAdd}
                min={0} max={8000} step={100}
                format={v => '¥' + v.toLocaleString('zh-CN')} accent="var(--ok)"
              />
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fg-3)' }}>
                从 <span className="mono" style={{ color: 'var(--fg-2)' }}>{fmt(monthlyIncome)}</span> →
                <span className="mono" style={{ color: 'var(--fg-0)' }}> {fmt(sim.newIncome)}</span>
              </div>
            </div>

            <div>
              <Slider
                label="一次性现金注入" value={cashAdd} onChange={setCashAdd}
                min={0} max={50000} step={500}
                format={v => '¥' + v.toLocaleString('zh-CN')} accent="var(--amber)"
              />
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--fg-3)' }}>
                从 <span className="mono" style={{ color: 'var(--fg-2)' }}>¥{savings.toLocaleString('zh-CN')}</span> →
                <span className="mono" style={{ color: 'var(--fg-0)' }}> ¥{(savings + cashAdd).toLocaleString('zh-CN')}</span>
                <span style={{ color: 'var(--fg-3)' }}> · 接一笔大单 / 追加储蓄</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
              <button
                onClick={() => { setExpenseReduce(0); setIncomeAdd(0); setCashAdd(0); setActiveScenario(null); }}
                style={{
                  padding: '8px 14px', fontSize: 12, borderRadius: 8, cursor: 'pointer',
                  background: 'transparent', border: '1px solid var(--line)', color: 'var(--fg-2)',
                }}
              >重置滑块</button>
              <div style={{ flex: 1 }} />
              {sim.runway === Infinity && (
                <span style={{
                  fontSize: 11, color: 'var(--ok)',
                  padding: '6px 10px', borderRadius: 6,
                  background: 'rgba(116,195,149,0.08)',
                  border: '1px solid rgba(116,195,149,0.2)',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--ok)' }} />
                  已达收支平衡 · 跑道无限
                </span>
              )}
            </div>
          </div>

          {/* AI insight */}
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
                <path d="M6 1l1.2 3.3L10.5 5.5 7.2 6.7 6 10l-1.2-3.3L1.5 5.5l3.3-1.2z" fill="currentColor" opacity="0.9" />
              </svg>
              AI 解读
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--fg-1)' }}>
              {sim.runway === Infinity ? (
                <>总收支已平衡，跑道不再消耗。但这不是终点 —— 真正的自由是<strong style={{ color: 'var(--amber)' }}>被动收入覆盖所有支出</strong>，让你不用时间换钱也能活。</>
              ) : deltaFromCurrent > 3 ? (
                <>这组参数让跑道延长 <span className="mono" style={{ color: 'var(--amber)' }}>+{deltaFromCurrent.toFixed(1)} 个月</span>，多出 <span className="mono" style={{ color: 'var(--fg-0)' }}>{Math.round(deltaFromCurrent * 30)} 天</span>缓冲时间。用这些时间构建<strong style={{ color: 'var(--ok)' }}>被动收入来源</strong> —— 跑道是手段，被动收入才是目的。</>
              ) : deltaFromCurrent < -1 ? (
                <>当前参数让跑道<strong style={{ color: 'oklch(0.80 0.14 25)' }}>缩短 {Math.abs(deltaFromCurrent).toFixed(1)} 个月</strong>。仅靠一次性现金无法抵消月度差额的累积，节流 + 开源是更稳的组合。</>
              ) : (
                <>变化较小。跑道延长只是缓冲，核心是<strong style={{ color: 'var(--fg-0)' }}>增加被动收入</strong>。劳动收入维持生存，被动收入通往自由。</>
              )}
            </div>
          </div>
        </section>

        {/* Scenarios */}
        <section style={{
          background: 'var(--bg-1)', border: '1px solid var(--line)',
          borderRadius: 16, padding: 28,
        }}>
          <h2 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 500, color: 'var(--fg-0)' }}>情景对比</h2>
          <div style={{ marginBottom: 24, fontSize: 12.5, color: 'var(--fg-2)' }}>Scenarios · 保存与对比</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scenarios.map(s => {
              const scResult = computeScenario(base, s);
              const delta = (scResult.runway === Infinity ? 999 : scResult.runway) - (runwayMonths === Infinity ? 999 : runwayMonths);
              return (
                <ScenarioCard
                  key={s.id}
                  name={s.name}
                  icon={s.icon}
                  active={activeScenario === s.id}
                  runway={scResult.runway}
                  delta={delta}
                  onClick={() => applyScenario(s)}
                />
              );
            })}
          </div>

          {/* Key milestones */}
          <div style={{
            marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--line)',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <div style={{
              fontSize: 10.5, color: 'var(--fg-2)', letterSpacing: '0.08em',
              textTransform: 'uppercase', fontWeight: 500,
            }}>关键里程碑</div>
            {[
              { icon: '⛨', label: '6 个月安全线', desc: '足以应对一次客户流失或病假', color: 'oklch(0.80 0.14 55)' },
              { icon: '★', label: '12 个月缓冲线', desc: '有底气拒绝不喜欢的项目', color: 'oklch(0.72 0.15 155)' },
              { icon: '∞', label: '被动收入 ≥ 支出', desc: '真正的自由 — 不再用时间换钱', color: 'var(--amber)' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: 'var(--bar-bg)',
                  border: '1px solid var(--line-strong)',
                  color: m.color, fontSize: 11, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>{m.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--fg-0)' }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

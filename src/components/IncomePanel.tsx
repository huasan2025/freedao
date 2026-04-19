'use client';

import { useState, useEffect, useRef } from 'react';
import { Income, ModelProvider, IncomeClassifyResult } from '@/lib/types';
import { classifyIncome } from '@/lib/ai';

const fmt = (n: number) => '¥' + Math.abs(Math.round(n)).toLocaleString('zh-CN');

const incomeColorMap: Record<Income['type'], string> = {
  labor: 'var(--income-labor)',
  passive: 'var(--income-passive)',
};
const incomeLabelMap: Record<Income['type'], string> = {
  labor: '劳动收入',
  passive: '被动收入',
};

function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <span style={{
    display: 'inline-block', width: size, height: size,
    borderRadius: '50%', background: color, flexShrink: 0,
  }} />;
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px', borderRadius: 4,
      fontSize: 10.5, fontWeight: 500, letterSpacing: '0.02em',
      color, background: 'var(--overlay-subtle)',
      border: '1px solid var(--line)',
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

const inputStyle = {
  background: 'var(--overlay-subtle)', border: '1px solid var(--line-strong)',
  borderRadius: 4, padding: '4px 8px', fontSize: 12, color: 'var(--fg-0)', outline: 'none',
};

function IncomeRow({ income, total, onDelete, onUpdate }: { income: Income; total: number; onDelete: () => void; onUpdate: (i: Income) => void }) {
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(income.name);
  const [editAmount, setEditAmount] = useState(String(income.amount));
  const [editType, setEditType] = useState(income.type);

  const pct = total > 0 ? (income.amount / total) * 100 : 0;
  const color = incomeColorMap[income.type];

  const startEdit = () => {
    setEditName(income.name);
    setEditAmount(String(income.amount));
    setEditType(income.type);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editAmount) return;
    const typeChanged = editType !== income.type;
    onUpdate({
      ...income,
      name: editName.trim(),
      amount: Number(editAmount),
      type: editType,
      classifiedBy: typeChanged ? 'user' : income.classifiedBy,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', borderBottom: '1px solid var(--line)', flexWrap: 'wrap' }}>
        <input value={editName} onChange={e => setEditName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveEdit()}
          autoFocus style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
        <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && saveEdit()}
          style={{ ...inputStyle, width: 80 }} />
        <select value={editType} onChange={e => setEditType(e.target.value as Income['type'])}
          style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}>
          <option value="labor">劳动收入</option>
          <option value="passive">被动收入</option>
        </select>
        <button onClick={saveEdit} style={{
          background: 'var(--amber)', border: 'none', cursor: 'pointer',
          color: '#1a1208', fontSize: 11, padding: '4px 10px', borderRadius: 4, fontWeight: 500,
        }}>保存</button>
        <button onClick={() => setEditing(false)} style={{
          background: 'transparent', border: '1px solid var(--line)', cursor: 'pointer',
          color: 'var(--fg-2)', fontSize: 11, padding: '4px 8px', borderRadius: 4,
        }}>取消</button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid var(--line)',
    }} onDoubleClick={startEdit}>
      <Dot color={color} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-0)' }}>{income.name}</span>
          <Tag color={color}>{incomeLabelMap[income.type]}</Tag>
        </div>
        <div style={{
          marginTop: 8, height: 2,
          background: 'var(--overlay-subtle)', borderRadius: 2, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: color, opacity: 0.7,
          }} />
        </div>
      </div>
      <div className="mono" style={{ fontSize: 13, color: 'var(--fg-0)', minWidth: 80, textAlign: 'right' }}>
        {fmt(income.amount)}
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', width: 42, textAlign: 'right' }}>
        {pct.toFixed(1)}%
      </div>
      {confirming ? (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={onDelete}
            style={{
              background: 'var(--danger)', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 4,
            }}
          >确认</button>
          <button
            onClick={() => setConfirming(false)}
            style={{
              background: 'transparent', border: '1px solid var(--line)', cursor: 'pointer',
              color: 'var(--fg-2)', fontSize: 11, padding: '2px 6px', borderRadius: 4,
            }}
          >取消</button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--fg-3)', fontSize: 11, padding: '2px 6px',
            opacity: 0.4, transition: 'opacity .15s, color .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.color = 'var(--fg-3)'; }}
        >删除</button>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

interface Props {
  incomes: Income[];
  monthlyExpense: number;
  activeProvider?: ModelProvider;
  onAdd: (i: Omit<Income, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (i: Income) => void;
}

export default function IncomePanel({ incomes, monthlyExpense, activeProvider, onAdd, onDelete, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<Income['type']>('labor');
  const [classifying, setClassifying] = useState(false);
  const [aiResult, setAiResult] = useState<IncomeClassifyResult | null>(null);
  const classifyTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const lastClassified = useRef('');

  // Auto-classify with debounce
  useEffect(() => {
    if (classifyTimer.current) clearTimeout(classifyTimer.current);

    const key = `${name.trim()}|${amount}`;
    if (!name.trim() || !amount || !activeProvider || key === lastClassified.current) return;

    classifyTimer.current = setTimeout(async () => {
      setClassifying(true);
      const result = await classifyIncome(name.trim(), Number(amount), activeProvider);
      if (result) {
        setAiResult(result);
        setType(result.type);
        lastClassified.current = key;
      }
      setClassifying(false);
    }, 600);

    return () => { if (classifyTimer.current) clearTimeout(classifyTimer.current); };
  }, [name, amount, activeProvider]);

  const handleAdd = () => {
    if (!name.trim() || !amount) return;
    onAdd({ name: name.trim(), amount: Number(amount), type, classifiedBy: aiResult ? 'ai' : null });
    setName('');
    setAmount('');
    setAiResult(null);
    lastClassified.current = '';
    setShowForm(false);
  };

  const incomeTotal = incomes.reduce((s, i) => s + i.amount, 0);
  const passiveTotal = incomes.filter(i => i.type === 'passive').reduce((s, i) => s + i.amount, 0);
  const laborTotal = incomes.filter(i => i.type === 'labor').reduce((s, i) => s + i.amount, 0);
  const incomeTarget = monthlyExpense;
  const freedomGap = Math.max(0, monthlyExpense - passiveTotal);

  const maxVal = Math.max(incomeTotal, incomeTarget, 1);
  const currentPct = (incomeTotal / maxVal) * 100;
  const targetPct = (incomeTarget / maxVal) * 100;

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
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500, letterSpacing: '0.01em', color: 'var(--fg-0)' }}>
            钱从哪来
          </h2>
          <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--fg-2)' }}>
            被动收入覆盖支出 = 自由 · 劳动收入维持跑道
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em' }}>当前 / 目标</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="serif" style={{ fontSize: 28, color: 'var(--fg-0)', lineHeight: 1 }}>
              {fmt(incomeTotal)}
            </span>
            <span style={{ fontSize: 14, color: 'var(--fg-2)' }}>
              / {incomeTarget > 0 ? fmt(incomeTarget) : '—'}
            </span>
          </div>
        </div>
      </header>

      {/* Income sources list */}
      <div style={{ marginBottom: 28 }}>
        {incomes.map(inc => (
          <IncomeRow key={inc.id} income={inc} total={incomeTotal} onDelete={() => onDelete(inc.id)} onUpdate={onUpdate} />
        ))}
        {incomes.length === 0 && (
          <div style={{ padding: '16px 0', fontSize: 12, color: 'var(--fg-3)', textAlign: 'center' }}>
            暂无收入记录
          </div>
        )}
      </div>

      {/* Current vs Target bar chart */}
      {incomeTarget > 0 && (
        <div>
          <div style={{
            fontSize: 10.5, color: 'var(--fg-2)',
            letterSpacing: '0.10em', fontWeight: 500, textTransform: 'uppercase',
            marginBottom: 16,
          }}>当前 vs. 目标</div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
            alignItems: 'end', height: 200, padding: '0 12px',
            borderBottom: '1px solid var(--line)',
            position: 'relative',
          }}>
            {/* Gridlines */}
            {[0.25, 0.5, 0.75].map(v => (
              <div key={v} aria-hidden style={{
                position: 'absolute', left: 0, right: 0,
                bottom: `${v * 100}%`,
                borderTop: '1px dashed var(--line)',
              }} />
            ))}

            {/* Current column */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'flex-end', height: '100%', gap: 8,
              position: 'relative', zIndex: 1,
            }}>
              <div className="mono" style={{ fontSize: 12, color: 'var(--fg-0)' }}>
                {fmt(incomeTotal)}
              </div>
              <div style={{
                width: '100%', maxWidth: 120,
                height: `${currentPct * 0.80}%`,
                background: 'linear-gradient(180deg, var(--amber-soft), var(--amber-dim))',
                borderRadius: '4px 4px 0 0',
                boxShadow: 'inset 0 1px 0 var(--line)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
              }}>
                {incomes.map((inc, i) => {
                  const h = incomeTotal > 0 ? (inc.amount / incomeTotal) * 100 : 0;
                  return (
                    <div key={inc.id} style={{
                      height: `${h}%`,
                      background: incomeColorMap[inc.type],
                      borderBottom: i < incomes.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none',
                      opacity: 0.95,
                    }} />
                  );
                })}
              </div>
            </div>

            {/* Target column */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'flex-end', height: '100%', gap: 8,
              position: 'relative', zIndex: 1,
            }}>
              <div className="mono" style={{ fontSize: 12, color: 'var(--fg-0)' }}>
                {fmt(incomeTarget)}
              </div>
              <div style={{
                width: '100%', maxWidth: 120,
                height: `${targetPct * 0.80}%`,
                border: '1.5px dashed rgba(255,186,92,0.5)',
                borderBottom: 'none',
                borderRadius: '4px 4px 0 0',
                background: 'repeating-linear-gradient(135deg, rgba(255,186,92,0.06) 0 6px, transparent 6px 12px)',
                position: 'relative',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              }}>
                {/* Freedom gap callout */}
                {freedomGap > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: `${((freedomGap / incomeTarget) * 0.80 * 100 / 2)}%`,
                    transform: 'translateY(-50%)',
                    fontSize: 11, color: 'var(--amber)',
                    background: 'var(--bg-1)',
                    padding: '3px 8px', borderRadius: 4,
                    border: '1px solid rgba(255,186,92,0.25)',
                    whiteSpace: 'nowrap',
                  }}>
                    <span className="mono">自由缺口 {fmt(freedomGap)}</span>
                  </div>
                )}
                {/* Filled portion */}
                {incomeTotal > 0 && incomeTarget > 0 && (
                  <div style={{
                    position: 'absolute', left: 0, right: 0, bottom: 0,
                    height: `${(incomeTotal / incomeTarget) * 100}%`,
                    background: 'linear-gradient(180deg, oklch(0.72 0.12 75 / 0.3), oklch(0.50 0.08 75 / 0.2))',
                    borderRadius: '0 0 2px 2px',
                  }} />
                )}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
            marginTop: 10, fontSize: 12, color: 'var(--fg-1)', textAlign: 'center',
          }}>
            <div>当前收入</div>
            <div>目标（=月支出）</div>
          </div>
        </div>
      )}

      {/* Add button / form */}
      {showForm ? (
        <div style={{
          marginTop: 16, padding: 16,
          background: 'var(--overlay-subtle)',
          border: '1px solid var(--line-strong)',
          borderRadius: 10,
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="收入名称"
              autoFocus
              style={{
                flex: 1, background: 'var(--overlay-subtle)',
                border: '1px solid var(--line-strong)', borderRadius: 6,
                padding: '8px 12px', fontSize: 13, color: 'var(--fg-0)',
                outline: 'none',
              }}
            />
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="月额"
              style={{
                width: 100, background: 'var(--overlay-subtle)',
                border: '1px solid var(--line-strong)', borderRadius: 6,
                padding: '8px 12px', fontSize: 13, color: 'var(--fg-0)',
                outline: 'none',
              }}
            />
          </div>

          {/* AI classification result */}
          {classifying && (
            <div style={{
              padding: '8px 12px', marginBottom: 8, borderRadius: 6,
              background: 'rgba(255,186,92,0.06)', border: '1px solid rgba(255,186,92,0.15)',
              fontSize: 12, color: 'var(--amber)',
            }}>
              AI 正在识别...
            </div>
          )}
          {aiResult && (
            <div style={{
              padding: '8px 12px', marginBottom: 8, borderRadius: 6,
              background: 'rgba(255,186,92,0.06)', border: '1px solid rgba(255,186,92,0.15)',
              fontSize: 12, color: 'var(--fg-1)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" style={{ color: 'var(--amber)', flexShrink: 0 }}>
                <path d="M6 1l1.2 3.3L10.5 5.5 7.2 6.7 6 10l-1.2-3.3L1.5 5.5l3.3-1.2z" fill="currentColor"/>
              </svg>
              <span>
                AI 建议：
                <strong style={{ color: 'var(--fg-0)' }}>
                  {aiResult.type === 'labor' ? '劳动收入' : '被动收入'}
                </strong>
                {aiResult.reasoning && (
                  <span style={{ color: 'var(--fg-2)', marginLeft: 6 }}>({aiResult.reasoning})</span>
                )}
              </span>
              <span className="mono" style={{ marginLeft: 'auto', color: 'var(--fg-3)', fontSize: 10 }}>
                {Math.round(aiResult.confidence * 100)}%
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={type}
              onChange={e => setType(e.target.value as Income['type'])}
              style={{
                background: 'var(--overlay-subtle)',
                border: '1px solid var(--line-strong)', borderRadius: 6,
                padding: '6px 10px', fontSize: 12, color: 'var(--fg-1)',
                outline: 'none',
              }}
            >
              <option value="labor">劳动收入</option>
              <option value="passive">被动收入</option>
            </select>
            <span style={{ flex: 1 }} />
            <button
              onClick={() => { setShowForm(false); setAiResult(null); lastClassified.current = ''; }}
              style={{
                padding: '6px 12px', fontSize: 12, borderRadius: 6,
                background: 'transparent', border: '1px solid var(--line)',
                cursor: 'pointer', color: 'var(--fg-2)',
              }}
            >取消</button>
            <button
              onClick={handleAdd}
              style={{
                padding: '6px 14px', fontSize: 12, borderRadius: 6,
                background: 'var(--amber)', border: '1px solid var(--amber)',
                cursor: 'pointer', color: '#1a1208', fontWeight: 500,
              }}
            >添加</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            marginTop: 16, width: '100%',
            padding: '10px 14px', fontSize: 12.5,
            background: 'var(--overlay-subtle)',
            border: '1px dashed var(--line-strong)',
            borderRadius: 8, cursor: 'pointer',
            color: 'var(--fg-2)', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--fg-3)'; e.currentTarget.style.color = 'var(--fg-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-strong)'; e.currentTarget.style.color = 'var(--fg-2)'; }}
        >+ 记录收入</button>
      )}

      {/* Insight */}
      {incomeTotal > 0 && (
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
            自由洞察
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--fg-1)' }}>
            {passiveTotal >= monthlyExpense ? (
              <>被动收入已覆盖月支出，你正在<strong style={{ color: 'var(--ok)' }}>自由区间</strong>。继续扩大安全边际。</>
            ) : passiveTotal > 0 ? (
              <>
                被动收入 <span className="mono" style={{ color: 'var(--fg-0)' }}>{fmt(passiveTotal)}</span> 覆盖了支出的{' '}
                <span className="mono" style={{ color: 'var(--amber)' }}>{(passiveTotal / monthlyExpense * 100).toFixed(1)}%</span>。
                {laborTotal > 0 && <>劳动收入 <span className="mono" style={{ color: 'var(--fg-0)' }}>{fmt(laborTotal)}</span> 维持跑道，但不是自由。</>}
                {' '}目标：把被动收入做到 <span className="mono" style={{ color: 'var(--ok)' }}>{fmt(monthlyExpense)}</span>/月。
              </>
            ) : (
              <>
                当前所有收入都是劳动收入，停止工作 = 收入归零。
                自由的关键：构建不依赖劳动时间的被动收入来源。
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

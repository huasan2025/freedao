'use client';

import { useState, useEffect, useRef } from 'react';
import { Expense, ModelProvider, ClassifyResult } from '@/lib/types';
import { classifyExpense } from '@/lib/ai';

const fmt = (n: number) => '¥' + Math.abs(Math.round(n)).toLocaleString('zh-CN');

/* ── Sub-components ─────────────────────────────────────────────────── */

function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <span style={{
    display: 'inline-block', width: size, height: size,
    borderRadius: '50%', background: color, flexShrink: 0,
  }} />;
}

function Tag({ children, color = 'var(--fg-2)' }: { children: React.ReactNode; color?: string }) {
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
const selectStyle = {
  ...inputStyle, cursor: 'pointer', colorScheme: 'dark',
};

function ExpenseRow({
  expense, total, onDelete, onUpdate,
}: {
  expense: Expense; total: number; onDelete: () => void; onUpdate: (e: Expense) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(expense.name);
  const [editAmount, setEditAmount] = useState(String(expense.amount));
  const [editCategory, setEditCategory] = useState(expense.category);
  const [editSub, setEditSub] = useState(expense.subCategory);

  const color = expense.category === 'investment' ? 'var(--invest)' : 'var(--consume)';
  const tag = expense.category === 'investment'
    ? '投资'
    : expense.subCategory === 'required' ? '必选' : '可选';
  const pct = total > 0 ? (expense.amount / total) * 100 : 0;

  const startEdit = () => {
    setEditName(expense.name);
    setEditAmount(String(expense.amount));
    setEditCategory(expense.category);
    setEditSub(expense.subCategory);
    setEditing(true);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editAmount) return;
    const categoryChanged = editCategory !== expense.category || editSub !== expense.subCategory;
    onUpdate({
      ...expense,
      name: editName.trim(),
      amount: Number(editAmount),
      category: editCategory,
      subCategory: editSub,
      classifiedBy: categoryChanged ? 'user' : expense.classifiedBy,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input value={editName} onChange={e => setEditName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveEdit()}
            autoFocus style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
          <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveEdit()}
            style={{ ...inputStyle, width: 80 }} />
          <select value={editCategory} onChange={e => setEditCategory(e.target.value as Expense['category'])}
            style={selectStyle}>
            <option value="investment">投资</option>
            <option value="consumption">消费</option>
          </select>
          {editCategory === 'consumption' && (
            <select value={editSub} onChange={e => setEditSub(e.target.value as Expense['subCategory'])}
              style={selectStyle}>
              <option value="required">必选</option>
              <option value="optional">可选</option>
            </select>
          )}
          <button onClick={saveEdit} style={{
            background: 'var(--amber)', border: 'none', cursor: 'pointer',
            color: '#1a1208', fontSize: 11, padding: '4px 10px', borderRadius: 4, fontWeight: 500,
          }}>保存</button>
          <button onClick={() => setEditing(false)} style={{
            background: 'transparent', border: '1px solid var(--line)', cursor: 'pointer',
            color: 'var(--fg-2)', fontSize: 11, padding: '4px 8px', borderRadius: 4,
          }}>取消</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderBottom: '1px solid var(--line)', padding: '12px 0' }} onDoubleClick={startEdit}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        width: '100%',
      }}>
        <Dot color={color} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--fg-0)' }}>{expense.name}</span>
            <Tag color="var(--fg-2)">{tag}</Tag>
          </div>
        </div>
        <div className="mono" style={{ fontSize: 13, color: 'var(--fg-0)', minWidth: 70, textAlign: 'right' }}>
          {fmt(expense.amount)}
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
          >
            删除
          </button>
        )}
      </div>
      {/* Thin proportion bar */}
      <div style={{
        marginTop: 10, marginLeft: 20, height: 2,
        background: 'var(--overlay-subtle)', borderRadius: 2,
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 2, opacity: 0.65,
        }} />
      </div>
    </div>
  );
}

function InsightCard({ children }: { children: React.ReactNode }) {
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
        省钱洞察
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--fg-1)' }}>
        {children}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */

interface Props {
  expenses: Expense[];
  activeProvider?: ModelProvider;
  onAdd: (e: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDelete: (id: string) => void;
  onUpdate: (e: Expense) => void;
}

export default function ExpensePanel({ expenses, activeProvider, onAdd, onDelete, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('consumption');
  const [subCategory, setSubCategory] = useState<Expense['subCategory']>('required');
  const [classifying, setClassifying] = useState(false);
  const [aiResult, setAiResult] = useState<ClassifyResult | null>(null);
  const classifyTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const lastClassified = useRef('');

  // Auto-classify with debounce when name + amount are both filled
  useEffect(() => {
    if (classifyTimer.current) clearTimeout(classifyTimer.current);

    const key = `${name.trim()}|${amount}`;
    if (!name.trim() || !amount || !activeProvider || key === lastClassified.current) return;

    classifyTimer.current = setTimeout(async () => {
      setClassifying(true);
      const result = await classifyExpense(name.trim(), Number(amount), activeProvider);
      if (result) {
        setAiResult(result);
        setCategory(result.category);
        setSubCategory(result.subCategory);
        lastClassified.current = key;
      }
      setClassifying(false);
    }, 600);

    return () => { if (classifyTimer.current) clearTimeout(classifyTimer.current); };
  }, [name, amount, activeProvider]);

  const handleAdd = () => {
    if (!name.trim() || !amount) return;
    onAdd({
      name: name.trim(),
      amount: Number(amount),
      category,
      subCategory,
      classifiedBy: aiResult ? 'ai' : null,
    });
    setName('');
    setAmount('');
    setAiResult(null);
    lastClassified.current = '';
    setShowForm(false);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const investTotal = expenses.filter(e => e.category === 'investment').reduce((s, e) => s + e.amount, 0);
  const consumeTotal = expenses.filter(e => e.category === 'consumption').reduce((s, e) => s + e.amount, 0);
  const consumeRequired = expenses.filter(e => e.category === 'consumption' && e.subCategory === 'required').reduce((s, e) => s + e.amount, 0);
  const consumeOptional = expenses.filter(e => e.category === 'consumption' && e.subCategory === 'optional').reduce((s, e) => s + e.amount, 0);

  const pctInvest = total > 0 ? (investTotal / total) * 100 : 0;
  const pctConsume = total > 0 ? (consumeTotal / total) * 100 : 0;

  const investExpenses = expenses.filter(e => e.category === 'investment');
  const requiredExpenses = expenses.filter(e => e.category === 'consumption' && e.subCategory === 'required');
  const optionalExpenses = expenses.filter(e => e.category === 'consumption' && e.subCategory === 'optional');

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
            钱花在哪了
          </h2>
          <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--fg-2)' }}>
            投资性支出期望有回报 · 消费性支出维持生活
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em' }}>月总支出</div>
          <div className="serif" style={{ fontSize: 28, color: 'var(--fg-0)', lineHeight: 1 }}>
            {fmt(total)}
          </div>
        </div>
      </header>

      {/* Composition bar */}
      {total > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', height: 8, borderRadius: 99, overflow: 'hidden',
            background: 'var(--overlay-subtle)',
          }}>
            <div style={{ width: `${pctInvest}%`, background: 'var(--invest)', opacity: 0.85 }} />
            <div style={{ width: `${pctConsume}%`, background: 'var(--consume)', opacity: 0.7 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dot color="var(--invest)" />
              <span style={{ color: 'var(--fg-1)' }}>投资性</span>
              <span className="mono" style={{ color: 'var(--fg-0)' }}>{fmt(investTotal)}</span>
              <span className="mono" style={{ color: 'var(--fg-3)' }}>{pctInvest.toFixed(1)}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Dot color="var(--consume)" />
              <span style={{ color: 'var(--fg-1)' }}>消费性</span>
              <span className="mono" style={{ color: 'var(--fg-0)' }}>{fmt(consumeTotal)}</span>
              <span className="mono" style={{ color: 'var(--fg-3)' }}>{pctConsume.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Investment section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 10.5, color: 'var(--invest)',
              letterSpacing: '0.10em', fontWeight: 500, textTransform: 'uppercase',
            }}>投资性支出</div>
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>· 预期有回报</span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-1)' }}>{fmt(investTotal)}</div>
        </div>
        {investExpenses.map(e => (
          <ExpenseRow key={e.id} expense={e} total={total} onDelete={() => onDelete(e.id)} onUpdate={onUpdate} />
        ))}
        {investExpenses.length === 0 && (
          <div style={{ padding: '12px 0', fontSize: 12, color: 'var(--fg-3)', borderBottom: '1px solid var(--line)' }}>
            暂无投资性支出
          </div>
        )}
      </div>

      {/* Consumption section */}
      <div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontSize: 10.5, color: 'var(--consume)',
              letterSpacing: '0.10em', fontWeight: 500, textTransform: 'uppercase',
            }}>消费性支出</div>
            <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              · 必选 {fmt(consumeRequired)} · 可选 {fmt(consumeOptional)}
            </span>
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-1)' }}>{fmt(consumeTotal)}</div>
        </div>
        {requiredExpenses.map(e => (
          <ExpenseRow key={e.id} expense={e} total={total} onDelete={() => onDelete(e.id)} onUpdate={onUpdate} />
        ))}
        {optionalExpenses.map(e => (
          <ExpenseRow key={e.id} expense={e} total={total} onDelete={() => onDelete(e.id)} onUpdate={onUpdate} />
        ))}
        {requiredExpenses.length === 0 && optionalExpenses.length === 0 && (
          <div style={{ padding: '12px 0', fontSize: 12, color: 'var(--fg-3)', borderBottom: '1px solid var(--line)' }}>
            暂无消费性支出
          </div>
        )}
      </div>

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
              placeholder="支出名称"
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
              AI 正在分类...
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
                  {aiResult.category === 'investment' ? '投资性' : aiResult.subCategory === 'required' ? '消费-必选' : '消费-可选'}
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
              value={category}
              onChange={e => setCategory(e.target.value as Expense['category'])}
              style={{
                background: 'var(--overlay-subtle)',
                border: '1px solid var(--line-strong)', borderRadius: 6,
                padding: '6px 10px', fontSize: 12, color: 'var(--fg-1)',
                outline: 'none',
              }}
            >
              <option value="consumption">消费性</option>
              <option value="investment">投资性</option>
            </select>
            {category === 'consumption' && (
              <select
                value={subCategory}
                onChange={e => setSubCategory(e.target.value as Expense['subCategory'])}
                style={{
                  background: 'var(--overlay-subtle)',
                  border: '1px solid var(--line-strong)', borderRadius: 6,
                  padding: '6px 10px', fontSize: 12, color: 'var(--fg-1)',
                  outline: 'none',
                }}
              >
                <option value="required">必选</option>
                <option value="optional">可选</option>
              </select>
            )}
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
              disabled={!name.trim() || !amount}
              style={{
                padding: '6px 14px', fontSize: 12, borderRadius: 6,
                background: 'var(--amber)', border: '1px solid var(--amber)',
                cursor: 'pointer', color: '#1a1208', fontWeight: 500,
                opacity: (!name.trim() || !amount) ? 0.4 : 1,
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
        >+ 记录支出</button>
      )}

      {/* Insight card */}
      {total > 0 && (
        <InsightCard>
          <div>
            <span style={{ color: 'var(--fg-2)' }}>提示 · </span>
            检查可选消费项，
            {consumeOptional > 0 ? (
              <>减半可选消费 <span className="mono" style={{ color: 'var(--fg-0)' }}>{fmt(consumeOptional)}</span> 可以<span style={{ color: 'var(--ok)' }}> 月省 <span className="mono">{fmt(consumeOptional / 2)}</span></span>。</>
            ) : (
              <>你的可选消费为零，支出结构很健康。</>
            )}
          </div>
        </InsightCard>
      )}
    </section>
  );
}

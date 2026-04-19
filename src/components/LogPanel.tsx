'use client';

import { useMemo, useState } from 'react';
import { Expense, Income } from '@/lib/types';

const fmt = (n: number) => '¥' + Math.abs(Math.round(n)).toLocaleString('zh-CN');

/* ── Types ───────────────────────────────────────────────────────────── */

type Entry = {
  id: string;
  type: 'expense' | 'income';
  name: string;
  amount: number;
  category: string;
  tag: string;
  tagColor: string;
  createdAt: string;
  time: string;
};

const CATEGORY_META: Record<string, { name: string; group: string; color: string }> = {
  'invest':      { name: '投资性',  group: 'expense', color: 'var(--invest)' },
  'consume-req': { name: '必选消费', group: 'expense', color: 'var(--consume)' },
  'consume-opt': { name: '可选消费', group: 'expense', color: 'var(--consume-dim)' },
  'labor':       { name: '劳动收入', group: 'income',  color: 'var(--income-labor)' },
  'passive':     { name: '被动收入', group: 'income',  color: 'var(--income-passive)' },
};

const FILTERS = [
  { id: 'all',         label: '全部' },
  { id: 'expense',     label: '仅支出' },
  { id: 'income',      label: '仅收入' },
  { id: 'invest',      label: '投资性', color: 'var(--invest)' },
  { id: 'consume-req', label: '必选',   color: 'var(--consume)' },
  { id: 'consume-opt', label: '可砍',   color: 'var(--consume-dim)' },
  { id: 'labor',       label: '劳动',   color: 'var(--income-labor)' },
  { id: 'passive',     label: '被动',   color: 'var(--income-passive)' },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

function getCategoryKey(e: Expense): string {
  if (e.category === 'investment') return 'invest';
  return e.subCategory === 'required' ? 'consume-req' : 'consume-opt';
}

function getIncomeCategoryKey(i: Income): string {
  return i.type === 'labor' ? 'labor' : 'passive';
}

function formatDateHeader(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
  const md = `${d.getMonth() + 1}月${d.getDate()}日`;
  let rel = md;
  if (diffDays === 0) rel = '今天';
  else if (diffDays === 1) rel = '昨天';
  else if (diffDays === 2) rel = '前天';
  return { rel, md, weekday };
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function LogStatCard({ label, sub, value, accent, children }: {
  label: string; sub?: string; value: string; accent?: string; children?: React.ReactNode;
}) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 14,
      background: 'var(--bg-1)', border: '1px solid var(--line)',
      position: 'relative', overflow: 'hidden',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: accent,
        }} />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
          {sub && <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>{sub}</div>}
        </div>
        {children}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 14 }}>
        <span className="serif" style={{ fontSize: 30, color: 'var(--fg-0)', lineHeight: 1 }}>
          {value}
        </span>
      </div>
    </div>
  );
}

function LogRow({ entry }: { entry: Entry }) {
  const meta = CATEGORY_META[entry.category];
  const isIncome = entry.type === 'income';
  const sign = isIncome ? '+' : '−';
  const signColor = isIncome ? 'var(--ok)' : 'oklch(0.72 0.14 25)';

  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: '56px 1fr auto',
        alignItems: 'center', gap: 16,
        padding: '14px 20px',
        borderBottom: '1px solid var(--line)',
        transition: 'background .12s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--overlay-subtle)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>{entry.time}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: meta?.color || 'var(--fg-3)', flexShrink: 0,
        }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 13.5, color: 'var(--fg-0)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {entry.name}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '2px 7px', borderRadius: 4,
              fontSize: 10.5, fontWeight: 500, letterSpacing: '0.02em',
              color: meta?.color || 'var(--fg-2)',
              background: 'var(--overlay-subtle)',
              border: '1px solid var(--line)',
              whiteSpace: 'nowrap',
            }}>
              {entry.tag}
            </span>
          </div>
        </div>
      </div>
      <div className="mono" style={{
        fontSize: 14, color: signColor, fontWeight: 500,
        minWidth: 100, textAlign: 'right',
      }}>
        {sign}¥{entry.amount.toLocaleString('zh-CN')}
      </div>
    </div>
  );
}

function DateGroup({ dateKey, entries }: { dateKey: string; entries: Entry[] }) {
  const h = formatDateHeader(entries[0].createdAt);
  const dayIncome = entries.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const dayExpense = entries.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const net = dayIncome - dayExpense;

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '22px 20px 12px',
        borderBottom: '1px solid var(--line)',
        background: 'var(--overlay-subtle)',
      }}>
        <div className="serif" style={{ fontSize: 22, color: 'var(--fg-0)', lineHeight: 1 }}>{h.rel}</div>
        <div style={{ fontSize: 12, color: 'var(--fg-2)' }}>
          {h.rel === h.md ? h.weekday : `${h.md} · ${h.weekday}`}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 14, fontSize: 11.5 }} className="mono">
          {dayIncome > 0 && <span style={{ color: 'var(--ok)' }}>+¥{dayIncome.toLocaleString('zh-CN')}</span>}
          {dayExpense > 0 && <span style={{ color: 'oklch(0.72 0.14 25)' }}>−¥{dayExpense.toLocaleString('zh-CN')}</span>}
          <span style={{ color: 'var(--fg-2)' }}>
            净 <span style={{ color: net >= 0 ? 'var(--ok)' : 'oklch(0.72 0.14 25)' }}>
              {net >= 0 ? '+' : '−'}¥{Math.abs(net).toLocaleString('zh-CN')}
            </span>
          </span>
        </div>
      </div>
      {entries.map(e => <LogRow key={e.id} entry={e} />)}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

interface Props {
  expenses: Expense[];
  incomes: Income[];
}

export default function LogPanel({ expenses, incomes }: Props) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const entries = useMemo(() => {
    const all: Entry[] = [];
    for (const e of expenses) {
      const catKey = getCategoryKey(e);
      const meta = CATEGORY_META[catKey];
      const d = new Date(e.createdAt);
      all.push({
        id: e.id, type: 'expense', name: e.name,
        amount: e.amount, category: catKey,
        tag: meta?.name || '', tagColor: meta?.color || '',
        createdAt: e.createdAt,
        time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
      });
    }
    for (const i of incomes) {
      const catKey = getIncomeCategoryKey(i);
      const meta = CATEGORY_META[catKey];
      const d = new Date(i.createdAt);
      all.push({
        id: i.id, type: 'income', name: i.name,
        amount: i.amount, category: catKey,
        tag: meta?.name || '', tagColor: meta?.color || '',
        createdAt: i.createdAt,
        time: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
      });
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [expenses, incomes]);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (search && !e.name.includes(search)) return false;
      if (filter === 'all') return true;
      if (filter === 'expense' || filter === 'income') return e.type === filter;
      return e.category === filter;
    });
  }, [entries, filter, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Entry[]>();
    for (const e of filtered) {
      const dateKey = new Date(e.createdAt).toISOString().slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(e);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  const monthlyExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const monthlyIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const expenseCount = expenses.length;
  const incomeCount = incomes.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em' }}>
            LOG · 收支流水
          </div>
          <h1 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
            所有记录 · <span className="serif" style={{ fontStyle: 'italic', color: 'var(--fg-1)' }}>Timeline</span>
          </h1>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <LogStatCard label="记录总数" sub={`共 ${entries.length} 条`} value={String(entries.length)}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>
            {expenseCount} 支 / {incomeCount} 收
          </div>
        </LogStatCard>
        <LogStatCard label="月支出" value={fmt(monthlyExpense)} accent="oklch(0.72 0.14 25 / 0.5)" />
        <LogStatCard label="月收入" value={fmt(monthlyIncome)} accent="oklch(0.72 0.15 155 / 0.5)" />
      </div>

      {/* Filter bar + search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 12,
        background: 'var(--bg-1)', border: '1px solid var(--line)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 10px', borderRadius: 8,
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          flex: '0 0 220px',
        }}>
          <svg width="12" height="12" viewBox="0 0 16 16" style={{ color: 'var(--fg-3)' }}>
            <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="11" y1="11" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索记录…"
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--fg-0)', fontSize: 12.5, flex: 1,
            }}
          />
        </div>

        <div style={{
          display: 'flex', gap: 4, overflowX: 'auto',
          scrollbarWidth: 'none',
        }}>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 12px', fontSize: 12,
                borderRadius: 6, border: 'none', cursor: 'pointer',
                background: filter === f.id ? 'var(--overlay-hover)' : 'transparent',
                color: filter === f.id ? 'var(--fg-0)' : 'var(--fg-2)',
                fontWeight: filter === f.id ? 500 : 400,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                whiteSpace: 'nowrap',
              }}
            >
              {f.color && (
                <span style={{
                  display: 'inline-block', width: 6, height: 6,
                  borderRadius: '50%', background: f.color,
                }} />
              )}
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--fg-3)' }}>
          {filtered.length} / {entries.length}
        </span>
      </div>

      {/* Timeline */}
      <div style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 14,
        overflow: 'hidden',
      }}>
        {grouped.length === 0 ? (
          <div style={{
            padding: '80px 24px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--overlay-subtle)',
              border: '1px dashed var(--line-strong)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: 'var(--fg-3)',
            }}>∅</div>
            <div className="serif" style={{ fontSize: 22, color: 'var(--fg-1)' }}>
              {search || filter !== 'all' ? '没有匹配的记录' : '暂无记录'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)', maxWidth: 360 }}>
              {search || filter !== 'all'
                ? '调整筛选条件，或去 Dashboard 添加记录。'
                : '去 Dashboard 添加你的第一笔支出或收入。'}
            </div>
          </div>
        ) : (
          grouped.map(([dateKey, items]) => (
            <DateGroup key={dateKey} dateKey={dateKey} entries={items} />
          ))
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppData } from '@/lib/types';
import { load, save } from '@/lib/storage';
import RunwayHero from '@/components/RunwayHero';
import ExpensePanel from '@/components/ExpensePanel';
import IncomePanel from '@/components/IncomePanel';
import TimePanel from '@/components/TimePanel';
import LogPanel from '@/components/LogPanel';
import PlanPanel from '@/components/PlanPanel';
import SettingsPanel from '@/components/SettingsPanel';
import GuidePanel from '@/components/GuidePanel';
import OnboardingOverlay from '@/components/OnboardingOverlay';

/* ── Logo ─────────────────────────────────────────────────────────────── */

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width="22" height="22" viewBox="0 0 100 100" style={{ color: 'var(--amber)' }}>
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M 25 68 Q 50 68, 62 56 Q 74 44, 74 32" strokeWidth="3.5" />
          <line x1="38" y1="28" x2="62" y2="28" strokeWidth="3" />
          <line x1="38" y1="40" x2="58" y2="40" strokeWidth="2.5" />
          <line x1="38" y1="50" x2="54" y2="50" strokeWidth="2" />
          <circle cx="48" cy="34" r="2.5" fill="currentColor" stroke="none" />
        </g>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Freedao</span>
        <span style={{ fontSize: 9.5, color: 'var(--fg-3)', letterSpacing: '0.15em' }}>自由道</span>
      </div>
    </div>
  );
}

/* ── Nav ──────────────────────────────────────────────────────────────── */

function Nav({ current, onChange }: { current: string; onChange: (k: string) => void }) {
  const tabs = [
    { k: 'dashboard', label: 'Dashboard', zh: '仪表盘' },
    { k: 'log', label: 'Log', zh: '记录' },
    { k: 'plan', label: 'Plan', zh: '规划' },
    { k: 'guide', label: 'Guide', zh: '指南' },
    { k: 'settings', label: 'Settings', zh: '设置' },
  ];
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', gap: 2,
      background: 'var(--overlay-subtle)',
      border: '1px solid var(--line)',
      borderRadius: 8, padding: 3,
    }}>
      {tabs.map(t => (
        <button
          key={t.k}
          onClick={() => onChange(t.k)}
          style={{
            padding: '7px 14px', fontSize: 13,
            borderRadius: 6, border: 'none', cursor: 'pointer',
            background: current === t.k ? 'var(--overlay-hover)' : 'transparent',
            color: current === t.k ? 'var(--fg-0)' : 'var(--fg-2)',
            fontWeight: current === t.k ? 500 : 400,
            display: 'flex', alignItems: 'center', gap: 6,
            transition: 'all .15s',
          }}
        >
          {t.label}
          <span style={{ fontSize: 11, color: 'var(--fg-3)' }}>{t.zh}</span>
        </button>
      ))}
    </nav>
  );
}

/* ── App ──────────────────────────────────────────────────────────────── */

export default function Home() {
  const [data, setData] = useState<AppData | null>(null);
  const [tab, setTab] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setData(load());
    try { setTab(localStorage.getItem('freedao:tab') || 'dashboard'); } catch {}
    try { if (!localStorage.getItem('freedao:onboarded')) setShowOnboarding(true); } catch {}
  }, []);

  useEffect(() => {
    if (data) {
      save(data);
      document.documentElement.setAttribute('data-theme', data.settings.theme);
    }
  }, [data]);

  useEffect(() => {
    try { localStorage.setItem('freedao:tab', tab); } catch {}
  }, [tab]);

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData(prev => prev ? fn(prev) : prev);
  }, []);

  const [classifying, setClassifying] = useState(false);
  const [classifyStatus, setClassifyStatus] = useState('');

  const batchClassify = useCallback(async () => {
    if (!data) return;
    const provider = data.settings.providers.find(
      p => p.id === data.settings.activeProviderId && p.apiKey && p.model && p.baseUrl,
    );
    if (!provider) {
      setTab('settings');
      return;
    }

    setClassifying(true);
    let processed = 0;
    let success = 0;
    const expensesToClassify = data.expenses.filter(e => e.classifiedBy !== 'user');
    const incomesToClassify = data.incomes.filter(i => i.classifiedBy !== 'user');
    const total = expensesToClassify.length + incomesToClassify.length;

    if (total === 0) {
      setClassifyStatus('没有需要分类的条目');
      setClassifying(false);
      setTimeout(() => setClassifyStatus(''), 2000);
      return;
    }

    // Classify expenses
    for (const expense of expensesToClassify) {
      try {
        setClassifyStatus(`分类中 ${++processed}/${total}...`);
        const res = await fetch('/api/ai/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: expense.name, amount: expense.amount, kind: 'expense',
            baseUrl: provider.baseUrl, apiKey: provider.apiKey, model: provider.model,
          }),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.category) {
            success++;
            update(d => ({
              ...d,
              expenses: d.expenses.map(e =>
                e.id === expense.id
                  ? { ...e, category: result.category, subCategory: result.subCategory || 'optional', classifiedBy: 'ai' as const }
                  : e
              ),
            }));
          }
        }
      } catch { /* skip failed items */ }
    }

    // Classify incomes
    for (const income of incomesToClassify) {
      try {
        setClassifyStatus(`分类中 ${++processed}/${total}...`);
        const res = await fetch('/api/ai/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: income.name, amount: income.amount, kind: 'income',
            baseUrl: provider.baseUrl, apiKey: provider.apiKey, model: provider.model,
          }),
        });
        if (res.ok) {
          const result = await res.json();
          if (result.type) {
            success++;
            update(d => ({
              ...d,
              incomes: d.incomes.map(i =>
                i.id === income.id
                  ? { ...i, type: result.type, classifiedBy: 'ai' as const }
                  : i
              ),
            }));
          }
        }
      } catch { /* skip failed items */ }
    }

    setClassifyStatus(success === total ? `完成，已整理 ${total} 条` : `完成，成功 ${success}/${total} 条`);
    setClassifying(false);
    setTimeout(() => setClassifyStatus(''), 3000);
  }, [data, update, setTab]);

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-0)',
      }}>
        <div style={{ color: 'var(--fg-3)' }}>加载中...</div>
      </div>
    );
  }

  const monthlyExpense = data.expenses.reduce((s, e) => s + e.amount, 0);
  const monthlyIncome = data.incomes.reduce((s, i) => s + i.amount, 0);
  const passiveIncome = data.incomes.filter(i => i.type === 'passive').reduce((s, i) => s + i.amount, 0);
  const laborIncome = data.incomes.filter(i => i.type === 'labor').reduce((s, i) => s + i.amount, 0);
  const gap = monthlyExpense - monthlyIncome;
  const monthlyDeficit = Math.max(0, gap);
  const runwayMonths = gap > 0 ? data.savings / gap : Infinity;
  const hasData = monthlyExpense > 0 || monthlyIncome > 0;
  const runwayLabel = !hasData ? '—' : (runwayMonths === Infinity ? '∞' : runwayMonths.toFixed(1));
  const freedomPct = monthlyExpense > 0 ? Math.min(100, (passiveIncome / monthlyExpense) * 100) : 0;

  // Get active AI provider
  const activeProvider = data.settings.providers.find(
    p => p.id === data.settings.activeProviderId && p.apiKey && p.model && p.baseUrl,
  );

  const hour = new Date().getHours();
  const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freedao-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (json: string) => {
    try {
      const imported = JSON.parse(json);
      if (imported.expenses && imported.incomes) {
        setData(imported);
      } else {
        alert('导入格式不正确');
      }
    } catch {
      alert('JSON 解析失败');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('freedao');
    setData(load());
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', color: 'var(--fg-0)' }}>
      {/* Sticky header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '14px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>
          <Logo />
          <Nav current={tab} onChange={setTab} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setTab('plan')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', borderRadius: 99,
                background: 'rgba(255,186,92,0.08)',
                border: '1px solid rgba(255,186,92,0.18)',
                cursor: 'pointer',
              }}
              title="打开 Plan 模拟跑道"
            >
              <span style={{
                display: 'inline-block', width: 6, height: 6,
                borderRadius: '50%', background: 'var(--amber)',
              }} />
              <span className="mono" style={{ fontSize: 11, color: 'var(--amber)', letterSpacing: '0.04em' }}>
                {runwayLabel} MO
              </span>
              <span style={{ width: 1, height: 12, background: 'rgba(255,186,92,0.3)' }} />
              <span className="mono" style={{
                fontSize: 11, letterSpacing: '0.04em',
                color: freedomPct >= 100 ? 'var(--ok)' : 'var(--amber)',
              }}>
                {freedomPct.toFixed(0)}% FREE
              </span>
            </button>
            <button
              onClick={() => setTab('settings')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 10px', borderRadius: 8,
                background: activeProvider ? 'rgba(116,195,149,0.08)' : 'var(--overlay-subtle)',
                border: `1px solid ${activeProvider ? 'rgba(116,195,149,0.18)' : 'var(--line)'}`,
                cursor: 'pointer',
              }}
              title={activeProvider ? `AI 分类已启用 · ${activeProvider.name}` : '点击前往设置配置 AI'}
            >
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: activeProvider ? 'var(--ok)' : 'var(--fg-3)',
                boxShadow: activeProvider ? '0 0 6px oklch(0.72 0.15 155 / 0.5)' : 'none',
              }} />
              <span className="mono" style={{
                fontSize: 11,
                color: activeProvider ? 'var(--ok)' : 'var(--fg-2)',
              }}>
                {activeProvider ? `AI · ${activeProvider.name}` : '未配置 AI'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '32px 32px 64px',
      }}>
        {/* ── Dashboard ─────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 24,
            }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em' }}>
                  {new Date().getFullYear()} / Q{Math.ceil((new Date().getMonth() + 1) / 3)} · ONE PERSON COMPANY
                </div>
                <h1 style={{
                  margin: '6px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em',
                }}>
                  {greeting}，<span className="serif" style={{ fontStyle: 'italic', color: 'var(--fg-1)' }}>独行者</span>。
                </h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {classifyStatus && (
                  <span className="mono" style={{ fontSize: 11, color: 'var(--fg-2)' }}>
                    {classifyStatus}
                  </span>
                )}
                <button
                  onClick={batchClassify}
                  disabled={classifying}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 14px', borderRadius: 8,
                    background: activeProvider ? 'rgba(255,186,92,0.08)' : 'var(--overlay-subtle)',
                    border: `1px solid ${activeProvider ? 'rgba(255,186,92,0.18)' : 'var(--line)'}`,
                    color: activeProvider ? 'var(--amber)' : 'var(--fg-3)',
                    fontSize: 12.5, cursor: classifying ? 'wait' : 'pointer',
                    opacity: classifying ? 0.6 : 1,
                  }}
                  title={activeProvider ? 'AI 批量整理所有未手动分类的条目' : '请先在设置中配置 AI'}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{ color: 'currentColor' }}>
                    <path d="M6 1l1.2 3.3L10.5 5.5 7.2 6.7 6 10l-1.2-3.3L1.5 5.5l3.3-1.2z" fill="currentColor" opacity="0.9"/>
                  </svg>
                  {classifying ? '整理中...' : 'AI 整理分类'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <RunwayHero
                savings={data.savings}
                monthlyExpense={monthlyExpense}
                monthlyIncome={monthlyIncome}
                passiveIncome={passiveIncome}
                onSavingsChange={v => update(d => ({ ...d, savings: v }))}
              />
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
              marginBottom: 24,
            }}>
              <ExpensePanel
                expenses={data.expenses}
                savings={data.savings}
                monthlyDeficit={monthlyDeficit}
                activeProvider={activeProvider}
                onAdd={e => update(d => ({
                  ...d,
                  expenses: [...d.expenses, { ...e, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
                }))}
                onDelete={id => update(d => ({
                  ...d,
                  expenses: d.expenses.filter(e => e.id !== id),
                }))}
                onUpdate={e => update(d => ({
                  ...d,
                  expenses: d.expenses.map(ex => ex.id === e.id ? e : ex),
                }))}
              />
              <IncomePanel
                incomes={data.incomes}
                monthlyExpense={monthlyExpense}
                activeProvider={activeProvider}
                onAdd={i => update(d => ({
                  ...d,
                  incomes: [...d.incomes, { ...i, id: crypto.randomUUID(), createdAt: new Date().toISOString() }],
                }))}
                onDelete={id => update(d => ({
                  ...d,
                  incomes: d.incomes.filter(i => i.id !== id),
                }))}
                onUpdate={i => update(d => ({
                  ...d,
                  incomes: d.incomes.map(inc => inc.id === i.id ? i : inc),
                }))}
              />
            </div>

            <TimePanel
              categories={data.timeCategories}
              laborIncome={laborIncome}
              onChange={cats => update(d => ({ ...d, timeCategories: cats }))}
            />
          </>
        )}

        {/* ── Log ───────────────────────────────────────────────── */}
        {tab === 'log' && (
          <LogPanel expenses={data.expenses} incomes={data.incomes} />
        )}

        {/* ── Plan ──────────────────────────────────────────────── */}
        {tab === 'plan' && (
          <PlanPanel
            savings={data.savings}
            monthlyExpense={monthlyExpense}
            monthlyIncome={monthlyIncome}
          />
        )}

        {/* ── Guide ──────────────────────────────────────────────── */}
        {tab === 'guide' && (
          <GuidePanel
            onOpenOnboarding={() => setShowOnboarding(true)}
            onNavigate={setTab}
          />
        )}

        {/* ── Settings ──────────────────────────────────────────── */}
        {tab === 'settings' && (
          <SettingsPanel
            settings={data.settings}
            onChange={s => update(d => ({ ...d, settings: s }))}
            onExport={handleExport}
            onImport={handleImport}
            onReset={handleReset}
            onShowOnboarding={() => setShowOnboarding(true)}
          />
        )}
      </main>

      {showOnboarding && (
        <OnboardingOverlay
          onDismiss={() => {
            setShowOnboarding(false);
            try { localStorage.setItem('freedao:onboarded', '1'); } catch {}
          }}
          onGoToSettings={() => {
            setShowOnboarding(false);
            try { localStorage.setItem('freedao:onboarded', '1'); } catch {}
            setTab('settings');
          }}
        />
      )}

      <footer style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '24px 32px 40px',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 11, color: 'var(--fg-3)',
        borderTop: '1px solid var(--line)',
      }}>
        <span className="mono">FREEDAO · 自由倒计时 v0.6.0</span>
        <span>&ldquo;看清跑道，才有自由。&rdquo;</span>
      </footer>
    </div>
  );
}

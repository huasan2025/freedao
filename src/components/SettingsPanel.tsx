'use client';

import { useState, useEffect } from 'react';
import { AppSettings, ModelProvider } from '@/lib/types';
import { classifyExpense } from '@/lib/ai';

interface Props {
  settings: AppSettings;
  onChange: (s: AppSettings) => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onReset: () => void;
  onShowOnboarding?: () => void;
}

/* ── Provider metadata ───────────────────────────────────────────────── */

const PROVIDER_META: Record<string, { label: string; description: string; accent: string; glyph: string; models: string[] }> = {
  deepseek:    { label: '深度求索',              description: '国产推理模型 · 性价比最高', accent: 'oklch(0.72 0.14 255)', glyph: 'DS', models: ['deepseek-chat', 'deepseek-reasoner'] },
  gemini:      { label: 'Google Gemini',         description: '多模态能力最强 · 长上下文', accent: 'oklch(0.76 0.14 55)',  glyph: 'GM', models: ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash'] },
  qwen:        { label: '通义千问',              description: '阿里云 · 中文场景优秀',    accent: 'oklch(0.68 0.16 305)', glyph: 'QW', models: ['qwen-max', 'qwen-plus', 'qwen-turbo'] },
  volcengine:  { label: 'Volcengine · Doubao',   description: '字节豆包 · 低延迟',        accent: 'oklch(0.72 0.14 25)',  glyph: 'VE', models: ['doubao-pro-32k', 'doubao-lite-32k'] },
  custom:      { label: 'Custom Endpoint',       description: 'OpenAI 兼容接口',          accent: 'oklch(0.65 0.01 260)', glyph: '+',  models: [] },
};

/* ── Sub-components ──────────────────────────────────────────────────── */

function ProviderListItem({ provider, selected, active, onSelect }: {
  provider: ModelProvider; selected: boolean; active: boolean; onSelect: () => void;
}) {
  const meta = PROVIDER_META[provider.id] || PROVIDER_META.custom;
  const configured = provider.apiKey.length > 0;

  return (
    <div
      onClick={onSelect}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
        background: selected ? 'var(--overlay-hover)' : 'transparent',
        border: `1px solid ${selected ? 'var(--line-strong)' : 'transparent'}`,
        transition: 'all .15s',
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 6,
        background: `linear-gradient(135deg, ${meta.accent}, rgba(0,0,0,0.2))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, fontWeight: 600, color: '#0a0a0b',
        letterSpacing: '0.02em',
      }}>
        {meta.glyph}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--fg-0)' }}>{provider.name}</span>
          {active && (
            <span style={{
              fontSize: 9, color: 'var(--amber)',
              padding: '1px 5px', borderRadius: 3,
              background: 'rgba(255,186,92,0.10)',
              letterSpacing: '0.06em', fontWeight: 500,
            }} className="mono">ACTIVE</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {meta.label}
        </div>
      </div>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: configured ? 'var(--ok)' : 'var(--fg-3)',
        boxShadow: configured ? '0 0 8px oklch(0.72 0.15 155 / 0.5)' : 'none',
        flexShrink: 0,
      }} />
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
      <label style={{ fontSize: 11, color: 'var(--fg-2)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 500 }}>
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '10px 12px',
  background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8,
  fontFamily: "'JetBrains Mono', var(--font-jetbrains-mono), monospace",
  fontSize: 13, color: 'var(--fg-0)', outline: 'none',
  width: '100%',
};

function ProviderDetail({ provider, isActive, onActivate, onUpdate }: {
  provider: ModelProvider; isActive: boolean; onActivate: () => void; onUpdate: (p: ModelProvider) => void;
}) {
  const meta = PROVIDER_META[provider.id] || PROVIDER_META.custom;
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState<null | 'testing' | 'ok' | 'fail'>(null);

  useEffect(() => {
    setShowKey(false);
    setTesting(null);
  }, [provider.id]);

  const testConnection = async () => {
    if (!provider.apiKey || !provider.model || !provider.baseUrl) return;
    setTesting('testing');
    const result = await classifyExpense('测试', 1, provider);
    setTesting(result ? 'ok' : 'fail');
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        paddingBottom: 22, marginBottom: 22,
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: 10,
          background: `linear-gradient(135deg, ${meta.accent}, rgba(0,0,0,0.3))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 600, color: '#0a0a0b',
        }}>
          {meta.glyph}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em' }}>
              {provider.name}
            </h3>
            <span style={{ fontSize: 12, color: 'var(--fg-2)' }}>· {meta.label}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4 }}>{meta.description}</div>
        </div>
        <button
          onClick={onActivate}
          disabled={isActive || !provider.apiKey}
          style={{
            padding: '8px 14px', fontSize: 12, borderRadius: 8, cursor: isActive ? 'default' : 'pointer',
            background: isActive ? 'rgba(255,186,92,0.12)' : 'transparent',
            border: isActive ? '1px solid rgba(255,186,92,0.3)' : '1px solid var(--line-strong)',
            color: isActive ? 'var(--amber)' : 'var(--fg-1)',
            opacity: !provider.apiKey && !isActive ? 0.4 : 1,
          }}
        >
          {isActive ? '● 当前激活' : '设为默认'}
        </button>
      </div>

      {/* Fields */}
      <Field label="API Key · 接口密钥" hint="仅存在你的浏览器 localStorage，Freedao 不上传任何 Key。">
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 8 }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={provider.apiKey}
            onChange={e => onUpdate({ ...provider, apiKey: e.target.value })}
            placeholder={provider.id === 'custom' ? 'sk-...' : '输入你的 API Key'}
            style={{ ...inputStyle, border: 'none', background: 'transparent' }}
          />
          <button
            onClick={() => setShowKey(s => !s)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0 12px', fontSize: 11, color: 'var(--fg-2)',
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em',
            }}
          >{showKey ? '隐藏' : '显示'}</button>
        </div>
      </Field>

      <Field label="Base URL · 接口地址">
        <input
          value={provider.baseUrl}
          onChange={e => onUpdate({ ...provider, baseUrl: e.target.value })}
          placeholder="https://api.example.com/v1"
          style={inputStyle}
        />
      </Field>

      <Field label="Model · 模型名称" hint="直接输入模型名称，如 gemini-2.5-pro、deepseek-chat 等">
        <input
          value={provider.model}
          onChange={e => onUpdate({ ...provider, model: e.target.value })}
          placeholder={meta.models[0] || 'e.g. gpt-4o-mini'}
          style={inputStyle}
        />
      </Field>

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 10, marginTop: 28,
        paddingTop: 22, borderTop: '1px solid var(--line)',
      }}>
        <button
          onClick={testConnection}
          disabled={!provider.apiKey || !provider.model || !provider.baseUrl}
          style={{
            padding: '9px 16px', fontSize: 12.5, borderRadius: 8, cursor: 'pointer',
            background: 'var(--overlay-subtle)',
            border: '1px solid var(--line-strong)',
            color: 'var(--fg-0)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            opacity: (!provider.apiKey || !provider.model || !provider.baseUrl) ? 0.4 : 1,
          }}
        >
          {testing === 'testing' && <><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)' }} /> 测试中…</>}
          {testing === 'ok' && <><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} /> 连接成功</>}
          {testing === 'fail' && <><span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)' }} /> 连接失败</>}
          {testing === null && '测试连接'}
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => onUpdate({ ...provider, apiKey: '' })}
          style={{
            padding: '9px 14px', fontSize: 12, borderRadius: 8, cursor: 'pointer',
            background: 'transparent', border: '1px solid var(--line)',
            color: 'var(--fg-2)',
          }}
        >清除凭据</button>
      </div>

      {/* BYOK notice */}
      <div style={{
        marginTop: 24, padding: '14px 18px',
        background: 'var(--overlay-subtle)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" style={{ color: 'var(--fg-2)', marginTop: 2, flexShrink: 0 }}>
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <line x1="8" y1="7" x2="8" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="8" cy="5" r="0.8" fill="currentColor" />
        </svg>
        <div style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--fg-2)' }}>
          <strong style={{ color: 'var(--fg-0)', fontWeight: 500 }}>BYOK · Bring Your Own Key</strong> ·
          你的 API Key 仅保存在本地浏览器存储中，每次请求通过服务端代理转发，不会被存储或记录。
        </div>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */

export default function SettingsPanel({ settings, onChange, onExport, onImport, onReset, onShowOnboarding }: Props) {
  const [selectedId, setSelectedId] = useState(settings.activeProviderId || settings.providers[0]?.id);
  const [confirmReset, setConfirmReset] = useState(false);

  const selectedProvider = settings.providers.find(p => p.id === selectedId);

  const handleProviderUpdate = (updated: ModelProvider) => {
    const old = settings.providers.find(p => p.id === updated.id);
    const keyJustAdded = old && old.apiKey === '' && updated.apiKey !== '';
    const shouldAutoActivate = keyJustAdded && !settings.activeProviderId;

    onChange({
      ...settings,
      providers: settings.providers.map(p => p.id === updated.id ? updated : p),
      activeProviderId: shouldAutoActivate ? updated.id : settings.activeProviderId,
    });
  };

  const handleActivate = (id: string) => {
    onChange({ ...settings, activeProviderId: id });
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => onImport(reader.result as string);
      reader.readAsText(file);
    };
    input.click();
  };

  const configuredCount = settings.providers.filter(p => p.apiKey.length > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page header */}
      <div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em' }}>
          SETTINGS · 设置
        </div>
        <h1 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
          配置 · <span className="serif" style={{ fontStyle: 'italic', color: 'var(--fg-1)' }}>Configuration</span>
        </h1>
      </div>

      {/* Appearance */}
      <section style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 16, padding: 28,
      }}>
        <header style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--fg-0)' }}>外观</h2>
          <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--fg-2)' }}>Appearance · 选择你喜欢的主题</div>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {([
            { id: 'dark' as const, label: '深色', desc: '默认 · 暗色背景', icon: '◐' },
            { id: 'light' as const, label: '浅色', desc: '明亮背景 · 日间使用', icon: '○' },
          ]).map(t => (
            <button
              key={t.id}
              onClick={() => onChange({ ...settings, theme: t.id })}
              style={{
                padding: '16px 18px', borderRadius: 10, cursor: 'pointer',
                background: settings.theme === t.id ? 'rgba(255,186,92,0.08)' : 'var(--overlay-subtle)',
                border: `1px solid ${settings.theme === t.id ? 'rgba(255,186,92,0.3)' : 'var(--line-strong)'}`,
                color: 'var(--fg-0)', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14,
                transition: 'all .15s',
              }}
            >
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500,
                  color: settings.theme === t.id ? 'var(--amber)' : 'var(--fg-0)',
                }}>{t.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-2)', fontWeight: 400 }}>{t.desc}</div>
              </div>
              {settings.theme === t.id && (
                <span style={{
                  marginLeft: 'auto',
                  display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                  background: 'var(--amber)',
                  boxShadow: '0 0 8px rgba(255,186,92,0.5)',
                }} />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* AI Providers */}
      <section style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 16, padding: 28,
      }}>
        <header style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--fg-0)' }}>AI 模型服务</h2>
          <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--fg-2)' }}>Model Services · 用于生成 AI 洞察与建议</div>
        </header>

        <div style={{
          display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24,
          minHeight: 480,
        }}>
          {/* Left: provider list */}
          <div style={{
            paddingRight: 20, borderRight: '1px solid var(--line)',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0 4px 10px',
            }}>
              <span style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Providers · {configuredCount}/{settings.providers.length}
              </span>
            </div>
            {settings.providers.map(p => (
              <ProviderListItem
                key={p.id}
                provider={p}
                selected={selectedId === p.id}
                active={settings.activeProviderId === p.id}
                onSelect={() => setSelectedId(p.id)}
              />
            ))}
          </div>

          {/* Right: detail */}
          <div>
            {selectedProvider && (
              <ProviderDetail
                provider={selectedProvider}
                isActive={settings.activeProviderId === selectedProvider.id}
                onActivate={() => handleActivate(selectedProvider.id)}
                onUpdate={handleProviderUpdate}
              />
            )}
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section style={{
        background: 'var(--bg-1)', border: '1px solid var(--line)',
        borderRadius: 16, padding: 28,
      }}>
        <header style={{ marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'var(--fg-0)' }}>数据管理</h2>
          <div style={{ marginTop: 4, fontSize: 12.5, color: 'var(--fg-2)' }}>所有数据保存在浏览器本地 · 支持导入导出迁移</div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            onClick={onExport}
            style={{
              padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
              background: 'var(--overlay-subtle)', border: '1px solid var(--line-strong)',
              color: 'var(--fg-0)', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500 }}>导出 JSON</div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-2)', fontWeight: 400 }}>
              下载全部收支与时间记录为 .json 文件
            </div>
          </button>

          <button
            onClick={handleImportClick}
            style={{
              padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
              background: 'var(--overlay-subtle)', border: '1px solid var(--line-strong)',
              color: 'var(--fg-0)', textAlign: 'left',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 500 }}>导入 JSON</div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-2)', fontWeight: 400 }}>
              合并或覆盖现有记录
            </div>
          </button>
        </div>

        {onShowOnboarding && (
          <button
            onClick={onShowOnboarding}
            style={{
              marginTop: 12, padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
              background: 'var(--overlay-subtle)', border: '1px solid var(--line)',
              color: 'var(--fg-1)', fontSize: 13, width: '100%', textAlign: 'left',
            }}
          >
            重新查看新手引导
          </button>
        )}

        {/* Danger zone */}
        <div style={{
          marginTop: 28, padding: 18, borderRadius: 10,
          background: 'rgba(232,92,82,0.03)',
          border: '1px solid rgba(232,92,82,0.18)',
        }}>
          <div style={{
            fontSize: 10.5, color: 'oklch(0.72 0.14 25)',
            letterSpacing: '0.10em', fontWeight: 500, textTransform: 'uppercase',
            marginBottom: 8,
          }}>Danger Zone · 危险操作</div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ fontSize: 12.5, color: 'var(--fg-1)', lineHeight: 1.55 }}>
              重置全部本地数据，包括收支记录、时间分配、AI 配置。此操作不可撤销。
            </div>
            <button
              onClick={() => {
                if (confirmReset) { onReset(); setConfirmReset(false); }
                else setConfirmReset(true);
              }}
              style={{
                padding: '9px 14px', fontSize: 12.5, borderRadius: 8, cursor: 'pointer',
                background: confirmReset ? 'oklch(0.55 0.18 25)' : 'transparent',
                border: '1px solid oklch(0.72 0.14 25 / 0.5)',
                color: confirmReset ? '#fff' : 'oklch(0.80 0.14 25)',
                fontWeight: 500, whiteSpace: 'nowrap',
              }}
            >
              {confirmReset ? '再点一次确认' : '重置全部数据'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

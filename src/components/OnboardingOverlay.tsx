'use client';

interface Props {
  onDismiss: () => void;
  onGoToSettings: () => void;
}

const concepts = [
  {
    icon: '🛤',
    title: '跑道 Runway',
    body: '你的存款还能撑多少个月。当月收入 ≥ 月支出时，跑道为无限（∞），这是好事。',
  },
  {
    icon: '🎯',
    title: '自由进度 Freedom Progress',
    body: '被动收入 / 月支出。当被动收入完全覆盖支出时，达到 100%，意味着财务自由。',
  },
  {
    icon: '💰',
    title: '支出分类',
    body: '投资性支出（预期有回报：课程、工具、营销）vs 消费性支出（必选：房租水电 / 可选：娱乐订阅）。',
  },
  {
    icon: '📈',
    title: '收入分类',
    body: '劳动收入（需持续投入时间）维持跑道，被动收入（不需持续投入）通往自由。',
  },
  {
    icon: '✨',
    title: 'AI 智能分类',
    body: '配置 AI 密钥后，新增收支时会自动分类。前往设置 → 填入 API Key 即可启用。',
  },
];

export default function OnboardingOverlay({ onDismiss, onGoToSettings }: Props) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onDismiss(); }}
    >
      <div style={{
        width: '100%', maxWidth: 520, maxHeight: '85vh',
        background: 'var(--bg-1)',
        border: '1px solid var(--line)',
        borderRadius: 20,
        padding: '40px 36px',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="serif" style={{
            fontSize: 28, fontStyle: 'italic', color: 'var(--fg-0)', marginBottom: 8,
          }}>
            欢迎来到 Freedao
          </div>
          <div style={{ fontSize: 14, color: 'var(--fg-2)', lineHeight: 1.6 }}>
            独立创业者的现金流生存仪表盘
          </div>
        </div>

        {/* Concepts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {concepts.map(c => (
            <div key={c.title} style={{
              display: 'flex', gap: 14,
              padding: '14px 16px',
              background: 'var(--overlay-subtle)',
              border: '1px solid var(--line)',
              borderRadius: 12,
            }}>
              <span style={{ fontSize: 20, lineHeight: 1.4, flexShrink: 0 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--fg-0)', marginBottom: 4 }}>
                  {c.title}
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.65 }}>
                  {c.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 12, justifyContent: 'center',
          marginTop: 32,
        }}>
          <button
            onClick={onDismiss}
            style={{
              padding: '12px 28px', borderRadius: 10,
              background: 'var(--amber)',
              border: 'none',
              color: '#1a1a1a', fontSize: 14, fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            开始使用
          </button>
          <button
            onClick={onGoToSettings}
            style={{
              padding: '12px 28px', borderRadius: 10,
              background: 'transparent',
              border: '1px solid var(--line)',
              color: 'var(--fg-1)', fontSize: 14,
              cursor: 'pointer',
            }}
          >
            前往配置 AI
          </button>
        </div>
      </div>
    </div>
  );
}

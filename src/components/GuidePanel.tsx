'use client';

interface Props {
  onOpenOnboarding: () => void;
  onNavigate: (tab: string) => void;
}

const sectionStyle = {
  background: 'var(--bg-1)',
  border: '1px solid var(--line)',
  borderRadius: 16,
  padding: 28,
  marginBottom: 20,
};

const titleStyle = {
  fontSize: 15,
  fontWeight: 500 as const,
  color: 'var(--fg-0)',
  marginBottom: 14,
};

const placeholderStyle = {
  fontSize: 13,
  color: 'var(--fg-3)',
  lineHeight: 1.7,
};

export default function GuidePanel({ onOpenOnboarding, onNavigate }: Props) {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em' }}>
          HELP · 帮助
        </div>
        <h1 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em' }}>
          使用指南
        </h1>
      </div>

      <section style={sectionStyle}>
        <div style={titleStyle}>产品理念 · Product Concepts</div>
        <div style={placeholderStyle}>
          <p style={{ margin: '0 0 8px' }}>Freedao 不是记账工具，而是「距离自由还差多少」的导航系统。</p>
          <p style={{ margin: 0, fontStyle: 'italic' }}>详细内容即将推出...</p>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={titleStyle}>使用指南 · How to Use</div>
        <div style={placeholderStyle}>
          <p style={{ margin: '0 0 8px' }}>从录入收支开始，跑道和自由进度会自动计算。</p>
          <p style={{ margin: 0, fontStyle: 'italic' }}>详细内容即将推出...</p>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={titleStyle}>快速操作 · Quick Actions</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={onOpenOnboarding}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'var(--overlay-subtle)',
              border: '1px solid var(--line)',
              color: 'var(--fg-1)', fontSize: 13,
              cursor: 'pointer',
            }}
          >
            重新查看引导
          </button>
          <button
            onClick={() => onNavigate('settings')}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'var(--overlay-subtle)',
              border: '1px solid var(--line)',
              color: 'var(--fg-1)', fontSize: 13,
              cursor: 'pointer',
            }}
          >
            配置 AI 分类
          </button>
        </div>
      </section>
    </div>
  );
}

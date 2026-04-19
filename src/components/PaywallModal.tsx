'use client';

import { useEffect } from 'react';

const WAITLIST_URL = 'https://my.feishu.cn/share/base/form/shrcnizYaLm11sTEQg8YoNjjThe';

export type PaywallVariant = 'savings' | 'opportunity';

interface Props {
  open: boolean;
  variant: PaywallVariant;
  onClose: () => void;
}

type Teaser = { icon: string; title: string; desc: string };

const content: Record<PaywallVariant, { title: string; subtitle: string; teasers: Teaser[] }> = {
  savings: {
    title: '更多省钱案例',
    subtitle: 'Freedao 正式版将持续更新独立创业者的日常省钱实战：',
    teasers: [
      { icon: '📱', title: '手机套餐深度优化', desc: '流量需求 × 套餐定价的最优解' },
      { icon: '🍜', title: '外卖替代策略', desc: '3 种不降低体验但减半成本的做饭方案' },
      { icon: '📺', title: '订阅费精简术', desc: '识别僵尸订阅 · 家庭合租方案' },
      { icon: '🏠', title: '房租议价与换房时机', desc: '合同到期前 60 天的谈判窗口' },
    ],
  },
  opportunity: {
    title: '更多赚钱案例',
    subtitle: 'Freedao 正式版将持续更新 AI 时代 OPC 的真实创收案例：',
    teasers: [
      { icon: '💼', title: 'AI 咨询师', desc: '某人如何 3 个月做到 ¥8,000/月' },
      { icon: '🛠️', title: '独立开发变现', desc: '从 0 做到 ¥1,500/月被动收入的组合拳' },
      { icon: '✍️', title: '内容付费社群', desc: '100 位种子用户滚到 ¥5,000/月的路径' },
      { icon: '🎯', title: '高客单接单', desc: '朋友圈信任链 → ¥2,000 单价的建立方法' },
    ],
  },
};

export default function PaywallModal({ open, variant, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const data = content[variant];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 480, width: '100%',
          background: 'var(--bg-1)',
          border: '1px solid var(--line-strong)',
          borderRadius: 16,
          padding: 28,
          display: 'flex', flexDirection: 'column', gap: 18,
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 12 12" style={{ color: 'var(--amber)' }}>
            <path d="M6 1l1.2 3.3L10.5 5.5 7.2 6.7 6 10l-1.2-3.3L1.5 5.5l3.3-1.2z" fill="currentColor" opacity="0.9"/>
          </svg>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--fg-0)' }}>
            {data.title}
          </h3>
        </div>

        <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.6 }}>
          {data.subtitle}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.teasers.map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px',
              background: 'var(--overlay-subtle)',
              border: '1px solid var(--line)',
              borderRadius: 10,
            }}>
              <div style={{ fontSize: 20, lineHeight: 1 }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--fg-0)', fontWeight: 500 }}>
                  {t.title}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-2)', marginTop: 2 }}>
                  {t.desc}
                </div>
              </div>
              <div style={{
                fontSize: 10, color: 'var(--fg-3)',
                padding: '2px 6px', borderRadius: 4,
                background: 'var(--bar-bg)',
                border: '1px solid var(--line)',
                whiteSpace: 'nowrap',
                alignSelf: 'center',
              }}>
                正式版
              </div>
            </div>
          ))}
        </div>

        <div style={{
          fontSize: 12, color: 'var(--fg-1)', lineHeight: 1.6,
          padding: '10px 12px',
          background: 'rgba(255,186,92,0.05)',
          borderLeft: '2px solid var(--amber)',
          borderRadius: '2px 6px 6px 2px',
        }}>
          更多真实案例正在整理中。加入 Waitlist，在正式版上线时第一时间解锁。
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 16px', fontSize: 13,
              background: 'transparent',
              border: '1px solid var(--line-strong)',
              borderRadius: 8, cursor: 'pointer',
              color: 'var(--fg-2)',
            }}
          >
            关闭
          </button>
          <a
            href={WAITLIST_URL}
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 2, padding: '10px 16px', fontSize: 13,
              background: 'var(--amber)', border: '1px solid var(--amber)',
              borderRadius: 8, cursor: 'pointer',
              color: '#1a1208', fontWeight: 500, textAlign: 'center',
              textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            加入 Waitlist →
          </a>
        </div>
      </div>
    </div>
  );
}

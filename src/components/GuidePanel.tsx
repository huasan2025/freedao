'use client';

import { useState } from 'react';

interface Props {
  onOpenOnboarding: () => void;
  onNavigate: (tab: string) => void;
}

const sections = [
  { id: 'overview', label: 'Overview', zh: '概览' },
  { id: 'theory', label: 'Theory', zh: '核心理论' },
  { id: 'input', label: 'Input', zh: '录入收支' },
  { id: 'metrics', label: 'Metrics', zh: '读懂指标' },
  { id: 'plan', label: 'Plan', zh: '模拟器' },
  { id: 'case-library', label: 'Case Library', zh: '案例库 & Waitlist' },
  { id: 'byok', label: 'BYOK AI', zh: '自带 AI' },
];

const H2 = ({ en, zh, id }: { en: string; zh: string; id: string }) => (
  <div id={id} style={{ scrollMarginTop: 100, marginBottom: 16 }}>
    <div className="mono" style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em' }}>
      {en.toUpperCase()}
    </div>
    <h2 style={{
      margin: '6px 0 0', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em',
      color: 'var(--fg-0)',
    }}>
      {zh}
    </h2>
  </div>
);

const Lead = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    margin: '0 0 20px', fontSize: 15, lineHeight: 1.7, color: 'var(--fg-1)',
  }}>
    {children}
  </p>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{
    margin: '28px 0 10px', fontSize: 14, fontWeight: 500,
    color: 'var(--fg-0)', letterSpacing: '-0.005em',
  }}>
    {children}
  </h3>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <p style={{
    margin: '0 0 10px', fontSize: 13.5, lineHeight: 1.75, color: 'var(--fg-1)',
  }}>
    {children}
  </p>
);

const KW = ({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) => (
  <span className="mono" style={{
    fontSize: '0.92em',
    color: accent ? 'var(--amber)' : 'var(--fg-0)',
    background: accent ? 'rgba(255,186,92,0.08)' : 'var(--overlay-subtle)',
    padding: '1px 6px', borderRadius: 4,
    border: `1px solid ${accent ? 'rgba(255,186,92,0.18)' : 'var(--line)'}`,
  }}>
    {children}
  </span>
);

const Note = ({ title, children, tone = 'info' }: {
  title: string;
  children: React.ReactNode;
  tone?: 'info' | 'tip' | 'warn';
}) => {
  const colors = {
    info: { bg: 'var(--overlay-subtle)', border: 'var(--line)', label: 'var(--fg-2)' },
    tip:  { bg: 'rgba(255,186,92,0.06)', border: 'rgba(255,186,92,0.18)', label: 'var(--amber)' },
    warn: { bg: 'rgba(232,110,83,0.06)', border: 'rgba(232,110,83,0.2)', label: 'var(--danger, #e86e53)' },
  }[tone];
  return (
    <div style={{
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: 10, padding: '14px 16px', margin: '14px 0',
    }}>
      <div className="mono" style={{
        fontSize: 10.5, color: colors.label, letterSpacing: '0.1em',
        marginBottom: 6, textTransform: 'uppercase',
      }}>
        {title}
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--fg-1)' }}>
        {children}
      </div>
    </div>
  );
};

const DefList = ({ items }: { items: { term: string; desc: React.ReactNode }[] }) => (
  <div style={{ margin: '14px 0' }}>
    {items.map((it, i) => (
      <div key={i} style={{
        display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16,
        padding: '10px 0',
        borderTop: i === 0 ? '1px solid var(--line)' : 'none',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-0)' }}>{it.term}</div>
        <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--fg-1)' }}>{it.desc}</div>
      </div>
    ))}
  </div>
);

const NextStep = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      marginTop: 18,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '8px 14px', borderRadius: 8,
      background: 'rgba(255,186,92,0.06)',
      border: '1px solid rgba(255,186,92,0.2)',
      color: 'var(--amber)', fontSize: 12.5,
      cursor: 'pointer',
    }}
  >
    {label}
    <span style={{ fontSize: 14 }}>→</span>
  </button>
);

const Section = ({ children }: { children: React.ReactNode }) => (
  <section style={{ marginBottom: 56 }}>{children}</section>
);

export default function GuidePanel({ onOpenOnboarding, onNavigate }: Props) {
  const [active, setActive] = useState('overview');

  const go = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 48 }}>
      {/* Sidebar TOC */}
      <aside style={{
        position: 'sticky', top: 90, alignSelf: 'start',
        height: 'fit-content',
      }}>
        <div className="mono" style={{
          fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em',
          marginBottom: 12,
        }}>
          ON THIS PAGE
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              style={{
                textAlign: 'left', padding: '7px 10px', borderRadius: 6,
                background: active === s.id ? 'var(--overlay-hover)' : 'transparent',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'baseline', gap: 8,
                color: active === s.id ? 'var(--fg-0)' : 'var(--fg-2)',
                transition: 'all .15s',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: active === s.id ? 500 : 400 }}>{s.zh}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--fg-3)' }}>{s.label}</span>
            </button>
          ))}
        </nav>
        <div style={{
          marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <button
            onClick={onOpenOnboarding}
            style={{
              textAlign: 'left', padding: '7px 10px', borderRadius: 6,
              background: 'var(--overlay-subtle)', border: '1px solid var(--line)',
              color: 'var(--fg-1)', fontSize: 12, cursor: 'pointer',
            }}
          >
            重看新手引导
          </button>
          <button
            onClick={() => onNavigate('settings')}
            style={{
              textAlign: 'left', padding: '7px 10px', borderRadius: 6,
              background: 'var(--overlay-subtle)', border: '1px solid var(--line)',
              color: 'var(--fg-1)', fontSize: 12, cursor: 'pointer',
            }}
          >
            配置 AI →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ maxWidth: 760 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="mono" style={{
            fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em',
          }}>
            DOCUMENTATION · 使用指南
          </div>
          <h1 style={{
            margin: '6px 0 8px', fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em',
          }}>
            Freedao 指南
          </h1>
          <p style={{ margin: 0, fontSize: 15, color: 'var(--fg-2)', lineHeight: 1.6 }}>
            独立创业者的现金流导航系统 — 从理解产品到每天用好它。
          </p>
        </div>

        {/* 1. Overview */}
        <Section>
          <H2 en="Overview" zh="概览" id="overview" />
          <Lead>
            Freedao 不是记账 App。记账回答&ldquo;钱去哪了&rdquo;；Freedao 回答
            <KW accent>我什么时候能不再为钱发愁</KW>，以及
            <KW accent>下一步往哪走</KW>。
          </Lead>

          <H3>它解决什么问题</H3>
          <P>大多数独立创业者（OPC）靠积蓄、股票、家人资助、偶尔接单撑着，同时不知道四件事：</P>
          <ul style={{ margin: '0 0 14px', paddingLeft: 20, fontSize: 13.5, lineHeight: 1.85, color: 'var(--fg-1)' }}>
            <li>自己还能撑多久（<KW>Runway</KW>）</li>
            <li>钱花在哪了（投资 vs 消费，能省 vs 不能省）</li>
            <li>时间花在哪了（产生收入的时间占比）</li>
            <li>怎样才能提前到达自由线（需要多少被动收入、来自哪里）</li>
          </ul>

          <H3>适合谁</H3>
          <DefList items={[
            { term: '全职 OPC', desc: 'AI 时代自己做产品 / 独立接单 / 内容创业的人' },
            { term: '收入不稳定', desc: '靠积蓄或家人资助撑着，想看清何时能自给自足' },
            { term: '想更自律', desc: '知道该省钱、该搞钱，但不知道从哪个口子开始动' },
          ]} />

          <H3>不适合谁</H3>
          <P>上班族、已经有稳定工资的自由职业者、传统小老板 — 他们的现金流结构不吃 Freedao 的理论框架。</P>

          <NextStep label="去 Dashboard 看看" onClick={() => onNavigate('dashboard')} />
        </Section>

        {/* 2. Theory */}
        <Section>
          <H2 en="Theory" zh="核心理论" id="theory" />
          <Lead>
            整个产品建在一个等式上：<br />
            <span className="serif" style={{ fontSize: 20, color: 'var(--amber)', display: 'inline-block', marginTop: 6 }}>
              被动收入 ≥ 月总支出 = 初步自由
            </span>
          </Lead>

          <P>这条线比&ldquo;收支平衡&rdquo;高一档，比&ldquo;财务自由&rdquo;低一档，是 OPC 最应该盯的中间里程碑。</P>

          <H3>两个独立指标</H3>
          <DefList items={[
            {
              term: 'Runway 跑道',
              desc: <>
                <KW>存款 ÷ 月缺口</KW>，用总收入算。回答&ldquo;我还能撑多久&rdquo;。
              </>,
            },
            {
              term: 'Freedom Progress',
              desc: <>
                <KW>被动收入 ÷ 月支出</KW>，<em>只用被动收入算</em>。回答&ldquo;我距离不再为钱发愁还差多少&rdquo;。
              </>,
            },
          ]} />

          <Note title="关键区分">
            劳动收入维持跑道，<KW accent>被动收入</KW>通往自由。不区分这两个，就会陷入
            &ldquo;我赚了很多钱，但一停工就崩溃&rdquo;的幻觉里。
          </Note>

          <H3>支出的两个切分轴</H3>
          <P>Freedao 把每笔支出放进 2×2 矩阵：</P>
          <DefList items={[
            { term: '投资性 · 必选', desc: '预期有回报的必要投入（工具订阅、线下房租）' },
            { term: '投资性 · 可选', desc: '预期有回报但可以省（线上课、会员工具）' },
            { term: '消费性 · 必选', desc: '没有回报但必须花（房租、食材、水电）' },
            { term: '消费性 · 可选', desc: '没有回报且可以砍（外卖、娱乐订阅、消费品）' },
          ]} />
          <P>&ldquo;消费性 · 可选&rdquo;是省钱洞察永远先盯的那一格。</P>

          <H3>收入的切分轴</H3>
          <DefList items={[
            { term: '劳动收入', desc: '靠时间换钱 — 接单、服务、日常咨询' },
            { term: '被动收入', desc: '不靠每天工作也能持续 — 产品、版税、会员、广告分成' },
          ]} />

          <NextStep label="去 Dashboard 看指标" onClick={() => onNavigate('dashboard')} />
        </Section>

        {/* 3. Input */}
        <Section>
          <H2 en="Input" zh="录入收支" id="input" />
          <Lead>
            Freedao 要的不是流水级记账，是<KW accent>月度稳态</KW>。一次录入，自动折算。
          </Lead>

          <H3>录入支出</H3>
          <P>在 Dashboard 的支出面板填<KW>名称</KW> + <KW>月金额</KW>，然后选分类。</P>
          <ul style={{ margin: '0 0 14px', paddingLeft: 20, fontSize: 13.5, lineHeight: 1.85, color: 'var(--fg-1)' }}>
            <li>配置了 AI 后会自动分类（投资/消费 × 必选/可选），不满意可手动改</li>
            <li>双击条目可进入编辑模式</li>
            <li>删除需二次确认（避免误删）</li>
          </ul>

          <H3>录入收入</H3>
          <P>同样填<KW>名称</KW> + <KW>月金额</KW>，AI 自动判断劳动/被动。被动收入是自由进度的唯一来源。</P>

          <H3>录入时间</H3>
          <P>在 Dashboard 底部的时间面板，填每周投入小时数，自动换算成月度占比。5 个维度：</P>
          <DefList items={[
            { term: '产品开发', desc: '做自己的产品、实验、试错' },
            { term: '学习成长', desc: '读、看课、练新工具' },
            { term: '内容创作', desc: '写、拍、发布、运营' },
            { term: '接单服务', desc: '靠时间换钱的直接收入口' },
            { term: '行政杂务', desc: '账务、沟通、流程 — 必要但不产值' },
          ]} />

          <Note title="提示" tone="tip">
            &ldquo;接单服务&rdquo; 的时间 + 你填的劳动收入 → 自动算出<KW>实际时薪</KW>，用在时间洞察里。
          </Note>

          <H3>导入/导出</H3>
          <P>在 Settings 页可以导出完整 JSON 备份，也可以把另一台机器的 JSON 导入。数据只在你的浏览器。</P>

          <NextStep label="去 Dashboard 开始录入" onClick={() => onNavigate('dashboard')} />
        </Section>

        {/* 4. Metrics */}
        <Section>
          <H2 en="Metrics" zh="读懂指标" id="metrics" />
          <Lead>
            每个数字背后都有一句行动建议。下面教你看懂它们。
          </Lead>

          <H3>Header badge</H3>
          <P>页面顶部永远显示两个数：</P>
          <div style={{
            margin: '12px 0 18px', padding: '14px 16px',
            background: 'rgba(255,186,92,0.06)',
            border: '1px solid rgba(255,186,92,0.18)',
            borderRadius: 10,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 14, color: 'var(--amber)', letterSpacing: '0.04em',
          }}>
            ● 12.4 MO &nbsp;|&nbsp; 35% FREE
          </div>
          <DefList items={[
            { term: 'X.X MO', desc: 'Runway 月数。< 6 个月要警觉，< 3 个月要行动。' },
            { term: 'XX% FREE', desc: 'Freedom Progress。0% = 没有被动收入；100% = 被动收入已覆盖全部月支出。' },
          ]} />

          <H3>Runway 警戒线</H3>
          <DefList items={[
            { term: '> 12 个月', desc: '安全带足够，可以长线做产品' },
            { term: '6 ~ 12 个月', desc: '该开始考虑副业 / 接单补贴跑道' },
            { term: '3 ~ 6 个月', desc: '优先把消费性可选砍一半' },
            { term: '< 3 个月', desc: '立刻接单 + 停止一切可选开支' },
          ]} />

          <H3>三个洞察卡片</H3>
          <DefList items={[
            {
              term: '省钱洞察',
              desc: '从 optional 支出里找最大的那笔，算出月省 + 年省 + 跑道延长的天数',
            },
            {
              term: '自由洞察',
              desc: '根据你的被动收入状态给 3 种提示：已自由 / 部分启动 / 纯劳动',
            },
            {
              term: '时间洞察',
              desc: '用你的真实时薪算：接单再多 2h / 周，月收入会多多少',
            },
          ]} />

          <NextStep label="去 Plan 模拟一下" onClick={() => onNavigate('plan')} />
        </Section>

        {/* 5. Plan */}
        <Section>
          <H2 en="Plan" zh="What-if 模拟器" id="plan" />
          <Lead>
            Plan 是 Freedao 最核心的差异化功能。记账只能看过去，Plan 让你
            <KW accent>实时模拟不同选择的跑道变化</KW>。
          </Lead>

          <H3>三个滑块</H3>
          <DefList items={[
            { term: '月支出减少', desc: '0–50%，模拟砍开销后跑道的延长' },
            { term: '月收入增加', desc: '¥0–8,000，模拟新接单或被动收入起来' },
            { term: '一次性现金', desc: '¥0–50,000，模拟存款注入（如结算应收款）' },
          ]} />

          <H3>跑道时间轴</H3>
          <P>当前跑道 vs 模拟跑道在同一张时间轴上对比，6 个月安全线、12 个月缓冲线标在轴上。</P>

          <H3>情景对比</H3>
          <P>3 个预设情景（保守/平衡/激进）+ 你自己保存的情景，随时对比。</P>

          <H3>AI 解读 & 商机发现</H3>
          <P>根据模拟结果给 4 种解读：跑道延长意义 / 被动收入起点 / 一次性注入的时间换算 / 多维联动。
          点<KW>商机发现</KW>进入赚钱案例库（目前是 Waitlist）。</P>

          <Note title="Plan 是手段，不是目的" tone="tip">
            延长跑道本身不是终点，<KW accent>跑道是用来争取时间做被动收入</KW>。
            Plan 里的里程碑按这个顺序走：6 个月安全 → 12 个月缓冲 → 被动收入 ≥ 支出。
          </Note>

          <NextStep label="去 Plan 模拟" onClick={() => onNavigate('plan')} />
        </Section>

        {/* 6. Case Library */}
        <Section>
          <H2 en="Case Library" zh="案例库 & Waitlist" id="case-library" />
          <Lead>
            工具让你看清&ldquo;自己在哪&rdquo;，案例库让你看见&ldquo;别人怎么走到那里&rdquo;。
            两者是一个闭环。
          </Lead>

          <H3>两个案例库</H3>
          <DefList items={[
            {
              term: '省钱案例库',
              desc: '日常生活可复制的省钱操作：手机套餐优化、外卖替代、订阅精简、房租议价 ...',
            },
            {
              term: '赚钱案例库',
              desc: 'AI 时代 OPC 真实案例：AI 咨询师、独立开发、内容社群、高客单接单 ...',
            },
          ]} />

          <H3>如何解锁</H3>
          <P>省钱洞察 / AI 解读下方的<KW>查看更多建议</KW>或<KW>商机发现</KW>点开即可。
          目前是 Waitlist 阶段 — 留个邮箱 + 最想解锁什么，上线优先通知你。</P>

          <Note title="开源免费 vs 付费案例库的分界" tone="info">
            所有 Freedao 工具本身永久免费、开源、数据本地。
            付费部分只有案例库内容 — 因为这部分需要持续调研、写作、验证。
          </Note>
        </Section>

        {/* 7. BYOK AI */}
        <Section>
          <H2 en="BYOK AI" zh="自带 AI 模型" id="byok" />
          <Lead>
            Freedao 不给你 AI，让你<KW accent>带自己的 Key 进来</KW>。
            数据永远是你的。
          </Lead>

          <H3>支持的 Provider</H3>
          <DefList items={[
            { term: 'DeepSeek', desc: '便宜好用的国产选择' },
            { term: 'Gemini', desc: 'Google，免费额度充裕' },
            { term: '通义千问', desc: '阿里云 DashScope' },
            { term: '火山引擎', desc: '字节，豆包接入' },
            { term: '自定义', desc: '任何 OpenAI 兼容接口均可' },
          ]} />

          <H3>数据流</H3>
          <P>你输入条目 → Freedao 服务端代理转发给<KW>你配置的 Provider</KW> → 结果返回你浏览器。
          Freedao 不存你的数据、不看你的 Key、不做任何训练。</P>

          <Note title="服务端代理只做一件事" tone="info">
            规避浏览器 CORS 限制。Key 随请求传入，用完即扔，不落库。
            如果你介意这一步，之后的 Tauri 桌面版会改成完全本地调用。
          </Note>

          <H3>怎么配置</H3>
          <ol style={{ margin: '0 0 14px', paddingLeft: 20, fontSize: 13.5, lineHeight: 1.85, color: 'var(--fg-1)' }}>
            <li>去 Settings → AI 模型服务</li>
            <li>选一个 Provider，填 Base URL + API Key + 模型名</li>
            <li>点&ldquo;测试连接&rdquo;确认可用</li>
            <li>回 Dashboard，点 Header 的&ldquo;AI 整理分类&rdquo;批量跑</li>
          </ol>

          <NextStep label="去 Settings 配置 AI" onClick={() => onNavigate('settings')} />
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--line)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: 'var(--fg-3)',
        }}>
          <span>看清跑道，才有自由。</span>
          <span className="mono">FREEDAO v0.6.0</span>
        </div>
      </div>
    </div>
  );
}

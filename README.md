# Freedao · 自由道

> 不是记账软件，是"距离自由还差多少"的导航系统。

**被动收入 ≥ 月总支出 = 初步自由。** 劳动收入维持跑道，被动收入通往自由。

Freedao 是给独立创业者的财务自由导航器：输入你的支出、收入、时间分配，它告诉你**现在的跑道还能撑多久**、**被动收入走到自由还差多少**、**如果砍掉哪个支出或开一条副业，时间表会怎样变化**。

本地存储，数据不上云。API Key 也从你本地直接发给模型，不经过任何中间服务器。

---

## 下载

👉 **[最新版 macOS 下载](https://github.com/huasan2025/freedao/releases/latest)**

目前只支持 macOS（Intel + Apple Silicon）。Windows / Linux 版后续补。

### 首次打开提示"已损坏"怎么办

因为 Freedao 没有 Apple Developer 签名（$99/年还在权衡），macOS 默认会拦截。两种解法：

**方法 1 · 右键打开（推荐小白）**
Finder 里找到 `Freedao.app` → 按住 `Control` 右键 → 选"打开" → 弹窗里再点"打开"。以后双击正常启动。

**方法 2 · 终端命令（程序员快捷）**
```bash
xattr -cr /Applications/Freedao.app
```

这一行命令的原理是什么？为什么能绕过安全检查？—— 见 [读懂代码的方法 2](https://github.com/huasan2025/freedao/blob/main/docs/xattr-explained.md)。

---

## 核心功能

- **自由倒计时 Runway**：存款 ÷ 月缺口 = 还能撑多少个月
- **自由进度 Freedom Progress**：被动收入 / 月支出，通往自由的百分比
- **支出/收入/时间三面板**：AI 自动分类投资 vs 消费、劳动 vs 被动
- **What-if 模拟器**：滑动"月支出减 X%"、"月收入加 Y 元"、"现金注入 Z"，立刻看到跑道如何变化
- **BYOK AI**：支持 DeepSeek、Gemini、通义千问、火山引擎、任意 OpenAI 兼容接口
- **全本地**：localStorage 存储，没有账号系统，没有云端

---

## 为什么写这个

画伞在做 Freedao 之前连续踩了两年的坑：
- 账户里的钱够花 ≠ 真自由
- 这个月收支平衡 ≠ 下个月也平衡
- 看到别人的"月入十万"很焦虑，但不知道自己离"不用焦虑"差多少

Freedao 把这三件事翻译成一个可以每天看一眼的数字 —— **离自由还差多少**。

它不是给"要早日退休"的人用的。是给**正在独立做事、需要一个导航系统来决定下一步**的人用的。

---

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS v4（静态导出）
- Tauri 2 打包成 macOS 桌面应用
- localStorage 全本地存储，无后端、无数据库
- OpenAI 兼容 API 直连（BYOK）

---

## 从源码构建

```bash
git clone https://github.com/huasan2025/freedao.git
cd freedao
npm install

# Web 版本
npm run dev            # 浏览器访问 localhost:3000

# 桌面版（需要 Rust 工具链）
npm run tauri:dev      # 开发模式
npm run tauri:build    # 产出 .dmg
```

首次 Tauri build 会下载 + 编译一堆 Rust crates，耗时 5-15 分钟。

---

## 路线图

- [x] v0.6.0 Web MVP：Dashboard / Log / Plan / Settings / AI 分类 / Waitlist
- [x] v0.7.0 Tauri macOS 首发
- [ ] Log 页直接编辑/删除记录
- [ ] "月度" vs "单笔" 概念澄清
- [ ] 移动端响应式
- [ ] Windows / Linux Tauri build
- [ ] 付费案例库：省钱库 + 赚钱库（[加入 Waitlist](https://my.feishu.cn/share/base/form/shrcnizYaLm11sTEQg8YoNjjThe)）

---

## License

MIT · 画伞（yangfan）· 2026

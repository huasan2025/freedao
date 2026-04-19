# 为什么 `xattr -cr` 一行就能解开"已损坏"

## 现象

从 GitHub Release 下载 `Freedao.dmg` → 拖到 Applications → 双击 → 弹窗：

> "Freedao.app 已损坏，无法打开。您应该将它移到废纸篓。"

但 app 没坏。这是 macOS 的 **Gatekeeper**（门卫系统）在拦你。

## 原理：Gatekeeper 和"隔离属性"

从 macOS Catalina 起，苹果默认只允许两类 app 运行：

1. 从 **App Store** 下载的
2. 被**有 Apple Developer 账号（$99/年）的开发者签名 + 公证过**的

不属于这两类，Gatekeeper 就拒绝。

**关键机制**：当你**从浏览器下载**任何文件时，macOS 会在文件上打一个隐形标签 `com.apple.quarantine`（中文意思"隔离"）。这个标签存在文件的扩展属性（extended attributes，简称 xattr）里，肉眼看不到。

Gatekeeper 打开文件时先检查这个标签：
- **有标签** → 外部下载 → 检查签名 → 没签名就拦截
- **没标签** → 信任来源（自己编译的、AirDrop 过来的）→ 放行

## `xattr -cr` 做了什么

```bash
xattr -cr /Applications/Freedao.app
```

- `xattr`：macOS 自带命令，操作扩展属性
- `-c`：clear（清除所有扩展属性）
- `-r`：recursive（递归处理 `.app` 里的每个子文件，因为 `.app` 是文件夹）

**效果**：把 `quarantine` 标签抹掉 → Gatekeeper 再看不到隔离标记 → 放行。

## 类比

小区门卫（Gatekeeper）只让两种人进：业主和登记过的访客。
- 下载的 app 入门时被门卫贴了张红色"外来者"贴纸（quarantine）
- 门卫见红贴纸就拦下查证件（签名）
- `xattr -cr` = 撕掉红贴纸
- 门卫再看 = "没贴纸，默认是熟人"→ 放行

## 为什么苹果允许绕过

因为这需要**用户主动执行命令**。苹果假设：能在终端敲这一串命令的人，有能力判断来源是否可信。责任从苹果转移到用户。

**对比**：普通用户右键 → 打开（弹窗里再点"打开"）也能一次性绕过，这是给小白留的口子。`xattr -cr` 是给进阶用户留的口子。

## 安全注意

- **抹标签不会给 app 增加权限**，只是去掉"外部下载"的标记
- 但如果 app 真被替换成恶意程序，Gatekeeper 就兜不住了
- 所以**只对信任来源的 `.app` 执行**（Freedao 源码开源可查，放心）

## 两种解法（README 给用户的）

**方法 1 · 右键打开（小白版）**
Finder 找到 Freedao.app → 按住 `Control` 右键 → 选"打开" → 弹窗里再点"打开"。以后双击正常。

**方法 2 · 终端（程序员版）**
```bash
xattr -cr /Applications/Freedao.app
```

## 更长远的解决

等有足够用户或收入再买 Apple Developer 账号（$99/年）签名 + 公证，下载零阻力。现在不急。

---

想系统理解 Tauri 打包背后的几个决策（签名、域名、API 迁移）？这篇文档在画伞的 Obsidian vault 里：`03-Projects/Freedao/🌟读懂代码的方法2.md`。

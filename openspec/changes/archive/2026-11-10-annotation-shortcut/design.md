# Design

## Context

插件是手写的客户端 bundle，没有 React。应用里已有的快捷键能力由 `@deepseek-ai/dsh-client-shortcuts` 提供，作为客户端 Service 暴露为 `ctx.shortcuts`：命令按 `runtime:platform` 声明默认键位，偏好只保存覆盖（`dsh.keybindings.v1` / `userData/keybindings.json`），速查与录制界面由 `dsh-client-ui-shortcuts` 提供，用户改键不需要插件自带 UI。

命令在 `dispatch` 时的顺序是：取到命令 → `resolve(context)` → 若返回 `pass` 就直接放行（不 `preventDefault`）→ 否则先消费按键再执行 `run()`。这个顺序正好提供了“没开页面就不占用组合”的能力。

## Goals / Non-Goals

**Goals:**

- 一个可改键的默认组合，仅在侧边栏有网页时生效。
- 改键后按钮提示立即反映实际键位。

**Non-Goals:**

- 不自己监听 `keydown`：那会绕过改键、冲突校验、输入法保护与“优先于编辑器/终端”的分发规则。
- 不为 Web 构建声明默认键位：插件的注入路径在 Web 上不可用。
- 不新增设置界面：快捷键设置已由应用提供。

## Decisions

### 1. 用 `ctx.shortcuts.register` 注册，而不是全局 `keydown`

自己监听只能拿到原始按键，拿不到用户改过的键位、冲突检测和输入法保护，也无法与编辑器、终端、内嵌页面正确分层。注册的命令由平台分发：桌面端 macOS / Windows 走原生键盘桥接，Linux 与 Web 走 DOM 适配器。

`ctx.get("shortcuts")` 取不到时（例如某个精简 profile 没挂这个包）静默跳过，按钮照旧可用——快捷键是增强，不是硬依赖。

### 2. 用 `resolve` 返回 `pass` 表达“不归我”

`dispatch` 只有在 `resolve` 不返回 `pass` 时才消费按键。所以“没开页面”这件事必须在 `resolve` 里同步判定：找一个**可见**（`getBoundingClientRect()` 有实际宽高）、已连接、且 `getURL()` 是 http(s) 的 `webview`。没有就返回 `{ status: "pass" }`，组合仍归应用与系统；有就返回 `{ status: "handled", run }`，由 `run` 开或关会话。

`resolve` 里不能启动会话：它只做判定，真正的动作在 `run()`——否则会在消费按键之前就把页面改了。

### 3. 生效区域取 `page` + `editable`

区域只影响非优先平台（Linux / Web）的分发：焦点在输入框里时区域是 `editable`。既然 macOS / Windows 桌面端本来就绕过区域判断、任何焦点下都会触发，把 `editable` 也列进来可以让各平台行为一致：只要开着页面，在输入框里按这个组合意图也是明确的。

模态（`modals: []`）下不认领：速查、设置这类弹窗打开时不希望背后突然进入标注。

### 4. tooltip 读目录快照，不自己记账

`ctx.shortcuts.catalog` 是可见的 observable，行里带着当前生效的 `keys` 与 `aria`。按钮 `paint()` 每次读一次快照，并订阅目录变化重绘；命令没绑定（用户清空）时 tooltip 退回按钮标签、并移除 `aria-keyshortcuts`，不显示一个不存在的键位。

## Risks / Trade-offs

- **`⌘⇧C` 同时是 Chromium 的“检查元素”** → 桌面端由快捷键服务优先接管（它是显式绑定）；如果目标机器上原生菜单也占用了这个组合，用户可在设置里改掉，这正是接入平台快捷键而不是硬编码的原因。
- **判定“可见”用 `getBoundingClientRect()`** → 页面在后台标签页时宽度为 0，会被判为不可见，这是想要的行为；但面板若在做 0 宽动画，极短时间内可能判为不可见，用户再按一次即可。
- **多标签** → 只取第一个可见页面，不尝试猜测焦点属于哪个 webview。

## Migration Plan

纯客户端 bundle 行为变更：`0.10.0` → `0.11.0`，`link:` 依赖，重载生效；回退即回退版本。首次运行没有任何偏好覆盖，默认键位直接生效。

## Open Questions

无。

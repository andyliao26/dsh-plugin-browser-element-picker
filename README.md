# dsh-plugin-browser-element-picker

在 DeepSeek Harness Desktop 的**侧边浏览器**里做 Codex 式页面标注：点选元素 → 卡片里写意见 →（可选）进设计模式记录样式调整 → Enter 把整段标注作为**引用 chip** 填进 Prompts Input（发送时展开成完整标注），⌘/Ctrl+Enter 直接发送。

![流程](docs/flow.svg)

| 评论卡片（Shift 多选 2 个元素） | 设计模式（16 项属性 + 改动描述，可拖动） |
| --- | --- |
| ![标注卡片](docs/annotation-card.png) | ![设计模式](docs/design-mode.png) |

## 交互

准星按钮内嵌在标签页**地址栏那一行**（排在「在系统浏览器打开」之后），尺寸/圆角/悬停底色与前后工具按钮一致。

| 操作 | 结果 |
| --- | --- |
| 点准星 | 进入标注会话，页面出现准星光标与顶部提示条 |
| 点击元素 | 选中它，浮出评论卡片（标签 + 文本预览 + 输入框） |
| **Shift + 点击** | 追加/移除一个元素，卡片上的 chips 同步增减（多处一起标注） |
| 点已选中的元素（不按 Shift） | 重新选择，换成当前这一个 |
| 输入评论 | 直接写，支持中文 IME；`Shift+Enter` 换行 |
| **Enter** | 结束会话，把标注作为**引用 chip** 填入输入框（不发送）；chip 显示「标签 + 你写的评论」，发送时展开全文 |
| **⌘/Ctrl+Enter** | 同上，并**立即发送** |
| 卡片上的滑块按钮 | 进入**设计模式**：回显当前样式，记录调整（不改页面）；已应用的调整会在卡片里逐行列出 |
| 设计模式里 `Enter` | 应用改动，回到卡片 |
| `Esc` | 设计模式 → 放弃改动回到卡片；卡片打开 → 取消选择；都没有 → 退出会话 |

## 设计模式

针对当前选中（chip 高亮）的那个元素，面板打开时读取一次当前 computed 样式作为基线并回显；之后的改动**不会作用到页面**，只记录成「从当前值到目标值」的调整，随提示词交给 Agent：

- 文本颜色 / 背景 / 不透明度
- 字号 / 字重
- 边框圆角 / 边框颜色 / 边框宽度
- 宽度 / 高度
- 内边距（上右下左）/ 外边距（上右下左）
- 布局方向 / 分布 / 对齐 / 间距

数值最多保留一位小数；`transparent` / 半透明颜色按原值回显；当前值不在下拉选项里（如非 flex 元素的 `normal`）时会补成当前选项。清空输入等于撤销该字段的调整；「取消」丢弃本次草稿，「应用」把调整挂到该元素，并在评论卡片里按行列出 `属性: 旧值 → 新值`。面板正文和卡片调整区都可以纵向滚动。注入提示词时只保留选择器、标签/文本与设计调整，不携带计算样式、HTML 或几何信息。

面板顶部可以直接写「描述这些更改…」：它和评论卡片里的评论是同一段要求，双向同步，最终以 `要求：…` 进入提示词——设计模式因此既能调属性，也能用文字补充意图。

面板可以拖动：按住 `<button>` 那一行（右侧四个点）就能把面板挪开，拖动范围限制在视口内；重新打开设计模式会回到默认位置。

改动过的属性行会带一层淡蓝色底，和未改动的行区分开。

单值控件的已知限制：圆角、边框颜色/宽度、间距各只有一个输入框；`from` 记录完整的 computed 简写（如四角不同、四边不同或双值 `gap`），输入框只回显首个数值，应用时按统一值表达。需要逐边调整时请在评论里说明。

## 注入的提示词

单个元素：

```
【页面标注】
页面：订单列表 | http://localhost:5173/orders
1. #app > div.list > button.btn.primary:nth-of-type(2) | <button> 提交订单
设计：
  - width: 91.3px → 466px
  - border-radius: 8px → 12px
要求：背景换成品牌绿
保持选择器语义，说明修改文件。
```

多处标注（Shift 多选）：

```
【页面标注】3 个元素
页面：版本发布 | http://127.0.0.1:5174/layouts/47ca…?tab=config
1. #app > main > h1.title | <h2> [验收] Chat分析 MSDS8页
2. #app > main > header > span:nth-of-type(2) | <span> 修订 2 · 草稿
3. #app > main > header > div.actions > button:nth-of-type(1) | <button> 保存草稿
设计：
  - border-radius: 8px → 12px
  - background-color: #4056ff → #2f4f45
要求：这三个的间距和圆角统一一下，按钮用品牌绿
保持选择器语义，说明修改文件。
```

填入优先走 composer 的 reference chip：输入框里显示 `<button> 背景换成品牌绿` 这样的短标签（标签 + 你写的评论，没有评论时显示 `<tag> 页面标注`），点一下弹出整段标注；发送时由插件注册的 codec 把 chip 展开成完整块，模型收到的内容与下面的示例完全一致。chip 不可用时退回原生 `QuoteNode`（`insertQuote`），再不可用则退化成纯文本追加；三条路径发送的都是同一段文本，不再额外追加「修改要求：」。

> **0.4.0 内部契约变化**：提示词改为紧凑结构，只保留选择器、标签/文本、设计调整与要求；不再注入计算样式、外部 HTML、视口几何和唯一选择器的匹配数（非唯一选择器仍带 `（匹配 N）`）。设计调整嵌到所属元素下，引用 chip、引用块与纯文本兜底输出同一段文本。guest 结果结构不变，不改变安装方式。

> **0.6.0**：输入框里改为短引用 chip（显示 `<tag> 你写的评论`，多选带数量），点 chip 看完整标注；发送时 codec 展开，模型收到的文本与上面示例一致。

## 安装

标准 DSH bundle 包（`dsh.bundle.patch` + `dsh.client`），安装后由 `dsh-client-modules` 挂载浏览器端代码，无需重新构建 DSH。三种方式任选其一。

### 方式一：一条 `dsh` 命令

用 Desktop 自带的 `dsh`（macOS 装到 `/usr/local/bin/dsh`；Desktop 至少打开过一次以初始化 profile），装完重启 Desktop：

```bash
dsh plugin --profile desktop add github:andyliao26/dsh-plugin-browser-element-picker
```

本地开发直接装目录：

```bash
dsh plugin --profile desktop add /path/to/dsh-plugin-browser-element-picker
```

安装成功后，这个 bundle 会自动追加进 `dsh.profile.bundles`，不需要再手动启用或改 profile 文件。

如果看到 `error: profile "desktop" is managed exclusively by the Electron application`，说明用的是 npm 全局安装的 `dsh`；改用 Desktop 自带的那一个，例如：

```bash
/usr/local/bin/dsh plugin --profile desktop add github:andyliao26/dsh-plugin-browser-element-picker
```

### 方式二：一段提示词

把下面这段发给 Desktop 里的 Agent（会请求一次 full access 授权）：

```text
请安装并启用 DSH 插件 dsh-plugin-browser-element-picker，来源：
git+https://github.com/andyliao26/dsh-plugin-browser-element-picker.git

用 plugin_manager：
- 未安装：install_bundle，target 用上面的来源；
- 已安装但未启用：set_bundle，enabled=true；
- 已启用：不要重装。
不要手改 profile 文件，也不要直接跑 pnpm。
完成后报告 bundle 状态和是否需要重启。
```

当前会话没有 `plugin_manager` 时，改用方式一。

### 方式三：Plugins 面板

1. 侧边栏 **Plugins** → **Add plugin** → 箭头 → **Install a third-party plugin**
2. 粘贴本目录的绝对路径（先把仓库 clone 到本地，再粘贴该目录）：
   ```
   /path/to/dsh-plugin-browser-element-picker
   ```
3. **Install**；装完若出现 **立即启用**，点它（第三方安装默认不启用）
4. 打开右侧 **Browser** 载入任意 http(s) 页面，地址栏右侧出现准星按钮

改完代码若界面没变化：切走再切回标签页 → 插件页 Off/On → 最后手段重启 App。

### 安装自检（可选）

在临时 `DSH_HOME` 的测试 profile 里装一遍，不碰日常 profile：

```bash
export DSH_HOME=$(mktemp -d)
dsh --profile picker-check --from-default-profile web --dump-config >/dev/null
dsh plugin --profile picker-check add github:andyliao26/dsh-plugin-browser-element-picker
dsh --profile picker-check --dump-config | grep -A2 'id: browser-element-picker'
```

看到 `id: browser-element-picker` 就说明依赖、bundle 选择和配置组合都生效了；这不等于 Desktop webview 里的交互验收。

## 使用边界

- **仅桌面端生效**。Web 形态的侧边浏览器用 `sandbox` iframe 承载跨域页面，宿主注入不进去；本插件只对 `webview` 生效。
- 只覆盖顶层文档：Iframe 内部、Shadow DOM 内部的元素拾到的会是宿主节点。
- 标注会话期间页面的点击会被拦截（滚动、悬停不受影响），这样点到链接不会跳走。
- 设计模式不修改页面：面板只回显当前样式并记录调整，提示词里是「旧值 → 新值」，实现仍由模型落到源码。
- 提示词只带定位与意图：选择器、标签/文本、设计调整、用户要求；计算样式、HTML 与几何不再注入，需要时在「要求」里补充。
- 一键发送走 `conversation.input.shellFor(binding).submit('queue')`，与输入框自己按下 Enter 是同一条提交事务。

## 原理

| 环节 | 实现 |
| --- | --- |
| 按钮挂载 | `MutationObserver` 扫描 `webview[data-sidebar-browser-frame]`，向上找到「直接子节点含地址输入框」的工具栏行把按钮 `append` 进去；React 重渲染丢掉时下一帧 `sync` 补回。探测失败退回悬浮按钮 |
| 标注会话 | 一次 `webview.executeJavaScript(guestAnnotate(...))` 承载整个会话：shadow DOM 里的评论卡片、设计面板、标注框；会话结束（Enter / ⌘Enter / Esc）才把结果 promise 交回宿主 |
| 元素描述 | 选择器优先 `#id`，否则自底向上拼 `tag.class:nth-of-type(n)` 并用 `querySelectorAll` 验证唯一；同时采集文本、属性、视口/文档坐标、计算样式、outerHTML。提示词只使用选择器、标签/文本与设计 delta，其余字段保留在会话结果中 |
| 设计模式 | 打开时把 `getComputedStyle` 落成字符串基线并回显；改动只进草稿、不写 DOM；「应用」把草稿转成 `{property, from, to}` delta 记进会话结果，卡片按行展示 |
| 注入提示词 | 从 `webview.closest('[data-sidebar-right-session]')`（回退 `ctx.sidebarRight.mounted`）拿 Session；优先 `shell.insertReference(...)` 插入短的 reference chip（codec 在发送时展开整段），失败退回 `insertQuote(block)`，再退回 `requestDraftInitialization(binding, { prompt, whenDraftExists: 'append' })` |
| 直接发送 | 同一 binding 调 `conversation.input.shellFor(binding).submit('queue')`，与 composer 的 Enter 提交共用事务 |

宿主侧 `lib/index.js` 是空 `apply`：它存在的唯一意义是给 `dsh-client-modules` 一个可以挂载浏览器半边的 Loader 行。

## 卸载

Plugins → 找到本 bundle → **Off** 关掉图层，或 **Remove** 卸载；profile 的 `cordis.patch.yml` 与依赖由插件管理器一并恢复。

## 文件结构

```
sidebar-browser-element-picker/
├── package.json          # dsh.bundle.patch + dsh.client 声明
├── cordis.patch.yml      # 一个 Host 行：browser-element-picker
├── lib/
│   ├── index.js          # Host 半边：空 apply
│   └── client.js         # 浏览器半边：工具栏按钮 + 标注会话 + 提示词
├── docs/flow.svg
└── test/                 # 五层离线测试
```

`lib/client.js` 是手写的 DSH 客户端 bundle（`window.__ModuleLoader__.load({ id, factory })`），刻意不引入 React 与任何依赖，因此也不需要仓库的 tsdown 构建链。

## 自检

需要 Node ≥ 22；`guest-annotate` 与 `payload` 两个测试使用本机 Playwright 缓存里的 Chromium headless shell。

```bash
cd dsh-plugins/sidebar-browser-element-picker
node test/bundle-contract.test.mjs   # 模块注册契约、i18n 键位、提示词占位符
node test/toolbar.test.mjs           # 工具栏内嵌、重渲染自愈、引用 chip 与直接发送两条链路
node test/injection.test.mjs         # 悬浮兜底路径、单/多元素块、取消不写入、文本兜底
node test/guest-annotate.test.mjs    # 真实 Chromium：多选、设计模式回显/零写入/from→to/滚动/键盘
node test/payload.test.mjs           # 端到端：真实描述符 + 设计 delta → 真实格式化器，字段缺失/undefined 会当场失败
```

`guest-annotate.test.mjs` 与 `payload.test.mjs` 默认使用
`~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell`，
可用 `PICKER_CHROME=/path/to/chromium` 覆盖。

# Design

## Context

见 `proposal.md - Why`。影响设计的三条既有约束：

- `guestAnnotate` 是序列化源码，通过 `webview.executeJavaScript(script, true)` 注入。该 API 走页面主世界，因此 React 挂在 DOM 节点上的 `__reactFiber$*` / `__reactProps$*` expando 可读——这是整个 React 身份方案的前提。
- guest 必须 ES5、自包含、无 import，任何位置抛错都会让整次标注失败。
- 块里已经有「挂在元素下的子行」语法（`设计：` 及其缩进项），新字段不该发明第二种结构。

## Goals / Non-Goals

**Goals:**

- 块变成「采集事实 + 一条分隔线 + 用户原话」，模型一眼能分出哪句是数据、哪句是诉求。
- 每个目标在可用时附带组件名与源码位置，让模型跳过「反查是哪个组件」这一步。
- 选择器不再被 utility 类名伪装成精确锚点。
- 所有新增信息都可缺失，缺了就整段消失，不出现占位符。

**Non-Goals:**

- 不引入 per-target 评论（已明确排除）。
- 不输出组件祖先链（`App > OrderForm > Toolbar`）。
- 不做 React 生产构建的源码定位：不解析调用栈、不临时替换 React dispatcher、不走 devtools 协议。这些手段侵入页面运行时，与「标注不改页面」的边界冲突。
- 不因为有了源码位置就缩短或改写选择器。

## Decisions

### 1. React 身份作为目标子行，而不是行内追加

块里已有 `设计：` 挂在目标下的先例，`组件：` 复用同一层。行内追加会把握手行拉长到 100 字符以上，多选时尤其难读；子行方案 token 基本持平（一次换行 vs 每行多约 30 字符），但主行形状不变，现有针对主行的 spec 场景与断言全部保持有效。

备选：把组件信息塞进 `<>` 标签（`<Toolbar.Button>` 之类）。否决——会和真实标签名混淆，且模型容易误以为是 DOM 结构。

### 2. 只取最近的函数组件名，不取链

编辑动作的落点是「哪个文件」，不是「在组件树的什么位置」。链的边际收益低于 40 字符的成本。若以后发现定位仍不够，加链是纯增量（多一个字段、多一个键），不影响现有形状。

### 3. fiber 遍历有界、全程 try/catch、失败即 `null`

遍历上限 30 层、最多取 6 个候选名；只接受函数/类组件的 `type.displayName || type.name`；跳过 host（`type` 为字符串）、`Fragment`/`Suspense`/`Provider`/`Consumer`/`StrictMode`/`ForwardRef`/`Memo` 等包装，以及 1-2 字符的压缩名。整段提取包在 try/catch 里，任何异常都退化成「没有 React 信息」。

源码位置沿同一条 `return` 链取第一个可用的 `_debugSource`（同时检查 `_debugOwner._debugSource`），React 19 依次尝试 `_debugSource`、`__source`、`_source`、`debugSource`、`memoizedProps.__source`。

### 4. 源码归一化到 `path:line`

顺序：剥 `webpack-internal:///`、`vite:` 等 scheme；剥开头的 `./`；删 `?t=...` 之类查询串；丢掉列号只留行号。不试图推断仓库根目录——猜错比不猜更糟。Next、Vite、CRA 三条链路都能落到可 grep 的相对路径。

### 5. 组件名与源码绑定输出

只有源码位置、没有组件名时整段省略。原因：组件名是「这是什么」，源码是「在哪」，只有后者时模型不知道这段位置属于谁，反而多一条要忽略的噪声。只有组件名（无源码）时保留，因为 `grep "function Toolbar"` 仍是有效策略。

### 6. utility 类名用精确词表 + 前缀匹配，不用启发式

不检测「class 数量多」「看起来像 Tailwind」这类信号——误判面太大。改为显式清单：无连字符的精确词（`flex`、`grid`、`block`、`hidden`、`relative`、`absolute`、`fixed`、`sticky`、`truncate`、`border`、`shadow`、`rounded`、`italic`、`underline` 等）与必须带连字符的前缀（`p-`、`m-`、`px-`、`w-`、`h-`、`text-`、`font-`、`bg-`、`border-`、`rounded-`、`shadow-`、`gap-`、`items-`、`justify-`、`space-`、`overflow-`、`z-`、`opacity-`、`transition-`、`inset-`、`top-`、`left-`、`translate-`、`duration-`、`min-`、`max-` 等）。带连字符的前缀天然不会误伤 `page-header`（`p-` 后面必须是 `-`，`page-` 不匹配）、`main`（`m-` 不匹配）、`header`（`h-` 不匹配）。

丢的只是类名候选，不是元素；全部候选被丢光时回落到属性锚点或 `tag:nth-of-type` 路径，与「没有可用类名」同一条路径。

备选：把类名整体降为最低优先级（`data-*` > 类名）。否决——`order-card` 这类语义类名比 `button:nth-of-type(3)` 可靠得多，不该被贬。

### 7. `---` 与空行是结构常量，不进字典

`---` 不是文案，语言无关，直接由格式化函数输出；`prompt.comment` 保留键名、只把值改成 `**修改要求:** {comment}`，`{comment}` 占位符不变，`bundle-contract` 的占位符断言因此不用改。`---` 前必须有一个空行：紧贴上一行时 markdown 会把它上一行吃成二级标题，而这段文本进的是用户消息正文、会被渲染。

### 8. 删除 `prompt.headerSingle` / `headerMany` / `footer` / `designFallback`

四个键整体删除，不是留空。留空键会让「块内没有指令」这条要求变成可绕过的——以后有人复用键名就能把文案加回来。

## Risks / Trade-offs

- [`_debugSource` 只在开发构建存在] → 生产页面不会出现 `组件：` 行；README 与使用边界写明，不把它当承诺。
- [React 19 元数据形状仍在变] → 只做尽力而为的多字段探测，任何一步失败都退化为无信息；不作为兼容性承诺。
- [utility 词表误杀语义类（如 `text-title`）] → 清单保持保守、只收录确定是工具类的词；误杀时选择器退回属性/祖先路径，不会产出错误选择器。
- [删掉 `保持选择器语义` 后模型可能重排 DOM] → 接受。需要约束时用户在 `**修改要求:**` 里自己写，这比固定尾句更可控。
- [删掉 `说明修改文件` 后模型可能不报文件] → 同上，接受；`组件：` 行已给出文件，多数情况无需再要求。
- [假 fiber 与真实 React 有差异] → fixture 用 React 18 的形状手写（`type` 为函数、`return` 链、`_debugSource` 带列号），覆盖遍历与归一化逻辑；真实页面另做一次人工验证，不进 CI。
- [guest 体积增加约 60 行] → 保持 ES5、无外部引用；提取失败不影响标注主流程（整段 try/catch）。

## Migration Plan

- `package.json` 版本 `0.7.0` → `0.8.0`。
- guest 结果新增可选 `react` 字段，旧消费方忽略即可；提示词块文本变化对模型可见，属行为变更，README 的两段示例与 `AGENTS.md` 契约段同步更新。
- 回滚：还原四个字典键与格式化函数即回到 0.7.0 的块形状；guest 多出的 `react` 字段不参与旧格式化路径，可单独保留。

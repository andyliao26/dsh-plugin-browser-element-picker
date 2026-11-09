# Tasks

## 1. 选择器：utility 类名过滤

- [x] 1.1 把工作树里已完成的 `data-*` 优先与生成类名过滤改动单独提交，不与本 change 混在一起；验证：`git status --short` 不再列出 `lib/client.js`、`test/fixture.html` 等五个文件
- [x] 1.2 在 `test/fixture.html` 的 `.react-row` 附近加入两组元素：`<div class="flex items-center gap-2">`（纯 utility）与 `<div class="order-card flex p-4">`（语义类混 utility）；验证：Chromium 打开 fixture 后两组元素存在，页面样式不变
- [x] 1.3 在 `lib/client.js` 的 `stableClass()` 中加入 utility 精确词表与带连字符前缀匹配；验证：纯 utility 元素生成的选择器不含 `.flex`、`.items-center`、`.gap-2`，混合元素保留 `.order-card` 且丢掉 `.p-4`
- [x] 1.4 在 `test/guest-annotate.test.mjs` 第 11 节补两个断言（utility-only 回落、语义类存活）；验证：`node test/guest-annotate.test.mjs` 通过

## 2. React 身份提取

- [x] 2.1 在 `test/fixture.html` 的内联脚本里手写一条 fiber 链（`__reactFiber$test`：host fiber → 函数组件 `Toolbar` → `App`，`_debugSource` 带列号且带 `webpack-internal:///./` 前缀）；验证：在 Chromium 里对 `[data-testid="reanalyze"]` 枚举 expando 能取到该键
- [x] 2.2 在 `guestAnnotate` 内新增 ES5 提取函数（有界遍历、包装组件与压缩名过滤、`_debugSource`/`__source` 探测、`path:line` 归一化、整段 try/catch），并在 `describe()` 返回值里加入 `react` 字段；验证：`node test/payload.test.mjs` 通过，且该目标的 `react` 为 `{component:"Toolbar", source:"src/components/Toolbar.tsx:42"}`
- [x] 2.3 补四类断言：有元数据、完全无元数据（`null`）、只有源码没有组件名（`null`）、压缩名被拒；验证：`node test/guest-annotate.test.mjs` 通过
- [x] 2.4 更新 `AGENTS.md` 的 guest 结果契约（新增可选 `react` 字段）与 README 使用边界（React 信息只在开发构建出现）；验证：`grep -n "react" AGENTS.md` 与实现字段一致

## 3. 提示词块重写

- [x] 3.1 重写 `formatAnnotation()`：页面行起手、目标行 + 可选 `组件：` 子行 + `设计：` 子行，评论非空时以空行 + `---` + `**修改要求:** {comment}` 收尾，无评论时块结束在最后一个子行；验证：`test/payload.test.mjs` 打印的块文本与 README 示例逐行一致
- [x] 3.2 调整字典键：删除 `prompt.headerSingle`、`prompt.headerMany`、`prompt.footer`、`prompt.designFallback`；`prompt.comment` 的值改为 `**修改要求:** {comment}`；新增 `prompt.react`、`prompt.reactAt`；验证：`node test/bundle-contract.test.mjs` 的键集、非空与占位符断言通过
- [x] 3.3 更新 `test/payload.test.mjs`、`test/toolbar.test.mjs`、`test/injection.test.mjs` 中对旧块头与 footer 的断言，并补「无评论时无 `---`」「有评论时恰好一个 `**修改要求:**`」；验证：三个套件分别 `node test/<name>.test.mjs` 通过
- [x] 3.4 更新 README 的两段示例与 `AGENTS.md` 的提示词契约段（块形状、四个被删的键、`---` 前必须空行）；验证：README 示例与 `test/payload.test.mjs` 的实际输出逐字一致

## 4. 集成与发布

- [x] 4.1 `package.json` 版本升到 `0.8.0`；验证：`for f in test/*.test.mjs; do node "$f" || break; done` 五套件全绿
- [ ] 4.2 在真实 React 开发页面（Vite 或 Next，存在组件边界）手测一次，确认 `组件：` 行与 `file:line` 可用，同时确认生产构建页面不出现该行；验证：两端页面的标注块分别有/无 `组件：` 行，结果记录在 PR 描述里
- [x] 4.3 `openspec validate annotation-block-and-react-locator --strict`；验证：无 error 与 warning

## Workflow follow-up

- 评审通过后归档本 change（`openspec archive`）。
- 归档后用 verify 流程复核实现与 delta spec 一致。

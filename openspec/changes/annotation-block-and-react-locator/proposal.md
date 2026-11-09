# Proposal

## Why

标注块的两头都是模板文案：开头 `【页面标注】N 个元素`，结尾 `保持选择器语义，说明修改文件。`。中间真正有用的定位信息（页面、选择器、标签/文本、设计增量）和用户自己写的诉求混在同一段素文里，接收的模型分不清哪句是页面事实、哪句是要求。尾部那句还自带一个副作用：它把「说明修改文件」变成固定输出格式，用户不要也得要。

定位侧的问题更硬。选择器是模型唯一的抓手，但在 React 页面上它经常既不准也不指向源码：没有 `data-testid` 的元素会拿一串 CSS Modules 或 utility 类名当锚点（`div.flex.items-center` 匹配几十个元素，看起来精确实际不可定位），而模型即便拿到一个唯一选择器，也仍要在 DOM 里反查是哪个组件、哪个文件——这些信息页面在开发构建里本来就暴露着（React fiber 上有组件名和 `_debugSource`）。

## What Changes

- **BREAKING** 删除块头：不再输出 `【页面标注】` 与 `【页面标注】{count} 个元素`，首行改为 `页面：{title} | {url}`。
- **BREAKING** 删除尾部指令 `保持选择器语义，说明修改文件。`，同时删除「只有设计增量、没有评论」时补的默认要求 `要求：按上述设计调整修改。`。
- 新增 `**修改要求:**` 段：采集内容之后空一行、`---`、再一行 `**修改要求:** {comment}`。评论为空时，`---` 与标签整段都不出现，块结束在最后一个目标的子行上。
- 每个目标行下新增可选子行 `组件：{component} {file}:{line}`；只有组件名时退成 `组件：{component}`；两者都拿不到时整行不出现，不输出「未知」占位。
- 选择器新增 utility 类名黑名单（`flex`、`items-center`、`bg-red-500`、`p-4` 等），命中即丢弃该类名；全部被丢弃时回落到属性锚点或 `tag:nth-of-type` 路径。
- guest 目标对象新增 `react` 字段（`{ component, source }` 或 `null`），`component` 为最近的函数组件名，`source` 为归一化后的 `file:line`。
- i18n：删除 `prompt.headerSingle`、`prompt.headerMany`、`prompt.footer`、`prompt.designFallback`；`prompt.comment` 的值改为 `**修改要求:** {comment}`；新增 `prompt.react`、`prompt.reactAt`。
- 版本 `0.7.0` → `0.8.0`。

## Capabilities

### New Capabilities

- `page-annotation/element-locator`: 选择器如何构造（锚点优先级、生成类名与 utility 类名过滤、祖先锚定、匹配数），以及如何在页面暴露 React 开发元数据时解析组件名与源码位置。此前这套规则散落在实现里，没有任何 spec 归属，prompt 能力只是引用它的输出。

### Modified Capabilities

- `page-annotation/prompt`: 块起手从标题行改为页面行；删除 closing instruction 与 design-only 默认要求；新增 `组件：` 子行与 `**修改要求:**` 段；把「块内不出现对模型的执行指令」写成显式要求。

## Impact

- `lib/client.js`：`formatAnnotation()` 重写行序与尾部；`describe()` 增加 `react` 字段；新增 fiber 提取函数（ES5、自包含、静默降级）；`stableClass()` 增加 utility 黑名单；zh/en 字典增删键。
- 测试：`test/payload.test.mjs` 的尾部锚点断言、`test/toolbar.test.mjs` 与 `test/injection.test.mjs` 的 footer 断言、`test/bundle-contract.test.mjs` 的键集/占位符断言都要改；`test/fixture.html` 需要手写的假 fiber 链（不引入 React）和一组 utility 类名元素；`test/guest-annotate.test.mjs` 增加 React 身份与黑名单断言。
- 文档：`README.md` 两段示例、使用边界（React 信息只在开发构建出现）、`AGENTS.md` 的提示词契约与 guest 结果结构，都要同步。
- 无新增运行时依赖；`guestAnnotate` 仍是序列化源码，必须保持 ES5 与自包含。
- 当前工作区已有一批未提交的选择器改动（`data-*` 属性优先、生成类名过滤），本 change 在其之上追加 utility 过滤，不重复实现。
- 对消费方：guest 结果只新增可选字段，旧消费方读取时忽略即可；提示词块文本变化对模型可见，任何硬编码匹配旧块头/尾句的集成都会失效。

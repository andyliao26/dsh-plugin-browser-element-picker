# Tasks

## 1. 字典与格式化器

- [x] 1.1 重写 `zh`/`en` 的 `prompt.*` 字典：新增 `headerSingle`、`headerMany`、`page`、`target`、`ambiguous`、`designHeader`、`designChange`、`comment`、`designFallback`、`footer`；删除 `selector`、`element`、`geometry`、`styles`、`html`、`designHeaderMany`、`footerSingle`、`footerMany`、`fillSuffix`；验证：`node test/bundle-contract.test.mjs` 的键集与非空断言通过（占位符断言在 2.3 更新）
- [x] 1.2 把 `formatAnnotation()` 改为单一路径：输出页头、`页面：标题 | URL`、编号目标 `selector[（匹配 N）] | <tag> 文本`、`设计：` 及缩进 delta、`要求`、短尾句；验证：`test/injection.test.mjs` 中单目标/多目标/设计三种样例逐行匹配
- [x] 1.3 实现歧义标记规则：仅当 `matches !== 1` 时追加 `（匹配 N）`；验证：`test/injection.test.mjs` 覆盖唯一选择器无标记、匹配 3 时有标记
- [x] 1.4 实现要求和结尾规则：评论非空用 `要求：{comment}`；空评论有 delta 用 `要求：按上述设计调整修改。`；两者皆空省略要求与尾句；验证：`test/injection.test.mjs` 三种分支断言通过
- [x] 1.5 删除纯文本后缀与 `quote` 分支，调用点收敛为 `formatAnnotation(t, result)`；验证：`test/injection.test.mjs` 的引用块与纯文本兜底得到完全相同文本，且都不含 `修改要求：`

## 2. 测试

- [x] 2.1 重写 `test/injection.test.mjs` 的提示词断言：A/B/C 三场景、歧义选择器、无样式/HTML/位置行、空评论、纯文本兜底；验证：该测试通过
- [x] 2.2 更新 `test/toolbar.test.mjs` 与 `test/payload.test.mjs` 的期望文本；验证：两个测试通过
- [x] 2.3 更新 `test/bundle-contract.test.mjs`：校验新占位符（`headerMany.count`、`page.title/url`、`target.index/selector/tag/text`、`ambiguous.matches`、`designChange.property/from/to`、`comment.comment`），并确认已删除的键不再存在；验证：该测试通过

## 3. 文档与版本

- [x] 3.1 更新 `README.md`：单/多/设计三种提示词示例、设计模式小节里关于「样式/HTML 不再注入」的说明、使用边界；验证：示例与 `formatAnnotation()` 实际输出一致
- [x] 3.2 更新 `AGENTS.md` 契约 #3（提示词键位与占位符）与 #4（结果结构、提示词排版、无样式/HTML/几何）；验证：契约描述与代码和测试一致
- [x] 3.3 `package.json` 版本升到 `0.4.0`；验证：`node -e "console.log(require('./package.json').version)"` 输出 `0.4.0`
- [x] 3.4 跑全量测试 `for f in test/*.test.mjs; do node "$f" || break; done` 全部 OK，并在桌面端侧边浏览器人工检查单标注、多标注、纯设计、空评论四种引用块

## Workflow follow-up

- 归档前按项目评审要求确认实现与 spec 一致。
- 归档后验证 `openspec/specs/page-annotation/prompt/spec.md` 已生成，且 `design-intent` 的提示词要求已收窄。

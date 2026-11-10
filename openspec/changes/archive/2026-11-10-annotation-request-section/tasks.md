# Tasks

## 1. 去掉要求段上方的分割线

- [x] 1.1 `formatAnnotation()` 不再输出 `---`，保留空行；验证：`node test/payload.test.mjs` 与 `node test/toolbar.test.mjs` 的精确块文本断言通过。

## 2. 同步断言与文档

- [x] 2.1 三个测试文件里拼接期望文本的位置同步去掉 `---`；验证：`for f in test/*.test.mjs; do node "$f" || break; done` 全量通过。
- [x] 2.2 `README.md` 两处示例去掉该行并补 0.13.0 说明，`AGENTS.md` 的块结构契约同步；验证：文档与实际输出一致。
- [x] 2.3 `package.json` 版本 `0.12.0` → `0.13.0`；验证：全量测试通过。

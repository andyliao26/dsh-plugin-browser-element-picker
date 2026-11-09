# Tasks

## 1. README 安装说明

- [x] 1.1 重写「安装」小节为三选一：`dsh` 命令、给 Agent 的提示词、Plugins 面板；命令用 `github:andyliao26/dsh-plugin-browser-element-picker`，本地开发用绝对路径。验证：`sed -n '/^## 安装/,/^## 使用边界/p' README.md` 能看到三个小标题、两条 `dsh plugin --profile desktop add` 命令，且说明「必须用 Desktop 自带的 dsh」与 npm 全局 `dsh` 的报错原文。
- [x] 1.2 修正 Plugins 面板第 3 步：删掉「bundle 默认启用」，改为「装完若出现『立即启用』就点它」。验证：README 中不再出现「bundle 默认启用」，且出现「立即启用」。
- [x] 1.3 新增可选的「安装自检」片段：临时 `DSH_HOME` + `--from-default-profile web` + `--dump-config | grep -A2 'id: browser-element-picker'`，并声明它不等于 webview 交互验收。验证：README 片段中的命令可在本机原样执行成功。

## 2. 测试 profile 验证

- [x] 2.1 在临时 `DSH_HOME` 建 base 测试 profile，执行 `dsh plugin --profile picker-check add link:<repo>`。验证：`package.json` 的 `dependencies` 含包名、`dsh.profile.bundles` 末尾含包名、`--dump-config` 输出含 `id: browser-element-picker`。
- [x] 2.2 用 `--from-default-profile web` 建第二个测试 profile，重复 2.1。验证：dump 中出现插件行，且 profile 内仍含 `dsh-client-modules`。
- [x] 2.3 用 Desktop 自带 CLI（`/Applications/DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh`）在测试 profile 上重复 2.1。验证：dump 出现 `id: browser-element-picker`，确认 README 里 `dsh` 的指向说明成立。
- [x] 2.4 在测试 profile 上执行 `dsh plugin --profile picker-git add github:andyliao26/dsh-plugin-browser-element-picker`。验证：安装成功且 bundle 自动进入 `dsh.profile.bundles`（证明命令式安装不需要额外 enable 步骤）。
- [x] 2.5 核对提示词与 `plugin_manager` 契约：`install_bundle` 接受绝对目录与 git URL，已安装未启用用 `set_bundle`、`enabled=true`。验证：README 提示词中的 target 形态与工具允许的 spec 形态逐项一致，且未承诺在测试 profile 里无法执行的桌面操作。

## 3. 收尾

- [x] 3.1 运行 `openspec validate install-docs-and-test-profiles --strict`。验证：命令退出码为 0。
- [x] 3.2 按 README 的「方式一」在全新临时 `DSH_HOME` 里完整复跑一次，确认命令可直接复制执行。验证：dump 输出 `id: browser-element-picker`，且未触碰 `~/.dsh`。

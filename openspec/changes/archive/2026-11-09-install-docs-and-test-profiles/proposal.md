# Proposal

## Why

README 的「安装」目前只有一条四步的 Plugins 面板路径。想在终端里装、或想让 Agent 代劳的用户没有可复制的命令和提示词；而且第 3 步写的「bundle 默认启用」与实际行为不符——第三方安装传的是 `enabled: false`，装完要再点「立即启用」。

## What Changes

- **新增方式一：一条 `dsh` 命令**。`dsh plugin --profile desktop add <spec>` 同时完成安装与启用（安装成功后会把新 bundle 追加进 `dsh.profile.bundles`），并写清两个前提：必须用 Desktop 自带的 `dsh`（npm 全局 `dsh` 会报 `profile "desktop" is managed exclusively by the Electron application`），Desktop 至少打开过一次；装完重启 Desktop。
- **新增方式二：一段提示词**。给 Desktop 里的 Agent 一段可直接粘贴的指令，用 `plugin_manager` 的 `install_bundle` / `set_bundle` 分支完成安装或启用，禁止手改 profile 与直接跑 pnpm，并要求回报 bundle 状态与重启需求。
- **保留方式三：Plugins 面板**，把「bundle 默认启用」修正为「装完出现『立即启用』就点它」。
- **新增可选「安装自检」**：在临时 `DSH_HOME` 的测试 profile（`--from-default-profile web`）里装一遍，用 `--dump-config` 断言 `browser-element-picker` 行存在；明确它只验证安装与配置组合，不等于 webview 交互验收。
- 不改代码、不改安装产物、不升版本号。

## Capabilities

### New Capabilities

无。这是纯文档变更：安装方式与验证步骤不改变插件的行为契约，因此 `.openspec.yaml` 标记 `skip_specs: true`，不新增或修改 spec。

### Modified Capabilities

无。

## Impact

- `README.md`：仅「安装」小节（三种方式 + 安装自检），以及其中 Plugins 面板第 3 步的措辞。
- 无 `lib/`、`test/`、`package.json`、`cordis.patch.yml` 改动；无新增依赖。
- 验证只在临时 `DSH_HOME` 的测试 profile 中进行，不写用户日常 profile。

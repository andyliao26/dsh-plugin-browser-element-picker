# Proposal

## Why

标注卡是注入访客页面的 shadow DOM 浮层：`host` 挂在 `<html>` 下、与 `<body>` 平级。页面自己的模态抽屉（Sheet / Dialog）用 `container.contains(target)` 判断「点击或焦点是否还在我里面」，对标注卡恒为 false。因此只要用户标注的对象在抽屉里，就会撞上两种失败：选中后抽屉的焦点守卫把焦点抢回表单（评论框没有光标，继续打字甚至会把字打进页面的输入框），以及点一下评论框就被判定为「点了外面」而收起抽屉——被标注的元素随之卸载，标注变成空壳。

标注本身没错，错在浮层对页面而言永远是外人。这个前提不修，任何带模态层的页面都只能在「丢了焦点」和「丢了抽屉」之间二选一。

## What Changes

- 会话活跃期间，把标注浮层的包含性判定委托给当前选中的元素：`container.contains(host)` 与 `container.contains(activeTarget)` 同值，`closest` 同理。会话结束立刻复原。
- 选中元素后校验焦点是否真的落在评论输入框；未落上时先补一次焦点并复核，仍未落上才显式提示，而不是让按键静默进入页面表单。
- 目标元素在会话完成前从页面移除时，不再静默丢弃：剔除该目标并明确提示，会话保持打开——用户重新选一个、再按一次 Enter 用剩下目标完成，或取消。若因此没有任何目标，会话退回收取态继续等用户操作，任何情况下都不写入。
- 版本 `0.8.0` → `0.9.0`；README 的交互区补一条。

不改的东西：标注块文本、选择器构造、设计模式语义、宿主侧三条注入路径（引用 chip / 引用节点 / 纯文本）都不变；页面事件在选取阶段的吞断行为保持现状；`guest-annotate` 里“已移除目标不返回成功结果”是行为变更，既有那条用例需要同步改期望。

## Capabilities

### New Capabilities

- `page-annotation/overlay-isolation`: 注入式标注浮层如何与宿主页面的模态层共存——包含性判定、焦点归属、会话结束后的完全复原，以及目标被页面移除时的失败语义。

### Modified Capabilities

（无。）`page-annotation/prompt` 与 `page-annotation/design-intent` 的要求都不变：本变更不动输出文本，也不动样式增量的记录方式。

注意 `openspec/specs/page-annotation/prompt/spec.md` 目前仍写着标题行与页尾指令，而代码自 `annotation-block-and-react-locator` 起就不再生成它们——那是那个 change 尚未归档造成的既有漂移，不是本变更的取舍；同步它属于归档前一个 change 的工作，这里不据此恢复已删除的输出。

## Impact

- `lib/client.js` 的 `guestAnnotate()`：包含性委托与复原、选中后的焦点校验、`finish()` 对已卸载目标的显式处理，以及随之新增的提示文案。
- i18n：`zh` / `en` 各新增用户可见文案；同步 `annotateScript()` 的 `texts` 与 `test/cdp.mjs` 的 `GUEST_TEXTS`（四处缺一即渲染成空串）。
- 测试：`test/fixture.html` 增加假抽屉（立即抢焦点、延迟复查、`mousedown` 关闭、以及一个绕过包含性的持续抢焦点版本）与一个无关容器；`test/cdp.mjs` 增加真实鼠标按压与真实逐字符输入两个助手；`test/guest-annotate.test.mjs` 增加包含性、焦点归属、提示、剔除四组断言，并改写既有“detached targets are dropped”用例的期望；`test/injection.test.mjs` 补“会话未完成时不插入不发送”。
- 不涉及宿主 API、依赖、bundle 契约或 `package.json` 的 `files` 白名单。

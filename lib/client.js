window.__ModuleLoader__.load({
	id: "dsh-plugin-browser-element-picker",
	factory: function (require) {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/** Locale namespace owned by this plugin. */
		var NS = "browser-element-picker";

		/** Simplified Chinese copy, guest UI copy and prompt templates. */
		var zh = {
			"button.pick": "标注页面元素",
			"button.cancel": "取消标注（Esc）",
			"toast.injected": "已填入输入框",
			"toast.quoted": "已作为引用填入输入框",
			"toast.sent": "已直接发送",
			"toast.sendFailed": "已填入，但发送失败：{message}",
			"toast.noPage": "请先在侧边浏览器里打开一个 http(s) 网页",
			"toast.unsupported": "当前环境不支持页面标注（仅桌面端侧边浏览器可用）",
			"toast.noSession": "找不到这个标签页所属的会话",
			"toast.busy": "输入框正在提交，请稍后再试",
			"toast.failed": "标注失败：{message}",
			"toast.empty": "没有选中任何元素",
			"guest.hint": "点击选择元素 · Shift 点击可多选 · Enter 填入 · ⌘Enter 直接发送 · Esc 退出",
			"guest.placeholder": "添加评论…",
			"guest.design": "设计模式",
			"guest.designPlaceholder": "描述这些更改…",
			"guest.cancel": "取消",
			"guest.apply": "应用",
			"guest.fill": "填入输入框",
			"guest.fillHint": "填入输入框 · ⌘/Ctrl+Enter 直接发送",
			"guest.close": "关闭",
			"guest.remove": "移除",
			"guest.removedTarget": "目标已从页面移除",
			"guest.focusBlocked": "页面正占用焦点，请点击评论框",
			"shortcut.annotate": "标注页面元素",
			"guest.chipOne": "{tag} 页面标注",
			"guest.chipMany": "{tag} 等 {count} 项 · 页面标注",
			"guest.chipComment": "{tag} {comment}",
			"guest.chipCommentMany": "{tag} 等 {count} 项 · {comment}",
			"guest.label.color": "文本颜色",
			"guest.label.background": "背景",
			"guest.label.opacity": "不透明度",
			"guest.label.fontSize": "字号",
			"guest.label.fontWeight": "字重",
			"guest.label.radius": "边框圆角半径",
			"guest.label.borderColor": "边框颜色",
			"guest.label.borderWidth": "边框宽度",
			"guest.label.width": "宽度",
			"guest.label.height": "高度",
			"guest.label.padding": "内边距",
			"guest.label.margin": "外边距",
			"guest.label.direction": "布局方向",
			"guest.label.justify": "分布",
			"guest.label.align": "对齐",
			"guest.label.gap": "间距",
			"guest.opt.row": "水平",
			"guest.opt.column": "垂直",
			"guest.opt.rowReverse": "水平（反向）",
			"guest.opt.columnReverse": "垂直（反向）",
			"guest.opt.start": "起始",
			"guest.opt.center": "居中",
			"guest.opt.end": "末尾",
			"guest.opt.spaceBetween": "两端对齐",
			"guest.opt.spaceAround": "环绕分布",
			"guest.opt.stretch": "拉伸",
			"prompt.page": "页面：{title} | {url}",
			"prompt.target": "{index}. {selector}{ambiguous} | <{tag}> {text}",
			"prompt.ambiguous": "（匹配 {matches}）",
			"prompt.react": "组件：{component}",
			"prompt.reactAt": "组件：{component} {source}",
			"prompt.designHeader": "设计：",
			"prompt.designChange": "  - {property}: {from} → {to}",
			"prompt.comment": "**修改要求:** {comment}",
			"prompt.emptyText": "（无可见文本）"
		};

		/** English copy, guest UI copy and prompt templates. */
		var en = {
			"button.pick": "Annotate page element",
			"button.cancel": "Cancel annotation (Esc)",
			"toast.injected": "Added to the prompt",
			"toast.quoted": "Added as a reference",
			"toast.sent": "Sent",
			"toast.sendFailed": "Added, but sending failed: {message}",
			"toast.noPage": "Open an http(s) page in the sidebar browser first",
			"toast.unsupported": "Annotation is unavailable here (Desktop sidebar browser only)",
			"toast.noSession": "This browser tab has no Session to fill",
			"toast.busy": "The prompt is being submitted; try again in a moment",
			"toast.failed": "Annotation failed: {message}",
			"toast.empty": "Nothing was selected",
			"guest.hint": "Click to select · Shift-click for more · Enter to fill · ⌘Enter to send · Esc to exit",
			"guest.placeholder": "Add a comment…",
			"guest.design": "Design mode",
			"guest.designPlaceholder": "Describe these changes…",
			"guest.cancel": "Cancel",
			"guest.apply": "Apply",
			"guest.fill": "Fill the prompt",
			"guest.fillHint": "Fill the prompt · ⌘/Ctrl+Enter sends",
			"guest.close": "Close",
			"guest.remove": "Remove",
			"guest.removedTarget": "The target was removed from the page",
			"guest.focusBlocked": "The page is holding focus; click the comment box",
			"shortcut.annotate": "Annotate a page element",
			"guest.chipOne": "{tag} annotation",
			"guest.chipMany": "{tag} +{count} · annotation",
			"guest.chipComment": "{tag} {comment}",
			"guest.chipCommentMany": "{tag} +{count} · {comment}",
			"guest.label.color": "Text color",
			"guest.label.background": "Background",
			"guest.label.opacity": "Opacity",
			"guest.label.fontSize": "Font size",
			"guest.label.fontWeight": "Font weight",
			"guest.label.radius": "Corner radius",
			"guest.label.borderColor": "Border color",
			"guest.label.borderWidth": "Border width",
			"guest.label.width": "Width",
			"guest.label.height": "Height",
			"guest.label.padding": "Padding",
			"guest.label.margin": "Margin",
			"guest.label.direction": "Direction",
			"guest.label.justify": "Distribute",
			"guest.label.align": "Align",
			"guest.label.gap": "Gap",
			"guest.opt.row": "Row",
			"guest.opt.column": "Column",
			"guest.opt.rowReverse": "Row reverse",
			"guest.opt.columnReverse": "Column reverse",
			"guest.opt.start": "Start",
			"guest.opt.center": "Center",
			"guest.opt.end": "End",
			"guest.opt.spaceBetween": "Space between",
			"guest.opt.spaceAround": "Space around",
			"guest.opt.stretch": "Stretch",
			"prompt.page": "Page: {title} | {url}",
			"prompt.target": "{index}. {selector}{ambiguous} | <{tag}> {text}",
			"prompt.ambiguous": " (matches {matches})",
			"prompt.react": "Component: {component}",
			"prompt.reactAt": "Component: {component} {source}",
			"prompt.designHeader": "Design:",
			"prompt.designChange": "  - {property}: {from} → {to}",
			"prompt.comment": "**Request:** {comment}",
			"prompt.emptyText": "(no visible text)"
		};

		/**
		 * Runs inside the visited page through `webview.executeJavaScript`.
		 * One annotation session: select one or more elements, type a comment,
		 * optionally record design adjustments, then hand the batch back.
		 *
		 * Enter (or the check button) resolves with `submit: false`, meaning "fill
		 * the prompt input"; Cmd/Ctrl+Enter (or the send button) resolves with
		 * `submit: true`, meaning "fill and send". Esc walks back one step and then
		 * ends the session with `{ ok: false, reason: 'cancel' }`.
		 *
		 * Self-contained by design: the embedder ships this function's source text.
		 * @param {{ texts?: object }} options - localized UI copy.
		 * @returns {Promise<object>} session result.
		 */
		function guestAnnotate(options) {
			var STATE_KEY = "__dshAnnotationState";
			var previous = window[STATE_KEY];
			if (previous && typeof previous.cancel === "function") {
				try {
					previous.cancel();
				} catch (error) {
					void error;
				}
			}
			var texts = (options && options.texts) || {};
			var labels = texts.labels || {};
			var nativeContains = Node.prototype.contains;
			var nativeClosest = Element.prototype.closest;
			var nativeComposedPath = Event.prototype.composedPath;
			var MAX_TEXT = 180;
			var MAX_HTML = 600;
			var MAX_CHIP = 26;
			var FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC',sans-serif";
			var MONO = "ui-monospace,SFMono-Regular,Menlo,monospace";

			return new Promise(function (resolve) {
				var settled = false;
				var targets = [];
				var active = 0;
				var comment = "";
				var designs = [];
				var baselines = [];
				var cardTarget = null;
				var designing = -1;
				var designDraft = null;
				var baseline = null;
				var cursorLock = null;
				var mode = "pick";
				var panelPinned = false;
				var panelDrag = null;

				var BTN = "appearance:none;border:0;background:transparent;color:#cfcfd6;height:26px;min-width:26px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0 6px;font:inherit;flex:none;";
				var BTN_PRIMARY = BTN + "background:#4f8cff;color:#ffffff;font-weight:600;";
				var BTN_GHOST = BTN + "border:1px solid rgba(255,255,255,0.16);";
				var INPUT = "box-sizing:border-box;width:100%;height:26px;border-radius:7px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.06);color:#f4f4f6;font:inherit;padding:0 8px;";
				var CARD = "position:fixed;display:none;pointer-events:auto;box-sizing:border-box;width:360px;max-width:calc(100vw - 20px);background:#1b1b1e;color:#f4f4f6;border:1px solid rgba(255,255,255,0.14);border-radius:14px;box-shadow:0 18px 46px rgba(0,0,0,0.42);font:13px/1.5 " + FONT + ";overflow:hidden;z-index:2147483647;";
				var PANEL = "position:fixed;display:none;pointer-events:auto;box-sizing:border-box;width:360px;max-width:calc(100vw - 20px);height:min(calc(100vh - 24px),360px);overflow:hidden;flex-direction:column;background:#1b1b1e;color:#f4f4f6;border:1px solid rgba(255,255,255,0.14);border-radius:14px;box-shadow:0 18px 46px rgba(0,0,0,0.42);font:12px/1.5 " + FONT + ";z-index:2147483647;";
				var HINT = "position:fixed;top:10px;left:50%;transform:translateX(-50%);pointer-events:none;background:rgba(17,18,24,0.92);color:#e9e9ee;font:12px/1.6 " + FONT + ";padding:5px 10px;border-radius:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:90vw;z-index:2147483647;box-shadow:0 4px 16px rgba(0,0,0,0.3);";
				var SWATCH = "box-sizing:border-box;width:52px;height:26px;padding:2px;border-radius:7px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.06);cursor:pointer;flex:none;";

				function node(tag, css, text) {
					var element = document.createElement(tag);
					if (css) element.style.cssText = css;
					if (text !== undefined) element.textContent = text;
					return element;
				}

				var host = node("div", "all:initial!important;position:fixed!important;top:0!important;left:0!important;width:0!important;height:0!important;z-index:2147483647!important;pointer-events:none!important;");
				host.setAttribute("data-dsh-annotation", "");
				var shadow = host.attachShadow({ mode: "open" });
				var box = node("div", "position:fixed;display:none;pointer-events:none;box-sizing:border-box;border:2px solid #4f8cff;background:rgba(79,140,255,0.12);border-radius:3px;z-index:2147483647;");
				var label = node("div", "position:fixed;display:none;pointer-events:none;box-sizing:border-box;background:#111318;color:#ffffff;font:11px/1.6 " + MONO + ";padding:1px 6px;border-radius:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:2147483647;box-shadow:0 2px 8px rgba(0,0,0,0.28);");
				var marks = node("div", "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2147483646;");
				var card = node("div", CARD);
				card.setAttribute("data-role", "card");
				var panel = node("div", PANEL);
				panel.setAttribute("data-role", "design-panel");
				var hint = node("div", HINT, texts.hint || "");
				var notice = node("div", "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);display:none;pointer-events:none;box-sizing:border-box;max-width:90vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;background:rgba(17,18,24,0.94);color:#e9e9ee;font:12px/1.6 " + FONT + ";padding:6px 12px;border-radius:9px;box-shadow:0 6px 20px rgba(0,0,0,0.36);z-index:2147483647;");
				notice.setAttribute("data-role", "notice");
				var scrollStyle = document.createElement("style");
				scrollStyle.textContent = "::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.28);border-radius:4px}::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.42)}";
				shadow.append(scrollStyle, box, label, marks, card, panel, hint, notice);
				document.documentElement.appendChild(host);

				// ---------- card ----------
				var cardHead = node("div", "display:flex;align-items:flex-start;gap:6px;padding:10px 10px 4px;");
				var chips = node("div", "display:flex;flex-wrap:wrap;align-items:center;gap:4px;flex:1 1 auto;min-width:0;");
				var designBtn = node("button", BTN, "");
				designBtn.type = "button";
				designBtn.innerHTML = "<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' aria-hidden='true'><path d='M4 8h9M19 8h1M4 16h4M14 16h6'/><circle cx='16' cy='8' r='2.2'/><circle cx='11' cy='16' r='2.2'/></svg>";
				designBtn.setAttribute("data-role", "design");
				designBtn.title = texts.design || "";
				designBtn.setAttribute("aria-label", texts.design || "");
				var closeBtn = node("button", BTN, "×");
				closeBtn.type = "button";
				closeBtn.setAttribute("data-role", "close");
				closeBtn.title = texts.close || "";
				closeBtn.setAttribute("aria-label", texts.close || "");
				cardHead.append(chips, designBtn, closeBtn);

				var cardDeltas = node("div", "display:none;max-height:72px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.28) transparent;padding:0 12px 4px;");
				cardDeltas.setAttribute("data-role", "deltas");

				var textarea = node("textarea");
				textarea.setAttribute("data-role", "comment");
				textarea.style.cssText = "display:block;box-sizing:border-box;flex:1 1 auto;min-width:0;height:44px;max-height:160px;resize:none;border:0;outline:0;background:transparent;color:#f4f4f6;font:13px/1.5 " + FONT + ";padding:2px 0 6px;";
				textarea.placeholder = texts.placeholder || "";
				textarea.rows = 1;

				var cardRow = node("div", "display:flex;align-items:flex-end;gap:6px;padding:0 10px 10px;");
				var fillBtn = node("button", BTN_PRIMARY, "✓");
				fillBtn.type = "button";
				fillBtn.setAttribute("data-role", "fill");
				fillBtn.title = texts.fillHint || texts.fill || "";
				fillBtn.setAttribute("aria-label", texts.fill || "");
				cardRow.append(textarea, fillBtn);
				card.append(cardHead, cardDeltas, cardRow);

				// ---------- design panel ----------
				var panelNote = node("textarea", "display:block;box-sizing:border-box;width:100%;height:32px;flex:none;resize:none;border:0;border-bottom:1px solid rgba(255,255,255,0.1);outline:0;background:transparent;color:#f4f4f6;font:12px/1.5 " + FONT + ";padding:6px 10px;");
				panelNote.setAttribute("data-role", "design-comment");
				panelNote.placeholder = texts.designPlaceholder || texts.placeholder || "";
				panelNote.rows = 1;
				panelNote.addEventListener("input", function () {
					comment = panelNote.value;
					textarea.value = comment;
				});
				var panelHead = node("div", "display:flex;align-items:center;justify-content:space-between;gap:6px;padding:7px 12px;margin:0;background:rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.05);flex:none;cursor:grab;user-select:none;");
				panelHead.setAttribute("data-role", "design-drag");
				var panelBadge = node("span", "display:inline-flex;align-items:center;gap:6px;min-width:0;color:#9ec1ff;font:11px/1.4 " + MONO + ";background:rgba(79,140,255,0.16);border-radius:6px;padding:2px 6px;");
				var panelGrip = node("span", "display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;color:#8b8b93;flex:none;");
				panelGrip.innerHTML = "<svg width='10' height='10' viewBox='0 0 10 10' fill='currentColor' aria-hidden='true'><circle cx='3' cy='3' r='1.1'/><circle cx='7' cy='3' r='1.1'/><circle cx='3' cy='7' r='1.1'/><circle cx='7' cy='7' r='1.1'/></svg>";
				panelHead.append(panelBadge, panelGrip);
				var panelBody = node("div", "padding:1px 10px 4px;overflow-y:auto;flex:1 1 auto;min-height:0;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.28) transparent;scrollbar-gutter:stable;overscroll-behavior:contain;");
				panelBody.setAttribute("data-role", "design-body");
				var panelFoot = node("div", "display:flex;align-items:center;justify-content:flex-end;gap:6px;padding:6px 10px 8px;flex:none;border-top:1px solid rgba(255,255,255,0.08);");
				var cancelBtn = node("button", BTN_GHOST, texts.cancel || "");
				cancelBtn.type = "button";
				cancelBtn.setAttribute("data-role", "design-cancel");
				var applyBtn = node("button", BTN_PRIMARY, texts.apply || "");
				applyBtn.type = "button";
				applyBtn.setAttribute("data-role", "design-apply");
				panelFoot.append(cancelBtn, applyBtn);
				var panelFade = node("div", "flex:none;height:12px;margin-top:-12px;pointer-events:none;background:linear-gradient(to top,#1b1b1e,rgba(27,27,30,0));");
				panel.append(panelNote, panelHead, panelBody, panelFade, panelFoot);

				function movePanel(event) {
					if (panelDrag === null) return;
					var maxLeft = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
					var maxTop = Math.max(8, window.innerHeight - panel.offsetHeight - 8);
					var left = Math.max(8, Math.min(maxLeft, panelDrag.left + event.clientX - panelDrag.x));
					var top = Math.max(8, Math.min(maxTop, panelDrag.top + event.clientY - panelDrag.y));
					panelPinned = true;
					panel.style.left = Math.round(left) + "px";
					panel.style.top = Math.round(top) + "px";
				}

				function stopPanelDrag() {
					if (panelDrag === null) return;
					panelDrag = null;
					panelHead.style.cursor = "";
					panelHead.removeEventListener("pointermove", movePanel);
					panelHead.removeEventListener("pointerup", stopPanelDrag);
					panelHead.removeEventListener("pointercancel", stopPanelDrag);
				}

				panelHead.addEventListener("pointerdown", function (event) {
					if (event.button !== 0) return;
					var rect = panel.getBoundingClientRect();
					panelDrag = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
					panelHead.style.cursor = "grabbing";
					try {
						panelHead.setPointerCapture(event.pointerId);
					} catch (error) {
						void error;
					}
					panelHead.addEventListener("pointermove", movePanel);
					panelHead.addEventListener("pointerup", stopPanelDrag);
					panelHead.addEventListener("pointercancel", stopPanelDrag);
					event.preventDefault();
					event.stopPropagation();
				});

				// ---------- geometry helpers ----------
				function cssEscape(value) {
					if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
					return String(value).replace(/[^\w-]/g, "\\$&");
				}

				/** Authoring attributes that survive React re-renders and CSS-module hashing. */
				var SELECTOR_ATTRS = ["data-testid", "data-test", "data-test-id", "data-cy", "data-qa", "data-automation-id", "name", "aria-label", "alt", "placeholder", "title"];

				/** Utility-framework names that repeat across the page and never locate one element. */
				var UTILITY_CLASSES = ["flex", "block", "inline", "grid", "hidden", "contents", "static", "fixed", "absolute", "relative", "sticky", "visible", "invisible", "uppercase", "lowercase", "capitalize", "italic", "underline", "truncate", "antialiased", "border", "rounded", "shadow", "outline", "ring", "transform", "transition", "isolate", "grow", "shrink", "resize"];

				/** Utility prefixes; the trailing hyphen keeps "page-header" away from "p-". */
				var UTILITY_PREFIXES = ["p-", "px-", "py-", "pt-", "pb-", "pl-", "pr-", "m-", "mx-", "my-", "mt-", "mb-", "ml-", "mr-", "w-", "h-", "min-w-", "min-h-", "max-w-", "max-h-", "size-", "text-", "font-", "leading-", "tracking-", "bg-", "border-", "rounded-", "shadow-", "ring-", "outline-", "divide-", "gap-", "space-", "items-", "justify-", "self-", "place-", "overflow-", "z-", "opacity-", "transition-", "duration-", "ease-", "delay-", "inset-", "translate-", "scale-", "rotate-", "skew-", "origin-", "cursor-", "pointer-events-", "object-", "aspect-", "grid-", "col-", "flex-", "basis-", "fill-", "stroke-", "decoration-", "whitespace-", "break-", "backdrop-", "blur-", "brightness-", "contrast-", "grayscale-", "invert-", "saturate-", "sepia-", "will-change-", "mix-blend-", "bg-blend-", "sr-"];

				function utilityClass(name) {
					var lower = name.toLowerCase();
					if (UTILITY_CLASSES.indexOf(lower) >= 0) return true;
					for (var index = 0; index < UTILITY_PREFIXES.length; index += 1) {
						if (lower.indexOf(UTILITY_PREFIXES[index]) === 0) return true;
					}
					return false;
				}

				/** A class worth keeping: human-authored, not a generated hash or a utility. */
				function stableClass(name) {
					if (!/^[A-Za-z_][\w-]*$/.test(name)) return false;
					if (name.length > 30) return false;
					if (/^(css|sc|jsx|svelte|emotion|styled)-/i.test(name)) return false;
					if (utilityClass(name)) return false;
					var tail = name.slice(-8);
					if (/__/.test(tail) && /[0-9]/.test(tail)) return false;
					if (/_/.test(tail) && /[0-9]/.test(tail) && /[A-Za-z]/.test(tail)) return false;
					if (/[0-9][0-9][0-9][0-9]/.test(name)) return false;
					return true;
				}

				/** First stable attribute that can be written as a simple quoted selector. */
				function attributeSelector(element) {
					for (var index = 0; index < SELECTOR_ATTRS.length; index += 1) {
						var value = element.getAttribute(SELECTOR_ATTRS[index]);
						if (value === null) continue;
						value = String(value).trim();
						if (value === "" || value.length > 80 || value.indexOf("\"") >= 0 || value.indexOf("\\") >= 0) continue;
						return {
							name: SELECTOR_ATTRS[index],
							value: value,
							part: element.tagName.toLowerCase() + "[" + SELECTOR_ATTRS[index] + "=\"" + value + "\"]"
						};
					}
					return null;
				}

				function selectorFor(element) {
					var parts = [];
					var cursor = element;
					var guard = 0;
					while (cursor && cursor.nodeType === 1 && guard < 12) {
						guard += 1;
						var id = cursor.getAttribute("id");
						if (id && /^[A-Za-z][\w:.\-]*$/.test(id) && document.querySelectorAll("#" + cssEscape(id)).length === 1) {
							parts.unshift("#" + id);
							break;
						}
						var attribute = attributeSelector(cursor);
						var part;
						if (attribute !== null) {
							part = attribute.part;
						} else {
							part = cursor.tagName.toLowerCase();
							var classes = Array.prototype.slice.call(cursor.classList, 0, 2).filter(stableClass);
							if (classes.length > 0) part += "." + classes.join(".");
						}
						var parent = cursor.parentElement;
						if (parent !== null) {
							var siblings = Array.prototype.filter.call(parent.children, function (child) {
								return child.tagName === cursor.tagName;
							});
							var ambiguous = siblings.length > 1;
							if (ambiguous && attribute !== null) {
								ambiguous = siblings.filter(function (child) {
									return child.getAttribute(attribute.name) === attribute.value;
								}).length > 1;
							}
							if (ambiguous) part += ":nth-of-type(" + (siblings.indexOf(cursor) + 1) + ")";
						}
						parts.unshift(part);
						if ((parts.length > 1 || attribute !== null)) {
							try {
								if (document.querySelectorAll(parts.join(" > ")).length === 1) break;
							} catch (error) {
								void error;
							}
						}
						cursor = parent;
					}
					return parts.join(" > ");
				}

				/** React wrapper components that name the framework, not a user component. */
				var NON_COMPONENTS = ["Fragment", "Suspense", "SuspenseList", "StrictMode", "Profiler", "Provider", "Consumer", "ForwardRef", "Memo"];

				/** The fiber React stashed on this node, if any. */
				function reactFiberOf(element) {
					var keys = Object.keys(element);
					for (var index = 0; index < keys.length; index += 1) {
						if (keys[index].indexOf("__reactFiber$") === 0 || keys[index].indexOf("__reactInternalInstance$") === 0) {
							return element[keys[index]];
						}
					}
					return null;
				}

				/** Component name a fiber would render as, or "" for host nodes and wrappers. */
				function fiberComponentName(fiber) {
					var type = fiber.type;
					if (typeof type === "function") return type.displayName || type.name || "";
					if (type && typeof type === "object") {
						var inner = type.type || type.render || null;
						if (typeof inner === "function") return inner.displayName || inner.name || "";
					}
					return "";
				}

				/** Drop framework names and one or two character minified identifiers. */
				function usableComponentName(name) {
					if (name === "" || name.length < 3) return false;
					return NON_COMPONENTS.indexOf(name) < 0;
				}

				/** Bundler file name normalized to `path:line`. */
				function normalizedSource(fileName, lineNumber) {
					var path = String(fileName);
					path = path.replace(/^(webpack-internal|webpack|vite):\/\/+/, "");
					path = path.replace(/^https?:\/\/[^/]+\//, "");
					path = path.replace(/^file:\/\/+/, "");
					path = path.replace(/\?.*$/, "");
					path = path.replace(/^\.\//, "");
					// Dev servers hand back absolute paths; keep the source-relative tail.
					path = path.replace(/^.*\/src\//, "src/");
					return lineNumber ? path + ":" + lineNumber : path;
				}

				/**
				 * First component source file named by a stack frame. Stack coordinates are
				 * post-transform, so the line would point into the module, not the source.
				 */
				function stackSource(stack) {
					if (!stack) return "";
					var lines = String(stack).split("\n");
					for (var index = 0; index < lines.length; index += 1) {
						var match = lines[index].match(/((?:[A-Za-z][A-Za-z0-9+.\-]*:\/\/)?[^\s()]+\.(?:jsx|tsx|vue|svelte))(?=[:?)\s]|$)/);
						if (match === null) continue;
						var file = match[1];
						if (file.indexOf("node_modules") >= 0) continue;
						if (file.indexOf("react-dom") >= 0 || file.indexOf("jsx-dev-runtime") >= 0) continue;
						return normalizedSource(file);
					}
					return "";
				}

				/** Nearest source location on the chain, including the React 19 stack shape. */
				function fiberSource(fiber) {
					var cursor = fiber;
					var guard = 0;
					while (cursor && guard < 30) {
						guard += 1;
						var found = cursor._debugSource || cursor.__source || cursor._source || cursor.debugSource;
						if (!found && cursor.memoizedProps) found = cursor.memoizedProps.__source;
						if (found && found.fileName) return normalizedSource(found.fileName, found.lineNumber);
						cursor = cursor.return;
					}
					cursor = fiber;
					guard = 0;
					while (cursor && guard < 30) {
						guard += 1;
						var debugStack = cursor._debugStack;
						var text = typeof debugStack === "string" ? debugStack : debugStack && debugStack.stack;
						var fromStack = stackSource(text);
						if (fromStack !== "") return fromStack;
						cursor = cursor.return;
					}
					return "";
				}

				/** React identity of a picked element, or null when the page exposes none. */
				function reactIdentity(element) {
					try {
						var fiber = reactFiberOf(element);
						if (fiber === null) return null;
						var component = "";
						var cursor = fiber;
						var guard = 0;
						while (cursor && guard < 30) {
							guard += 1;
							var name = fiberComponentName(cursor);
							if (usableComponentName(name)) {
								component = name;
								break;
							}
							cursor = cursor.return;
						}
						if (component === "") return null;
						return { component: component, source: fiberSource(fiber) };
					} catch (error) {
						void error;
						return null;
					}
				}

				var STYLE_KEYS = ["display", "position", "color", "background-color", "background-image", "border", "border-radius", "box-shadow", "font-family", "font-size", "font-weight", "line-height", "letter-spacing", "padding", "margin", "opacity", "z-index", "flex-direction", "align-items", "justify-content", "gap", "text-align", "transform", "overflow"];
				var ATTRIBUTES = ["id", "class", "role", "aria-label", "name", "type", "placeholder", "value", "href", "src", "alt", "title", "data-testid", "for"];
				var IGNORED_VALUES = ["none", "auto", "normal", "0px", "rgba(0, 0, 0, 0)", "visible", "static", "baseline", "0s"];

				function displayText(element) {
					var raw = element.tagName === "INPUT" || element.tagName === "TEXTAREA" ? element.value : element.innerText || element.textContent || "";
					var text = String(raw).replace(/\s+/g, " ").trim();
					if (text === "") return texts.empty || "";
					return text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + "…" : text;
				}

				function describe(element) {
					var rect = element.getBoundingClientRect();
					var view = window.getComputedStyle(element);
					var styles = [];
					for (var index = 0; index < STYLE_KEYS.length; index += 1) {
						var key = STYLE_KEYS[index];
						var value = view.getPropertyValue(key);
						if (!value || IGNORED_VALUES.indexOf(value) >= 0) continue;
						styles.push(key + ": " + value);
					}
					var attrs = {};
					for (var attrIndex = 0; attrIndex < ATTRIBUTES.length; attrIndex += 1) {
						var name = ATTRIBUTES[attrIndex];
						var attrValue = element.getAttribute(name);
						if (attrValue === null || attrValue === "") continue;
						attrs[name] = attrValue.length > 200 ? attrValue.slice(0, 200) + "…" : attrValue;
					}
					var html = String(element.outerHTML || "").replace(/\s+/g, " ").trim();
					if (html.length > MAX_HTML) html = html.slice(0, MAX_HTML) + "…";
					var selector = selectorFor(element);
					var matches = 0;
					try {
						matches = document.querySelectorAll(selector).length;
					} catch (error) {
						void error;
					}
					return {
						tag: element.tagName.toLowerCase(),
						selector: selector,
						matches: matches,
						react: reactIdentity(element),
						text: displayText(element),
						html: html,
						attrs: attrs,
						styles: styles,
						rect: {
							x: Math.round(rect.left),
							y: Math.round(rect.top),
							width: Math.round(rect.width),
							height: Math.round(rect.height)
						},
						docRect: {
							x: Math.round(rect.left + window.scrollX),
							y: Math.round(rect.top + window.scrollY)
						}
					};
				}

				function shortLabel(element) {
					var name = element.tagName.toLowerCase();
					if (element.id) return name + "#" + element.id;
					var className = Array.prototype.slice.call(element.classList, 0, 2).join(".");
					return className === "" ? name : name + "." + className;
				}

				function targetAt(x, y) {
					var element = document.elementFromPoint(x, y);
					if (element === null || element === host) return null;
					if (element.nodeType !== 1) return null;
					return element;
				}

				function isOurs(event) {
					if (typeof event.composedPath !== "function") return false;
					return event.composedPath().indexOf(host) >= 0;
				}

				function swallow(event) {
					event.preventDefault();
					event.stopPropagation();
					if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
				}

				// ---------- overlay identity ----------
				/** The element the overlay speaks for; null while picking or after it left the page. */
				function delegatedTarget() {
					var target = targets[active];
					return target && target.isConnected ? target : null;
				}

				/** A page container asking about this overlay gets the answer for the target. */
				function patchedContains(other) {
					var target = other === host ? delegatedTarget() : null;
					return nativeContains.call(this, target === null ? other : target);
				}

				function patchedClosest(selector) {
					var target = this === host ? delegatedTarget() : null;
					return nativeClosest.call(target === null ? this : target, selector);
				}

				/**
				 * A path through the overlay continues into the ancestors of the target,
				 * so a page checking composedPath sees the same containers it would see
				 * for a click on that target.
				 */
				function patchedComposedPath() {
					var path = nativeComposedPath.call(this);
					if (path.indexOf(host) < 0) return path;
					var target = delegatedTarget();
					if (target === null) return path;
					var chain = [];
					var node = target;
					while (node !== null && node !== document && chain.length < 64) {
						if (path.indexOf(node) < 0) chain.push(node);
						node = node.parentNode;
					}
					if (chain.length === 0) return path;
					var position = path.indexOf(host) + 1;
					var merged = path.slice(0, position);
					var index = 0;
					for (index = 0; index < chain.length; index += 1) merged.push(chain[index]);
					for (index = position; index < path.length; index += 1) merged.push(path[index]);
					return merged;
				}

				function installDelegation() {
					Node.prototype.contains = patchedContains;
					Element.prototype.closest = patchedClosest;
					if (typeof nativeComposedPath === "function") Event.prototype.composedPath = patchedComposedPath;
				}

				function uninstallDelegation() {
					if (Node.prototype.contains === patchedContains) Node.prototype.contains = nativeContains;
					if (Element.prototype.closest === patchedClosest) Element.prototype.closest = nativeClosest;
					if (Event.prototype.composedPath === patchedComposedPath) Event.prototype.composedPath = nativeComposedPath;
				}

				/** Events raised inside the overlay belong to the overlay, not to the page. */
				function stopAtBoundary(event) {
					event.stopPropagation();
				}

				var BOUNDARY_EVENTS = ["pointerdown", "pointerup", "mousedown", "mouseup", "click", "dblclick", "auxclick", "contextmenu", "keydown", "keyup", "focusin", "focusout"];
				for (var boundaryIndex = 0; boundaryIndex < BOUNDARY_EVENTS.length; boundaryIndex += 1) {
					shadow.addEventListener(BOUNDARY_EVENTS[boundaryIndex], stopAtBoundary);
				}

				// ---------- focus + notices ----------
				var noticeTimer = null;
				var focusRetry = null;
				var focusSettle = null;

				function hideNotice() {
					if (noticeTimer !== null) {
						window.clearTimeout(noticeTimer);
						noticeTimer = null;
					}
					notice.style.display = "none";
				}

				function notify(text) {
					if (!text) return;
					hideNotice();
					notice.textContent = text;
					notice.style.display = "block";
					noticeTimer = window.setTimeout(function () {
						noticeTimer = null;
						notice.style.display = "none";
					}, 2400);
				}

				function commentFocused() {
					return shadow.activeElement === textarea;
				}

				function clearFocusTimers() {
					if (focusRetry !== null) {
						window.cancelAnimationFrame(focusRetry);
						focusRetry = null;
					}
					if (focusSettle !== null) {
						window.clearTimeout(focusSettle);
						focusSettle = null;
					}
				}

				/** Put the caret in the comment field and keep it there across a page focus guard. */
				function focusComment() {
					if (settled || mode !== "edit") return;
					clearFocusTimers();
					textarea.focus();
					if (!commentFocused()) {
						focusRetry = window.requestAnimationFrame(function () {
							focusRetry = null;
							if (settled || mode !== "edit") return;
							textarea.focus();
						});
					}
					focusSettle = window.setTimeout(function () {
						focusSettle = null;
						if (settled || mode !== "edit" || commentFocused()) return;
						textarea.focus();
						focusSettle = window.setTimeout(function () {
							focusSettle = null;
							if (settled || mode !== "edit" || commentFocused()) return;
							notify(texts.focusBlocked);
						}, 120);
					}, 100);
				}

				// ---------- rendering ----------
				var markNodes = [];

				function renderMarks() {
					for (var index = 0; index < markNodes.length; index += 1) {
						markNodes[index].box.remove();
						markNodes[index].badge.remove();
					}
					markNodes = [];
					for (var targetIndex = 0; targetIndex < targets.length; targetIndex += 1) {
						var frame = node("div", "position:fixed;display:block;pointer-events:none;box-sizing:border-box;border:2px solid rgba(79,140,255,0.95);background:rgba(79,140,255,0.10);border-radius:3px;");
						frame.setAttribute("data-mark", "box");
						if (targetIndex !== active) frame.style.borderColor = "rgba(79,140,255,0.45)";
						var badge = node("div", "position:fixed;pointer-events:none;box-sizing:border-box;min-width:16px;height:16px;padding:0 4px;border-radius:8px;background:#4f8cff;color:#ffffff;font:600 10px/16px " + MONO + ";text-align:center;");
						badge.setAttribute("data-mark", "badge");
						if (targetIndex !== active) badge.style.background = "rgba(79,140,255,0.55)";
						badge.textContent = String(targetIndex + 1);
						marks.append(frame, badge);
						markNodes.push({ box: frame, badge: badge });
					}
				}

				function positionMarks() {
					for (var index = 0; index < markNodes.length; index += 1) {
						var target = targets[index];
						if (!target) continue;
						var rect = target.getBoundingClientRect();
						var frame = markNodes[index].box;
						frame.style.left = rect.left + "px";
						frame.style.top = rect.top + "px";
						frame.style.width = rect.width + "px";
						frame.style.height = rect.height + "px";
						var badge = markNodes[index].badge;
						badge.style.left = Math.max(0, rect.left - 2) + "px";
						badge.style.top = Math.max(0, rect.top - 18) + "px";
					}
				}

				function chipLabel(element) {
					var text = String(element.innerText || element.textContent || "").replace(/\s+/g, " ").trim();
					if (text === "") return shortLabel(element);
					return text.length > MAX_CHIP ? text.slice(0, MAX_CHIP) + "…" : text;
				}

				function renderChips() {
					chips.textContent = "";
					for (var index = 0; index < targets.length; index += 1) {
						var chip = node("span", "display:inline-flex;align-items:center;gap:4px;max-width:100%;height:22px;padding:0 2px 0 4px;border-radius:7px;box-sizing:border-box;" + (index === active ? "background:rgba(79,140,255,0.26);" : "background:rgba(255,255,255,0.08);"));
						chip.setAttribute("data-role", "chip");
						var tag = node("span", "color:#9ec1ff;font:10px/22px " + MONO + ";flex:none;");
						tag.textContent = targets[index].tagName.toLowerCase();
						var text = node("span", "color:#dedee4;font:11px/22px " + FONT + ";max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;");
						text.textContent = chipLabel(targets[index]);
						var remove = node("button", BTN + "height:18px;min-width:16px;padding:0 3px;font-size:13px;line-height:1;", "×");
						remove.type = "button";
						remove.setAttribute("data-role", "chip-remove");
						remove.title = texts.remove || "";
						(function (position) {
							chip.addEventListener("click", function (event) {
								event.stopPropagation();
								active = position;
								renderChips();
								renderMarks();
								refresh();
							});
							remove.addEventListener("click", function (event) {
								event.stopPropagation();
								removeTarget(position);
							});
						})(index);
						chip.append(tag, text, remove);
						chips.append(chip);
					}
					renderCardDeltas();
				}

				function placeCard() {
					if (mode !== "edit" || targets.length === 0) return;
					var rect = targets[Math.min(active, targets.length - 1)].getBoundingClientRect();
					var width = card.offsetWidth || 360;
					var height = card.offsetHeight || 120;
					var left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
					var top = rect.bottom + 10;
					if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 10);
					card.style.left = Math.round(left) + "px";
					card.style.top = Math.round(top) + "px";
				}

				function placePanel() {
					if (mode !== "design" || designing < 0) return;
					if (panelPinned) return;
					var target = targets[designing];
					if (!target) return;
					var rect = target.getBoundingClientRect();
					var width = panel.offsetWidth || 360;
					var height = panel.offsetHeight || 320;
					var left = rect.right + 12;
					if (left + width > window.innerWidth - 8) left = rect.left - width - 12;
					if (left < 8) left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
					var top = Math.max(8, Math.min(rect.top, window.innerHeight - height - 8));
					panel.style.left = Math.round(left) + "px";
					panel.style.top = Math.round(top) + "px";
				}

				function refresh() {
					positionMarks();
					placeCard();
					placePanel();
				}

				function highlight(element) {
					if (element === null) {
						box.style.display = "none";
						label.style.display = "none";
						return;
					}
					var rect = element.getBoundingClientRect();
					box.style.display = "block";
					box.style.left = rect.left + "px";
					box.style.top = rect.top + "px";
					box.style.width = rect.width + "px";
					box.style.height = rect.height + "px";
					label.style.display = targets.length > 0 ? "none" : "block";
					if (targets.length > 0) return;
					label.textContent = shortLabel(element);
					var labelTop = rect.top - 20;
					if (labelTop < 4) labelTop = Math.min(rect.bottom + 4, window.innerHeight - 20);
					var labelLeft = Math.max(4, Math.min(rect.left, window.innerWidth - 40));
					label.style.top = labelTop + "px";
					label.style.left = labelLeft + "px";
					label.style.maxWidth = Math.max(80, window.innerWidth - labelLeft - 8) + "px";
				}

				// ---------- mode ----------
				function lockCursor() {
					if (cursorLock !== null) return;
					var style = document.documentElement.style;
					cursorLock = {
						cursor: { value: style.getPropertyValue("cursor"), priority: style.getPropertyPriority("cursor") },
						userSelect: { value: style.getPropertyValue("user-select"), priority: style.getPropertyPriority("user-select") }
					};
					style.setProperty("cursor", "crosshair", "important");
					style.setProperty("user-select", "none", "important");
				}

				function restoreStyle(property, saved) {
					var style = document.documentElement.style;
					if (saved.value === "") style.removeProperty(property);
					else style.setProperty(property, saved.value, saved.priority);
				}

				function unlockCursor() {
					if (cursorLock === null) return;
					restoreStyle("cursor", cursorLock.cursor);
					restoreStyle("user-select", cursorLock.userSelect);
					cursorLock = null;
				}

				function setMode(next) {
					mode = next;
					var picking = next === "pick";
					if (picking) lockCursor();
					else unlockCursor();
					card.style.display = next === "edit" && targets.length > 0 ? "block" : "none";
					panel.style.display = next === "design" ? "flex" : "none";
					hint.style.display = next === "pick" ? "block" : "none";
				}

				function removeTarget(position) {
					targets.splice(position, 1);
					designs.splice(position, 1);
					baselines.splice(position, 1);
					if (targets.length === 0) {
						designs = [];
						baselines = [];
						active = 0;
						setMode("pick");
						renderChips();
						renderMarks();
						return;
					}
					if (active >= targets.length) active = targets.length - 1;
					renderChips();
					renderMarks();
					refresh();
				}

				function select(element, additive) {
					if (additive) {
						var existing = targets.indexOf(element);
						if (existing >= 0) {
							removeTarget(existing);
							return;
						}
						targets.push(element);
						designs.push([]);
						baselines.push(null);
						active = targets.length - 1;
					} else {
						if (targets.length === 1 && targets[0] === element) {
							active = 0;
						} else {
							targets = [element];
							designs = [[]];
							baselines = [null];
							active = 0;
						}
					}
					renderChips();
					renderMarks();
					setMode("edit");
					refresh();
					focusComment();
				}

				// ---------- design panel ----------
				function roundNumber(value) {
					var parsed = parseFloat(value);
					if (!isFinite(parsed)) return "";
					return String(Math.round(parsed * 10) / 10);
				}

				function sizeValue(value) {
					var text = String(value == null ? "" : value).trim();
					if (text === "") return "";
					var number = roundNumber(text);
					return number === "" ? text : number + "px";
				}

				function normalizeColor(value) {
					var text = String(value == null ? "" : value).trim();
					if (text === "" || text === "transparent") return "transparent";
					var match = /^rgba?\(([^)]+)\)$/i.exec(text);
					if (match) {
						var parts = match[1].split(",").map(function (part) {
							return parseFloat(part);
						});
						if (parts.length < 3 || !isFinite(parts[0]) || !isFinite(parts[1]) || !isFinite(parts[2])) return text;
						var alpha = parts.length > 3 && isFinite(parts[3]) ? parts[3] : 1;
						if (alpha <= 0) return "transparent";
						if (alpha < 1) return "rgba(" + Math.round(parts[0]) + ", " + Math.round(parts[1]) + ", " + Math.round(parts[2]) + ", " + alpha + ")";
						return "#" + [parts[0], parts[1], parts[2]].map(function (channel) {
							var clamped = Math.max(0, Math.min(255, Math.round(channel)));
							return (clamped < 16 ? "0" : "") + clamped.toString(16);
						}).join("");
					}
					var hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
					if (hex) {
						var body = hex[1].length === 3 ? hex[1].split("").map(function (part) {
							return part + part;
						}).join("") : hex[1];
						return "#" + body.toLowerCase();
					}
					return text;
				}

				function toHex(value) {
					var normalized = normalizeColor(value);
					return /^#[0-9a-f]{6}$/i.test(normalized) ? normalized : "#000000";
				}

				function normalizeCorners(value) {
					return String(value).trim().split(/\s+/).map(function (part) {
						return sizeValue(part);
					}).join(" ");
				}

				function splitColors(value) {
					var text = String(value).trim();
					var parts = [];
					var current = "";
					var depth = 0;
					for (var index = 0; index < text.length; index += 1) {
						var char = text[index];
						if (char === "(") depth += 1;
						if (char === ")") depth = Math.max(0, depth - 1);
						if (/\s/.test(char) && depth === 0) {
							if (current !== "") parts.push(current);
							current = "";
							continue;
						}
						current += char;
					}
					if (current !== "") parts.push(current);
					return parts;
				}

				function normalizeColors(value) {
					return splitColors(value).map(normalizeColor).join(" ");
				}

				function normalizeSides(value) {
					return String(value).trim().split(/\s+/).map(sizeValue).join(" ");
				}

				/** Snapshot the properties the panel echoes as normalized strings. */
				function captureBaseline(element) {
					var view = window.getComputedStyle(element);
					var map = {};
					function put(property, value) {
						map[property] = value;
					}
					put("color", normalizeColor(view.getPropertyValue("color")));
					put("background-color", normalizeColor(view.getPropertyValue("background-color")));
					put("opacity", roundNumber(view.getPropertyValue("opacity")));
					put("font-size", sizeValue(view.getPropertyValue("font-size")));
					put("font-weight", roundNumber(view.getPropertyValue("font-weight")));
					put("border-radius", normalizeCorners(view.getPropertyValue("border-radius")));
					put("border-color", normalizeColors(view.getPropertyValue("border-color")));
					put("border-width", normalizeSides(view.getPropertyValue("border-width")));
					put("width", sizeValue(view.getPropertyValue("width")));
					put("height", sizeValue(view.getPropertyValue("height")));
					["top", "right", "bottom", "left"].forEach(function (side) {
						put("padding-" + side, sizeValue(view.getPropertyValue("padding-" + side)));
						put("margin-" + side, sizeValue(view.getPropertyValue("margin-" + side)));
					});
					put("flex-direction", view.getPropertyValue("flex-direction").trim());
					put("justify-content", view.getPropertyValue("justify-content").trim());
					put("align-items", view.getPropertyValue("align-items").trim());
					put("gap", view.getPropertyValue("gap").trim().split(/\s+/).map(function (part) {
						return part === "normal" ? part : sizeValue(part);
					}).join(" "));
					return map;
				}

				function normalizeValue(property, value) {
					if (value === "" || value === null || value === undefined) return "";
					if (property === "color" || property === "background-color" || property === "border-color") return normalizeColor(value);
					if (property === "opacity" || property === "font-weight") return roundNumber(value);
					if (property === "flex-direction" || property === "justify-content" || property === "align-items") return String(value);
					return sizeValue(value);
				}

				/** Record the target value only; the page is never touched. */
				function record(property, value) {
					if (designDraft === null || baseline === null) return;
					var next = normalizeValue(property, value);
					if (next === "" || next === baseline[property]) {
						delete designDraft[property];
						paintDirty();
						return;
					}
					designDraft[property] = next;
					paintDirty();
				}

				function fieldRow(text, key, properties) {
					var row = node("div", "display:flex;align-items:center;gap:6px;min-height:26px;padding:2px 6px;margin:2px 0;border-radius:6px;");
					row.setAttribute("data-field", key);
					row.setAttribute("data-props", (properties || [key]).join(" "));
					var name = node("div", "flex:0 0 72px;color:#a8a8b3;font:12px/1.4 " + FONT + ";", text);
					var control = node("div", "flex:1 1 auto;min-width:0;display:flex;align-items:center;gap:6px;");
					row.append(name, control);
					panelBody.append(row);
					return control;
				}

				function numberInput(value, placeholder, options, commit, reset) {
					var input = node("input", INPUT + "text-align:right;");
					input.type = "number";
					if (value !== "") input.value = String(value);
					if (placeholder) input.placeholder = String(placeholder);
					if (options && options.step !== undefined) input.step = String(options.step);
					if (options && options.min !== undefined) input.min = String(options.min);
					if (options && options.max !== undefined) input.max = String(options.max);
					input.addEventListener("input", function () {
						if (input.value === "") {
							commit("");
							return;
						}
						var parsed = parseFloat(input.value);
						if (!isFinite(parsed)) return;
						var clamped = false;
						if (options && options.min !== undefined && parsed < options.min) {
							if (options.rejectBelowMin === true) return;
							parsed = options.min;
							clamped = true;
						}
						if (options && options.max !== undefined && parsed > options.max) {
							parsed = options.max;
							clamped = true;
						}
						if (clamped) input.value = String(parsed);
						commit(String(parsed));
					});
					input.addEventListener("blur", function () {
						var parsed = parseFloat(input.value);
						var invalid = input.value === "" || !isFinite(parsed) || (options && options.min !== undefined && parsed < options.min);
						if (invalid) {
							commit("");
							input.value = reset === undefined ? "" : String(reset);
						}
					});
					return input;
				}

				function colorInput(value, commit) {
					var wrap = node("div", "display:flex;align-items:center;gap:6px;min-width:0;");
					var swatch = node("div", SWATCH + "position:relative;overflow:hidden;padding:0;");
					swatch.setAttribute("data-role", "swatch");
					var input = node("input", "position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;border:0;padding:0;margin:0;");
					input.type = "color";
					input.value = toHex(value);
					var text = node("span", "color:#8b8b93;font:11px/1.4 " + MONO + ";overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", normalizeColor(value));
					text.setAttribute("data-role", "color-value");
					function paint(next) {
						var normalized = normalizeColor(next);
						if (/^#[0-9a-f]{6}$/i.test(normalized)) {
							swatch.style.background = normalized;
							swatch.style.backgroundImage = "none";
						} else {
							swatch.style.background = "transparent";
							swatch.style.backgroundImage = "repeating-conic-gradient(#6b6b73 0% 25%,#3a3a40 0% 50%)";
							swatch.style.backgroundSize = "8px 8px";
							swatch.style.backgroundPosition = "0 0";
						}
						text.textContent = normalized;
					}
					paint(value);
					input.addEventListener("input", function () {
						paint(input.value);
						commit(input.value);
					});
					swatch.append(input);
					wrap.append(swatch, text);
					return wrap;
				}

				function selectInput(options, value, commit) {
					var list = Array.isArray(options) ? options.slice() : [];
					var known = false;
					for (var offset = 0; offset < list.length; offset += 1) {
						if (list[offset][0] === value) known = true;
					}
					if (!known && value) list = [[value, value]].concat(list);
					var select = node("select", INPUT + "padding:0 6px;");
					for (var index = 0; index < list.length; index += 1) {
						var option = node("option", "", list[index][1]);
						option.value = list[index][0];
						if (list[index][0] === value) option.selected = true;
						select.append(option);
					}
					select.addEventListener("change", function () {
						commit(select.value);
					});
					return select;
				}

				function buildPanel(seed) {
					var target = targets[designing];
					if (!target) return;
					panelBadge.textContent = "<" + target.tagName.toLowerCase() + ">";
					panelBody.textContent = "";

					function value(property) {
						return Object.prototype.hasOwnProperty.call(seed, property) ? seed[property] : baseline[property];
					}

					function numberField(label, property, options) {
						var row = fieldRow(label, property);
						var current = value(property);
						row.append(numberInput(roundNumber(current), roundNumber(current) === "" ? current : "", options, function (next) {
							record(property, next);
						}, roundNumber(baseline[property])));
					}

					var colorRow = fieldRow(labels.color || "Color", "color");
					colorRow.append(colorInput(value("color"), function (next) {
						record("color", next);
					}));

					var backgroundRow = fieldRow(labels.background || "Background", "background", ["background-color"]);
					backgroundRow.append(colorInput(value("background-color"), function (next) {
						record("background-color", next);
					}));

					numberField(labels.opacity || "Opacity", "opacity", { step: 0.05, min: 0, max: 1 });
					numberField(labels.fontSize || "Font size", "font-size", { step: 1, min: 0, rejectBelowMin: true });

					var weightRow = fieldRow(labels.fontWeight || "Font weight", "fontWeight", ["font-weight"]);
					weightRow.append(selectInput([["300", "300"], ["400", "400"], ["500", "500"], ["600", "600"], ["700", "700"], ["800", "800"]], value("font-weight"), function (next) {
						record("font-weight", next);
					}));

					numberField(labels.radius || "Corner radius", "border-radius", { step: 1, min: 0, rejectBelowMin: true });

					var borderColorRow = fieldRow(labels.borderColor || "Border color", "borderColor", ["border-color"]);
					borderColorRow.append(colorInput(value("border-color"), function (next) {
						record("border-color", next);
					}));

					numberField(labels.borderWidth || "Border width", "border-width", { step: 1, min: 0, rejectBelowMin: true });
					numberField(labels.width || "Width", "width", { step: 1, min: 0, rejectBelowMin: true });
					numberField(labels.height || "Height", "height", { step: 1, min: 0, rejectBelowMin: true });

					var paddingRow = fieldRow(labels.padding || "Padding", "padding", ["padding-top", "padding-right", "padding-bottom", "padding-left"]);
					["top", "right", "bottom", "left"].forEach(function (side) {
						var property = "padding-" + side;
						var current = value(property);
						var input = numberInput(roundNumber(current), roundNumber(current) === "" ? current : "", { step: 1, min: 0, rejectBelowMin: true }, function (next) {
							record(property, next);
						}, roundNumber(baseline[property]));
						input.style.padding = "0 6px";
						paddingRow.append(input);
					});

					var marginRow = fieldRow(labels.margin || "Margin", "margin", ["margin-top", "margin-right", "margin-bottom", "margin-left"]);
					["top", "right", "bottom", "left"].forEach(function (side) {
						var property = "margin-" + side;
						var current = value(property);
						var input = numberInput(roundNumber(current), roundNumber(current) === "" ? current : "", { step: 1, min: 0, rejectBelowMin: true }, function (next) {
							record(property, next);
						}, roundNumber(baseline[property]));
						input.style.padding = "0 6px";
						marginRow.append(input);
					});

					var directionRow = fieldRow(labels.direction || "Direction", "direction", ["flex-direction"]);
					directionRow.append(selectInput(texts.directions, value("flex-direction"), function (next) {
						record("flex-direction", next);
					}));

					var justifyRow = fieldRow(labels.justify || "Distribute", "justify", ["justify-content"]);
					justifyRow.append(selectInput(texts.justifyOptions, value("justify-content"), function (next) {
						record("justify-content", next);
					}));

					var alignRow = fieldRow(labels.align || "Align", "align", ["align-items"]);
					alignRow.append(selectInput(texts.alignOptions, value("align-items"), function (next) {
						record("align-items", next);
					}));

					numberField(labels.gap || "Gap", "gap", { step: 1, min: 0, rejectBelowMin: true });
					paintDirty();
				}

				function paintDirty() {
					for (var index = 0; index < panelBody.children.length; index += 1) {
						var row = panelBody.children[index];
						var properties = (row.getAttribute("data-props") || "").split(" ");
						var dirty = false;
						for (var offset = 0; offset < properties.length; offset += 1) {
							if (properties[offset] !== "" && designDraft !== null && Object.prototype.hasOwnProperty.call(designDraft, properties[offset])) {
								dirty = true;
								break;
							}
						}
						row.style.background = dirty ? "rgba(79,140,255,0.10)" : "transparent";
					}
				}

				function renderCardDeltas() {
					cardTarget = targets[active] || null;
					var list = designs[active] || [];
					cardDeltas.textContent = "";
					if (list.length === 0) {
						cardDeltas.style.display = "none";
						return;
					}
					for (var index = 0; index < list.length; index += 1) {
						cardDeltas.append(node("div", "color:#c8c8d0;font:11px/1.6 " + MONO + ";white-space:nowrap;overflow:hidden;text-overflow:ellipsis;", list[index].property + ": " + list[index].from + " → " + list[index].to));
					}
					cardDeltas.style.display = "block";
				}

				function openDesign(element) {
					var index = element ? targets.indexOf(element) : active;
					if (index < 0) return;
					designing = index;
					if (!baselines[index]) baselines[index] = captureBaseline(targets[index]);
					baseline = baselines[index];
					designDraft = {};
					panelPinned = false;
					(designs[index] || []).forEach(function (delta) {
						designDraft[delta.property] = delta.to;
					});
					panelNote.value = comment;
					buildPanel(designDraft);
					setMode("design");
					refresh();
				}

				function closeDesign() {
					designDraft = null;
					baseline = null;
					designing = -1;
					setMode(targets.length > 0 ? "edit" : "pick");
					renderCardDeltas();
					refresh();
					focusComment();
				}

				function commitDesign() {
					if (designing >= 0 && designDraft !== null) {
						var deltas = [];
						Object.keys(designDraft).forEach(function (property) {
							if (designDraft[property] === baseline[property]) return;
							deltas.push({ property: property, from: baseline[property] || "", to: designDraft[property] });
						});
						designs[designing] = deltas;
					}
					designDraft = null;
					baseline = null;
					designing = -1;
					setMode(targets.length > 0 ? "edit" : "pick");
					renderCardDeltas();
					refresh();
					focusComment();
				}

				function cleanup() {
					window.removeEventListener("pointermove", onMove, true);
					window.removeEventListener("pointerdown", onPress, true);
					window.removeEventListener("pointerup", onPress, true);
					window.removeEventListener("mousedown", onPress, true);
					window.removeEventListener("mouseup", onPress, true);
					window.removeEventListener("click", onActivate, true);
					window.removeEventListener("dblclick", onPress, true);
					window.removeEventListener("auxclick", onPress, true);
					window.removeEventListener("contextmenu", onPress, true);
					window.removeEventListener("keydown", onKey, true);
					window.removeEventListener("scroll", onScroll, true);
					window.removeEventListener("resize", onScroll, true);
					window.removeEventListener("pagehide", dismiss);
					clearFocusTimers();
					hideNotice();
					uninstallDelegation();
					unlockCursor();
					if (host.parentNode !== null) host.parentNode.removeChild(host);
					if (window[STATE_KEY] === state) {
						try {
							delete window[STATE_KEY];
						} catch (error) {
							window[STATE_KEY] = undefined;
						}
					}
				}

				/** Drop targets the page removed; true when the selection changed. */
				function dropDisconnected() {
					var keptTargets = [];
					var keptDesigns = [];
					var keptBaselines = [];
					var dropped = 0;
					var current = targets[active] || null;
					for (var index = 0; index < targets.length; index += 1) {
						if (!targets[index].isConnected) {
							dropped += 1;
							continue;
						}
						keptTargets.push(targets[index]);
						keptDesigns.push(designs[index] || []);
						keptBaselines.push(baselines[index] || null);
					}
					if (dropped === 0) return false;
					targets = keptTargets;
					designs = keptDesigns;
					baselines = keptBaselines;
					var position = current === null ? -1 : targets.indexOf(current);
					active = position < 0 ? 0 : position;
					setMode(targets.length > 0 ? "edit" : "pick");
					renderChips();
					renderMarks();
					refresh();
					notify(texts.removedTarget);
					return true;
				}

				function finish(submit) {
					if (settled) return;
					// A target the page removed must never become an annotation about nothing.
					if (dropDisconnected()) return;
					if (targets.length === 0) return;
					settled = true;
					var design = [];
					targets.forEach(function (element, position) {
						var changes = designs[position] || [];
						if (changes.length === 0) return;
						design.push({
							index: position,
							selector: selectorFor(element),
							changes: changes.map(function (delta) {
								return { property: delta.property, from: delta.from, to: delta.to };
							})
						});
					});
					var payload = {
						ok: true,
						submit: submit === true,
						page: {
							url: String(location.href),
							title: String(document.title || ""),
							width: window.innerWidth,
							height: window.innerHeight,
							scrollX: Math.round(window.scrollX),
							scrollY: Math.round(window.scrollY)
						},
						targets: targets.map(describe),
						comment: String(comment || "").trim(),
						design: design
					};
					cleanup();
					resolve(payload);
				}

				function dismiss() {
					if (settled) return;
					settled = true;
					cleanup();
					resolve({ ok: false, reason: "cancel" });
				}

				function escape() {
					if (settled) return;
					if (mode === "design") {
						closeDesign();
						return;
					}
					if (targets.length > 0) {
						targets = [];
						designs = [];
						baselines = [];
						active = 0;
						setMode("pick");
						renderChips();
						renderMarks();
						refresh();
						return;
					}
					dismiss();
				}

				// ---------- events ----------
				function onMove(event) {
					if (isOurs(event)) return;
					if (mode === "design") {
						highlight(null);
						return;
					}
					highlight(targetAt(event.clientX, event.clientY));
				}

				function onPress(event) {
					if (isOurs(event)) return;
					swallow(event);
				}

				function onActivate(event) {
					if (isOurs(event)) return;
					swallow(event);
					if (mode === "design") return;
					var element = targetAt(event.clientX, event.clientY);
					if (element === null) return;
					select(element, event.shiftKey === true);
				}

				function onKey(event) {
					if (isOurs(event)) return;
					if (event.isComposing || event.keyCode === 229) return;
					if (event.key === "Enter") {
						swallow(event);
						if (mode === "design") return;
						finish(event.metaKey === true || event.ctrlKey === true);
						return;
					}
					if (event.key === "Escape" || event.key === "Esc") {
						swallow(event);
						escape();
					}
				}

				function onScroll() {
					refresh();
				}

				/** Enter/Esc work from any control inside the overlay, not only the page body. */
				function onOverlayKey(event) {
					if (event.isComposing || event.keyCode === 229) return;
					if (event.key === "Escape" || event.key === "Esc") {
						event.preventDefault();
						event.stopPropagation();
						escape();
						return;
					}
					if (event.target && event.target.tagName === "BUTTON") return;
					if (event.key !== "Enter" || event.shiftKey === true) return;
					event.preventDefault();
					event.stopPropagation();
					var submit = event.metaKey === true || event.ctrlKey === true;
					if (mode === "design") {
						commitDesign();
						if (submit) finish(true);
						return;
					}
					finish(submit);
				}

				shadow.addEventListener("keydown", onOverlayKey);

				textarea.addEventListener("focus", hideNotice);

				textarea.addEventListener("input", function () {
					comment = textarea.value;
					panelNote.value = comment;
					textarea.style.height = "auto";
					textarea.style.height = Math.min(160, Math.max(44, textarea.scrollHeight)) + "px";
					refresh();
				});

				textarea.addEventListener("keydown", function (event) {
					if (event.isComposing || event.keyCode === 229) return;
					if (event.key === "Escape" || event.key === "Esc") {
						event.preventDefault();
						event.stopPropagation();
						escape();
						return;
					}
					if (event.key === "Enter" && event.shiftKey !== true) {
						event.preventDefault();
						event.stopPropagation();
						finish(event.metaKey === true || event.ctrlKey === true);
					}
				});

				closeBtn.addEventListener("click", function (event) {
					event.stopPropagation();
					escape();
				});
				designBtn.addEventListener("click", function (event) {
					event.stopPropagation();
					openDesign(cardTarget);
				});
				fillBtn.addEventListener("click", function (event) {
					event.stopPropagation();
					finish(false);
				});
				applyBtn.addEventListener("click", function (event) {
					event.stopPropagation();
					commitDesign();
				});
				cancelBtn.addEventListener("click", function (event) {
					event.stopPropagation();
					closeDesign();
				});

				window.addEventListener("pointermove", onMove, true);
				window.addEventListener("pointerdown", onPress, true);
				window.addEventListener("pointerup", onPress, true);
				window.addEventListener("mousedown", onPress, true);
				window.addEventListener("mouseup", onPress, true);
				window.addEventListener("click", onActivate, true);
				window.addEventListener("dblclick", onPress, true);
				window.addEventListener("auxclick", onPress, true);
				window.addEventListener("contextmenu", onPress, true);
				window.addEventListener("keydown", onKey, true);
				window.addEventListener("scroll", onScroll, true);
				window.addEventListener("resize", onScroll, true);
				window.addEventListener("pagehide", dismiss);
				installDelegation();

				var state = {
					cancel: dismiss
				};
				window[STATE_KEY] = state;

				setMode("pick");
				renderChips();
			});
		}

		/** Source of {@link guestAnnotate} plus its localized copy, ready for executeJavaScript. */
		function annotateScript(t) {
			return "(" + guestAnnotate.toString() + ")(" + JSON.stringify({
				texts: {
					hint: t("guest.hint"),
					placeholder: t("guest.placeholder"),
					design: t("guest.design"),
					designPlaceholder: t("guest.designPlaceholder"),
					cancel: t("guest.cancel"),
					apply: t("guest.apply"),
					fill: t("guest.fill"),
					fillHint: t("guest.fillHint"),
					close: t("guest.close"),
					remove: t("guest.remove"),
					removedTarget: t("guest.removedTarget"),
					focusBlocked: t("guest.focusBlocked"),
					empty: t("prompt.emptyText"),
					labels: {
						color: t("guest.label.color"),
						background: t("guest.label.background"),
						opacity: t("guest.label.opacity"),
						fontSize: t("guest.label.fontSize"),
						fontWeight: t("guest.label.fontWeight"),
						radius: t("guest.label.radius"),
						borderColor: t("guest.label.borderColor"),
						borderWidth: t("guest.label.borderWidth"),
						width: t("guest.label.width"),
						height: t("guest.label.height"),
						padding: t("guest.label.padding"),
						margin: t("guest.label.margin"),
						direction: t("guest.label.direction"),
						justify: t("guest.label.justify"),
						align: t("guest.label.align"),
						gap: t("guest.label.gap")
					},
					directions: [
						["row", t("guest.opt.row")],
						["column", t("guest.opt.column")],
						["row-reverse", t("guest.opt.rowReverse")],
						["column-reverse", t("guest.opt.columnReverse")]
					],
					justifyOptions: [
						["flex-start", t("guest.opt.start")],
						["center", t("guest.opt.center")],
						["flex-end", t("guest.opt.end")],
						["space-between", t("guest.opt.spaceBetween")],
						["space-around", t("guest.opt.spaceAround")]
					],
					alignOptions: [
						["stretch", t("guest.opt.stretch")],
						["flex-start", t("guest.opt.start")],
						["center", t("guest.opt.center")],
						["flex-end", t("guest.opt.end")]
					]
				}
			}) + ");";
		}

		/** Ask the guest page to end its annotation session, if any. */
		var CANCEL_SCRIPT = "(function () { var state = window.__dshAnnotationState; if (state && typeof state.cancel === 'function') state.cancel(); return true; })();";

		/** Crosshair glyph used by the toolbar button. */
		var CROSSHAIR_SVG = "<svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' aria-hidden='true'><circle cx='12' cy='12' r='6.5'/><path d='M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4'/></svg>";

		/**
		 * Compose the annotation block for one session.
		 * @param t - bound translator.
		 * @param result - guest session result.
		 * @returns the block text.
		 */
		function formatAnnotation(t, result) {
			var targets = Array.isArray(result.targets) ? result.targets : [];
			var page = result.page || {};
			var comment = String(result.comment || "").trim();
			var changes = {};
			(result.design || []).forEach(function (entry) {
				if (!entry.changes || entry.changes.length === 0) return;
				changes[entry.index] = entry.changes;
			});
			var lines = [];
			lines.push(t("prompt.page", { title: page.title || page.url || "", url: page.url || "" }));
			targets.forEach(function (target, index) {
				lines.push(t("prompt.target", {
					index: String(index + 1),
					selector: target.selector,
					ambiguous: target.matches !== 1 ? t("prompt.ambiguous", { matches: String(target.matches) }) : "",
					tag: target.tag,
					text: target.text
				}));
				var react = target.react || null;
				if (react !== null && react.component) {
					lines.push(react.source
						? t("prompt.reactAt", { component: react.component, source: react.source })
						: t("prompt.react", { component: react.component }));
				}
				var deltas = changes[index];
				if (deltas) {
					lines.push(t("prompt.designHeader"));
					deltas.forEach(function (change) {
						lines.push(t("prompt.designChange", {
							property: change.property,
							from: change.from,
							to: change.to
						}));
					});
				}
			});
			if (comment !== "") {
				lines.push("");
				lines.push(t("prompt.comment", { comment: comment }));
			}
			return lines.join("\n");
		}

		/** Composer reference source that owns annotation chips. */
		var REFERENCE_SOURCE = "browser-element-picker";
		var SHORTCUT_ID = "browser-element-picker.annotate";

		/** Untypable trigger: the chip is only inserted programmatically. */
		var REFERENCE_TRIGGER = "\u0001";

		/**
		 * Chip label shown in the composer. The full block rides in the reference
		 * and is expanded by the codec only when the message is sent.
		 * @param t - bound translator.
		 * @param result - guest session result.
		 * @returns the short chip label.
		 */
		function annotationChipLabel(t, result) {
			var targets = Array.isArray(result.targets) ? result.targets : [];
			var tag = targets.length > 0 ? "<" + targets[0].tag + ">" : "";
			var comment = String(result.comment || "").trim().replace(/\s+/g, " ");
			if (comment !== "") {
				return targets.length > 1
					? t("guest.chipCommentMany", { tag: tag, count: String(targets.length), comment: comment })
					: t("guest.chipComment", { tag: tag, comment: comment });
			}
			return targets.length > 1
				? t("guest.chipMany", { tag: tag, count: String(targets.length) })
				: t("guest.chipOne", { tag: tag });
		}

		/**
		 * Reference source for annotation chips: display text and model text stay
		 * separate, and clicking the chip opens the full block.
		 * @param state - shared preview state owned by apply().
		 * @returns the source registration object.
		 */
		function annotationReferenceSource(state) {
			return {
				trigger: REFERENCE_TRIGGER,
				name: REFERENCE_SOURCE,
				showGroupTitle: false,
				candidates: function () { return []; },
				codec: {
					clipboardText: function (ref) { return ref; },
					serialize: function (ref) { return Promise.resolve(ref); }
				},
				openReference: function (session, reference) {
					void session;
					showAnnotationPreview(state, reference && reference.ref);
					return true;
				}
			};
		}

		/**
		 * Show the full annotation block next to the clicked chip.
		 * @param state - shared preview state owned by apply().
		 * @param text - full block stored in the reference.
		 */
		function showAnnotationPreview(state, text) {
			hideAnnotationPreview(state);
			if (typeof text !== "string" || text === "") return;
			var panel = document.createElement("div");
			panel.setAttribute("data-dsh-annotation-preview", "");
			panel.style.cssText = "position:fixed;z-index:2147483646;box-sizing:border-box;max-width:min(460px,calc(100vw - 24px));max-height:min(360px,calc(100vh - 24px));overflow:auto;background:#1b1b1e;color:#f4f4f6;border:1px solid rgba(255,255,255,0.14);border-radius:12px;box-shadow:0 18px 46px rgba(0,0,0,0.42);font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;padding:10px 12px;white-space:pre-wrap;word-break:break-word;";
			panel.textContent = text;
			document.body.appendChild(panel);
			var rect = state.rect;
			var width = panel.offsetWidth || 360;
			var height = panel.offsetHeight || 200;
			var left = rect ? rect.left : Math.max(12, (window.innerWidth - width) / 2);
			var top = rect ? rect.top - height - 8 : 80;
			if (top < 8) top = rect ? rect.bottom + 8 : 80;
			panel.style.left = Math.round(Math.max(8, Math.min(left, window.innerWidth - width - 8))) + "px";
			panel.style.top = Math.round(Math.max(8, Math.min(top, window.innerHeight - height - 8))) + "px";
			state.preview = panel;
			state.dismissPreview = function (event) {
				if (event.type === "keydown") {
					if (event.key !== "Escape" && event.key !== "Esc") return;
				} else if (panel.contains(event.target)) {
					return;
				}
				hideAnnotationPreview(state);
			};
			document.addEventListener("pointerdown", state.dismissPreview, true);
			document.addEventListener("keydown", state.dismissPreview, true);
		}

		/**
		 * Remove the preview panel and its dismiss listeners.
		 * @param state - shared preview state owned by apply().
		 */
		function hideAnnotationPreview(state) {
			if (state.dismissPreview) {
				document.removeEventListener("pointerdown", state.dismissPreview, true);
				document.removeEventListener("keydown", state.dismissPreview, true);
				state.dismissPreview = null;
			}
			if (state.preview) {
				state.preview.remove();
				state.preview = null;
			}
		}

		/**
		 * Mount a picker button in every Desktop browser tab's toolbar (floating
		 * fallback when the tab body does not expose an address field).
		 * @param ctx - client plugin context.
		 * @param t - bound translator for this namespace.
		 * @param reference - shared annotation-chip registration state.
		 * @returns disposer removing every button, listener and observer.
		 */
		function install(ctx, t, reference) {
			var entries = new Map();
			var observers = [];

			var shortcutCatalog = null;
			try {
				shortcutCatalog = ctx.get("shortcuts");
			} catch (error) {
				shortcutCatalog = null;
			}

			/**
			 * Locate the tab's toolbar row: the direct child of the tab body that owns the
			 * address input. Null when the layout differs, so the caller falls back to a
			 * floating button instead of guessing at a structure.
			 * @param frame - the tab's webview guest.
			 * @returns the toolbar element, or null.
			 */
			function locateToolbar(frame) {
				var viewport = frame.parentElement;
				var content = viewport ? viewport.parentElement : null;
				var body = content ? content.parentElement : null;
				if (!body) return null;
				var fields = body.querySelectorAll("input");
				for (var index = 0; index < fields.length; index += 1) {
					var candidate = fields[index];
					while (candidate !== null && candidate.parentElement !== body) candidate = candidate.parentElement;
					if (candidate !== null && candidate !== content && candidate.parentElement === body) return candidate;
				}
				return null;
			}

			function createEntry(frame) {
				var picking = false;
				var disposed = false;
				var hovered = false;
				var toastTimer = 0;
				var toolbar = locateToolbar(frame);
				var integrated = toolbar !== null;

				var button = document.createElement("button");
				button.type = "button";
				button.setAttribute("aria-pressed", "false");
				button.innerHTML = CROSSHAIR_SVG;
				if (integrated) {
					button.style.cssText = "-webkit-app-region:no-drag;box-sizing:border-box;display:inline-flex;flex:none;align-items:center;justify-content:center;width:28px;height:28px;padding:0;margin:0;border:0;border-radius:var(--dsw-radius-sm,6px);background:transparent;color:var(--dsw-alias-label-secondary,#667085);cursor:pointer;transition:background 120ms ease,color 120ms ease;";
				} else {
					button.style.cssText = "pointer-events:auto;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border-radius:7px;border:1px solid rgba(0,0,0,0.14);background:rgba(255,255,255,0.92);color:var(--dsw-alias-label-secondary,#4b5563);cursor:pointer;opacity:0.72;box-shadow:0 1px 4px rgba(0,0,0,0.18);transition:opacity 120ms ease,background 120ms ease;";
				}

				var toast = document.createElement("div");
				toast.style.cssText = "max-width:240px;pointer-events:none;background:rgba(11,18,32,0.92);color:#ffffff;font:11px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:4px 8px;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.28);display:none;";

				var root = document.createElement("div");
				root.setAttribute("data-dsh-browser-element-picker", "");
				if (integrated) {
					root.style.cssText = "position:fixed;top:0;right:0;z-index:70;display:flex;flex-direction:column;align-items:flex-end;pointer-events:none;";
					root.append(toast);
					toolbar.append(button);
				} else {
					root.style.cssText = "position:fixed;top:0;right:0;z-index:70;display:flex;flex-direction:column;align-items:flex-end;gap:6px;pointer-events:none;";
					root.append(toast, button);
				}
				document.body.append(root);

				function paint() {
					var label = picking ? t("button.cancel") : t("button.pick");
					var hint = shortcutHint();
					button.title = hint.keys === "" ? label : label + " · " + hint.keys;
					button.setAttribute("aria-label", button.title);
					button.setAttribute("aria-pressed", picking ? "true" : "false");
					if (hint.aria === "") button.removeAttribute("aria-keyshortcuts");
					else button.setAttribute("aria-keyshortcuts", hint.aria);
					if (!integrated) {
						button.style.opacity = picking || hovered ? "1" : "0.72";
						button.style.background = picking ? "var(--dsw-alias-state-business-primary,#3b82f6)" : "rgba(255,255,255,0.92)";
						button.style.color = picking ? "#ffffff" : "var(--dsw-alias-label-secondary,#4b5563)";
						button.style.borderColor = picking ? "var(--dsw-alias-state-business-primary,#2563eb)" : "rgba(0,0,0,0.14)";
						return;
					}
					button.style.background = picking ? "var(--dsw-alias-state-business-primary,#3b82f6)" : hovered ? "var(--dsw-alias-interactive-bg-hover,rgba(0,0,0,0.06))" : "transparent";
					button.style.color = picking ? "#ffffff" : hovered ? "var(--dsw-alias-label-primary,#101828)" : "var(--dsw-alias-label-secondary,#667085)";
				}

				button.addEventListener("pointerenter", function () {
					hovered = true;
					paint();
				});
				button.addEventListener("pointerleave", function () {
					hovered = false;
					paint();
				});

				function showToast(message) {
					toast.textContent = message;
					toast.style.display = "block";
					if (toastTimer !== 0) clearTimeout(toastTimer);
					toastTimer = setTimeout(function () {
						toastTimer = 0;
						toast.style.display = "none";
					}, 3200);
				}

				/** Re-attach the button when React replaced the strip, and keep the toast under it. */
				function sync() {
					if (integrated) {
						if (toolbar === null || !toolbar.isConnected) toolbar = locateToolbar(frame);
						if (toolbar !== null && button.parentNode !== toolbar) toolbar.append(button);
						var bar = toolbar === null ? null : toolbar.getBoundingClientRect();
						var barShown = bar !== null && bar.width > 0 && bar.height > 0;
						root.style.display = barShown ? "flex" : "none";
						if (!barShown) return;
						root.style.top = Math.round(bar.bottom + 6) + "px";
						root.style.right = Math.round(window.innerWidth - bar.right + 6) + "px";
						return;
					}
					var rect = frame.getBoundingClientRect();
					var visible = frame.isConnected && rect.width >= 120 && rect.height >= 80 && rect.left < window.innerWidth - 40 && rect.right > 40;
					root.style.display = visible ? "flex" : "none";
					if (!visible) return;
					root.style.top = Math.round(rect.top + 8) + "px";
					root.style.right = Math.round(window.innerWidth - rect.right + 8) + "px";
				}

				/** Resolve the Session that owns this browser tab. */
				function owningSession() {
					var panel = typeof frame.closest === "function" ? frame.closest("[data-sidebar-right-session]") : null;
					if (panel !== null) {
						var fromPanel = panel.getAttribute("data-sidebar-right-session");
						if (fromPanel) return fromPanel;
					}
					var sidebar = ctx.get("sidebarRight");
					var mounted = sidebar && sidebar.mounted && typeof sidebar.mounted.getSnapshot === "function" ? sidebar.mounted.getSnapshot() : undefined;
					return mounted;
				}

				/**
				 * Rule and blank lines that turn the block into a section of its own.
				 * @param shell - the composer shell, or null.
				 * @returns the separator, or an empty string at the start of a draft.
				 */
				function draftSeparator(shell) {
					if (shell === null || typeof shell !== "object" || typeof shell.caretSpan !== "function") return "";
					var caret = null;
					try {
						caret = shell.caretSpan();
					} catch (error) {
						return "";
					}
					if (!caret || typeof caret.start !== "number" || caret.start <= 0) return "";
					return "\n\n---\n\n";
				}

				/** Fill the prompt input, and send it when the session asked for that. */
				function inject(result) {
					if (disposed) return;
					var sessions = ctx.get("sessions");
					var conversation = ctx.get("conversation");
					if (!sessions || !conversation || !conversation.input) {
						showToast(t("toast.unsupported"));
						return;
					}
					var sessionId = owningSession();
					if (!sessionId) {
						showToast(t("toast.noSession"));
						return;
					}
					var binding;
					try {
						binding = sessions.binding(sessionId);
					} catch (error) {
						binding = undefined;
					}
					if (!binding) {
						showToast(t("toast.noSession"));
						return;
					}
					var shell = null;
					try {
						shell = typeof conversation.input.shellFor === "function" ? conversation.input.shellFor(binding) : null;
					} catch (error) {
						shell = null;
					}

					// A block that lands after existing content becomes its own section.
					var block = draftSeparator(shell) + formatAnnotation(t, result);
					var inserted = false;
					if (reference && reference.ready && shell !== null && typeof shell.insertReference === "function" && typeof shell.caretSpan === "function") {
						try {
							var caret = shell.caretSpan() || { start: 0, end: 0 };
							var label = annotationChipLabel(t, result);
							inserted = shell.insertReference({
								source: REFERENCE_SOURCE,
								ref: block,
								label: label,
								clipboardText: label
							}, {
								start: caret.start,
								end: caret.end,
								draftRev: shell.rev
							}) === true;
						} catch (error) {
							inserted = false;
						}
					}

					// Fall back to the quote node, then to plain appended text.
					var quoted = false;
					if (!inserted && shell !== null && typeof shell.insertQuote === "function") {
						try {
							quoted = shell.insertQuote(block) === true;
						} catch (error) {
							quoted = false;
						}
					}

					if (!inserted && !quoted) {
						var outcome;
						try {
							outcome = conversation.input.requestDraftInitialization(binding, {
								prompt: block,
								whenDraftExists: "append"
							});
						} catch (error) {
							showToast(t("toast.failed", { message: String(error && error.message ? error.message : error) }));
							return;
						}
						if (outcome === "blocked") {
							showToast(t("toast.busy"));
							return;
						}
					}

					if (result.submit !== true) {
						showToast(inserted || quoted ? t("toast.quoted") : t("toast.injected"));
						return;
					}
					try {
						if (!shell || typeof shell.submit !== "function") throw new Error("composer submit unavailable");
						shell.submit("queue");
						showToast(t("toast.sent"));
					} catch (error) {
						showToast(t("toast.sendFailed", { message: String(error && error.message ? error.message : error) }));
					}
				}

				/** Handle one guest session result. */
				function report(result) {
					if (disposed) return;
					if (!result || result.ok !== true) {
						if (result && (result.reason === "cancel" || result.reason === "empty")) return;
						if (result && result.reason === "describe") showToast(t("toast.failed", { message: String(result.message) }));
						return;
					}
					inject(result);
				}

				async function start() {
					if (picking) {
						try {
							await frame.executeJavaScript(CANCEL_SCRIPT, true);
						} catch (error) {
							void error;
						}
						return;
					}
					if (typeof frame.executeJavaScript !== "function") {
						showToast(t("toast.unsupported"));
						return;
					}
					var url = "";
					try {
						url = String(frame.getURL() || "");
					} catch (error) {
						url = "";
					}
					if (!/^https?:/i.test(url)) {
						showToast(t("toast.noPage"));
						return;
					}
					picking = true;
					paint();
					var script = annotateScript(t);
					try {
						var result;
						try {
							result = await frame.executeJavaScript(script, true);
						} catch (error) {
							var detail = String(error && error.message ? error.message : error);
							// A guest that has not emitted `dom-ready` refuses injection; one retry covers it.
							if (!/dom-ready|attached to the DOM|not attached/i.test(detail)) throw error;
							await new Promise(function (resolve) {
								setTimeout(resolve, 300);
							});
							result = await frame.executeJavaScript(script, true);
						}
						report(result);
					} catch (error) {
						showToast(t("toast.failed", { message: String(error && error.message ? error.message : error) }));
					} finally {
						picking = false;
						paint();
					}
				}

				button.addEventListener("click", function (event) {
					event.preventDefault();
					event.stopPropagation();
					start();
				});

				var resize = new ResizeObserver(function () {
					sync();
				});
				resize.observe(frame);
				if (integrated && toolbar !== null) resize.observe(toolbar);

				sync();
				paint();

				return {
					sync: sync,
					paint: paint,
					start: start,
					dispose: function () {
						disposed = true;
						resize.disconnect();
						if (toastTimer !== 0) clearTimeout(toastTimer);
						button.remove();
						root.remove();
					}
				};
			}

			/**
			 * The binding the keyboard service currently shows for this command.
			 * @returns display keys and the ARIA shortcut, both empty when unbound.
			 */
			function shortcutHint() {
				var catalog = shortcutCatalog && shortcutCatalog.catalog;
				if (!catalog || typeof catalog.getSnapshot !== "function") return { keys: "", aria: "" };
				var rows = catalog.getSnapshot() || [];
				for (var index = 0; index < rows.length; index += 1) {
					if (rows[index].id === SHORTCUT_ID) {
						return { keys: String(rows[index].keys || ""), aria: String(rows[index].aria || "") };
					}
				}
				return { keys: "", aria: "" };
			}

			/** The browser page on screen, or null when the sidebar has no page open. */
			function visibleEntry() {
				var chosen = null;
				entries.forEach(function (entry, frame) {
					if (chosen !== null || !frame.isConnected) return;
					var rect = frame.getBoundingClientRect();
					if (rect.width < 120 || rect.height < 80) return;
					var url = "";
					try {
						url = String(frame.getURL() || "");
					} catch (error) {
						url = "";
					}
					if (!/^https?:/i.test(url)) return;
					chosen = entry;
				});
				return chosen;
			}

			/** Start or cancel a session on the page on screen; false when there is none. */
			function startVisible() {
				var entry = visibleEntry();
				if (entry === null) return false;
				entry.start();
				return true;
			}

			ctx.effect(function () {
				if (!shortcutCatalog || typeof shortcutCatalog.register !== "function") return;
				try {
						return shortcutCatalog.register({
						id: SHORTCUT_ID,
						label: function () {
							return t("shortcut.annotate");
						},
						aliases: ["annotate", "page annotation", "element picker"],
						regions: ["page", "editable"],
						modals: [],
						defaults: {
							"desktop:macos": { code: "KeyC", modifiers: ["primary", "shift"] },
							"desktop:windows": { code: "KeyC", modifiers: ["primary", "shift"] }
						},
							resolve: function () {
								// With no page open the combination still belongs to the app.
								return visibleEntry() === null ? { status: "pass" } : { status: "handled", run: startVisible };
							}
					});
				} catch (error) {
					// A reserved or conflicting default must not disable the toolbar button.
					console.warn("browser element picker: shortcut unavailable", error);
				}
			}, "browser-element-picker: keyboard shortcut");

			ctx.effect(function () {
				var catalog = shortcutCatalog && shortcutCatalog.catalog;
				if (!catalog || typeof catalog.subscribe !== "function") return;
				return catalog.subscribe(function () {
					entries.forEach(function (entry) {
						entry.paint();
					});
				});
			}, "browser-element-picker: shortcut labels");

			/** Attach a button to each browser guest, refresh the attached ones, drop detached ones. */
			function scan() {
				var frames = document.querySelectorAll("webview[data-sidebar-browser-frame]");
				for (var index = 0; index < frames.length; index += 1) {
					var frame = frames[index];
					if (entries.has(frame)) continue;
					try {
						entries.set(frame, createEntry(frame));
					} catch (error) {
						console.warn("browser element picker: could not attach", error);
					}
				}
				entries.forEach(function (entry, frame) {
					if (!frame.isConnected) {
						entry.dispose();
						entries.delete(frame);
						return;
					}
					entry.sync();
				});
			}

			// Streaming output and typing mutate the DOM constantly; coalesce rescans per frame.
			var scheduled = false;
			var schedule = typeof requestAnimationFrame === "function" ? requestAnimationFrame : function (callback) {
				return setTimeout(callback, 16);
			};
			var mutation = new MutationObserver(function () {
				if (scheduled) return;
				scheduled = true;
				schedule(function () {
					scheduled = false;
					scan();
				});
			});
			mutation.observe(document.body, { childList: true, subtree: true });
			observers.push(mutation);
			var onViewport = function () {
				entries.forEach(function (entry) {
					entry.sync();
				});
			};
			window.addEventListener("resize", onViewport, true);
			window.addEventListener("scroll", onViewport, true);
			scan();

			return function () {
				for (var index = 0; index < observers.length; index += 1) observers[index].disconnect();
				window.removeEventListener("resize", onViewport, true);
				window.removeEventListener("scroll", onViewport, true);
				entries.forEach(function (entry) {
					entry.dispose();
				});
				entries.clear();
			};
		}

		/** Services this plugin needs before it can mount. */
		var inject = ["locale", "inputTriggers"];

		/**
		 * Register the copy and mount the annotation button over sidebar browser tabs.
		 * @param ctx - client plugin context.
		 */
		function apply(ctx) {
			var t = ctx.locale.bind(NS);
			ctx.effect(function () {
				return ctx.locale.register(NS, { zh: zh, en: en });
			}, "browser-element-picker: dictionaries");
			var reference = { ready: false, preview: null, rect: null, dismissPreview: null };
			ctx.effect(function () {
				var triggers;
				var disposeSource;
				try {
					triggers = ctx.get("inputTriggers");
					if (!triggers || typeof triggers.registerSource !== "function") return;
					disposeSource = triggers.registerSource(annotationReferenceSource(reference));
				} catch (error) {
					void error;
					return;
				}
				reference.ready = true;
				var style = null;
				if (document.head && typeof document.head.appendChild === "function") {
					style = document.createElement("style");
					style.setAttribute("data-plugin-css", "dsh-plugin-browser-element-picker");
					style.textContent = '[data-composer-chip="' + REFERENCE_SOURCE + '"] > span > span:first-child{display:none!important}';
					document.head.appendChild(style);
				}
				var onChipClick = function (event) {
					var node = event.target;
					if (!node || node.nodeType !== 1 || typeof node.closest !== "function") return;
					var chip = node.closest('[data-composer-chip="' + REFERENCE_SOURCE + '"]');
					if (chip !== null) reference.rect = chip.getBoundingClientRect();
				};
				document.addEventListener("click", onChipClick, true);
				return function () {
					reference.ready = false;
					reference.rect = null;
					document.removeEventListener("click", onChipClick, true);
					if (style !== null) style.remove();
					hideAnnotationPreview(reference);
					disposeSource();
				};
			}, "browser-element-picker: annotation references");
			ctx.effect(function () {
				return install(ctx, t, reference);
			}, "browser-element-picker: overlay");
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

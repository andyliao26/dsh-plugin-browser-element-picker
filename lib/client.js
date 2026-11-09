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
			"toast.quoted": "已作为引用块填入输入框",
			"toast.sent": "已直接发送",
			"toast.sendFailed": "已填入，但发送失败：{message}",
			"toast.noPage": "请先在侧边浏览器里打开一个 http(s) 网页",
			"toast.unsupported": "当前环境不支持页面标注（仅桌面端侧边浏览器可用）",
			"toast.noSession": "找不到这个标签页所属的会话",
			"toast.busy": "输入框正在提交，请稍后再试",
			"toast.failed": "标注失败：{message}",
			"toast.empty": "没有选中任何元素",
			"guest.hint": "点击选择元素 · Shift 点击可多选 · Enter 填入 · ⌘Enter 直接发送 · Esc 退出",
			"guest.cardHint": "Shift 多选 · Enter 填入 · ⌘Enter 发送",
			"guest.placeholder": "添加评论…",
			"guest.design": "设计模式",
			"guest.designHint": "调整会写入提示词，不改页面",
			"guest.cancel": "取消",
			"guest.apply": "应用",
			"guest.fill": "填入输入框",
			"guest.send": "直接发送",
			"guest.close": "关闭",
			"guest.selected": "已选择 {count} 项",
			"guest.remove": "移除",
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
			"prompt.headerSingle": "【页面标注】",
			"prompt.headerMany": "【页面标注】共 {count} 个元素",
			"prompt.page": "- 页面：{title}（{url}）",
			"prompt.selector": "- 选择器：{selector}（页面内匹配 {matches} 个元素）",
			"prompt.element": "- 元素：<{tag}> {text}",
			"prompt.geometry": "- 位置：左 {x}、上 {y}，尺寸 {width}×{height}；页面视口 {vw}×{vh}，滚动 ({sx}, {sy})",
			"prompt.styles": "- 计算样式：{styles}",
			"prompt.html": "- 外部 HTML：{html}",
			"prompt.target": "{index}. <{tag}> {text} — {selector}",
			"prompt.designHeader": "- 设计调整：",
			"prompt.designHeaderMany": "- 设计调整（第 {index} 个元素）：",
			"prompt.designChange": "  - {property}: {from} → {to}",
			"prompt.comment": "- 我的意见：{comment}",
			"prompt.emptyText": "（无可见文本）",
			"prompt.footerSingle": "请按上面的意见精确修改这个元素；落到源码时保持相同的选择器语义，并说明改了哪些文件。",
			"prompt.footerMany": "请按上面的意见精确修改这些元素；落到源码时保持相同的选择器语义，并说明改了哪些文件。",
			"prompt.fillSuffix": "\n\n修改要求："
		};

		/** English copy, guest UI copy and prompt templates. */
		var en = {
			"button.pick": "Annotate page element",
			"button.cancel": "Cancel annotation (Esc)",
			"toast.injected": "Added to the prompt",
			"toast.quoted": "Added as a quoted block",
			"toast.sent": "Sent",
			"toast.sendFailed": "Added, but sending failed: {message}",
			"toast.noPage": "Open an http(s) page in the sidebar browser first",
			"toast.unsupported": "Annotation is unavailable here (Desktop sidebar browser only)",
			"toast.noSession": "This browser tab has no Session to fill",
			"toast.busy": "The prompt is being submitted; try again in a moment",
			"toast.failed": "Annotation failed: {message}",
			"toast.empty": "Nothing was selected",
			"guest.hint": "Click to select · Shift-click for more · Enter to fill · ⌘Enter to send · Esc to exit",
			"guest.cardHint": "Shift-click for more · Enter fills · ⌘Enter sends",
			"guest.placeholder": "Add a comment…",
			"guest.design": "Design mode",
			"guest.designHint": "Adjustments go into the prompt; the page stays untouched",
			"guest.cancel": "Cancel",
			"guest.apply": "Apply",
			"guest.fill": "Fill the prompt",
			"guest.send": "Send now",
			"guest.close": "Close",
			"guest.selected": "{count} selected",
			"guest.remove": "Remove",
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
			"prompt.headerSingle": "[Page annotation]",
			"prompt.headerMany": "[Page annotation] {count} elements",
			"prompt.page": "- Page: {title} ({url})",
			"prompt.selector": "- Selector: {selector} (matches {matches} element(s))",
			"prompt.element": "- Element: <{tag}> {text}",
			"prompt.geometry": "- Box: left {x}, top {y}, size {width}×{height}; viewport {vw}×{vh}, scroll ({sx}, {sy})",
			"prompt.styles": "- Computed styles: {styles}",
			"prompt.html": "- Outer HTML: {html}",
			"prompt.target": "{index}. <{tag}> {text} — {selector}",
			"prompt.designHeader": "- Design adjustments:",
			"prompt.designHeaderMany": "- Design adjustments (element {index}):",
			"prompt.designChange": "  - {property}: {from} → {to}",
			"prompt.comment": "- My comment: {comment}",
			"prompt.emptyText": "(no visible text)",
			"prompt.footerSingle": "Change exactly this element as requested; keep the same selector semantics when editing source and name the file you changed.",
			"prompt.footerMany": "Change exactly these elements as requested; keep the same selector semantics when editing source and name the files you changed.",
			"prompt.fillSuffix": "\n\nRequested change:"
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

				var BTN = "appearance:none;border:0;background:transparent;color:#cfcfd6;height:26px;min-width:26px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0 6px;font:inherit;flex:none;";
				var BTN_PRIMARY = BTN + "background:#4f8cff;color:#ffffff;font-weight:600;";
				var BTN_GHOST = BTN + "border:1px solid rgba(255,255,255,0.16);";
				var INPUT = "box-sizing:border-box;width:100%;height:26px;border-radius:7px;border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.06);color:#f4f4f6;font:inherit;padding:0 8px;";
				var CARD = "position:fixed;display:none;pointer-events:auto;box-sizing:border-box;width:360px;max-width:calc(100vw - 20px);background:#1b1b1e;color:#f4f4f6;border:1px solid rgba(255,255,255,0.14);border-radius:14px;box-shadow:0 18px 46px rgba(0,0,0,0.42);font:13px/1.5 " + FONT + ";overflow:hidden;z-index:2147483647;";
				var PANEL = "position:fixed;display:none;pointer-events:auto;box-sizing:border-box;width:320px;max-height:min(calc(100vh - 24px),720px);overflow:hidden;flex-direction:column;background:#1b1b1e;color:#f4f4f6;border:1px solid rgba(255,255,255,0.14);border-radius:14px;box-shadow:0 18px 46px rgba(0,0,0,0.42);font:12px/1.5 " + FONT + ";z-index:2147483647;";
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
				var scrollStyle = document.createElement("style");
				scrollStyle.textContent = "::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.28);border-radius:4px}::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.42)}";
				shadow.append(scrollStyle, box, label, marks, card, panel, hint);
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
				textarea.style.cssText = "display:block;box-sizing:border-box;width:100%;height:44px;max-height:160px;resize:none;border:0;outline:0;background:transparent;color:#f4f4f6;font:13px/1.5 " + FONT + ";padding:2px 12px 6px;";
				textarea.placeholder = texts.placeholder || "";
				textarea.rows = 1;

				var cardFoot = node("div", "display:flex;align-items:center;justify-content:space-between;gap:8px;padding:0 10px 10px;");
				var cardHint = node("div", "color:#8b8b93;font:11px/1.4 " + FONT + ";min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", texts.cardHint || "");
				var actions = node("div", "display:flex;align-items:center;gap:6px;flex:none;");
				var sendBtn = node("button", BTN_GHOST, "↑");
				sendBtn.type = "button";
				sendBtn.setAttribute("data-role", "send");
				sendBtn.title = texts.send || "";
				sendBtn.setAttribute("aria-label", texts.send || "");
				var fillBtn = node("button", BTN_PRIMARY, "✓");
				fillBtn.type = "button";
				fillBtn.setAttribute("data-role", "fill");
				fillBtn.title = texts.fill || "";
				fillBtn.setAttribute("aria-label", texts.fill || "");
				actions.append(sendBtn, fillBtn);
				cardFoot.append(cardHint, actions);
				card.append(cardHead, cardDeltas, textarea, cardFoot);

				// ---------- design panel ----------
				var panelHead = node("div", "display:flex;align-items:center;gap:8px;padding:12px 12px 8px;flex:none;");
				var panelBadge = node("span", "display:inline-flex;align-items:center;gap:6px;min-width:0;color:#9ec1ff;font:11px/1.4 " + MONO + ";background:rgba(79,140,255,0.16);border-radius:6px;padding:2px 6px;");
				var panelTitle = node("span", "color:#8b8b93;font:11px/1.4 " + FONT + ";flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", texts.designHint || "");
				panelHead.append(panelBadge, panelTitle);
				var panelBody = node("div", "padding:2px 12px 10px;overflow-y:auto;flex:1 1 auto;min-height:0;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.28) transparent;scrollbar-gutter:stable;overscroll-behavior:contain;");
				var panelFoot = node("div", "display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:8px 12px 12px;flex:none;border-top:1px solid rgba(255,255,255,0.08);");
				var cancelBtn = node("button", BTN_GHOST, texts.cancel || "");
				cancelBtn.type = "button";
				cancelBtn.setAttribute("data-role", "design-cancel");
				var applyBtn = node("button", BTN_PRIMARY, texts.apply || "");
				applyBtn.type = "button";
				applyBtn.setAttribute("data-role", "design-apply");
				panelFoot.append(cancelBtn, applyBtn);
				var panelFade = node("div", "flex:none;height:12px;margin-top:-12px;pointer-events:none;background:linear-gradient(to top,#1b1b1e,rgba(27,27,30,0));");
				panel.append(panelHead, panelBody, panelFade, panelFoot);

				// ---------- geometry helpers ----------
				function cssEscape(value) {
					if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
					return String(value).replace(/[^\w-]/g, "\\$&");
				}

				function selectorFor(element) {
					var parts = [];
					var cursor = element;
					var guard = 0;
					while (cursor && cursor.nodeType === 1 && guard < 12) {
						guard += 1;
						var part = cursor.tagName.toLowerCase();
						var id = cursor.getAttribute("id");
						if (id && /^[A-Za-z][\w:.\-]*$/.test(id) && document.querySelectorAll("#" + cssEscape(id)).length === 1) {
							parts.unshift("#" + id);
							break;
						}
						var classes = Array.prototype.slice.call(cursor.classList, 0, 2).filter(function (name) {
							return /^[A-Za-z_][\w-]*$/.test(name);
						});
						if (classes.length > 0) part += "." + classes.join(".");
						var parent = cursor.parentElement;
						if (parent !== null) {
							var siblings = Array.prototype.filter.call(parent.children, function (child) {
								return child.tagName === cursor.tagName;
							});
							if (siblings.length > 1) part += ":nth-of-type(" + (siblings.indexOf(cursor) + 1) + ")";
						}
						parts.unshift(part);
						if (parts.length > 1) {
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
					var count = node("span", "color:#8b8b93;font:11px/1.6 " + FONT + ";flex:none;margin-right:2px;", String(texts.selected || "{count}").replace("{count}", String(targets.length)));
					chips.append(count);
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
					var target = targets[designing];
					if (!target) return;
					var rect = target.getBoundingClientRect();
					var width = panel.offsetWidth || 320;
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
					textarea.focus();
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
						return;
					}
					designDraft[property] = next;
				}

				function fieldRow(text, key) {
					var row = node("div", "display:flex;align-items:center;gap:10px;min-height:28px;padding:2px 0;");
					row.setAttribute("data-field", key);
					var name = node("div", "flex:0 0 92px;color:#a8a8b3;font:12px/1.4 " + FONT + ";", text);
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

					var backgroundRow = fieldRow(labels.background || "Background", "background");
					backgroundRow.append(colorInput(value("background-color"), function (next) {
						record("background-color", next);
					}));

					numberField(labels.opacity || "Opacity", "opacity", { step: 0.05, min: 0, max: 1 });
					numberField(labels.fontSize || "Font size", "font-size", { step: 1, min: 0, rejectBelowMin: true });

					var weightRow = fieldRow(labels.fontWeight || "Font weight", "fontWeight");
					weightRow.append(selectInput([["300", "300"], ["400", "400"], ["500", "500"], ["600", "600"], ["700", "700"], ["800", "800"]], value("font-weight"), function (next) {
						record("font-weight", next);
					}));

					numberField(labels.radius || "Corner radius", "border-radius", { step: 1, min: 0, rejectBelowMin: true });

					var borderColorRow = fieldRow(labels.borderColor || "Border color", "borderColor");
					borderColorRow.append(colorInput(value("border-color"), function (next) {
						record("border-color", next);
					}));

					numberField(labels.borderWidth || "Border width", "border-width", { step: 1, min: 0, rejectBelowMin: true });
					numberField(labels.width || "Width", "width", { step: 1, min: 0, rejectBelowMin: true });
					numberField(labels.height || "Height", "height", { step: 1, min: 0, rejectBelowMin: true });

					var paddingRow = fieldRow(labels.padding || "Padding", "padding");
					["top", "right", "bottom", "left"].forEach(function (side) {
						var property = "padding-" + side;
						var current = value(property);
						var input = numberInput(roundNumber(current), roundNumber(current) === "" ? current : "", { step: 1, min: 0, rejectBelowMin: true }, function (next) {
							record(property, next);
						}, roundNumber(baseline[property]));
						input.style.padding = "0 6px";
						paddingRow.append(input);
					});

					var marginRow = fieldRow(labels.margin || "Margin", "margin");
					["top", "right", "bottom", "left"].forEach(function (side) {
						var property = "margin-" + side;
						var current = value(property);
						var input = numberInput(roundNumber(current), roundNumber(current) === "" ? current : "", { step: 1, min: 0, rejectBelowMin: true }, function (next) {
							record(property, next);
						}, roundNumber(baseline[property]));
						input.style.padding = "0 6px";
						marginRow.append(input);
					});

					var directionRow = fieldRow(labels.direction || "Direction", "direction");
					directionRow.append(selectInput(texts.directions, value("flex-direction"), function (next) {
						record("flex-direction", next);
					}));

					var justifyRow = fieldRow(labels.justify || "Distribute", "justify");
					justifyRow.append(selectInput(texts.justifyOptions, value("justify-content"), function (next) {
						record("justify-content", next);
					}));

					var alignRow = fieldRow(labels.align || "Align", "align");
					alignRow.append(selectInput(texts.alignOptions, value("align-items"), function (next) {
						record("align-items", next);
					}));

					numberField(labels.gap || "Gap", "gap", { step: 1, min: 0, rejectBelowMin: true });
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
					(designs[index] || []).forEach(function (delta) {
						designDraft[delta.property] = delta.to;
					});
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
					if (targets.length > 0) textarea.focus();
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
					if (targets.length > 0) textarea.focus();
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

				function finish(submit) {
					if (settled) return;
					var liveTargets = [];
					var liveDesigns = [];
					for (var index = 0; index < targets.length; index += 1) {
						if (!targets[index].isConnected) continue;
						liveTargets.push(targets[index]);
						liveDesigns.push(designs[index] || []);
					}
					if (liveTargets.length === 0) {
						dismiss();
						return;
					}
					settled = true;
					var design = [];
					liveTargets.forEach(function (element, position) {
						var changes = liveDesigns[position];
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
						targets: liveTargets.map(describe),
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
						textarea.focus();
						if (submit) finish(true);
						return;
					}
					finish(submit);
				}

				shadow.addEventListener("keydown", onOverlayKey);

				textarea.addEventListener("input", function () {
					comment = textarea.value;
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
				sendBtn.addEventListener("click", function (event) {
					event.stopPropagation();
					finish(true);
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
					cardHint: t("guest.cardHint"),
					placeholder: t("guest.placeholder"),
					design: t("guest.design"),
					designHint: t("guest.designHint"),
					cancel: t("guest.cancel"),
					apply: t("guest.apply"),
					fill: t("guest.fill"),
					send: t("guest.send"),
					close: t("guest.close"),
					selected: t("guest.selected"),
					remove: t("guest.remove"),
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
		 * @param quote - true for the composer's quote block (no trailing fill prompt).
		 * @returns the block text.
		 */
		function formatAnnotation(t, result, quote) {
			var targets = Array.isArray(result.targets) ? result.targets : [];
			var page = result.page || {};
			var lines = [];
			lines.push(targets.length > 1 ? t("prompt.headerMany", { count: String(targets.length) }) : t("prompt.headerSingle"));
			lines.push(t("prompt.page", { title: page.title || page.url || "", url: page.url || "" }));
			if (targets.length === 1) {
				var target = targets[0];
				lines.push(t("prompt.selector", { selector: target.selector, matches: String(target.matches) }));
				lines.push(t("prompt.element", { tag: target.tag, text: target.text }));
				lines.push(t("prompt.geometry", {
					x: String(target.rect.x),
					y: String(target.rect.y),
					width: String(target.rect.width),
					height: String(target.rect.height),
					vw: String(page.width),
					vh: String(page.height),
					sx: String(page.scrollX),
					sy: String(page.scrollY)
				}));
				var styles = Array.isArray(target.styles) ? target.styles : [];
				if (styles.length > 0) lines.push(t("prompt.styles", { styles: styles.join("; ") }));
				if (target.html) lines.push(t("prompt.html", { html: target.html }));
			} else {
				targets.forEach(function (item, index) {
					lines.push(t("prompt.target", {
						index: String(index + 1),
						tag: item.tag,
						text: item.text,
						selector: item.selector
					}));
				});
			}
			(result.design || []).forEach(function (entry) {
				if (!entry.changes || entry.changes.length === 0) return;
				lines.push(t(targets.length > 1 ? "prompt.designHeaderMany" : "prompt.designHeader", {
					index: String(entry.index + 1)
				}));
				entry.changes.forEach(function (change) {
					lines.push(t("prompt.designChange", {
						property: change.property,
						from: change.from,
						to: change.to
					}));
				});
			});
			if (result.comment) lines.push(t("prompt.comment", { comment: result.comment }));
			lines.push("");
			lines.push(t(targets.length > 1 ? "prompt.footerMany" : "prompt.footerSingle"));
			var text = lines.join("\n");
			return quote === true ? text : text + t("prompt.fillSuffix");
		}

		/**
		 * Mount a picker button in every Desktop browser tab's toolbar (floating
		 * fallback when the tab body does not expose an address field).
		 * @param ctx - client plugin context.
		 * @param t - bound translator for this namespace.
		 * @returns disposer removing every button, listener and observer.
		 */
		function install(ctx, t) {
			var entries = new Map();
			var observers = [];

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
					button.title = label;
					button.setAttribute("aria-label", label);
					button.setAttribute("aria-pressed", picking ? "true" : "false");
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

					// Prefer the composer's own quote node: the annotation then rides as one
					// removable block and the caret lands after it, ready for the request.
					var quoted = false;
					if (shell !== null && typeof shell.insertQuote === "function") {
						try {
							quoted = shell.insertQuote(formatAnnotation(t, result, true)) === true;
						} catch (error) {
							quoted = false;
						}
					}

					if (!quoted) {
						var outcome;
						try {
							outcome = conversation.input.requestDraftInitialization(binding, {
								prompt: formatAnnotation(t, result, false),
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
						showToast(quoted ? t("toast.quoted") : t("toast.injected"));
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
					dispose: function () {
						disposed = true;
						resize.disconnect();
						if (toastTimer !== 0) clearTimeout(toastTimer);
						button.remove();
						root.remove();
					}
				};
			}

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
		var inject = ["locale"];

		/**
		 * Register the copy and mount the annotation button over sidebar browser tabs.
		 * @param ctx - client plugin context.
		 */
		function apply(ctx) {
			var t = ctx.locale.bind(NS);
			ctx.effect(function () {
				return ctx.locale.register(NS, { zh: zh, en: en });
			}, "browser-element-picker: dictionaries");
			ctx.effect(function () {
				return install(ctx, t);
			}, "browser-element-picker: overlay");
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

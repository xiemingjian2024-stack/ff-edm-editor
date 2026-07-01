# EDM 搭建器界面改版实施计划

> **供执行人员使用：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，按任务逐项实施。所有步骤使用复选框跟踪状态。

**目标：** 将编辑器、草稿首页和导出弹窗统一改造成参考图式专业页面编辑工具，并用品牌色 `#FFAC33` 替换蓝色交互色。

**架构：** 保留现有业务状态、模板协议、Shopify 和导出模块，仅重组界面组件并建立共享视觉令牌。模板搜索保留在 `TemplateLibrary` 内，缩放状态保留在 `EditorPage` 内，只影响 `Canvas` 的显示比例。

**技术栈：** React、TypeScript、CSS、Vitest、Testing Library、Playwright、内置 SVG 图标。

---

## 任务 1：建立共享设计系统和 SVG 图标

**文件：**

- 创建：`src/ui/Icon.tsx`
- 创建：`src/ui/ToolButton.tsx`
- 创建：`src/ui/ui.css`
- 修改：`src/main.tsx`
- 测试：`src/ui/ToolButton.test.tsx`

- [ ] 先编写失败测试，确认图标按钮具有可访问名称、选中状态和禁用状态。
- [ ] 运行 `npm test -- src/ui/ToolButton.test.tsx`，确认因组件不存在而失败。
- [ ] 创建统一 SVG `Icon`，支持返回、楼层、草稿、素材、搜索、撤销、重做、预览、导出、缩放和上下移动。
- [ ] 创建 `ToolButton`，使用 `aria-pressed` 表示当前工具，使用原生 `disabled` 表示未开放工具。
- [ ] 在 `ui.css` 定义颜色、间距、圆角、阴影、焦点环、按钮和输入框令牌。
- [ ] 在 `main.tsx` 引入共享样式。
- [ ] 运行组件测试、类型检查和构建。
- [ ] 提交 `feat: add branded editor design system`。

## 任务 2：重构编辑器框架、模板搜索和缩放

**文件：**

- 创建：`src/editor/EditorToolbar.tsx`
- 创建：`src/editor/EditorRail.tsx`
- 修改：`src/editor/EditorPage.tsx`
- 修改：`src/editor/TemplateLibrary.tsx`
- 修改：`src/editor/Canvas.tsx`
- 修改：`src/editor/editor.css`
- 测试：`src/editor/EditorPage.test.tsx`
- 测试：`src/editor/TemplateLibrary.test.tsx`
- 测试：`src/editor/Canvas.test.tsx`

- [ ] 先增加失败测试：搜索“标题”只显示标题模板，搜索未知名称显示空结果。
- [ ] 先增加失败测试：选择 80% 缩放后，画布包装层显示 `scale(0.8)`，内部设计宽度仍为 375px。
- [ ] 运行三组测试并确认新测试失败。
- [ ] 创建 64px 顶部工具栏，左侧显示返回、品牌和名称，中间显示 `375 PX / 缩放值`，右侧显示撤销、重做、预览和品牌橙导出按钮。
- [ ] 创建 48px 左侧工具导航栏；楼层为当前项，草稿执行返回，素材保持禁用。
- [ ] 为模板面板增加“楼层 / 元素”标签、搜索框和空结果提示。“元素”显示暂未开放，不切换业务页面。
- [ ] 为画布增加 80%、100% 和 120% 缩放控制；缩放只应用于预览包装层。
- [ ] 将楼层操作从文字箭头改为统一 SVG 图标，并保留原有可访问名称。
- [ ] 重写编辑器布局 CSS，使桌面结构为 `48px + 240px + 中央画布 + 280px`。
- [ ] 运行编辑器测试、完整单元测试、类型检查和构建。
- [ ] 提交 `feat: redesign editor workspace`。

## 任务 3：重构属性面板

**文件：**

- 创建：`src/editor/InspectorSection.tsx`
- 修改：`src/editor/PropertyPanel.tsx`
- 修改：`src/editor/ProductSlotEditor.tsx`
- 修改：`src/editor/editor.css`
- 测试：`src/editor/EditorPage.test.tsx`

- [ ] 先增加失败测试，确认选中商品卡后出现“颜色”“商品”“操作”分组，且仍不出现字号和位置控件。
- [ ] 运行测试并确认分组尚不存在。
- [ ] 创建可复用 `InspectorSection`，用统一标题、分隔线和折叠图标呈现属性分组。
- [ ] 将文字和图片放入“内容”，颜色字段放入“颜色”，商品槽位放入“商品”，复制和删除放入“操作”。
- [ ] 调整 Shopify 输入、图库、错误提示和按钮，使其使用共享控件样式。
- [ ] 保持所有现有回调、字段 ID 和商品数据结构不变。
- [ ] 运行编辑器与商品槽位测试、类型检查和构建。
- [ ] 提交 `feat: redesign property inspector`。

## 任务 4：统一草稿首页和预览/导出弹窗

**文件：**

- 修改：`src/editor/DraftHome.tsx`
- 修改：`src/export/ExportDialog.tsx`
- 修改：`src/editor/editor.css`
- 测试：`src/editor/DraftHome.test.tsx`
- 测试：`src/export/ExportDialog.test.tsx`

- [ ] 先编写失败测试，确认草稿卡显示名称、楼层数量、修改时间和明确的打开按钮。
- [ ] 先编写失败测试，确认导出弹窗显示导出规格、分组检查结果和品牌主操作。
- [ ] 重构草稿首页顶栏、标题区和设计文件式草稿卡，保留 IndexedDB 行为。
- [ ] 重构弹窗顶部工具栏、左右预览结构、语义提示和底部操作。
- [ ] 使用品牌橙主按钮、白底次按钮、浅绿成功、浅橙提醒和浅红错误。
- [ ] 运行页面测试、完整单元测试、类型检查和构建。
- [ ] 提交 `feat: unify draft and export surfaces`。

## 任务 5：浏览器视觉验收与回归验证

**文件：**

- 修改：`e2e/editor.spec.ts`
- 创建：`test-results/visual/` 下的临时截图，验收后不提交。

- [ ] 扩展端到端流程，覆盖模板搜索、画布缩放、草稿恢复和完整预览。
- [ ] 运行 `npm test && npm run typecheck && npm run build && npm run test:e2e`。
- [ ] 使用应用内浏览器在 1280×720 检查草稿首页、混合楼层编辑器、商品属性和预览弹窗。
- [ ] 使用应用内浏览器在 1440×900 重复检查。
- [ ] 对照用户参考图检查顶栏、左右面板、中央画布、控件密度、字体、描边、橙色使用和选中状态。
- [ ] 检查控制台无错误，核心操作仍可用，375px 画布和导出逻辑未改变。
- [ ] 修复视觉或功能问题后再次运行完整验证。
- [ ] 删除临时截图并提交 `test: verify editor visual redesign`。

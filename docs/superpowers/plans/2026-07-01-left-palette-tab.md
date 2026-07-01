# 左侧配色 Tab 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 用左侧“配色”Tab 替换“元素”，并移除顶部配色入口。

**架构：** `TemplateLibrary` 管理“楼层 / 配色”视图状态并复用现有套餐数据；`EditorToolbar` 回归纯工具栏。套餐选择仍由 `EditorPage` 派发原有 reducer 动作。

**技术栈：** React、TypeScript、Vitest、Testing Library、Playwright

---

### 任务 1：移动配色入口

**文件：**
- 修改：`src/editor/TemplateLibrary.tsx`
- 修改：`src/editor/TemplateLibrary.test.tsx`
- 修改：`src/editor/EditorToolbar.tsx`
- 修改：`src/editor/EditorPage.tsx`
- 修改：`src/editor/EditorPage.test.tsx`
- 修改：`src/editor/editor.css`

- [ ] 先写失败测试：确认顶部没有配色按钮，左侧“配色”Tab 可显示 `FunnyFuzzy 经典`、主题色位 A/B/C，并可切回楼层模板。
- [ ] 运行 `npm test -- src/editor/TemplateLibrary.test.tsx src/editor/EditorPage.test.tsx`，确认因新 Tab 尚不存在而失败。
- [ ] 给 `TemplateLibrary` 增加 `paletteId`、`palettes`、`onPaletteChange`，并用本地 `activeTab` 在楼层和配色内容之间切换。
- [ ] 从 `EditorToolbar` 删除套餐参数和组件；由 `EditorPage` 将套餐数据传给 `TemplateLibrary`。
- [ ] 增加简版套餐卡样式，显示套餐名称、选中状态和每个色位的字母、色块、颜色值。
- [ ] 运行定向测试、全量测试、类型检查、构建和端到端测试。
- [ ] 在 `http://127.0.0.1:5174/` 验证顶部、Tab 切换和现有模板添加流程。
- [ ] 提交：`git commit -m "feat: move palette picker to library tabs"`。

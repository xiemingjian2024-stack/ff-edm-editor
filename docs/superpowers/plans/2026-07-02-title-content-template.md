# 标题文本常规模板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有标题模板替换为支持标题、描述、按钮、统一对齐和内容自适应高度的“标题文本-常规”。

**Architecture:** 沿用 `title-centered` 模板 ID，通过渲染层默认值兼容旧草稿；模板新增 `autoHeight` 声明，导出阶段读取真实 DOM 高度生成完整区域。颜色继续使用现有主题绑定机制，不增加链接字段。

**Tech Stack:** React、TypeScript、CSS、Zod、Vitest、Testing Library、Playwright

---

### Task 1: 替换标题模板内容

**Files:**
- Modify: `src/templates/registry.test.tsx`
- Modify: `src/templates/title-centered/index.tsx`
- Modify: `src/templates/templateStyles.css`

- [ ] **Step 1: 写失败测试**

在 `registry.test.tsx` 验证模板名称、字段、主题色位、可选元素隐藏和旧草稿渲染。

- [ ] **Step 2: 运行测试确认失败**

运行：`npm test -- src/templates/registry.test.tsx`

预期：模板仍名为“标题居中”，缺少描述、按钮和对齐字段。

- [ ] **Step 3: 实现模板**

模板字段包含 `title`、`description`、`buttonText`、`alignment`、`background`、`textColor`、`buttonBackground`、`buttonTextColor`。渲染器对缺失值使用默认回退，并在空字符串时隐藏元素。

- [ ] **Step 4: 添加自适应 CSS**

标题楼层使用 `padding: 36px 24px` 和纵向 flex 布局；标题限制 4 行，描述限制 6 行，按钮复用 `.banner-button` 尺寸规则。

- [ ] **Step 5: 运行模板测试**

运行：`npm test -- src/templates/registry.test.tsx`

预期：通过。

### Task 2: 支持真实高度导出

**Files:**
- Modify: `src/domain/edm.ts`
- Modify: `src/templates/schema.ts`
- Modify: `src/templates/schema.test.ts`
- Modify: `src/export/regions.ts`
- Modify: `src/export/regions.test.ts`
- Modify: `src/export/package.ts`

- [ ] **Step 1: 写失败测试**

验证 `autoHeight: true` 可通过模板校验，并验证 `getFloorExportRegions(template, floor, 224)` 返回高度 224 的完整区域。

- [ ] **Step 2: 运行测试确认失败**

运行：`npm test -- src/templates/schema.test.ts src/export/regions.test.ts`

预期：类型或断言因 `autoHeight` 尚未实现而失败。

- [ ] **Step 3: 实现自动高度声明与区域计算**

为 `FloorTemplate` 和模板 schema 增加可选布尔值 `autoHeight`；`getFloorExportRegions` 接受可选实际高度，仅对自动高度模板的整层区域替换高度。

- [ ] **Step 4: 导出使用 DOM 实际高度**

`exportDraftFromDom` 将 `node.clientHeight` 传给区域计算，并将 `RenderedFloor.height` 设置为实际高度的两倍。

- [ ] **Step 5: 运行导出测试**

运行：`npm test -- src/templates/schema.test.ts src/export/regions.test.ts src/export/render.test.ts`

预期：通过。

### Task 3: 页面流程与全量验证

**Files:**
- Modify: `e2e/editor.spec.ts`

- [ ] **Step 1: 添加页面流程测试**

新增标题模板，验证名称、默认内容、清空描述与按钮后元素隐藏、三种对齐可切换，并确认楼层高度随内容变化。

- [ ] **Step 2: 运行页面流程测试**

运行：`npm run test:e2e -- --grep "标题文本"`

预期：通过。

- [ ] **Step 3: 浏览器视觉检查**

在 `http://127.0.0.1:5174/` 检查默认布局、左右对齐、空元素隐藏和属性面板完整显示。

- [ ] **Step 4: 全量验证**

运行：`npm test && npm run typecheck && npm run build && npm run test:e2e`

预期：单元测试、类型检查、构建和全部页面流程通过。

- [ ] **Step 5: 提交**

```bash
git add src/domain/edm.ts src/templates/schema.ts src/templates/schema.test.ts src/templates/title-centered/index.tsx src/templates/templateStyles.css src/templates/registry.test.tsx src/export/regions.ts src/export/regions.test.ts src/export/package.ts e2e/editor.spec.ts docs/superpowers/plans/2026-07-02-title-content-template.md
git commit -m "feat: replace title content template"
```

# N×3 商品卡实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增固定三列、带五星和单行标题的 N×3 商品卡模板。

**Architecture:** 新模板独立注册，复用商品媒体、Canvas 回调和 DOM 分区导出。给商品槽位增加可选 `showPrice` 声明，由公共属性面板控制是否显示价格输入框，默认保持其他模板现状。

**Tech Stack:** React 19、TypeScript、CSS、Vitest、Testing Library、Vite

---

### Task 1: 支持商品槽位隐藏价格

**Files:** `src/domain/edm.ts`, `src/templates/schema.ts`, `src/editor/ProductSlotEditor.tsx`, `src/editor/PropertyPanel.tsx`, `src/editor/ProductSlotEditor.test.tsx`

- [ ] 先写 `showPrice={false}` 时没有价格输入框、默认仍显示价格的失败测试。
- [ ] 运行 `npm test -- src/editor/ProductSlotEditor.test.tsx` 确认失败。
- [ ] 给商品槽位 schema 增加可选 `showPrice`，给编辑器增加默认 true 的同名属性，PropertyPanel 传递槽位声明。
- [ ] 运行同一测试确认通过。

### Task 2: 注册并渲染 N×3

**Files:** `src/templates/product-grid-n-by-3/index.tsx`, `src/templates/registry.ts`, `src/templates/registry.test.tsx`, `src/templates/templateStyles.css`, `src/editor/TemplateLibrary.test.tsx`

- [ ] 先写模板注册、固定 3 槽位、无数量字段、三卡渲染、五星颜色和单行标题的失败测试。
- [ ] 运行 `npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx` 确认失败。
- [ ] 实现三列模板；三个槽位设置 `showPrice: false`；图片使用公共可编辑框架和 `contain`；卡片/图片区共用背景。
- [ ] 运行同一测试确认通过。

### Task 3: 验证导出与动态编辑

**Files:** `src/export/regions.test.ts`, `src/editor/EditorPage.test.tsx`

- [ ] 写标题、三张卡、底部按钮五个区域和三个商品链接测试。
- [ ] 写右侧固定三坑位且没有价格输入框测试。
- [ ] 运行 `npm test -- src/export/regions.test.ts src/editor/EditorPage.test.tsx` 并确认通过。

### Task 4: 缩略图与完整验证

**Files:** `src/assets/thumbnails/缩略图-商品卡-Nx3商品卡.svg`, `src/editor/TemplateLibrary.tsx`

- [ ] 创建 160×90 三列卡片缩略图并加入模板映射。
- [ ] 运行 `npm test`，预期 0 failures。
- [ ] 运行 `npm run build`，预期构建成功。
- [ ] 检查 `http://127.0.0.1:5174/` 返回 HTTP 200。
- [ ] 提交 `feat: add n by 3 product card template`。

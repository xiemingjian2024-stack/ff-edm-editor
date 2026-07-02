# 对比信息模板 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增“信息 / 对比信息”模板，并提供可复用的独立双图片上传、拖动、缩放与重置能力。

**Architecture:** 在模板定义中声明具名媒体槽位，楼层实例使用 `mediaSlots` 按槽位保存媒体状态；画布和属性面板通过槽位 ID 更新对应媒体。对比模板自身只负责固定布局、双图片区裁切、文字和附件图标，现有单媒体 Banner 保持不变。

**Tech Stack:** React、TypeScript、CSS、Zod、Vitest、Testing Library、Playwright

---

### Task 1: 可复用具名媒体槽位

**Files:**
- Modify: `src/domain/edm.ts`
- Modify: `src/templates/schema.ts`
- Modify: `src/templates/schema.test.ts`
- Modify: `src/editor/reducer.ts`
- Modify: `src/editor/reducer.test.ts`
- Modify: `src/editor/Canvas.tsx`
- Modify: `src/editor/EditorPage.tsx`
- Modify: `src/editor/PropertyPanel.tsx`
- Create: `src/editor/ManualMediaEditor.tsx`
- Create: `src/editor/ManualMediaEditor.test.tsx`
- Modify: `src/editor/EditableImageFrame.tsx`

- [ ] **Step 1:** 先写 schema、reducer 和手动媒体编辑器失败测试。
- [ ] **Step 2:** 运行 `npm test -- src/templates/schema.test.ts src/editor/reducer.test.ts src/editor/ManualMediaEditor.test.tsx`，确认因媒体槽位缺失而失败。
- [ ] **Step 3:** 增加 `MediaSlotDefinition`、`FloorTemplate.mediaSlots`、`FloorInstance.mediaSlots`、`FloorRenderProps.onMediaSlotChange` 和 reducer `updateMediaSlot`。
- [ ] **Step 4:** 实现 `ManualMediaEditor`，包含具名上传、100%–300%缩放和重置；上传仅写入本地 blob URL。
- [ ] **Step 5:** 将槽位更新接入 Canvas、EditorPage 和 PropertyPanel；EditableImageFrame 支持自定义占位提示。
- [ ] **Step 6:** 运行目标测试并确认通过。

### Task 2: 对比信息模板与素材

**Files:**
- Create: `src/templates/comparison-information/index.tsx`
- Modify: `src/templates/templateStyles.css`
- Modify: `src/templates/registry.ts`
- Modify: `src/templates/registry.test.tsx`
- Modify: `src/editor/TemplateLibrary.tsx`
- Modify: `src/editor/TemplateLibrary.test.tsx`
- Create: `src/assets/comparison/Before.svg`
- Create: `src/assets/comparison/After.svg`
- Create: `src/assets/comparison/VS.svg`

- [ ] **Step 1:** 写失败测试，验证新 `information` 分类、模板固定 375×420、字段、主题色位和两个媒体槽位。
- [ ] **Step 2:** 运行 `npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx`，确认模板未注册。
- [ ] **Step 3:** 将三个用户附件机械复制到项目素材目录，保持 SVG 内容不变。
- [ ] **Step 4:** 实现模板：固定标题区、斜向双图框、中央 VS、底部 Before/After 固定标签和三行描述。
- [ ] **Step 5:** 注册模板并增加左侧“信息”分组。
- [ ] **Step 6:** 运行目标测试并确认通过。

### Task 3: 验证与交付

**Files:**
- Modify: `e2e/editor.spec.ts`

- [ ] **Step 1:** 添加页面流程，验证信息分组、双上传入口、独立缩放、描述隐藏和固定 420px 高度。
- [ ] **Step 2:** 运行 `npm run test:e2e -- --grep "对比信息"`。
- [ ] **Step 3:** 在 `http://127.0.0.1:5174/` 进行视觉检查，确认斜向中缝、VS、底部图标、字号和颜色。
- [ ] **Step 4:** 运行 `npm test && npm run typecheck && npm run build && npm run test:e2e`。
- [ ] **Step 5:** 提交全部改动，提交信息为 `feat: add comparison information template`。

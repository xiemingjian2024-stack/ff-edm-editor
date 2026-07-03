# CODE 信息模板实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在信息分组新增固定 375×200px、只导出顶部与底部的 CODE 模板。

**Architecture:** CODE 模板使用独立组件和静态导出区域。顶部、CODE 占位和底部按 60/56/84px 固定布局；模板不启用整层导出和 DOM 动态区域，因此中间占位不会进入任何 JPG。

**Tech Stack:** React 19、TypeScript、CSS、Vitest、Testing Library、Vite

---

### Task 1: 注册 CODE 模板并加入信息分组

**Files:**
- Create: `src/templates/code-information/index.tsx`
- Modify: `src/templates/registry.ts`
- Modify: `src/templates/registry.test.tsx`
- Modify: `src/editor/TemplateLibrary.test.tsx`

- [ ] **Step 1: 写模板注册失败测试**

断言注册表存在 `code-information`，名称为 `CODE`、分类为 `information`、尺寸为 375×200、无商品和媒体槽位，并且只有背景字段绑定主题色位 A。

断言左侧信息分组显示“添加 CODE”按钮。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx`

Expected: FAIL，模板尚未注册。

- [ ] **Step 3: 创建模板定义并注册**

模板字段固定为：

```ts
topText, actionText, noteText, background, accentColor
```

默认值分别为参考图文案、`#FFFFFF` 和 `#FFAC33`。`themeColorFields` 只声明 background → A。

- [ ] **Step 4: 运行注册测试**

Run: `npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx`

Expected: PASS。

### Task 2: 实现三段固定视觉与单行文案

**Files:**
- Modify: `src/templates/code-information/index.tsx`
- Modify: `src/templates/templateStyles.css`
- Modify: `src/templates/registry.test.tsx`

- [ ] **Step 1: 写渲染失败测试**

渲染模板并断言：

- 顶部、CODE 占位和底部分别存在。
- 三处可编辑文案正确显示。
- action 文案、左右线条和箭头都应用 `accentColor`。
- 三处文案 CSS 都包含单行、溢出隐藏和省略号规则。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/templates/registry.test.tsx`

Expected: FAIL，组件尚未渲染完整结构。

- [ ] **Step 3: 实现模板和样式**

模板使用 `code-information-top`、`code-information-placeholder`、`code-information-bottom` 三个固定区域。箭头使用 CSS 边框旋转生成，不引入新图片资源；底部线条、箭头和行动文案读取同一个强调色。

- [ ] **Step 4: 运行渲染测试**

Run: `npm test -- src/templates/registry.test.tsx`

Expected: PASS。

### Task 3: 只导出顶部与底部

**Files:**
- Modify: `src/templates/code-information/index.tsx`
- Modify: `src/export/render.test.ts`
- Modify: `src/export/regions.test.ts`

- [ ] **Step 1: 写导出失败测试**

断言模板导出区域精确等于：

```ts
[
  { id: 'top', name: 'CODE 顶部', x: 0, y: 0, width: 375, height: 60 },
  { id: 'bottom', name: 'CODE 底部', x: 0, y: 116, width: 375, height: 84 },
]
```

缩放后尺寸为 750×120 和 750×168。断言没有 full 或 placeholder 导出区域，两个区域 URL 均为空。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/export/render.test.ts src/export/regions.test.ts`

Expected: FAIL，模板尚未声明导出区域。

- [ ] **Step 3: 加入固定导出区域**

设置 `exportFullImage: false`，只声明 top 和 bottom 两个静态区域，不启用 `domExportRegions`。

- [ ] **Step 4: 运行导出测试**

Run: `npm test -- src/export/render.test.ts src/export/regions.test.ts`

Expected: PASS。

### Task 4: 增加左侧缩略图

**Files:**
- Create: `src/assets/thumbnails/缩略图-信息-CODE.svg`
- Modify: `src/editor/TemplateLibrary.tsx`
- Modify: `src/editor/TemplateLibrary.test.tsx`

- [ ] **Step 1: 创建固定 160×90 SVG 缩略图**

缩略图只展示标题、CODE 框和底部强调线，使用现有模板缩略图的 `#EFF1F5 / #D2D4E4 / #FFAC33` 视觉语言。

- [ ] **Step 2: 映射缩略图**

导入 SVG 并将 `code-information` 加入 `thumbnails` 映射，避免显示空占位。

- [ ] **Step 3: 运行模板库测试**

Run: `npm test -- src/editor/TemplateLibrary.test.tsx`

Expected: PASS。

### Task 5: 完整验证与提交

**Files:**
- Verify: `src/templates/code-information/index.tsx`
- Verify: `src/templates/templateStyles.css`
- Verify: `src/templates/registry.ts`
- Verify: `src/editor/TemplateLibrary.tsx`
- Verify: `src/export/render.test.ts`
- Verify: `src/export/regions.test.ts`

- [ ] **Step 1: 运行完整测试**

Run: `npm test`

Expected: 0 failures。

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`

Expected: TypeScript 和 Vite 构建成功。

- [ ] **Step 3: 启动并检查本地预览**

Run: `npm run dev -- --host 127.0.0.1 --port 5174`

Expected: Vite ready；随后访问 `http://127.0.0.1:5174/` 返回 HTTP 200。

- [ ] **Step 4: 提交实现**

```bash
git add src/templates/code-information src/templates/registry.ts src/templates/registry.test.tsx src/templates/templateStyles.css src/assets/thumbnails/缩略图-信息-CODE.svg src/editor/TemplateLibrary.tsx src/editor/TemplateLibrary.test.tsx src/export/render.test.ts src/export/regions.test.ts docs/superpowers/plans/2026-07-03-code-information-template.md
git commit -m "feat: add code information template"
```

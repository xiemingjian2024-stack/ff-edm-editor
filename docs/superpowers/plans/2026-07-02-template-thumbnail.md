# 左侧模板预览图统一 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除楼层模板卡片中的主题色位标签，并将全部模板预览框统一为 160×90px 的 16:9 规范。

**Architecture:** 保持模板数据结构不变，只调整 `TemplateLibrary` 的展示内容和 `editor.css` 的卡片预览样式。通过组件测试验证标签被移除、每个预览框都带有统一的可测试标识。

**Tech Stack:** React、TypeScript、CSS、Vitest、Testing Library

---

### Task 1: 统一模板卡片内容与预览框

**Files:**
- Modify: `src/editor/TemplateLibrary.test.tsx`
- Modify: `src/editor/TemplateLibrary.tsx`
- Modify: `src/editor/editor.css`

- [ ] **Step 1: 写失败测试**

将原主题色位测试改为：

```tsx
it('模板卡片不展示主题色位且预览框使用统一标识', () => {
  render(<TemplateLibrary onAdd={() => {}} />)
  expect(screen.queryByText('主题色位 A')).not.toBeInTheDocument()
  const previews = screen.getAllByTestId('template-thumbnail')
  expect(previews).toHaveLength(screen.getAllByRole('button', { name: /添加/ }).length)
})
```

- [ ] **Step 2: 运行测试并确认失败**

运行：`npm test -- src/editor/TemplateLibrary.test.tsx`

预期：主题色位仍存在，且找不到 `template-thumbnail`。

- [ ] **Step 3: 最小实现**

在 `TemplateLibrary.tsx` 中删除 `themeColorFields` 标签映射，并为预览元素添加：

```tsx
<span data-testid="template-thumbnail" className={`template-mini template-mini--${definition.category}`}><i /></span>
```

在 `editor.css` 中统一预览框：

```css
.template-mini { width: 100%; aspect-ratio: 16 / 9; height: auto; }
.template-mini--head, .template-mini--title { height: auto; }
```

正式预览源文件统一为 160×90px；页面按卡片宽度等比缩放，未来图片使用 `width: 100%; height: 100%; object-fit: cover; object-position: center;`。

- [ ] **Step 4: 运行组件测试**

运行：`npm test -- src/editor/TemplateLibrary.test.tsx`

预期：全部通过。

- [ ] **Step 5: 运行全量验证**

运行：`npm test && npm run typecheck && npm run build && npm run test:e2e`

预期：全部测试通过，构建成功。

- [ ] **Step 6: 提交**

```bash
git add src/editor/TemplateLibrary.test.tsx src/editor/TemplateLibrary.tsx src/editor/editor.css docs/superpowers/plans/2026-07-02-template-thumbnail.md
git commit -m "feat: unify template thumbnails"
```

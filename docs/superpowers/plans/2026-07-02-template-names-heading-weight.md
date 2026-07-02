# 模板命名与主标题字重实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 更新两个模板的运营名称，并将三个模板的楼层主标题统一为常规字重 400。

**架构：** 保留现有模板 ID 和数据结构，仅修改模板定义中的显示/导出名称以及模板 CSS。通过注册测试和浏览器测试同时覆盖名称、旧草稿兼容及编辑/预览字重一致性。

**技术栈：** React 19、TypeScript、CSS、Vitest、Testing Library、Playwright。

---

### 任务 1：用失败测试固定新名称和常规字重

**文件：**
- 修改：`src/templates/registry.test.tsx`
- 修改：`e2e/editor.spec.ts`

- [ ] **步骤 1：修改模板注册测试**

将名称断言改为：

```tsx
expect(templateRegistry.find(item => item.definition.id === 'title-centered')?.definition.name).toBe('常规标题')
expect(templateRegistry.find(item => item.definition.id === 'selling-points-information')?.definition.name).toBe('多卖点信息')
```

增加 CSS 断言：

```tsx
expect(css).toContain('.title-content h2')
expect(css).toContain('.comparison-heading h2')
expect(css).toContain('.selling-points-heading h2')
expect(css.match(/font-weight: 400/g)).toHaveLength(3)
```

- [ ] **步骤 2：运行测试确认失败**

运行：`npm test -- src/templates/registry.test.tsx`

预期：旧名称及缺少 `font-weight: 400` 导致失败。

### 任务 2：更新模板名称和主标题字重

**文件：**
- 修改：`src/templates/title-centered/index.tsx`
- 修改：`src/templates/selling-points-information/index.tsx`
- 修改：`src/templates/templateStyles.css`
- 修改：`src/editor/TemplateLibrary.test.tsx`
- 修改：`src/editor/EditorPage.test.tsx`
- 修改：`e2e/editor.spec.ts`

- [ ] **步骤 1：更新模板定义**

在 `title-centered` 中设置：

```tsx
name: '常规标题'
exportRegions: [{ id: 'full', name: '常规标题', x: 0, y: 0, width: 375, height: 200 }]
```

在 `selling-points-information` 中设置：

```tsx
name: '多卖点信息'
exportRegions: [{ id: 'full', name: '多卖点信息', x: 0, y: 0, width: 375, height: 390 }]
```

- [ ] **步骤 2：设置主标题字重**

在 `src/templates/templateStyles.css` 的三个选择器中分别加入：

```css
font-weight: 400;
```

选择器为 `.title-content h2`、`.comparison-heading h2`、`.selling-points-heading h2`。

- [ ] **步骤 3：更新界面测试文案**

将运行时测试中的「标题文本-常规」替换为「常规标题」，将「卖点信息」替换为「多卖点信息」。历史设计文档不做机械改写。

- [ ] **步骤 4：运行单元测试**

运行：`npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx src/editor/EditorPage.test.tsx`

预期：全部通过。

### 任务 3：浏览器验证与提交

**文件：**
- 修改：`e2e/editor.spec.ts`

- [ ] **步骤 1：增加计算字重断言**

分别添加三个模板后断言：

```ts
await expect(page.getByTestId('title-content').locator('h2')).toHaveCSS('font-weight', '400')
await expect(page.getByTestId('comparison-information').locator('.comparison-heading h2')).toHaveCSS('font-weight', '400')
await expect(page.getByTestId('selling-points-information').locator('.selling-points-heading h2')).toHaveCSS('font-weight', '400')
```

- [ ] **步骤 2：运行全量验证**

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
git diff --check
```

预期：全部通过。

- [ ] **步骤 3：提交**

```bash
git add src/templates src/editor e2e/editor.spec.ts
git commit -m "fix: rename information templates and normalize headings"
```

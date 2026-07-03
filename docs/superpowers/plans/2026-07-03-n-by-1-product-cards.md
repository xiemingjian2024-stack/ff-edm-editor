# N×1 商品卡实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在商品卡分组新增支持 1 至 4 个商品、左右交替布局和独立卡片切图的 N×1 商品卡模板。

**Architecture:** 新模板放在独立目录，复用 `getActiveProductSlots`、`ProductSlotEditor`、DOM 导出区域和现有主题色绑定。模板预置 4 个稳定商品槽位；一个数量字段同时控制画布、右侧面板、验证和导出区域。

**Tech Stack:** React 19、TypeScript、CSS、Zod、Vitest、Testing Library、Vite

---

### Task 1: 注册 N×1 商品卡模板

**Files:**
- Create: `src/templates/product-list-n-by-1/index.tsx`
- Modify: `src/templates/registry.ts`
- Modify: `src/templates/registry.test.tsx`
- Modify: `src/editor/TemplateLibrary.test.tsx`

- [ ] **Step 1: 写模板注册失败测试**

在 `registry.test.tsx` 中断言：

```ts
const template = templateRegistry.find(item => item.definition.id === 'product-list-n-by-1')?.definition
expect(template?.name).toBe('N×1 商品卡')
expect(template?.productSlots).toHaveLength(4)
expect(template?.productSlotCountFieldId).toBe('productCount')
expect(template?.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
```

在 `TemplateLibrary.test.tsx` 中断言存在“添加 N×1 商品卡”按钮。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx`

Expected: FAIL，注册表与模板库中不存在 N×1。

- [ ] **Step 3: 创建模板定义并注册**

定义 4 个商品槽位、1/2/3/4 商品数量选项、标题、描述、底部主按钮、价格前缀、卡内按钮文案、楼层背景、文字颜色、按钮颜色和统一卡片背景。只把 `background` 绑定主题色位 A。

在 `registry.ts` 的商品卡分组末尾加入 `productListNBy1`。

- [ ] **Step 4: 运行注册测试**

Run: `npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx`

Expected: PASS。

### Task 2: 实现交替卡片布局与动态坑位

**Files:**
- Modify: `src/templates/product-list-n-by-1/index.tsx`
- Modify: `src/templates/templateStyles.css`
- Modify: `src/templates/registry.test.tsx`
- Test: `src/templates/registry.test.tsx`

- [ ] **Step 1: 写渲染失败测试**

创建 3 商品楼层并渲染模板，断言：

```ts
expect(screen.getAllByTestId('product-list-n-card')).toHaveLength(3)
expect(screen.getAllByTestId('product-list-n-card')[0]).toHaveClass('is-image-left')
expect(screen.getAllByTestId('product-list-n-card')[1]).toHaveClass('is-image-right')
expect(screen.getAllByTestId('product-list-n-card')[2]).toHaveClass('is-image-left')
```

同时断言卡片和图片区内联背景色相同，标题、价格和卡内按钮正确渲染。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/templates/registry.test.tsx`

Expected: FAIL，模板尚未渲染交替卡片。

- [ ] **Step 3: 实现模板渲染与样式**

使用 `getActiveProductSlots(template, floor)` 获取当前商品，按索引添加 `is-image-left` / `is-image-right`。每张卡包含等宽图片区和文案区；两者使用 `floor.values.cardBackground`。商品标题限制 3 行，卡内按钮为空时不渲染。

模板根节点使用自动高度和 24px 底部内边距，顶部标题区与底部主按钮复用 N×2 的公共类名和尺寸规则。

- [ ] **Step 4: 运行渲染测试**

Run: `npm test -- src/templates/registry.test.tsx`

Expected: PASS。

### Task 3: 验证动态导出区域和链接

**Files:**
- Modify: `src/export/regions.test.ts`
- Modify: `src/export/validate.test.ts`

- [ ] **Step 1: 写动态导出失败测试**

为 N×1 创建 3 商品楼层，断言 `getFloorExportRegions` 只返回 header、item-1、item-2、item-3、button；每个 item 的 `linkSlotId` 对应同序号商品。

再通过 `getRegionUrl` 断言商品卡区域返回对应 Shopify 链接。

- [ ] **Step 2: 运行导出测试并确认结果**

Run: `npm test -- src/export/regions.test.ts src/export/validate.test.ts`

Expected: 新增测试通过；公共动态商品区域逻辑无需增加模板特例。

- [ ] **Step 3: 运行相关测试**

Run: `npm test -- src/export/regions.test.ts src/export/validate.test.ts`

Expected: PASS。

### Task 4: 完整验证与提交

**Files:**
- Verify: `src/templates/product-list-n-by-1/index.tsx`
- Verify: `src/templates/registry.ts`
- Verify: `src/templates/templateStyles.css`
- Verify: `src/editor/TemplateLibrary.tsx`
- Verify: `src/export/regions.ts`
- Verify: `src/export/validate.ts`

- [ ] **Step 1: 运行完整测试**

Run: `npm test`

Expected: 0 failures。

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`

Expected: TypeScript 和 Vite 构建成功。

- [ ] **Step 3: 检查本地预览服务**

Run: `curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:5174/`

Expected: `200`。

- [ ] **Step 4: 提交实现**

```bash
git add src/templates/product-list-n-by-1 src/templates/registry.ts src/templates/registry.test.tsx src/templates/templateStyles.css src/editor/TemplateLibrary.test.tsx src/export/regions.test.ts src/export/validate.test.ts docs/superpowers/plans/2026-07-03-n-by-1-product-cards.md
git commit -m "feat: add n by 1 product card template"
```

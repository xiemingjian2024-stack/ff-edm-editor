# 商品卡手动编辑实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 N×2 商品卡在没有 Shopify 链接时也能手动填写图片、标题、价格和跳转链接，并允许覆盖自动读取结果。

**Architecture:** 保持现有 `ProductValue` 数据结构不变，在 `ProductSlotEditor` 中为缺省值创建空商品数据，使所有编辑入口始终渲染。图片操作复用 `MediaControlCard` 的上传、粘贴和图片直链交互，并把图片状态映射回商品的 `image` 字段；商品卡的 1:1 图片框架仍由模板控制。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite

---

### Task 1: 商品内容始终可手动填写

**Files:**
- Modify: `src/editor/ProductSlotEditor.tsx`
- Test: `src/editor/ProductSlotEditor.test.tsx`

- [ ] **Step 1: 写空商品状态的失败测试**

在 `ProductSlotEditor.test.tsx` 中渲染 `value={undefined}`，断言无需 Shopify 链接就能看到商品图片、商品标题、价格和跳转链接编辑入口；输入标题与价格后断言 `onChange` 收到完整的 `ProductValue`。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/editor/ProductSlotEditor.test.tsx`

Expected: FAIL，空商品状态下找不到手动编辑入口。

- [ ] **Step 3: 实现始终可编辑的文本字段**

在组件内建立空商品回退值：

```ts
const product: ProductValue = value ?? { image: '', title: '', price: '', url: '', gallery: [] }
```

始终渲染标题、价格和跳转链接输入框，并让 `update` 基于 `product` 生成下一份完整数据。

- [ ] **Step 4: 运行测试并确认文本编辑通过**

Run: `npm test -- src/editor/ProductSlotEditor.test.tsx`

Expected: PASS。

### Task 2: 商品图片支持完整手动操作

**Files:**
- Modify: `src/editor/ProductSlotEditor.tsx`
- Modify: `src/editor/editor.css`
- Test: `src/editor/ProductSlotEditor.test.tsx`

- [ ] **Step 1: 写图片手动操作的失败测试**

断言商品编辑器显示共享图片卡片；输入图片直链并点击“从链接获取”后，`onChange` 的 `image` 更新为该地址，同时保留标题、价格和跳转链接。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/editor/ProductSlotEditor.test.tsx`

Expected: FAIL，当前商品编辑器没有手动图片卡片。

- [ ] **Step 3: 复用共享图片卡片**

把商品图片映射成 `MediaState`：

```ts
const media = { image: product.image, url: '', scale: 1, offsetX: 0, offsetY: 0 }
```

将 `MediaControlCard` 的变更写回 `product.image`。商品卡当前只保存图片地址，因此缩放和位置控件在商品编辑器中隐藏；商品图片自身仍通过既有 1:1 框架展示。

- [ ] **Step 4: 运行商品编辑器测试**

Run: `npm test -- src/editor/ProductSlotEditor.test.tsx src/editor/MediaControlCard.test.tsx`

Expected: PASS。

### Task 3: 回归验证与提交

**Files:**
- Verify: `src/editor/ProductSlotEditor.tsx`
- Verify: `src/editor/ProductSlotEditor.test.tsx`
- Verify: `src/editor/editor.css`

- [ ] **Step 1: 运行完整测试**

Run: `npm test`

Expected: 所有测试通过，0 failures。

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`

Expected: TypeScript 与 Vite 构建成功，退出码为 0。

- [ ] **Step 3: 检查页面服务**

Run: `curl -I http://127.0.0.1:5174/`

Expected: HTTP 200。

- [ ] **Step 4: 提交实现**

```bash
git add src/editor/ProductSlotEditor.tsx src/editor/ProductSlotEditor.test.tsx src/editor/editor.css docs/superpowers/plans/2026-07-03-manual-product-card-editing.md
git commit -m "feat: allow manual product card editing"
```

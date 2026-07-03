# 商品卡图片缩放与移动实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 N×1 与 N×2 商品卡的每个商品图片增加独立缩放、重置和画布拖动，并让预览与导出复用相同变换。

**Architecture:** 在 `ProductValue` 上增加可选变换字段，并用一个纯函数模块统一填充旧数据默认值及把媒体状态写回商品。商品编辑器复用 `MediaControlCard`，两个商品模板复用 `EditableImageFrame`；Canvas 只负责把商品更新回调传给模板。

**Tech Stack:** React 19、TypeScript、Vitest、Testing Library、Vite

---

### Task 1: 建立兼容旧草稿的商品图片变换数据

**Files:**
- Modify: `src/domain/edm.ts`
- Create: `src/domain/productMedia.ts`
- Create: `src/domain/productMedia.test.ts`

- [ ] **Step 1: 写默认值与回写失败测试**

测试旧商品 `{ image, title, price, url }` 转为媒体状态后得到：

```ts
{ image: 'image.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 }
```

再测试媒体状态写回商品后保留标题、价格和 Shopify 链接，并更新 `imageScale / imageOffsetX / imageOffsetY`。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/domain/productMedia.test.ts`

Expected: FAIL，商品媒体转换函数不存在。

- [ ] **Step 3: 实现类型与纯函数**

在 `ProductValue` 增加：

```ts
imageScale?: number
imageOffsetX?: number
imageOffsetY?: number
```

导出 `getProductMedia(product)` 和 `withProductMedia(product, media)`，集中处理默认值，模板和编辑器不自行拼装变换字段。

- [ ] **Step 4: 运行领域测试**

Run: `npm test -- src/domain/productMedia.test.ts`

Expected: PASS。

### Task 2: 右侧商品图片显示缩放与重置控件

**Files:**
- Modify: `src/editor/ProductSlotEditor.tsx`
- Modify: `src/editor/ProductSlotEditor.test.tsx`

- [ ] **Step 1: 写缩放与更换图片失败测试**

渲染已有图片和非默认变换的商品，断言存在“商品 1 商品图片缩放”滑杆；修改为 150% 后，`onChange` 收到 `imageScale: 1.5`。再通过图片直链更换图片，断言新商品的缩放和偏移恢复为 `1 / 0 / 0`。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/editor/ProductSlotEditor.test.tsx`

Expected: FAIL，商品图片变换控件当前被隐藏。

- [ ] **Step 3: 接入商品媒体转换函数**

用 `getProductMedia(product)` 作为 `MediaControlCard` 的 value，移除 `showTransformControls={false}`。图片卡片变化时通过 `withProductMedia` 写回商品；当图片地址变化时，将变换重置后再写回。

Shopify 自动读取返回的新商品不包含变换字段，因此自然使用默认值。

- [ ] **Step 4: 运行商品编辑器测试**

Run: `npm test -- src/editor/ProductSlotEditor.test.tsx src/editor/MediaControlCard.test.tsx`

Expected: PASS。

### Task 3: 让公共图片框架支持 contain 与 cover

**Files:**
- Modify: `src/editor/EditableImageFrame.tsx`
- Modify: `src/editor/EditableImageFrame.test.tsx`

- [ ] **Step 1: 写适配模式失败测试**

渲染 `fit="contain"` 的图片框架，断言内部图片样式包含 `object-fit: contain`；未传 fit 时断言保持 `cover`。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/editor/EditableImageFrame.test.tsx`

Expected: FAIL，组件不接受 fit 属性。

- [ ] **Step 3: 增加 fit 属性**

给 `EditableImageFrame` 增加可选 `fit: 'cover' | 'contain'`，默认 `cover`，把值以内联 `objectFit` 应用到图片。现有 Banner 和信息模板不传该属性，视觉保持不变。

- [ ] **Step 4: 运行图片框架测试**

Run: `npm test -- src/editor/EditableImageFrame.test.tsx`

Expected: PASS。

### Task 4: 接通画布商品更新回调

**Files:**
- Modify: `src/domain/edm.ts`
- Modify: `src/editor/Canvas.tsx`
- Modify: `src/editor/EditorPage.tsx`
- Modify: `src/editor/Canvas.test.tsx`

- [ ] **Step 1: 写 Canvas 回调失败测试**

渲染包含 N×1 商品的 Canvas，传入 `onProductChange`，在商品图片框触发拖动，断言回调收到楼层 ID、商品槽位 ID 和更新后的商品变换。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/editor/Canvas.test.tsx`

Expected: FAIL，Canvas 尚未向模板传递商品更新回调。

- [ ] **Step 3: 扩展渲染接口并接入 reducer**

在 `FloorRenderProps` 增加：

```ts
onProductChange?: (slotId: string, value: ProductValue) => void
```

Canvas 增加 `(floorId, slotId, value)` 回调并传给 Renderer；EditorPage 将其转换为 `updateProduct` action。

- [ ] **Step 4: 运行 Canvas 测试**

Run: `npm test -- src/editor/Canvas.test.tsx`

Expected: PASS。

### Task 5: 两个商品模板使用可编辑图片框架

**Files:**
- Modify: `src/templates/product-grid-n-by-2/index.tsx`
- Modify: `src/templates/product-list-n-by-1/index.tsx`
- Modify: `src/templates/templateStyles.css`
- Modify: `src/templates/registry.test.tsx`

- [ ] **Step 1: 写模板图片变换失败测试**

分别渲染 N×1 和 N×2，商品设置 `imageScale: 1.4, imageOffsetX: 8, imageOffsetY: -6`，断言图片 transform 一致。断言 N×1 使用 contain，N×2 使用 cover；触发拖动后，对应模板的 `onProductChange` 收到正确槽位。

- [ ] **Step 2: 运行测试并确认失败**

Run: `npm test -- src/templates/registry.test.tsx`

Expected: FAIL，商品模板仍使用普通 img。

- [ ] **Step 3: 替换模板图片渲染**

两个模板都用 `getProductMedia` 和 `EditableImageFrame`。N×1 传 `fit="contain"`，N×2 传 `fit="cover"`；图片框变化时用 `withProductMedia` 更新当前商品。图片区容器设置相对定位，移除会覆盖公共图片框架的普通 img 尺寸规则。

- [ ] **Step 4: 运行模板和导出相关测试**

Run: `npm test -- src/templates/registry.test.tsx src/export/regions.test.ts src/export/render.test.ts`

Expected: PASS。

### Task 6: 完整验证与提交

**Files:**
- Verify: `src/domain/edm.ts`
- Verify: `src/domain/productMedia.ts`
- Verify: `src/editor/ProductSlotEditor.tsx`
- Verify: `src/editor/EditableImageFrame.tsx`
- Verify: `src/editor/Canvas.tsx`
- Verify: `src/editor/EditorPage.tsx`
- Verify: `src/templates/product-grid-n-by-2/index.tsx`
- Verify: `src/templates/product-list-n-by-1/index.tsx`

- [ ] **Step 1: 运行完整测试**

Run: `npm test`

Expected: 0 failures。

- [ ] **Step 2: 运行生产构建**

Run: `npm run build`

Expected: TypeScript 和 Vite 构建成功。

- [ ] **Step 3: 检查本地预览**

Run: `curl -sS -o /dev/null -w '%{http_code}' http://127.0.0.1:5174/`

Expected: `200`。

- [ ] **Step 4: 提交实现**

```bash
git add src/domain src/editor src/templates docs/superpowers/plans/2026-07-03-product-image-transforms.md
git commit -m "feat: add product image transforms"
```

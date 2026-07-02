# N×2 商品卡楼层实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 新增可显示 2/4/6/8 个 Shopify 商品、右侧坑位同步增减并逐卡切图的 N×2 商品卡楼层。

**架构：** 模板预置 8 个商品槽位，通过 `productCount` 控制画布、属性面板、校验和导出使用的槽位数量。商品卡在 DOM 上标记导出区域，导出管线读取实际元素边界生成精确裁切区域，避免自适应标题区导致坐标漂移。

**技术栈：** React 19、TypeScript、CSS、Vitest、Testing Library、Playwright、html-to-image、现有 Shopify 读取器。

---

### 任务 1：扩展动态商品槽位和 DOM 导出能力

**文件：**
- 修改：`src/domain/edm.ts`
- 修改：`src/templates/schema.ts`
- 修改：`src/editor/PropertyPanel.tsx`
- 修改：`src/export/validate.ts`
- 修改：`src/export/regions.ts`
- 修改：`src/export/package.ts`
- 测试：`src/export/validate.test.ts`
- 测试：`src/export/regions.test.ts`

- [ ] **步骤 1：编写失败测试**

增加动态槽位测试，断言 `productSlotCountFieldId: 'productCount'` 时只校验、显示并导出前 N 个槽位；增加 DOM 区域转换测试，输入卡片相对楼层的矩形后得到同尺寸 `ExportRegion`。

- [ ] **步骤 2：运行测试确认失败**

运行：`npm test -- src/export/validate.test.ts src/export/regions.test.ts`

预期：缺少动态商品槽位和 DOM 区域 API 导致失败。

- [ ] **步骤 3：增加模板元数据**

在 `FloorTemplate` 和 schema 增加：

```ts
productSlotCountFieldId?: string
domExportRegions?: boolean
```

`productSlotCountFieldId` 必须指向 choice 字段。

- [ ] **步骤 4：统一截取当前商品槽位**

新增：

```ts
export function getActiveProductSlots(template: FloorTemplate, floor: FloorInstance) {
  const count = template.productSlotCountFieldId ? Number(floor.values[template.productSlotCountFieldId]) : template.productSlots.length
  return template.productSlots.slice(0, Number.isFinite(count) ? count : template.productSlots.length)
}
```

属性面板和导出校验均使用该函数。

- [ ] **步骤 5：根据 DOM 读取卡片区域**

在导出时查询 `[data-export-region-id]`，通过元素与楼层的 `getBoundingClientRect()` 差值覆盖当前活动区域的 `x/y/width/height`；仍保留定义中的 `linkSlotId`，用于生成链接清单。

- [ ] **步骤 6：运行测试并提交**

运行：`npm test -- src/export/validate.test.ts src/export/regions.test.ts`

预期：全部通过。

```bash
git add src/domain src/templates/schema.ts src/editor/PropertyPanel.tsx src/export
git commit -m "feat: support dynamic product slots and dom export regions"
```

### 任务 2：注册并渲染 N×2 商品卡

**文件：**
- 新建：`src/templates/product-grid-n-by-2/index.tsx`
- 修改：`src/templates/registry.ts`
- 删除：`src/templates/product-grid-two/index.tsx`
- 修改：`src/templates/templateStyles.css`
- 复制：`src/assets/product-card/跳转.svg`
- 测试：`src/templates/registry.test.tsx`

- [ ] **步骤 1：编写失败的模板测试**

断言模板名称、2/4/6/8 选项、8 个商品槽位、主题色位 A、动态商品数量字段、DOM 导出开关和 8 个独立链接区域；同时断言注册表中不存在 `product-grid-two`。

- [ ] **步骤 2：运行测试确认失败**

运行：`npm test -- src/templates/registry.test.tsx`

预期：找不到 `product-grid-n-by-2`。

- [ ] **步骤 3：实现模板定义**

字段包括：标题、可选描述、按钮文案、商品数量、统一价格前缀、背景色、文字色、按钮背景色、按钮文字色。预置 `product-1` 至 `product-8`，默认数量 2，自动高度，楼层背景关联主题色位 A。

从 `src/templates/registry.ts` 删除原 `productGridTwo` 的导入与注册，并删除 `src/templates/product-grid-two/index.tsx`。商品卡分组只保留新模板。

- [ ] **步骤 4：实现渲染组件**

按活动数量渲染双列卡片。每张卡片结构为 1:1 图片、固定两行标题、价格前缀与价格、附件箭头；卡片根节点带 `data-export-region-id`。按钮位于楼层底部。

- [ ] **步骤 5：增加样式**

商品卡固定白色；标题使用两行 clamp 且设置固定两行 `min-height`；图片 1:1；网格、卡片间距和底部按钮按参考图实现。

- [ ] **步骤 6：运行测试并提交**

运行：`npm test -- src/templates/registry.test.tsx`

```bash
git add src/templates src/assets/product-card
git commit -m "feat: add n by 2 product card template"
```

### 任务 3：完善商品编辑器的可访问标签与动态坑位

**文件：**
- 修改：`src/editor/ProductSlotEditor.tsx`
- 修改：`src/editor/ProductSlotEditor.test.tsx`
- 测试：`e2e/editor.spec.ts`

- [ ] **步骤 1：编写失败测试**

断言商品标题、价格、跳转链接输入分别具有 `${label} 商品标题`、`${label} 价格`、`${label} 跳转链接` 标签；画布选择 2/4/6/8 时属性面板出现对应数量的 Shopify 链接输入。

- [ ] **步骤 2：运行测试确认失败**

运行：`npm test -- src/editor/ProductSlotEditor.test.tsx`

- [ ] **步骤 3：补齐标签并验证 Shopify 自动填充**

保持现有读取器逻辑，补齐输入标签；确认返回的 `title/image/price/url/gallery` 可继续逐项手动覆盖。

- [ ] **步骤 4：运行测试并提交**

运行：`npm test -- src/editor/ProductSlotEditor.test.tsx`

```bash
git add src/editor/ProductSlotEditor.tsx src/editor/ProductSlotEditor.test.tsx e2e/editor.spec.ts
git commit -m "test: cover dynamic product card editors"
```

### 任务 4：浏览器与导出回归

**文件：**
- 修改：`e2e/editor.spec.ts`

- [ ] **步骤 1：增加完整流程测试**

新建模板，切换 2/4/6/8，断言画布卡片与右侧坑位同步；修改统一价格前缀并清空；确认标题两行高度、卡片白色、楼层背景主题色；验证完整预览数量一致。

- [ ] **步骤 2：验证导出区域**

在浏览器中读取 8 张卡片的 DOM 区域，断言每个区域都位于楼层内且互不重叠；导出区域数量与选择数量一致，每个区域保留独立商品链接。

- [ ] **步骤 3：运行全量验证**

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
git diff --check
```

预期：全部通过。

- [ ] **步骤 4：提交**

```bash
git add e2e/editor.spec.ts
git commit -m "test: verify n by 2 product card workflow"
```

# 卖点信息楼层实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 在信息分组新增可切换 2/4 个卖点、支持四张图片独立编辑且整体高度自适应的「卖点信息」楼层。

**架构：** 新模板沿用 `FloorTemplate` 的字段、主题色位与命名媒体槽位结构，使用四个稳定媒体槽位保存图片，切换数量时只控制显示而不删除数据。渲染组件负责标题区、两列卖点网格和底部按钮；通用属性面板继续根据模板定义自动生成内容、图片和颜色编辑器。

**技术栈：** React 19、TypeScript、CSS、Vitest、Testing Library、Playwright、现有 `EditableImageFrame` 与导出管线。

---

## 文件结构

- 新建 `src/templates/selling-points-information/index.tsx`：模板定义与楼层渲染组件。
- 修改 `src/templates/registry.ts`：注册卖点信息模板。
- 修改 `src/templates/templateStyles.css`：卖点信息布局、1:1 图片、行数限制和自适应高度样式。
- 修改 `src/templates/registry.test.tsx`：模板定义、2/4 项渲染、可选内容和媒体槽位测试。
- 修改 `src/editor/PropertyPanel.test.tsx`：确认四张图片的独立编辑入口与 2/4 项切换字段。
- 修改 `e2e/editor.spec.ts`：覆盖实际添加、切换数量、编辑内容和独立图片控制。

### 任务 1：注册模板数据结构

**文件：**
- 新建：`src/templates/selling-points-information/index.tsx`
- 修改：`src/templates/registry.ts`
- 测试：`src/templates/registry.test.tsx`

- [ ] **步骤 1：编写失败的模板注册测试**

在 `src/templates/registry.test.tsx` 增加测试，断言：

```tsx
it('注册支持 2/4 项与四个媒体槽位的卖点信息模板', () => {
  const template = templateRegistry.find(item => item.definition.id === 'selling-points-information')?.definition
  expect(template?.category).toBe('information')
  expect(template?.autoHeight).toBe(true)
  expect(template?.fields.find(field => field.id === 'itemCount')).toMatchObject({
    type: 'choice',
    defaultValue: '2',
    options: [{ label: '2 个卖点', value: '2' }, { label: '4 个卖点', value: '4' }],
  })
  expect(template?.mediaSlots?.map(slot => slot.id)).toEqual(['point1', 'point2', 'point3', 'point4'])
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- src/templates/registry.test.tsx`

预期：失败，提示找不到 `selling-points-information`。

- [ ] **步骤 3：建立最小模板定义并注册**

在 `src/templates/selling-points-information/index.tsx` 定义模板：

```tsx
import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'

export function SellingPointsInformation({ floor }: FloorRenderProps) {
  return <section className="floor-render selling-points-information">{floor.values.title}</section>
}

export const sellingPointsInformation: RegisteredTemplate = {
  definition: {
    id: 'selling-points-information', version: 1, name: '卖点信息', category: 'information',
    designWidth: 375, designHeight: 390, autoHeight: true,
    fields: [
      { id: 'title', type: 'text', label: '标题', defaultValue: 'A Better Spot for Every Ride' },
      { id: 'description', type: 'text', label: '描述', defaultValue: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.' },
      { id: 'buttonText', type: 'text', label: '按钮文案', defaultValue: 'Shop Now' },
      { id: 'itemCount', type: 'choice', label: '卖点数量', defaultValue: '2', options: [{ label: '2 个卖点', value: '2' }, { label: '4 个卖点', value: '4' }] },
      ...Array.from({ length: 4 }, (_, index) => ([
        { id: `point${index + 1}Title`, type: 'text' as const, label: `卖点 ${index + 1} 标题`, defaultValue: index % 2 ? 'Sponge Support' : '360° Snug Comfort' },
        { id: `point${index + 1}Description`, type: 'text' as const, label: `卖点 ${index + 1} 描述`, defaultValue: index % 2 ? 'Soft, steady support to help them settle in for every ride.' : 'A cushioned, wraparound spot that helps ease travel anxiety.' },
      ])).flat(),
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
      { id: 'buttonBackground', type: 'color', label: '按钮背景颜色', defaultValue: '#000000' },
      { id: 'buttonTextColor', type: 'color', label: '按钮文字颜色', defaultValue: '#FFFFFF' },
    ],
    themeColorFields: [
      { fieldId: 'background', defaultSlot: 'A' },
      { fieldId: 'textColor', defaultSlot: 'B' },
      { fieldId: 'buttonBackground', defaultSlot: 'B' },
      { fieldId: 'buttonTextColor', defaultSlot: 'A' },
    ],
    mediaSlots: Array.from({ length: 4 }, (_, index) => ({ id: `point${index + 1}`, label: `卖点 ${index + 1} 图片` })),
    productSlots: [],
    exportRegions: [{ id: 'full', name: '卖点信息', x: 0, y: 0, width: 375, height: 390 }],
  },
  Renderer: SellingPointsInformation,
}
```

在 `src/templates/registry.ts` 导入并加入 `templateRegistry`。

- [ ] **步骤 4：运行注册测试并确认通过**

运行：`npm test -- src/templates/registry.test.tsx`

预期：模板注册测试通过。

- [ ] **步骤 5：提交模板骨架**

```bash
git add src/templates/selling-points-information/index.tsx src/templates/registry.ts src/templates/registry.test.tsx
git commit -m "feat: register selling points information template"
```

### 任务 2：实现自适应楼层渲染

**文件：**
- 修改：`src/templates/selling-points-information/index.tsx`
- 修改：`src/templates/templateStyles.css`
- 测试：`src/templates/registry.test.tsx`

- [ ] **步骤 1：编写失败的 2/4 项和可选内容测试**

增加测试，使用模板渲染器分别渲染 `itemCount: '2'` 与 `itemCount: '4'`，断言：

```tsx
expect(screen.getAllByTestId('selling-point')).toHaveLength(2)
expect(screen.queryByText('Shop Now')).not.toBeInTheDocument()
expect(screen.queryByText('Optional description')).not.toBeInTheDocument()
```

再次渲染四项数据后断言：

```tsx
expect(screen.getAllByTestId('selling-point')).toHaveLength(4)
expect(screen.getByText('Shop Now')).toHaveClass('selling-points-button')
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- src/templates/registry.test.tsx`

预期：失败，因为模板尚未输出卖点网格及底部按钮。

- [ ] **步骤 3：实现标题区、卖点网格和底部按钮**

在渲染器中按 `itemCount` 生成卖点：

```tsx
const count = floor.values.itemCount === '4' ? 4 : 2
const points = Array.from({ length: count }, (_, index) => ({
  id: `point${index + 1}`,
  title: floor.values[`point${index + 1}Title`],
  description: floor.values[`point${index + 1}Description`],
  media: floor.mediaSlots?.[`point${index + 1}`],
}))
```

结构固定为：

```tsx
<section className="floor-render selling-points-information" style={{ backgroundColor, color: textColor }}>
  <header className="selling-points-heading">标题与可选描述</header>
  <div className="selling-points-grid">卖点卡片</div>
  {buttonText ? <span className="banner-button selling-points-button">{buttonText}</span> : null}
</section>
```

每张图使用 `EditableImageFrame`，并调用 `onMediaSlotChange(point.id, value)`。

- [ ] **步骤 4：增加布局和行数限制样式**

在 `src/templates/templateStyles.css` 添加：

```css
.selling-points-information { display: flex; flex-direction: column; padding-bottom: 24px; }
.selling-points-heading { padding: 24px 24px 22px; text-align: center; }
.selling-points-heading h2 { margin: 0; font-size: 20px; line-height: 1.2; }
.selling-points-heading p { margin: 10px 0 0; font-size: 14px; line-height: 1.35; }
.selling-points-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 8px; }
.selling-point-media { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; }
.selling-point-copy { padding: 12px 12px 0; text-align: center; }
.selling-point-copy h3 { display: -webkit-box; overflow: hidden; margin: 0; font-size: 14px; line-height: 1.25; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.selling-point-copy p { display: -webkit-box; overflow: hidden; margin: 7px 0 0; font-size: 12px; line-height: 1.35; -webkit-box-orient: vertical; -webkit-line-clamp: 4; }
.selling-points-button { margin: 22px 24px 0; align-self: stretch; text-align: center; }
```

- [ ] **步骤 5：运行渲染测试并确认通过**

运行：`npm test -- src/templates/registry.test.tsx`

预期：2/4 项、可选描述、可选底部按钮测试通过。

- [ ] **步骤 6：提交渲染实现**

```bash
git add src/templates/selling-points-information/index.tsx src/templates/templateStyles.css src/templates/registry.test.tsx
git commit -m "feat: render adaptive selling points layout"
```

### 任务 3：验证编辑器中的独立图片控制

**文件：**
- 修改：`src/editor/PropertyPanel.test.tsx`
- 必要时修改：`src/editor/PropertyPanel.tsx`

- [ ] **步骤 1：编写失败的属性面板测试**

渲染卖点信息楼层，断言四个媒体编辑器及数量切换均存在：

```tsx
expect(screen.getByRole('button', { name: '2 个卖点' })).toBeVisible()
expect(screen.getByRole('button', { name: '4 个卖点' })).toBeVisible()
for (let index = 1; index <= 4; index += 1) {
  expect(screen.getByLabelText(`上传 卖点 ${index} 图片`)).toBeVisible()
  expect(screen.getByLabelText(`卖点 ${index} 图片缩放`)).toBeVisible()
  expect(screen.getByRole('button', { name: `重置 卖点 ${index} 图片位置` })).toBeVisible()
}
```

- [ ] **步骤 2：运行测试并确认结果**

运行：`npm test -- src/editor/PropertyPanel.test.tsx`

预期：如果通用属性面板已完整支持命名媒体槽位则直接通过；若失败，只针对缺少的语义标签或媒体槽位传递进行最小修正。

- [ ] **步骤 3：完成最小修正并验证回调隔离**

触发“卖点 3 图片缩放”，断言 `onMediaSlotChange` 只收到：

```tsx
expect(onMediaSlotChange).toHaveBeenCalledWith('point3', expect.objectContaining({ scale: 1.5 }))
```

运行：`npm test -- src/editor/PropertyPanel.test.tsx`

预期：全部通过。

- [ ] **步骤 4：提交编辑器验证**

```bash
git add src/editor/PropertyPanel.test.tsx src/editor/PropertyPanel.tsx
git commit -m "test: cover selling point media controls"
```

### 任务 4：增加浏览器流程与导出回归验证

**文件：**
- 修改：`e2e/editor.spec.ts`

- [ ] **步骤 1：编写卖点信息浏览器测试**

测试流程：新建草稿、添加卖点信息、切换为 4 个卖点、清空楼层描述与按钮，断言画布出现四个 1:1 图片框且不再显示描述与按钮；再填写按钮并打开完整预览，确认按钮位于网格之后。

关键断言：

```ts
await expect(page.getByTestId('selling-point')).toHaveCount(4)
await expect(page.getByTestId('selling-point-media')).toHaveCount(4)
await expect(page.getByText('Shop Now')).toHaveCount(0)
const preview = page.getByRole('dialog', { name: '完整预览' })
await expect(preview.getByTestId('selling-point')).toHaveCount(4)
```

- [ ] **步骤 2：运行浏览器测试并确认失败**

运行：`npm run test:e2e -- --grep "卖点信息"`

预期：初次失败于尚未补齐的可访问名称、测试标识或布局断言。

- [ ] **步骤 3：只补齐测试所需的稳定标识并再次运行**

在模板中保留：

```tsx
data-testid="selling-points-information"
data-testid="selling-point"
data-testid="selling-point-media"
```

运行：`npm run test:e2e -- --grep "卖点信息"`

预期：通过。

- [ ] **步骤 4：执行全量验证**

运行：

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
git diff --check
```

预期：全部通过，无 TypeScript 错误、构建错误或空白差异。

- [ ] **步骤 5：提交浏览器测试和最终修正**

```bash
git add e2e/editor.spec.ts src/templates/selling-points-information/index.tsx src/templates/templateStyles.css
git commit -m "test: verify selling points editor flow"
```


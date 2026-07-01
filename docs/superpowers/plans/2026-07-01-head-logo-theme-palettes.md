# HEAD Logo 模板与配色套餐实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 新增固定尺寸的 HEAD 品牌 Logo 模板，并让楼层背景可关联 EDM 级“配色套餐”的主题色位、手动覆盖及重新关联。

**架构：** 配色套餐放在独立注册表中，模板仅声明颜色字段默认关联的主题色位。草稿保存套餐 ID，楼层保存每个颜色字段的“主题关联或自定义覆盖”状态；画布、预览和导出统一先解析颜色，再交给现有模板渲染器。旧草稿在加载时迁移，已有颜色一律保留为自定义值。

**技术栈：** React、TypeScript、Vitest、Testing Library、IndexedDB、html-to-image、Playwright、Vite

---

## 文件结构

- 新建 `src/themes/palettes.ts`：配色套餐类型、经典套餐和查询函数。
- 新建 `src/themes/resolveThemeColor.ts`：主题颜色解析、楼层渲染值解析及旧草稿迁移。
- 新建 `src/themes/resolveThemeColor.test.ts`：解析优先级与迁移测试。
- 新建 `src/templates/head-brand-logo/index.tsx`：HEAD 品牌 Logo 模板定义和渲染器。
- 新建 `public/assets/brand-logo.svg`：项目内置品牌 Logo 素材。
- 新建 `src/editor/ThemePalettePicker.tsx`：顶部配色套餐入口。
- 修改 `src/domain/edm.ts`、`src/templates/schema.ts`：补充 HEAD、选项字段、主题色声明及草稿状态协议。
- 修改 `src/templates/registry.ts`、`src/editor/TemplateLibrary.tsx`：注册并展示 HEAD 模板和主题色位标签。
- 修改 `src/editor/reducer.ts`：新增套餐切换、颜色覆盖和重新关联动作。
- 修改 `src/editor/PropertyPanel.tsx`、`src/editor/EditorToolbar.tsx`、`src/editor/EditorPage.tsx`：接入主题状态交互。
- 修改 `src/editor/Canvas.tsx`、`src/export/ExportDialog.tsx`：统一使用解析后的楼层值。
- 修改 `src/storage/drafts.ts`：加载时迁移旧草稿。
- 修改相关测试和 `tests/editor.spec.ts`：覆盖完整使用与导出流程。

### 任务 1：建立配色套餐、主题关联和迁移协议

**文件：**
- 新建：`src/themes/palettes.ts`
- 新建：`src/themes/resolveThemeColor.ts`
- 新建：`src/themes/resolveThemeColor.test.ts`
- 修改：`src/domain/edm.ts`
- 修改：`src/templates/schema.ts`
- 修改：`src/templates/schema.test.ts`
- 修改：`src/storage/drafts.ts`
- 修改：`src/storage/drafts.test.ts`

- [ ] **步骤 1：先写主题解析和旧草稿迁移的失败测试**

```ts
it('按 自定义覆盖 > 套餐色位 > 字段默认值 解析颜色', () => {
  expect(resolveThemeColor({ mode: 'custom', color: '#123456' }, 'A', classicPalette, '#FFFFFF')).toBe('#123456')
  expect(resolveThemeColor({ mode: 'theme', slot: 'C' }, 'A', classicPalette, '#FFFFFF')).toBe('#FFAC33')
  expect(resolveThemeColor({ mode: 'theme', slot: 'D' }, 'A', classicPalette, '#ABCDEF')).toBe('#ABCDEF')
})

it('旧草稿补充经典套餐，并把已有颜色迁移为自定义覆盖', () => {
  const migrated = migrateDraftTheme(legacyDraft)
  expect(migrated.themePaletteId).toBe('funnyfuzzy-classic')
  expect(migrated.floors[0].themeColors?.background).toEqual({ mode: 'custom', color: '#EFEFEF' })
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- src/themes/resolveThemeColor.test.ts src/templates/schema.test.ts src/storage/drafts.test.ts`

预期：因主题类型、解析函数和迁移函数尚不存在而失败。

- [ ] **步骤 3：增加可扩展的数据类型和模板校验**

在 `src/domain/edm.ts` 中增加：

```ts
export type ThemeSlot = string
export interface ThemePalette { id: string; name: string; slots: Record<ThemeSlot, string> }
export type ThemeColorBinding =
  | { mode: 'theme'; slot: ThemeSlot }
  | { mode: 'custom'; color: string }

export type FieldDefinition =
  | { id: string; type: 'text'; label: string; defaultValue: string }
  | { id: string; type: 'color'; label: string; defaultValue: string }
  | { id: string; type: 'image'; label: string; defaultValue: string }
  | { id: string; type: 'choice'; label: string; defaultValue: string; options: Array<{ label: string; value: string }> }

export interface ThemeColorField { fieldId: string; defaultSlot: ThemeSlot }
```

同时：

```ts
export type TemplateCategory = 'head' | 'banner' | 'title' | 'product-card' | 'content' | 'promotion' | 'footer'

export interface FloorTemplate {
  // 保留现有字段
  themeColorFields?: ThemeColorField[]
}

export interface FloorInstance {
  // 保留现有字段
  themeColors?: Record<string, ThemeColorBinding>
}

export interface EdmDraft {
  // 保留现有字段
  themePaletteId: string
}
```

在 `src/templates/schema.ts` 增加 `choice` 字段和可选 `themeColorFields` 校验，并要求其 `fieldId` 指向一个 `color` 字段。

- [ ] **步骤 4：实现经典套餐和统一解析/迁移函数**

`src/themes/palettes.ts`：

```ts
export const classicPalette: ThemePalette = {
  id: 'funnyfuzzy-classic',
  name: 'FunnyFuzzy 经典',
  slots: { A: '#FFFFFF', B: '#000000', C: '#FFAC33' },
}

export const themePalettes = [classicPalette]
export const getThemePalette = (id: string) => themePalettes.find(item => item.id === id) ?? classicPalette
```

`src/themes/resolveThemeColor.ts` 导出：

```ts
export function resolveThemeColor(
  binding: ThemeColorBinding | undefined,
  defaultSlot: ThemeSlot,
  palette: ThemePalette,
  fallback: string,
): string {
  if (binding?.mode === 'custom') return binding.color
  return palette.slots[binding?.slot ?? defaultSlot] ?? fallback
}

export function resolveFloorForRender(floor: FloorInstance, template: FloorTemplate, palette: ThemePalette): FloorInstance
export function migrateDraftTheme(draft: EdmDraft | LegacyEdmDraft): EdmDraft
```

迁移规则只处理模板已声明的主题颜色字段：旧楼层存在的 `values[fieldId]` 写入 `{ mode: 'custom', color }`，不改变视觉；缺失值才建立默认主题关联。迁移保持幂等。

- [ ] **步骤 5：在草稿加载边界执行迁移并跑测试**

`src/storage/drafts.ts` 的 `getDraft` 与 `listDrafts` 返回前调用 `migrateDraftTheme`，保存时持久化新结构。

运行：`npm test -- src/themes/resolveThemeColor.test.ts src/templates/schema.test.ts src/storage/drafts.test.ts`

预期：全部通过。

- [ ] **步骤 6：提交协议层**

```bash
git add src/domain src/templates/schema.ts src/templates/schema.test.ts src/themes src/storage
git commit -m "feat: add theme palette domain model"
```

### 任务 2：新增 HEAD 品牌 Logo 模板

**文件：**
- 新建：`public/assets/brand-logo.svg`
- 新建：`src/templates/head-brand-logo/index.tsx`
- 修改：`src/templates/registry.ts`
- 修改：`src/templates/registry.test.tsx`
- 修改：`src/templates/templateStyles.css`
- 修改：`src/editor/TemplateLibrary.tsx`
- 修改：`src/editor/TemplateLibrary.test.tsx`

- [ ] **步骤 1：写模板定义和模板库展示的失败测试**

```ts
it('注册 375×56 的 HEAD 品牌 Logo 模板', () => {
  const template = getTemplate('head-brand-logo')!.definition
  expect(template.category).toBe('head')
  expect(template.designHeight).toBe(56)
  expect(template.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
  expect(template.exportRegions).toEqual([{ id: 'full', name: 'HEAD 品牌 Logo', x: 0, y: 0, width: 375, height: 56 }])
})
```

模板库测试确认出现 `HEAD` 分类、`品牌 Logo` 和 `主题色位 A` 标签。

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx`

预期：找不到 `head-brand-logo` 和 HEAD 分类。

- [ ] **步骤 3：复制原始 SVG 并创建模板**

将 `/Users/ff-sheji/Downloads/Brand logo.svg` 原样放入 `public/assets/brand-logo.svg`。模板定义为：

```ts
export const definition: FloorTemplate = {
  id: 'head-brand-logo',
  version: 1,
  name: '品牌 Logo',
  category: 'head',
  designWidth: 375,
  designHeight: 56,
  fields: [
    { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
    {
      id: 'logoColor', type: 'choice', label: 'Logo 颜色', defaultValue: '#000000',
      options: [{ label: '黑色', value: '#000000' }, { label: '白色', value: '#FFFFFF' }],
    },
  ],
  themeColorFields: [{ fieldId: 'background', defaultSlot: 'A' }],
  productSlots: [],
  exportRegions: [{ id: 'full', name: 'HEAD 品牌 Logo', x: 0, y: 0, width: 375, height: 56 }],
}
```

渲染器根节点固定 `375×56`，Logo `<img>` 固定 `90×30` 且居中；白色使用 `filter: invert(1)`，黑色不加滤镜。注册表加入该模板。

- [ ] **步骤 4：增加 HEAD 分类和主题色位标签**

`TemplateLibrary.tsx` 的分类名称映射增加 `head: 'HEAD'`，模板卡片从 `themeColorFields` 读取并显示 `主题色位 A`。

- [ ] **步骤 5：运行模板测试并提交**

运行：`npm test -- src/templates/registry.test.tsx src/editor/TemplateLibrary.test.tsx`

预期：全部通过。

```bash
git add public/assets/brand-logo.svg src/templates src/editor/TemplateLibrary.tsx src/editor/TemplateLibrary.test.tsx
git commit -m "feat: add HEAD brand logo template"
```

### 任务 3：接入编辑器的套餐切换、覆盖和重新关联

**文件：**
- 新建：`src/editor/ThemePalettePicker.tsx`
- 修改：`src/editor/reducer.ts`
- 修改：`src/editor/reducer.test.ts`
- 修改：`src/editor/EditorToolbar.tsx`
- 修改：`src/editor/EditorPage.tsx`
- 修改：`src/editor/PropertyPanel.tsx`
- 修改：`src/editor/EditorPage.test.tsx`
- 修改：`src/editor/editor.css`

- [ ] **步骤 1：写 reducer 状态转换的失败测试**

```ts
it('新增主题模板时建立默认色位关联', () => {
  const next = reducer(initialState, { type: 'addFloor', templateId: 'head-brand-logo' })
  expect(next.draft.floors[0].themeColors?.background).toEqual({ mode: 'theme', slot: 'A' })
})

it('手动改色后脱离主题，再重新关联', () => {
  const custom = reducer(stateWithHead, { type: 'overrideThemeColor', floorId: 'head-1', fieldId: 'background', color: '#EFEFEF' })
  expect(custom.draft.floors[0].themeColors?.background).toEqual({ mode: 'custom', color: '#EFEFEF' })
  const linked = reducer(custom, { type: 'relinkThemeColor', floorId: 'head-1', fieldId: 'background', slot: 'A' })
  expect(linked.draft.floors[0].themeColors?.background).toEqual({ mode: 'theme', slot: 'A' })
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- src/editor/reducer.test.ts src/editor/EditorPage.test.tsx`

预期：新动作和配色入口尚不存在。

- [ ] **步骤 3：实现 reducer 动作**

增加动作：

```ts
| { type: 'changeThemePalette'; paletteId: string }
| { type: 'overrideThemeColor'; floorId: string; fieldId: string; color: string }
| { type: 'relinkThemeColor'; floorId: string; fieldId: string; slot: ThemeSlot }
```

`createFloor` 根据模板的 `themeColorFields` 初始化 `themeColors`；`changeThemePalette` 仅更改 `draft.themePaletteId`，不重写楼层，因此自定义颜色天然保持不变。

- [ ] **步骤 4：实现顶部配色套餐入口**

`ThemePalettePicker` 接收：

```ts
interface ThemePalettePickerProps {
  value: string
  palettes: ThemePalette[]
  onChange: (paletteId: string) => void
}
```

入口显示“配色套餐”和当前套餐名；展开后显示 FunnyFuzzy 经典及 A/B/C 色块。`EditorPage` 把选择结果派发为 `changeThemePalette`。

- [ ] **步骤 5：扩展属性面板**

`choice` 字段渲染为互斥按钮，Logo 仅出现“黑色 / 白色”。主题颜色字段显示状态标签：关联时为 `主题色位 A`，覆盖时为 `自定义颜色`。颜色输入改变时派发 `overrideThemeColor`；自定义状态显示 `重新关联主题色位 A` 按钮并派发 `relinkThemeColor`。

- [ ] **步骤 6：运行编辑器测试并提交**

运行：`npm test -- src/editor/reducer.test.ts src/editor/EditorPage.test.tsx`

预期：全部通过。

```bash
git add src/editor
git commit -m "feat: add theme palette editor controls"
```

### 任务 4：让画布、预览和导出共享最终颜色

**文件：**
- 修改：`src/editor/Canvas.tsx`
- 修改：`src/editor/Canvas.test.tsx`
- 修改：`src/editor/EditorPage.tsx`
- 修改：`src/export/ExportDialog.tsx`
- 修改：`src/export/ExportDialog.test.tsx`
- 修改：`src/export/render.test.ts`

- [ ] **步骤 1：写统一渲染结果和 HEAD 导出尺寸的失败测试**

```ts
it('关联色位时画布使用套餐颜色，自定义后使用覆盖颜色', () => {
  render(<Canvas draft={draftWithHead} palette={classicPalette} {...props} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#FFFFFF' })
})

it('HEAD 完整楼层按 2 倍导出为 750×112', () => {
  const region = buildExportRegions(headTemplate.definition)[0]
  expect(region.outputWidth).toBe(750)
  expect(region.outputHeight).toBe(112)
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：`npm test -- src/editor/Canvas.test.tsx src/export/ExportDialog.test.tsx src/export/render.test.ts`

预期：Canvas 尚未接收套餐，HEAD 导出断言尚未满足。

- [ ] **步骤 3：统一在渲染入口解析楼层**

`Canvas` 和 `ExportDialog` 接收 `palette: ThemePalette`，在调用模板 Renderer 前统一执行：

```ts
const renderedFloor = resolveFloorForRender(floor, template.definition, palette)
return <template.Renderer floor={renderedFloor} template={template.definition} />
```

禁止在 HEAD 模板、预览或导出逻辑内另写颜色优先级，确保三个场景完全一致。

- [ ] **步骤 4：验证完整预览、黑白 Logo 与尺寸并提交**

运行：`npm test -- src/editor/Canvas.test.tsx src/export/ExportDialog.test.tsx src/export/render.test.ts`

预期：全部通过，HEAD 输出区域为 750×112。

```bash
git add src/editor/Canvas.tsx src/editor/Canvas.test.tsx src/editor/EditorPage.tsx src/export
git commit -m "feat: resolve theme colors in preview and export"
```

### 任务 5：全量回归与浏览器验收

**文件：**
- 修改：`tests/editor.spec.ts`
- 按验收结果修正：`src/editor/editor.css`、`src/templates/templateStyles.css`

- [ ] **步骤 1：补充端到端场景**

端到端测试依次验证：打开模板库 HEAD 分类、添加品牌 Logo、看到 375×56 楼层、切换 Logo 黑白、手动改背景后出现“自定义颜色”、重新关联 A、打开导出预览并确认楼层存在。

- [ ] **步骤 2：运行完整自动化验证**

运行：

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
```

预期：全部命令退出码为 0，无失败测试、类型错误或构建错误。

- [ ] **步骤 3：在浏览器进行视觉验收**

启动 `npm run dev -- --host 127.0.0.1 --port 5174`，在 1440px 视口检查：

- 顶部配色套餐入口不挤压已有工具。
- HEAD 卡片和属性面板都显示 `主题色位 A`。
- Logo 在 375×56 楼层内严格居中，视觉尺寸为 90×30。
- 黑白 Logo 在对应深浅背景上清晰。
- 完整预览和画布颜色一致。

- [ ] **步骤 4：提交验收测试与最终修正**

```bash
git add tests/editor.spec.ts src/editor/editor.css src/templates/templateStyles.css
git commit -m "test: cover HEAD logo theme workflow"
```


# 新增楼层模板说明

## 需要提供的设计资料

- 375px 宽的 Figma 楼层设计稿或清晰导出图。
- 使用的字体、图片和装饰素材。
- 允许运营修改的文字、文字颜色、纯色背景和图片字段。
- 商品槽位及每个槽位对应的标题、价格、图片和链接位置。
- 每个需要独立绑定链接的切图区域。

工具运行时不依赖 Figma 或 Figma MCP。

## 坐标规则

所有模板和切图坐标以 375px 设计宽度记录。导出时统一按 2 倍渲染。区域应共享边界，例如双列商品使用 `0–187.5` 和 `187.5–375`；导出后分别为 375px。

## 文件结构

每个模板位于 `src/templates/<template-id>/`，导出一个包含 `definition` 和 `Renderer` 的 `RegisteredTemplate`。完成后将模板加入 `src/templates/registry.ts`。

```tsx
export const productGridTwo: RegisteredTemplate = {
  definition: {
    id: 'product-grid-two',
    version: 1,
    name: '双列商品卡',
    category: 'product-card',
    designWidth: 375,
    designHeight: 280,
    fields: [
      { id: 'background', type: 'color', label: '背景色', defaultValue: '#ffffff' }
    ],
    productSlots: [
      { id: 'product-1', label: '商品 1' },
      { id: 'product-2', label: '商品 2' }
    ],
    exportRegions: [
      { id: 'item-1', name: '商品 1', x: 0, y: 0, width: 187.5, height: 280, linkSlotId: 'product-1' },
      { id: 'item-2', name: '商品 2', x: 187.5, y: 0, width: 187.5, height: 280, linkSlotId: 'product-2' }
    ]
  },
  Renderer: ProductGridTwo
}
```

## 验收

1. 运行 `npm test` 和 `npm run typecheck`。
2. 在编辑器中添加模板，检查默认内容和所有开放字段。
3. 按 2 倍导出，检查完整楼层尺寸和每个区域边界。
4. 检查 `link-manifest.csv` 与区域、商品链接一一对应。
5. 检查任意相邻楼层之间没有白线、重叠或裁切。

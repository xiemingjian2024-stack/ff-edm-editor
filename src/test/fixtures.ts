export const twoProductTemplate = {
  id: 'product-grid-two', version: 1, name: '双列商品卡', category: 'product-card',
  designWidth: 375, designHeight: 240,
  fields: [{ id: 'background', type: 'color', label: '背景色', defaultValue: '#ffffff' }],
  productSlots: [{ id: 'product-1', label: '商品 1' }, { id: 'product-2', label: '商品 2' }],
  exportRegions: [
    { id: 'item-1', name: '商品 1', x: 0, y: 0, width: 187.5, height: 240, linkSlotId: 'product-1' },
    { id: 'item-2', name: '商品 2', x: 187.5, y: 0, width: 187.5, height: 240, linkSlotId: 'product-2' }
  ]
} as const

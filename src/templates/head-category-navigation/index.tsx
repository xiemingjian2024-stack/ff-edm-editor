import type { FloorRenderProps, RegisteredTemplate } from '../../domain/edm'

function HeadCategoryNavigation({ floor }: FloorRenderProps) {
  const count = Math.min(4, Math.max(2, Number(floor.values.navigationCount) || 3))
  const items = (floor.navigationItems ?? []).slice(0, count)
  return <section
    className="floor-render head-category-navigation"
    data-testid="head-category-navigation"
    style={{ backgroundColor: floor.values.background, gridTemplateColumns: `repeat(${count}, 1fr)` }}
  >
    {items.map((item, index) => <div className="head-navigation-item" key={index} style={{ color: floor.values.textColor }}><span>{item.text}</span></div>)}
  </section>
}

export const headCategoryNavigation: RegisteredTemplate = {
  definition: {
    id: 'head-category-navigation', version: 1, name: '分类导航', category: 'head', designWidth: 375, designHeight: 46,
    fields: [
      { id: 'navigationCount', type: 'choice', label: '导航数量', defaultValue: '3', options: [{ label: '2 项', value: '2' }, { label: '3 项', value: '3' }, { label: '4 项', value: '4' }] },
      { id: 'background', type: 'color', label: '背景颜色', defaultValue: '#FFFFFF' },
      { id: 'textColor', type: 'color', label: '文字颜色', defaultValue: '#000000' },
    ],
    navigationConfig: {
      minItems: 2, maxItems: 4,
      defaultItems: [
        { text: 'Home', url: 'https://funnyfuzzy.com/' },
        { text: 'Carrier & Travel', url: 'https://funnyfuzzy.com/collections/travel-1' },
        { text: 'Couch Covers', url: 'https://funnyfuzzy.com/collections/couch-cover' },
        { text: 'New Category', url: '' },
      ],
    },
    exportFullImage: false,
    productSlots: [], exportRegions: [],
  },
  Renderer: HeadCategoryNavigation,
}

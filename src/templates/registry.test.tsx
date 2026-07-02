import { render, screen } from '@testing-library/react'
import { templateRegistry } from './registry'
import { readFileSync } from 'node:fs'

it('注册 HEAD、Banner、标题和商品卡模板', () => {
  expect(templateRegistry.map(item => item.definition.category)).toEqual(['head', 'head', 'banner', 'banner', 'banner', 'title', 'information', 'information', 'product-card'])
})

it('用 N×2 商品卡替换旧双列商品卡', () => {
  expect(templateRegistry.some(item => item.definition.id === 'product-grid-two')).toBe(false)
  const template = templateRegistry.find(item => item.definition.id === 'product-grid-n-by-2')?.definition
  expect(template?.name).toBe('N×2 商品卡')
  expect(template?.fields.find(field => field.id === 'productCount')).toMatchObject({ type: 'choice', defaultValue: '2', options: [{ label: '2 个商品', value: '2' }, { label: '4 个商品', value: '4' }, { label: '6 个商品', value: '6' }, { label: '8 个商品', value: '8' }] })
  expect(template?.productSlots).toHaveLength(8)
  expect(template?.productSlotCountFieldId).toBe('productCount')
  expect(template?.domExportRegions).toBe(true)
  expect(template?.exportRegions.map(region => region.id)).toEqual(['header', 'item-1', 'item-2', 'item-3', 'item-4', 'item-5', 'item-6', 'item-7', 'item-8', 'button'])
  expect(template?.themeColorFields).toContainEqual({ fieldId: 'background', defaultSlot: 'A' })
})

it('注册支持 2/4 项与四个媒体槽位的卖点信息模板', () => {
  const template = templateRegistry.find(item => item.definition.id === 'selling-points-information')?.definition
  expect(template?.category).toBe('information')
  expect(template?.autoHeight).toBe(true)
  expect(template?.fields.find(field => field.id === 'itemCount')).toMatchObject({ type: 'choice', defaultValue: '2', options: [{ label: '2 个卖点', value: '2' }, { label: '4 个卖点', value: '4' }] })
  expect(template?.mediaSlots?.map(slot => slot.id)).toEqual(['point1', 'point2', 'point3', 'point4'])
  expect(template?.mediaSlotCountFieldId).toBe('itemCount')
})

it('卖点信息按数量显示卖点并将按钮放在网格之后', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'selling-points-information')!
  const media = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }
  const floor = { id: 'points', templateId: entry.definition.id, values: { title: 'Title', description: '', buttonText: '', itemCount: '2', point1Title: 'One', point1Description: 'First', point2Title: 'Two', point2Description: 'Second', point3Title: 'Three', point3Description: 'Third', point4Title: 'Four', point4Description: 'Fourth', background: '#FFFFFF', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' }, products: {}, mediaSlots: { point1: media, point2: media, point3: media, point4: media } }
  const { rerender } = render(<entry.Renderer template={entry.definition} floor={floor} />)
  expect(screen.getAllByTestId('selling-point')).toHaveLength(2)
  expect(screen.queryByText('Shop Now')).not.toBeInTheDocument()
  rerender(<entry.Renderer template={entry.definition} floor={{ ...floor, values: { ...floor.values, itemCount: '4', buttonText: 'Shop Now' } }} />)
  expect(screen.getAllByTestId('selling-point')).toHaveLength(4)
  const button = screen.getByText('Shop Now')
  expect(button).toHaveClass('selling-points-button')
  expect(button.parentElement?.lastElementChild).toBe(button)
})

it('分类导航固定为 375×46 且只有背景关联主题色位', () => {
  const template = templateRegistry.find(item => item.definition.id === 'head-category-navigation')!.definition
  expect(template.designHeight).toBe(46)
  expect(template.exportFullImage).toBe(false)
  expect(template.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
  expect(template.navigationConfig?.defaultItems.slice(0, 3).map(item => item.text)).toEqual(['Home', 'Carrier & Travel', 'Couch Covers'])
})

it('注册两个新 Banner 并保留隐藏的旧 Banner', () => {
  const regular = templateRegistry.find(item => item.definition.id === 'banner-regular')!.definition
  const imageCopy = templateRegistry.find(item => item.definition.id === 'banner-image-copy')!.definition
  const legacy = templateRegistry.find(item => item.definition.id === 'banner-simple')!.definition
  expect(regular.designHeight).toBe(375)
  expect(regular.heightConfig).toEqual({ fieldId: 'height', min: 250, max: 600, offset: 0 })
  expect(regular.themeColorFields).toEqual([
    { fieldId: 'textColor', defaultSlot: 'A' }, { fieldId: 'buttonBackground', defaultSlot: 'C' }, { fieldId: 'buttonTextColor', defaultSlot: 'B' },
  ])
  expect(imageCopy.heightConfig).toEqual({ fieldId: 'imageHeight', min: 200, max: 500, offset: 180 })
  expect(legacy.hiddenInLibrary).toBe(true)
})

it('HEAD 品牌 Logo 使用固定尺寸和主题色位 A', () => {
  const template = templateRegistry.find(item => item.definition.id === 'head-brand-logo')!.definition
  expect(template.designHeight).toBe(56)
  expect(template.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
  expect(template.exportRegions).toEqual([{ id: 'full', name: 'HEAD 品牌 Logo', x: 0, y: 0, width: 375, height: 56 }])
})

it('标题文本常规模板包含内容、对齐、颜色和自适应高度配置', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'title-centered')!
  expect(entry.definition.name).toBe('常规标题')
  expect(entry.definition.autoHeight).toBe(true)
  expect(entry.definition.fields.map(field => field.id)).toEqual(['title', 'description', 'buttonText', 'alignment', 'background', 'textColor', 'buttonBackground', 'buttonTextColor'])
  expect(entry.definition.themeColorFields).toEqual([
    { fieldId: 'background', defaultSlot: 'A' }, { fieldId: 'textColor', defaultSlot: 'B' },
    { fieldId: 'buttonBackground', defaultSlot: 'B' }, { fieldId: 'buttonTextColor', defaultSlot: 'A' },
  ])
})

it('多卖点信息使用新名称且三个信息模板主标题为常规字重', () => {
  expect(templateRegistry.find(item => item.definition.id === 'selling-points-information')?.definition.name).toBe('多卖点信息')
  const css = readFileSync('src/templates/templateStyles.css', 'utf8')
  for (const selector of ['title-content', 'comparison-heading', 'selling-points-heading']) {
    expect(css).toMatch(new RegExp(`\\.${selector} h2 \\{[^}]*font-weight: 400`))
  }
})

it('标题文本模板隐藏空内容并兼容旧草稿字段', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'title-centered')!
  const { rerender } = render(<entry.Renderer template={entry.definition} floor={{ id: '1', templateId: entry.definition.id, values: { title: 'Summer Picks', textColor: '#111111', background: '#ffffff' }, products: {} }} />)
  expect(screen.getByText('Summer Picks')).toBeVisible()
  expect(screen.queryByText('SHOP NOW')).not.toBeInTheDocument()
  rerender(<entry.Renderer template={entry.definition} floor={{ id: '1', templateId: entry.definition.id, values: { title: '', description: '', buttonText: '', alignment: 'right', textColor: '#111111', background: '#ffffff', buttonBackground: '#000000', buttonTextColor: '#ffffff' }, products: {} }} />)
  expect(screen.getByTestId('title-content')).toHaveAttribute('data-alignment', 'right')
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
})

it('EDM 内容使用品牌字体变量', () => {
  const css = readFileSync('src/templates/templateStyles.css', 'utf8')
  expect(css).toContain('.floor-render, .floor-render *')
  expect(css).toContain('font-family: "Euclid Circular A"')
  expect(css).toContain('"Euclid Circular A"')
})

it('注册固定尺寸的对比信息模板与双媒体槽位', () => {
  const template = templateRegistry.find(item => item.definition.id === 'comparison-information')!.definition
  expect(template.name).toBe('对比信息')
  expect(template.category).toBe('information')
  expect(template.designHeight).toBe(420)
  expect(template.autoHeight).toBe(true)
  expect(template.mediaSlots).toEqual([{ id: 'before', label: 'Before 图片' }, { id: 'after', label: 'After 图片' }])
  expect(template.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'C' }, { fieldId: 'textColor', defaultSlot: 'B' }])
})

it('对比信息将文字颜色显式应用到标题、描述和结果文案', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'comparison-information')!
  const media = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }
  render(<entry.Renderer template={entry.definition} floor={{ id: 'comparison', templateId: entry.definition.id, values: { title: 'Title', description: 'Description', beforeDescription: 'Before copy', afterDescription: 'After copy', background: '#FFAC33', textColor: '#123456' }, products: {}, mediaSlots: { before: media, after: media } }} />)
  expect(screen.getByRole('heading', { name: 'Title' }).getAttribute('style')).toContain('color: rgb(18, 52, 86)')
  expect(screen.getByText('Description').getAttribute('style')).toContain('color: rgb(18, 52, 86)')
  expect(screen.getByText('Before copy').getAttribute('style')).toContain('color: rgb(18, 52, 86)')
  expect(screen.getByText('After copy').getAttribute('style')).toContain('color: rgb(18, 52, 86)')
})

it('对比信息上下间距与多卖点信息一致', () => {
  const css = readFileSync('src/templates/templateStyles.css', 'utf8')
  expect(css).toContain('.comparison-heading { min-width: 0; display: flex; flex-direction: column; justify-content: center; padding: 24px 24px 22px;')
  expect(css).toContain('padding: 12px 18px 24px;')
  expect(css).toContain('.comparison-result p { display: -webkit-box; overflow: hidden; margin: 7px 0 0;')
})

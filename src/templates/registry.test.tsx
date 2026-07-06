import { fireEvent, render, screen } from '@testing-library/react'
import { templateRegistry } from './registry'
import { readFileSync } from 'node:fs'

it('注册 HEAD、Banner、标题、信息、商品卡和页尾模板', () => {
  expect(templateRegistry.map(item => item.definition.category)).toEqual(['head', 'head', 'banner', 'banner', 'banner', 'title', 'information', 'information', 'information', 'information', 'product-card', 'product-card', 'product-card', 'footer'])
})

it('注册支持 1 至 6 条链接且固定上下图片的页尾模板', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'footer-links')!
  expect(entry.definition.name).toBe('页尾')
  expect(entry.definition.category).toBe('footer')
  expect(entry.definition.navigationConfig).toMatchObject({ minItems: 1, maxItems: 6 })
  expect(entry.definition.fields).toEqual([
    expect.objectContaining({ id: 'navigationCount', type: 'choice', defaultValue: '3' }),
  ])
  const floor = {
    id: 'footer', templateId: entry.definition.id, values: { navigationCount: '2' }, products: {},
    navigationItems: [{ text: 'HOME', url: '' }, { text: 'Travel Carriers', url: '' }, { text: 'Sofa Covers', url: '' }],
  }
  render(<entry.Renderer template={entry.definition} floor={floor} />)
  expect(screen.getByTestId('footer-showcase')).toHaveAttribute('src', expect.stringContaining('footer-showcase'))
  expect(screen.getAllByTestId('footer-link')).toHaveLength(2)
  expect(screen.getByTestId('footer-copy')).toHaveAttribute('src', expect.stringContaining('footer-copy'))
})

it('注册只绑定背景色位的 CODE 信息模板', () => {
  const template = templateRegistry.find(item => item.definition.id === 'code-information')?.definition
  expect(template?.name).toBe('CODE')
  expect(template?.category).toBe('information')
  expect(template?.designHeight).toBe(200)
  expect(template?.fields.map(field => field.id)).toEqual(['topText', 'actionText', 'noteText', 'background', 'accentColor'])
  expect(template?.productSlots).toEqual([])
  expect(template?.mediaSlots).toBeUndefined()
  expect(template?.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
})

it('CODE 模板渲染三段结构并让行动元素共用强调色', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'code-information')!
  const floor = { id: 'code', templateId: entry.definition.id, values: { topText: 'Copy Your Code', actionText: 'SAVE NOW', noteText: '*Selected Products Only', background: '#FFFFFF', accentColor: '#F59E0B' }, products: {} }
  const { container } = render(<entry.Renderer template={entry.definition} floor={floor} />)
  expect(screen.getByTestId('code-information-top')).toHaveTextContent('Copy Your Code')
  expect(screen.getByTestId('code-information-placeholder')).toBeVisible()
  expect(screen.getByTestId('code-information-bottom')).toHaveTextContent('SAVE NOW')
  expect(screen.getByTestId('code-information-bottom')).toHaveTextContent('*Selected Products Only')
  expect(container.querySelector('.code-information-action')).toHaveStyle({ color: '#F59E0B' })
  expect(container.querySelectorAll('.code-information-line')).toHaveLength(2)
  container.querySelectorAll('.code-information-line').forEach(line => expect(line).toHaveStyle({ backgroundColor: '#F59E0B' }))
  expect(container.querySelector('.code-information-arrow')).toHaveStyle({ borderColor: '#F59E0B' })
  const css = readFileSync('src/templates/templateStyles.css', 'utf8')
  for (const selector of ['code-information-title', 'code-information-action-text', 'code-information-note']) expect(css).toMatch(new RegExp(`\\.${selector} \\{[^}]*white-space: nowrap;[^}]*text-overflow: ellipsis;`))
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
  expect(template?.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
})

it('注册支持 1 至 4 个商品的 N×1 商品卡', () => {
  const template = templateRegistry.find(item => item.definition.id === 'product-list-n-by-1')?.definition
  expect(template?.name).toBe('N×1 商品卡')
  expect(template?.fields.find(field => field.id === 'productCount')).toMatchObject({ type: 'choice', defaultValue: '1', options: [{ label: '1 个商品', value: '1' }, { label: '2 个商品', value: '2' }, { label: '3 个商品', value: '3' }, { label: '4 个商品', value: '4' }] })
  expect(template?.productSlots).toHaveLength(4)
  expect(template?.productSlotCountFieldId).toBe('productCount')
  expect(template?.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
})

it('N×1 商品卡按商品数量左右交替并统一卡片与图片背景', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'product-list-n-by-1')!
  const floor = {
    id: 'product-list', templateId: entry.definition.id,
    values: { title: 'Title', description: 'Description', buttonText: 'See More', cardButtonText: 'Shop Now', productCount: '3', pricePrefix: 'From', background: '#FFFFFF', cardBackground: '#F5E1C9', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' },
    products: {
      'product-1': { image: 'one.png', title: 'One', price: '£10', url: '/one' },
      'product-2': { image: 'two.png', title: 'Two', price: '£20', url: '/two' },
      'product-3': { image: 'three.png', title: 'Three', price: '£30', url: '/three' },
    },
  }
  render(<entry.Renderer template={entry.definition} floor={floor} />)
  const cards = screen.getAllByTestId('product-list-n-card')
  expect(cards).toHaveLength(3)
  expect(cards[0]).toHaveClass('is-image-left')
  expect(cards[1]).toHaveClass('is-image-right')
  expect(cards[2]).toHaveClass('is-image-left')
  expect(cards[0]).toHaveStyle({ backgroundColor: '#F5E1C9' })
  expect(screen.getAllByTestId('product-list-n-image')[0]).toHaveStyle({ backgroundColor: '#F5E1C9' })
  expect(screen.getByText('From £10')).toBeVisible()
  expect(screen.getAllByText('Shop Now')).toHaveLength(3)
})

it('N×1 奇偶商品卡分别贴左右边且使用紧凑卡内按钮', () => {
  const css = readFileSync('src/templates/templateStyles.css', 'utf8')
  expect(css).toMatch(/\.product-list-n-card \{[^}]*width: calc\(100% - 12px\);/)
  expect(css).toMatch(/\.product-list-n-card\.is-image-left \{[^}]*justify-self: start;/)
  expect(css).toMatch(/\.product-list-n-card\.is-image-right \{[^}]*justify-self: end;/)
  expect(css).toMatch(/\.product-list-n-card-button \{[^}]*width: 112px;[^}]*height: 28px;/)
})

it('N×1 商品图片框使用透明底透出卡片背景', () => {
  const css = readFileSync('src/templates/templateStyles.css', 'utf8')
  expect(css).toMatch(/\.product-list-n-image \.editable-image-frame \{[^}]*background: transparent;/)
})

it('N×1 与 N×2 应用商品图片变换并上报各自商品槽位', () => {
  for (const [templateId, fit] of [['product-list-n-by-1', 'contain'], ['product-grid-n-by-2', 'cover']] as const) {
    const entry = templateRegistry.find(item => item.definition.id === templateId)!
    const onProductChange = vi.fn()
    const floor = {
      id: templateId, templateId,
      values: { title: 'Title', description: '', buttonText: '', cardButtonText: '', productCount: templateId === 'product-list-n-by-1' ? '1' : '2', pricePrefix: 'From', background: '#FFFFFF', cardBackground: '#F5E1C9', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' },
      products: { 'product-1': { image: 'product.png', title: 'Product', price: '$10', url: '/product', imageScale: 1.4, imageOffsetX: 8, imageOffsetY: -6 } },
    }
    const { unmount } = render(<entry.Renderer template={entry.definition} floor={floor} onProductChange={onProductChange} />)
    const frame = screen.getByLabelText(`${entry.definition.name} 商品 1 图片`)
    expect(frame.querySelector('img')).toHaveStyle({ objectFit: fit, transform: 'translate(-50%, -50%) translate(8px, -6px) scale(1.4)' })
    vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, width: templateId === 'product-list-n-by-1' ? 181.5 : 175.5, height: 160, top: 0, right: 181.5, bottom: 160, left: 0, toJSON: () => ({}) })
    fireEvent.pointerDown(frame, { pointerId: 1, clientX: 50, clientY: 50 })
    fireEvent.pointerMove(frame, { pointerId: 1, clientX: 60, clientY: 45 })
    expect(onProductChange).toHaveBeenCalledWith('product-1', expect.objectContaining({ imageOffsetX: expect.any(Number), imageOffsetY: expect.any(Number) }))
    unmount()
  }
})

it('注册固定三槽位且隐藏价格的 N×3 商品卡', () => {
  const template = templateRegistry.find(item => item.definition.id === 'product-grid-n-by-3')?.definition
  expect(template?.name).toBe('N×3 商品卡')
  expect(template?.productSlots).toEqual([
    { id: 'product-1', label: '商品 1', showPrice: false },
    { id: 'product-2', label: '商品 2', showPrice: false },
    { id: 'product-3', label: '商品 3', showPrice: false },
  ])
  expect(template?.productSlotCountFieldId).toBeUndefined()
  expect(template?.fields.some(field => field.id === 'pricePrefix')).toBe(false)
  expect(template?.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
})

it('N×3 渲染三张卡、固定五星和单行标题', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'product-grid-n-by-3')!
  const products = Object.fromEntries([1, 2, 3].map(index => [`product-${index}`, { image: `${index}.png`, title: `Product ${index}`, price: '', url: `/product-${index}` }]))
  const floor = { id: 'n3', templateId: entry.definition.id, values: { title: 'Title', description: '', buttonText: '', cardButtonText: 'SHOP NOW', background: '#FFFFFF', cardBackground: '#EEEEEE', starColor: '#F59E0B', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' }, products }
  const { container } = render(<entry.Renderer template={entry.definition} floor={floor} />)
  expect(screen.getAllByTestId('product-grid-n-by-3-card')).toHaveLength(3)
  expect(screen.getAllByLabelText('5 星')).toHaveLength(3)
  expect(screen.getAllByText('★★★★★')).toHaveLength(3)
  expect(screen.getAllByText('SHOP NOW')).toHaveLength(3)
  expect(container.querySelector('.product-grid-n-by-3-stars')).toHaveStyle({ color: '#F59E0B' })
  const css = readFileSync('src/templates/templateStyles.css', 'utf8')
  expect(css).toMatch(/\.product-grid-n-by-3-copy \{[^}]*text-align: center;/)
  expect(css).toMatch(/\.product-grid-n-by-3-title \{[^}]*white-space: nowrap;[^}]*text-overflow: ellipsis;/)
})

it('注册支持 2/4 项与四个媒体槽位的卖点信息模板', () => {
  const template = templateRegistry.find(item => item.definition.id === 'selling-points-information')?.definition
  expect(template?.category).toBe('information')
  expect(template?.autoHeight).toBe(true)
  expect(template?.fields.find(field => field.id === 'itemCount')).toMatchObject({ type: 'choice', defaultValue: '2', options: [{ label: '2 个卖点', value: '2' }, { label: '4 个卖点', value: '4' }] })
  expect(template?.mediaSlots?.map(slot => slot.id)).toEqual(['point1', 'point2', 'point3', 'point4'])
  expect(template?.mediaSlotCountFieldId).toBe('itemCount')
  expect(template?.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
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

it('注册单卖点信息模板及可调图片高度', () => {
  const template = templateRegistry.find(item => item.definition.id === 'single-selling-point-information')?.definition
  const sellingPoints = templateRegistry.find(item => item.definition.id === 'selling-points-information')?.definition
  expect(template?.name).toBe('单卖点信息')
  expect(template?.category).toBe('information')
  expect(template?.autoHeight).toBe(true)
  expect(template?.fields.find(field => field.id === 'imageHeight')).toMatchObject({ type: 'range', defaultValue: '200', min: 100, max: 300, step: 1, unit: 'px' })
  expect(template?.mediaSlots).toEqual([{ id: 'feature', label: '卖点图片' }])
  expect(template?.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
  expect(template?.exportRegions).toEqual([{ id: 'full', name: '单卖点信息', x: 0, y: 0, width: 375, height: 390 }])
})

it('单卖点信息按设置显示图片高度并将可选按钮放在图片之后', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'single-selling-point-information')!
  const media = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }
  const floor = { id: 'single-point', templateId: entry.definition.id, values: { title: 'Title', description: 'Description', buttonText: '', imageHeight: '200', background: '#FFFFFF', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' }, products: {}, mediaSlots: { feature: media } }
  const { rerender } = render(<entry.Renderer template={entry.definition} floor={floor} />)
  expect(screen.getByTestId('single-selling-point-media')).toHaveStyle({ height: '200px' })
  expect(screen.queryByText('Shop Now')).not.toBeInTheDocument()
  rerender(<entry.Renderer template={entry.definition} floor={{ ...floor, values: { ...floor.values, imageHeight: '300', buttonText: 'Shop Now' } }} />)
  expect(screen.getByTestId('single-selling-point-media')).toHaveStyle({ height: '300px' })
  const button = screen.getByText('Shop Now')
  expect(button).toHaveClass('single-selling-point-button')
  expect(button.parentElement?.lastElementChild).toBe(button)
  expect(readFileSync('src/templates/templateStyles.css', 'utf8')).toMatch(/\.single-selling-point-button \{[^}]*margin-top: 20px;/)
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
  expect(regular.themeColorFields).toEqual([])
  expect(imageCopy.heightConfig).toEqual({ fieldId: 'imageHeight', min: 200, max: 500, offset: 180 })
  expect(imageCopy.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
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
  expect(entry.definition.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
  expect(readFileSync('src/templates/templateStyles.css', 'utf8')).toMatch(/\.title-content \{[^}]*padding: 24px;/)
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
  expect(template.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'C' }])
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

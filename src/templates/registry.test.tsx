import { render, screen } from '@testing-library/react'
import { templateRegistry } from './registry'
import { readFileSync } from 'node:fs'

it('注册 HEAD、Banner、标题和商品卡模板', () => {
  expect(templateRegistry.map(item => item.definition.category)).toEqual(['head', 'head', 'banner', 'banner', 'banner', 'title', 'product-card'])
})

it('分类导航固定为 375×46 并关联主题色位 A/B', () => {
  const template = templateRegistry.find(item => item.definition.id === 'head-category-navigation')!.definition
  expect(template.designHeight).toBe(46)
  expect(template.exportFullImage).toBe(false)
  expect(template.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }, { fieldId: 'textColor', defaultSlot: 'B' }])
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
  expect(entry.definition.name).toBe('标题文本-常规')
  expect(entry.definition.autoHeight).toBe(true)
  expect(entry.definition.fields.map(field => field.id)).toEqual(['title', 'description', 'buttonText', 'alignment', 'background', 'textColor', 'buttonBackground', 'buttonTextColor'])
  expect(entry.definition.themeColorFields).toEqual([
    { fieldId: 'background', defaultSlot: 'A' }, { fieldId: 'textColor', defaultSlot: 'B' },
    { fieldId: 'buttonBackground', defaultSlot: 'B' }, { fieldId: 'buttonTextColor', defaultSlot: 'A' },
  ])
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
  expect(css).toContain('font-family: var(--edm-font-family)')
  expect(css).toContain('"Euclid Circular A"')
})

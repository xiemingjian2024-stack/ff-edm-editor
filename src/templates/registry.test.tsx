import { render, screen } from '@testing-library/react'
import { templateRegistry } from './registry'
import { readFileSync } from 'node:fs'

it('注册 HEAD、Banner、标题和商品卡模板', () => {
  expect(templateRegistry.map(item => item.definition.category)).toEqual(['head', 'banner', 'title', 'product-card'])
})

it('HEAD 品牌 Logo 使用固定尺寸和主题色位 A', () => {
  const template = templateRegistry.find(item => item.definition.id === 'head-brand-logo')!.definition
  expect(template.designHeight).toBe(56)
  expect(template.themeColorFields).toEqual([{ fieldId: 'background', defaultSlot: 'A' }])
  expect(template.exportRegions).toEqual([{ id: 'full', name: 'HEAD 品牌 Logo', x: 0, y: 0, width: 375, height: 56 }])
})

it('模板渲染修改后的文案', () => {
  const entry = templateRegistry.find(item => item.definition.id === 'title-centered')!
  render(<entry.Renderer template={entry.definition} floor={{ id: '1', templateId: entry.definition.id, values: { title: 'Summer Picks', textColor: '#111111', background: '#ffffff' }, products: {} }} />)
  expect(screen.getByText('Summer Picks')).toBeVisible()
})

it('EDM 内容使用品牌字体变量', () => {
  const css = readFileSync('src/templates/templateStyles.css', 'utf8')
  expect(css).toContain('font-family: var(--edm-font-family)')
  expect(css).toContain('"Euclid Circular A"')
})

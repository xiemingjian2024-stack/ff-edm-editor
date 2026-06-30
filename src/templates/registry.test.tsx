import { render, screen } from '@testing-library/react'
import { templateRegistry } from './registry'

it('注册 Banner、标题和商品卡模板', () => {
  expect(templateRegistry.map(item => item.definition.category)).toEqual(['banner', 'title', 'product-card'])
})

it('模板渲染修改后的文案', () => {
  const entry = templateRegistry[1]
  render(<entry.Renderer template={entry.definition} floor={{ id: '1', templateId: entry.definition.id, values: { title: 'Summer Picks', textColor: '#111111', background: '#ffffff' }, products: {} }} />)
  expect(screen.getByText('Summer Picks')).toBeVisible()
})

import { expect, it } from 'vitest'
import { buildProductGridNBy2EmailHtml } from './productGridNBy2Html'

it('N×2 商品卡输出在线图片、灰色占位背景和 HTML 圆形箭头', () => {
  const html = buildProductGridNBy2EmailHtml({
    id: 'products', templateId: 'product-grid-n-by-2',
    values: { title: 'Title', description: 'Description', productCount: '2', pricePrefix: 'From', background: '#FFFFFF', textColor: '#000000', buttonText: '' },
    products: {
      'product-1': { image: 'local-1.jpg', title: 'Bed one', price: '$10', url: 'https://funnyfuzzy.com/products/one' },
      'product-2': { image: 'local-2.jpg', title: 'Bed two', price: '$20', url: 'https://funnyfuzzy.com/products/two' },
    },
  }, ['https://cdn.example/one.jpg', 'https://cdn.example/two.jpg'])
  expect(html).toContain('src="https://cdn.example/one.jpg"')
  expect(html).toContain('bgcolor="#F0F0ED"')
  expect(html).toContain('arcsize="50%"')
  expect(html).toContain('border-radius:50%')
  expect(html).toContain('&#8250;')
  expect(html).toContain('alt=""')
  expect(html).not.toContain('local-1.jpg')
})

it('N×2 商品卡的 See More 按钮使用单独配置的链接', () => {
  const html = buildProductGridNBy2EmailHtml({
    id: 'products', templateId: 'product-grid-n-by-2',
    values: { title: '', description: '', productCount: '2', pricePrefix: '', buttonText: 'See More', buttonLink: 'https://funnyfuzzy.com/collections/all', background: '#FFFFFF' },
    products: {
      'product-1': { image: '1.jpg', title: 'One', price: '$10', url: 'https://funnyfuzzy.com/products/one' },
      'product-2': { image: '2.jpg', title: 'Two', price: '$20', url: 'https://funnyfuzzy.com/products/two' },
    },
  }, ['https://cdn.example/one.jpg', 'https://cdn.example/two.jpg'])
  expect(html).toContain('href="https://funnyfuzzy.com/collections/all"')
  expect(html).toContain('>See More</a>')
})

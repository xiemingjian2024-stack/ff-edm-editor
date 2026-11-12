import { expect, it } from 'vitest'
import type { FloorInstance } from '../domain/edm'
import { buildProductListNBy1EmailHtml } from './productListNBy1Html'
import { buildProductGridNBy3EmailHtml } from './productGridNBy3Html'
import { buildProductIntroductionCardsEmailHtml } from './productIntroductionCardsHtml'

const product = (index: number) => ({ image: `${index}.jpg`, title: `Product ${index}`, description: `Description ${index}`, price: `$${index}0`, url: `https://funnyfuzzy.com/products/${index}`, actionText: 'Shop Now' })
const products = Object.fromEntries([1, 2, 3, 4, 5].map(index => [`product-${index}`, product(index)]))
const base = (templateId: string, values: Record<string, string>): FloorInstance => ({ id: 'floor', templateId, values: { title: 'Products', description: 'Description', buttonText: 'See More', buttonLink: 'https://funnyfuzzy.com/collections/all', background: '#FFFFFF', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF', ...values }, products })

it('N×1 商品卡输出对应商品链接和独立主按钮链接', () => {
  const html = buildProductListNBy1EmailHtml(base('product-list-n-by-1', { productCount: '2', cardButtonText: 'Shop Now', pricePrefix: 'From' }), ['https://cdn/1.jpg', 'https://cdn/2.jpg'])
  expect(html).toContain('src="https://cdn/1.jpg"')
  expect(html).toContain('href="https://funnyfuzzy.com/products/1"')
  expect(html).toContain('href="https://funnyfuzzy.com/collections/all"')
  expect(html).toContain('width="97%"')
  expect(html).toContain('display:table-cell!important')
  expect(html).not.toContain('border-spacing')
})

it('N×3 商品卡输出三张在线图片和商品链接', () => {
  const html = buildProductGridNBy3EmailHtml(base('product-grid-n-by-3', { cardButtonText: 'SHOP NOW', cardBackground: '#EEEEEE', starColor: '#FFAC33' }), ['https://cdn/1.jpg', 'https://cdn/2.jpg', 'https://cdn/3.jpg'])
  expect(html.match(/src="https:\/\/cdn\//g)).toHaveLength(3)
  expect(html).toContain('href="https://funnyfuzzy.com/products/3"')
  expect(html).toContain('table-layout:fixed')
  expect(html).toContain('display:table-cell!important')
  expect(html).toContain('padding:0 3px')
  expect(html).not.toContain('border-spacing')
})

it('产品介绍卡使用 HTML 圆形箭头并保留每张商品链接', () => {
  const html = buildProductIntroductionCardsEmailHtml(base('product-introduction-cards', { productCount: '2', cardBackground: '#F3F3F3' }), ['https://cdn/1.jpg', 'https://cdn/2.jpg'])
  expect(html).toContain('arcsize="50%"')
  expect(html).toContain('&#8250;')
  expect(html).toContain('href="https://funnyfuzzy.com/products/2"')
  expect(html).toContain('valign="bottom"')
  expect(html).toContain('height="180"')
  expect(html).toContain('display:table-cell!important')
  expect(html).not.toContain('height:360px')
  expect(html).not.toContain('border-spacing')
})

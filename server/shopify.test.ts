import { buildProductJsonUrl, normalizeShopifyProduct } from './shopify'

it('从商品页生成 Shopify JSON 地址', () => {
  expect(buildProductJsonUrl('https://shop.example.com/products/cloud-bed?variant=123').toString()).toBe('https://shop.example.com/products/cloud-bed.js?variant=123')
})

it('标准化商品和指定变体价格', () => {
  const result = normalizeShopifyProduct({ title: 'Cloud Bed', featured_image: '//cdn.example/a.jpg', images: ['//cdn.example/a.jpg', '//cdn.example/b.jpg'], variants: [{ id: 1, price: 12900 }, { id: 123, price: 9900 }] }, 'https://shop.example.com/products/cloud-bed?variant=123')
  expect(result).toMatchObject({ title: 'Cloud Bed', price: '99.00', image: 'https://cdn.example/a.jpg' })
})

it('拒绝 localhost', () => {
  expect(() => buildProductJsonUrl('http://localhost/products/test')).toThrow(/不允许/)
})

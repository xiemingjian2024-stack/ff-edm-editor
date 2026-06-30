import { fetchShopifyProduct } from './client'

it('请求商品读取接口', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ title: 'Cloud Bed', image: 'a.jpg', gallery: ['a.jpg'], price: '99.00', url: 'https://shop.test/products/a' }) })
  const result = await fetchShopifyProduct('https://shop.test/products/a', fetcher as typeof fetch)
  expect(result.title).toBe('Cloud Bed')
  expect(fetcher).toHaveBeenCalledWith('/api/shopify/product', expect.objectContaining({ method: 'POST' }))
})

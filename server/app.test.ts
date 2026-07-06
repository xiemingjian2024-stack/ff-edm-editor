import type { AddressInfo } from 'node:net'
import { afterEach, expect, it, vi } from 'vitest'
import { createShopifyApp } from './app'

const servers: Array<ReturnType<ReturnType<typeof createShopifyApp>['listen']>> = []
afterEach(async () => { await Promise.all(servers.splice(0).map(server => new Promise<void>(resolve => server.close(() => resolve())))) })

it('提供可由网页直接调用的 Shopify 商品接口', async () => {
  const reader = vi.fn().mockResolvedValue({ title: 'Cloud Bed', image: 'a.jpg', gallery: ['a.jpg'], price: '99.00', url: 'https://shop.test/products/cloud-bed' })
  const server = createShopifyApp(reader).listen(0, '127.0.0.1'); servers.push(server)
  await new Promise<void>(resolve => server.once('listening', () => resolve()))
  const { port } = server.address() as AddressInfo

  const response = await fetch(`http://127.0.0.1:${port}/api/shopify/product`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: 'https://shop.test/products/cloud-bed' }) })

  expect(response.status).toBe(200)
  expect(await response.json()).toMatchObject({ title: 'Cloud Bed', price: '99.00' })
  expect(reader).toHaveBeenCalledWith('https://shop.test/products/cloud-bed')
})

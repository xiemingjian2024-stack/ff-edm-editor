import { afterEach, expect, it } from 'vitest'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createLocalApp } from './local-app.mjs'
import { buildProductAdminJsonUrl, readShopifyProduct } from './local-app.mjs'

const servers = []
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise(resolve => server.close(resolve))))
})

it('读取 Shopify 商品时使用浏览器请求头降低 429 限流', async () => {
  const calls = []
  const fetcher = async (url, options) => {
    calls.push({ url: String(url), options })
    if (String(url).endsWith('/cart.js')) return { ok: true, json: async () => ({ currency: 'GBP' }) }
    return { ok: true, json: async () => ({ title: 'Urban Voyager', featured_image: '//cdn.test/bed.jpg', images: [], variants: [{ price: 8499 }] }) }
  }

  await expect(readShopifyProduct('https://funnyfuzzy.co.uk/products/deluxe-faux-leather-dog-car-seat-booster-bed-urban-voyager', fetcher)).resolves.toMatchObject({
    title: 'Urban Voyager',
    image: 'https://cdn.test/bed.jpg',
    price: '£84.99',
  })
  expect(calls[0].options.headers['user-agent']).toContain('Mozilla/5.0')
  expect(calls[0].options.headers.accept).toContain('application/json')
})

it('Shopify 商品接口遇到 429 会自动重试', async () => {
  let productAttempts = 0
  const fetcher = async url => {
    if (String(url).includes('/cart.js')) return { ok: true, json: async () => ({ currency: 'GBP' }) }
    productAttempts += 1
    if (productAttempts === 1) return { ok: false, status: 429, json: async () => ({}) }
    return { ok: true, json: async () => ({ title: 'Retry Bed', featured_image: 'bed.jpg', images: [], variants: [{ price: 12999 }] }) }
  }

  await expect(readShopifyProduct('https://funnyfuzzy.co.uk/products/retry-bed', fetcher)).resolves.toMatchObject({ title: 'Retry Bed', price: '£129.99' })
  expect(productAttempts).toBe(2)
})

it('Shopify .js 持续限流时回退到 .json 商品接口', async () => {
  const urls = []
  const fetcher = async url => {
    urls.push(String(url))
    if (url.pathname.endsWith('/cart.js')) return { ok: true, json: async () => ({ currency: 'GBP' }) }
    if (url.pathname.endsWith('.js')) return { ok: false, status: 429, json: async () => ({}) }
    return { ok: true, json: async () => ({ product: { title: 'Fallback Bed', image: { src: '//cdn.test/fallback.jpg' }, images: [], variants: [{ price: '84.99' }] } }) }
  }

  await expect(readShopifyProduct('https://funnyfuzzy.co.uk/products/fallback-bed', fetcher)).resolves.toMatchObject({
    title: 'Fallback Bed',
    image: 'https://cdn.test/fallback.jpg',
    price: '£84.99',
  })
  expect(urls.some(url => url.includes('/products/fallback-bed.json'))).toBe(true)
  expect(String(buildProductAdminJsonUrl('https://funnyfuzzy.co.uk/products/fallback-bed'))).toContain('/products/fallback-bed.json')
})

it('本地服务同时提供构建页面和 Shopify 商品读取接口', async () => {
  const distDir = await mkdtemp(join(tmpdir(), 'edm-local-dist-'))
  await writeFile(join(distDir, 'index.html'), '<main>EDM EDITOR</main>')
  const reader = async url => ({ title: 'Dog Bed', image: 'dog.jpg', gallery: ['dog.jpg'], price: '£10.00', url })
  const server = createLocalApp({ distDir, reader }).listen(0, '127.0.0.1')
  servers.push(server)
  await new Promise(resolve => server.once('listening', resolve))
  const { port } = server.address()

  await expect(fetch(`http://127.0.0.1:${port}/`).then(response => response.text())).resolves.toContain('EDM EDITOR')
  await expect(fetch(`http://127.0.0.1:${port}/api/shopify/product`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: 'https://shop.example/products/dog-bed' }),
  }).then(response => response.json())).resolves.toMatchObject({ title: 'Dog Bed', price: '£10.00' })
})

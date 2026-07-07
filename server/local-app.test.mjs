import { afterEach, expect, it } from 'vitest'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { createLocalApp } from './local-app.mjs'

const servers = []
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise(resolve => server.close(resolve))))
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

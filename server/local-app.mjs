import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFile } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDistDir = resolve(__dirname, '..', 'dist')

const blockedHost = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)$/i
const currencySymbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', HKD: 'HK$', SGD: 'S$' }

export function buildProductJsonUrl(input) {
  const url = new URL(input)
  if (!['http:', 'https:'].includes(url.protocol) || blockedHost.test(url.hostname)) throw new Error('该商品地址不允许读取')
  const match = url.pathname.match(/^(.*\/products\/[^/]+)/)
  if (!match) throw new Error('不是有效的 Shopify 商品地址')
  url.pathname = `${match[1]}.js`
  url.search = url.searchParams.get('variant') ? `?variant=${url.searchParams.get('variant')}` : ''
  return url
}

const imageUrl = value => typeof value === 'string' && value.startsWith('//') ? `https:${value}` : value
const formatPrice = (value, currency) => `${currency ? currencySymbols[currency.toUpperCase()] ?? `${currency.toUpperCase()} ` : ''}${value.toFixed(2)}`

export function normalizeShopifyProduct(input, sourceUrl, currency) {
  if (!input || typeof input.title !== 'string' || !Array.isArray(input.variants) || input.variants.length === 0) throw new Error('商品数据格式异常')
  const variant = input.variants.reduce((lowest, item) => Number(item.price) < Number(lowest.price) ? item : lowest)
  const rawPrice = typeof variant.price === 'number' ? variant.price / 100 : Number(variant.price)
  const gallery = Array.isArray(input.images) ? input.images.map(imageUrl).filter(Boolean) : []
  const image = imageUrl(input.featured_image) || gallery[0] || ''
  return { title: input.title, image, gallery, price: formatPrice(rawPrice, currency), url: sourceUrl }
}

export async function readShopifyProduct(input, fetcher = fetch) {
  const endpoint = buildProductJsonUrl(input)
  const cartEndpoint = new URL('/cart.js', endpoint.origin)
  const [response, cartResponse] = await Promise.all([
    fetcher(endpoint, { signal: AbortSignal.timeout(5000), headers: { accept: 'application/json' } }),
    fetcher(cartEndpoint, { signal: AbortSignal.timeout(5000), headers: { accept: 'application/json' } }),
  ])
  if (!response.ok) throw new Error(`商品读取失败（${response.status}）`)
  const cart = cartResponse.ok ? await cartResponse.json() : {}
  return normalizeShopifyProduct(await response.json(), input, cart.currency)
}

export function createLocalApp({ distDir = defaultDistDir, reader = readShopifyProduct } = {}) {
  const app = express()
  app.use(express.json({ limit: '8kb' }))
  app.post('/api/shopify/product', async (request, response) => {
    try { response.json(await reader(String(request.body?.url ?? ''))) }
    catch (error) { response.status(422).json({ code: 'PRODUCT_READ_FAILED', message: error instanceof Error ? error.message : '商品读取失败' }) }
  })
  app.use(express.static(distDir))
  app.get(/.*/, (_request, response) => response.sendFile(join(distDir, 'index.html')))
  return app
}

function openBrowser(url) {
  const commands = process.platform === 'darwin'
    ? ['open', url]
    : process.platform === 'win32'
      ? ['cmd', '/c', 'start', '', url]
      : ['xdg-open', url]
  execFile(commands[0], commands.slice(1), { stdio: 'ignore' }).unref()
}

export function startLocalServer({
  preferredPort = Number(process.env.PORT) || 5174,
  distDir = defaultDistDir,
  open = process.env.EDM_NO_OPEN !== '1',
  strictPort = process.env.EDM_STRICT_PORT === '1',
} = {}) {
  if (!existsSync(join(distDir, 'index.html'))) throw new Error(`没有找到构建文件：${distDir}，请先运行 npm run build`)
  const app = createLocalApp({ distDir })
  const listen = port => new Promise((resolveListen, rejectListen) => {
    const server = app.listen(port, '127.0.0.1')
    server.once('listening', () => resolveListen({ server, port }))
    server.once('error', error => {
      if (error.code === 'EADDRINUSE' && !strictPort) resolveListen(listen(port + 1))
      else rejectListen(error)
    })
  })
  return listen(preferredPort).then(({ server, port }) => {
    const url = `http://127.0.0.1:${port}/`
    console.log(`EDM EDITOR 已启动：${url}`)
    console.log('请保持这个窗口打开；关闭窗口后工具会停止运行。')
    if (open) openBrowser(url)
    return { server, port, url }
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startLocalServer().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
}

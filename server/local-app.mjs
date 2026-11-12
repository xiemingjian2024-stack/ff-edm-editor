import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFile } from 'node:child_process'
import { createLocalKlaviyoService } from './klaviyo-local.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const defaultDistDir = resolve(__dirname, '..', 'dist')

const blockedHost = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)$/i
const currencySymbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', CNY: '¥', HKD: 'HK$', SGD: 'S$' }
const shopifyHeaders = {
  accept: 'application/json,text/plain,*/*',
  'accept-language': 'en-US,en;q=0.9',
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  referer: 'https://funnyfuzzy.co.uk/',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
}

export function buildProductJsonUrl(input) {
  const url = new URL(input)
  if (!['http:', 'https:'].includes(url.protocol) || blockedHost.test(url.hostname)) throw new Error('该商品地址不允许读取')
  const match = url.pathname.match(/^(.*\/products\/[^/]+)/)
  if (!match) throw new Error('不是有效的 Shopify 商品地址')
  url.pathname = `${match[1]}.js`
  url.search = url.searchParams.get('variant') ? `?variant=${url.searchParams.get('variant')}` : ''
  return url
}

export function buildProductAdminJsonUrl(input) {
  const url = buildProductJsonUrl(input)
  url.pathname = url.pathname.replace(/\.js$/, '.json')
  return url
}

export function buildProductSuggestUrl(input) {
  const url = new URL(input)
  if (!['http:', 'https:'].includes(url.protocol) || blockedHost.test(url.hostname)) throw new Error('该商品地址不允许读取')
  const match = url.pathname.match(/\/products\/([^/?#]+)/)
  if (!match) throw new Error('不是有效的 Shopify 商品地址')
  const suggestUrl = new URL('/search/suggest.json', url.origin)
  suggestUrl.searchParams.set('q', decodeURIComponent(match[1]))
  suggestUrl.searchParams.set('resources[type]', 'product')
  suggestUrl.searchParams.set('resources[limit]', '4')
  return suggestUrl
}

const imageUrl = value => {
  const source = typeof value === 'string' ? value : value?.src || value?.url
  return typeof source === 'string' && source.startsWith('//') ? `https:${source}` : source
}
const formatPrice = (value, currency) => `${currency ? currencySymbols[currency.toUpperCase()] ?? `${currency.toUpperCase()} ` : ''}${value.toFixed(2)}`
const toDisplayPrice = value => {
  const number = Number(value)
  return number > 1000 ? number / 100 : number
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

async function fetchShopifyJson(fetcher, url, { required = true } = {}) {
  const delays = [0, 180, 420, 800]
  let lastResponse
  for (let index = 0; index < delays.length; index++) {
    if (delays[index]) await wait(delays[index])
    const requestUrl = new URL(url)
    if (index > 0) requestUrl.searchParams.set('_edm_retry', `${Date.now()}_${index}`)
    const response = await fetcher(requestUrl, { signal: AbortSignal.timeout(5000), headers: { ...shopifyHeaders, referer: requestUrl.origin + '/' } })
    if (response.ok) return response.json()
    lastResponse = response
    if (response.status !== 429) break
  }
  if (required) throw new Error(`商品读取失败（${lastResponse?.status ?? '网络异常'}）`)
  return {}
}

export function normalizeShopifyProduct(input, sourceUrl, currency) {
  if (input?.product) input = input.product
  if (!input || typeof input.title !== 'string' || !Array.isArray(input.variants) || input.variants.length === 0) throw new Error('商品数据格式异常')
  const toPrice = item => toDisplayPrice(item.price)
  const variant = input.variants.reduce((lowest, item) => toPrice(item) < toPrice(lowest) ? item : lowest)
  const rawPrice = toPrice(variant)
  const gallery = Array.isArray(input.images) ? input.images.map(imageUrl).filter(Boolean) : []
  const image = imageUrl(input.featured_image) || imageUrl(input.image) || gallery[0] || ''
  return { title: input.title, image, gallery, price: formatPrice(rawPrice, currency), url: sourceUrl }
}

export function normalizeShopifySuggestProduct(input, sourceUrl, currency) {
  const source = new URL(sourceUrl)
  const handle = source.pathname.match(/\/products\/([^/?#]+)/)?.[1]
  const products = input?.resources?.results?.products
  if (!Array.isArray(products) || products.length === 0) throw new Error('商品搜索数据格式异常')
  const product = products.find(item => item?.handle === handle) || products[0]
  if (!product?.title) throw new Error('商品搜索数据格式异常')
  const rawPrice = toDisplayPrice(product.price_min ?? product.price ?? product.variants?.[0]?.price ?? 0)
  const image = imageUrl(product.image) || imageUrl(product.featured_image) || ''
  const gallery = image ? [image] : []
  return { title: product.title, image, gallery, price: formatPrice(rawPrice, currency), url: sourceUrl }
}

export async function readShopifyProduct(input, fetcher = fetch) {
  const endpoint = buildProductJsonUrl(input)
  const fallbackEndpoint = buildProductAdminJsonUrl(input)
  const suggestEndpoint = buildProductSuggestUrl(input)
  const cartEndpoint = new URL('/cart.js', endpoint.origin)
  let product
  const cart = await fetchShopifyJson(fetcher, cartEndpoint, { required: false })
  try {
    product = await fetchShopifyJson(fetcher, endpoint)
    return normalizeShopifyProduct(product, input, cart.currency)
  } catch {
    try {
      product = await fetchShopifyJson(fetcher, fallbackEndpoint)
      return normalizeShopifyProduct(product, input, cart.currency)
    } catch {
      product = await fetchShopifyJson(fetcher, suggestEndpoint)
      return normalizeShopifySuggestProduct(product, input, cart.currency)
    }
  }
}

export function createLocalApp({ distDir = defaultDistDir, reader = readShopifyProduct, klaviyo = createLocalKlaviyoService() } = {}) {
  const app = express()
  app.use(express.json({ limit: '8kb' }))
  app.post('/api/shopify/product', async (request, response) => {
    try { response.json(await reader(String(request.body?.url ?? ''))) }
    catch (error) { response.status(422).json({ code: 'PRODUCT_READ_FAILED', message: error instanceof Error ? error.message : '商品读取失败' }) }
  })
  const ensureLocalRequest = (request, response, next) => request.get('x-edm-editor') === '1' ? next() : response.status(403).json({ message: '仅允许 EDM EDITOR 本机页面访问' })
  const sendKlaviyoError = (response, error) => response.status(422).json({ message: error instanceof Error ? error.message : 'Klaviyo 请求失败' })
  app.get('/api/klaviyo/status', ensureLocalRequest, async (_request, response) => { try { response.json(await klaviyo.status()) } catch (error) { sendKlaviyoError(response, error) } })
  app.post('/api/klaviyo/connect', ensureLocalRequest, async (request, response) => { try { response.json(await klaviyo.connect(request.body?.key)) } catch (error) { sendKlaviyoError(response, error) } })
  app.post('/api/klaviyo/disconnect', ensureLocalRequest, async (_request, response) => { try { response.json(await klaviyo.disconnect()) } catch (error) { sendKlaviyoError(response, error) } })
  app.post('/api/klaviyo/image', ensureLocalRequest, express.raw({ type: ['image/jpeg', 'image/png', 'image/gif'], limit: '5mb' }), async (request, response) => {
    try { response.json(await klaviyo.upload(request.body, request.get('content-type') || 'image/jpeg')) }
    catch (error) { sendKlaviyoError(response, error) }
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

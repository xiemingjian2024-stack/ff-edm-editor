import { z } from 'zod'
import type { NormalizedProduct } from '../src/domain/edm'

const rawProductSchema = z.object({
  title: z.string(), featured_image: z.string().optional(), images: z.array(z.string()).default([]),
  variants: z.array(z.object({ id: z.union([z.string(), z.number()]), price: z.union([z.string(), z.number()]) })).min(1)
})
const blockedHost = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)$/i

export function buildProductJsonUrl(input: string) {
  const url = new URL(input)
  if (!['http:', 'https:'].includes(url.protocol) || blockedHost.test(url.hostname)) throw new Error('该商品地址不允许读取')
  const match = url.pathname.match(/^(.*\/products\/[^/]+)/)
  if (!match) throw new Error('不是有效的 Shopify 商品地址')
  url.pathname = `${match[1]}.js`; url.search = url.searchParams.get('variant') ? `?variant=${url.searchParams.get('variant')}` : ''
  return url
}
const imageUrl = (value: string) => value.startsWith('//') ? `https:${value}` : value

export function normalizeShopifyProduct(input: unknown, sourceUrl: string): NormalizedProduct {
  const raw = rawProductSchema.parse(input); const requested = new URL(sourceUrl).searchParams.get('variant')
  const variant = raw.variants.find(item => String(item.id) === requested) ?? raw.variants[0]
  const price = typeof variant.price === 'number' ? (variant.price / 100).toFixed(2) : Number(variant.price).toFixed(2)
  const gallery = raw.images.map(imageUrl); const image = imageUrl(raw.featured_image ?? gallery[0] ?? '')
  return { title: raw.title, image, gallery, price, url: sourceUrl }
}

export async function readShopifyProduct(input: string, fetcher: typeof fetch = fetch) {
  const endpoint = buildProductJsonUrl(input)
  const response = await fetcher(endpoint, { signal: AbortSignal.timeout(5000), headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`商品读取失败（${response.status}）`)
  return normalizeShopifyProduct(await response.json(), input)
}

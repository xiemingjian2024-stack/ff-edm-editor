import { z } from 'zod'
import type { NormalizedProduct } from '../domain/edm'

const schema = z.object({ title: z.string(), image: z.string(), gallery: z.array(z.string()), price: z.string(), url: z.string() })
export async function fetchShopifyProduct(url: string, fetcher: typeof fetch = fetch): Promise<NormalizedProduct> {
  const response = await fetcher('/api/shopify/product', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url }) })
  if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.message ?? '商品读取失败') }
  return schema.parse(await response.json())
}

import { useState } from 'react'
import type { NormalizedProduct, ProductValue } from '../domain/edm'
import { fetchShopifyProduct } from '../shopify/client'
import { MediaControlCard } from './MediaControlCard'
import { getProductMedia, withProductMedia } from '../domain/productMedia'

export function ProductSlotEditor({ label, value, onChange, reader = fetchShopifyProduct, showPrice = true }: { label: string; value?: ProductValue; onChange: (value: ProductValue) => void; reader?: (url: string) => Promise<NormalizedProduct>; showPrice?: boolean }) {
  const [url, setUrl] = useState(value?.url ?? ''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const load = async () => { setLoading(true); setError(''); try { onChange(await reader(url)) } catch (reason) { setError(reason instanceof Error ? reason.message : '读取失败') } finally { setLoading(false) } }
  const product: ProductValue = value ?? { image: '', title: '', price: '', url: '', gallery: [] }
  const update = (key: keyof ProductValue, next: string) => onChange({ ...product, [key]: next })
  const updateMedia = (media: ReturnType<typeof getProductMedia>) => onChange(withProductMedia(product, media.image === product.image ? media : { ...media, scale: 1, offsetX: 0, offsetY: 0 }))
  const replaceImage = (image: string) => onChange(withProductMedia(product, { image, url: '', scale: 1, offsetX: 0, offsetY: 0 }))
  return <section className="product-slot-editor"><h3>{label}</h3><label className="field"><span>Shopify 商品链接</span><div className="url-field"><input aria-label={`${label} Shopify 链接`} value={url} onChange={event => { const next = event.target.value; setUrl(next); update('url', next) }} /><button onClick={load} disabled={loading || !url} aria-label={`自动填充${label}`}>{loading ? '读取中' : '自动填充'}</button></div></label>
    {error ? <p className="field-error">{error}，可重试或手动填写。</p> : null}
    <div className="product-image-field"><span>商品图片</span><MediaControlCard label={`${label} 商品图片`} value={getProductMedia(product)} onChange={updateMedia} /></div>
    <label className="field"><span>商品标题</span><input aria-label={`${label} 商品标题`} value={product.title} onChange={event => update('title', event.target.value)} /></label>{showPrice ? <label className="field"><span>价格</span><input aria-label={`${label} 价格`} value={product.price} onChange={event => update('price', event.target.value)} /></label> : null}{product.gallery?.length ? <div className="gallery">{product.gallery.map(image => <button key={image} onClick={() => replaceImage(image)}><img src={image} alt="商品图库" /></button>)}</div> : null}
  </section>
}

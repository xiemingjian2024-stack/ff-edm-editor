import { useState } from 'react'
import type { NormalizedProduct, ProductValue } from '../domain/edm'
import { fetchShopifyProduct } from '../shopify/client'

export function ProductSlotEditor({ label, value, onChange, reader = fetchShopifyProduct }: { label: string; value?: ProductValue; onChange: (value: ProductValue) => void; reader?: (url: string) => Promise<NormalizedProduct> }) {
  const [url, setUrl] = useState(value?.url ?? ''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const load = async () => { setLoading(true); setError(''); try { onChange(await reader(url)) } catch (reason) { setError(reason instanceof Error ? reason.message : '读取失败') } finally { setLoading(false) } }
  const update = (key: keyof ProductValue, next: string) => onChange({ image: '', title: '', price: '', url, ...value, [key]: next })
  return <section className="product-slot-editor"><h3>{label}</h3><label className="field"><span>Shopify 商品链接</span><div className="url-field"><input aria-label={`${label} Shopify 链接`} value={url} onChange={event => setUrl(event.target.value)} /><button onClick={load} disabled={loading || !url} aria-label={`自动填充${label}`}>{loading ? '读取中' : '自动填充'}</button></div></label>
    {error ? <p className="field-error">{error}，可重试或手动填写。</p> : null}
    {value ? <><label className="field"><span>商品标题</span><input value={value.title} onChange={event => update('title', event.target.value)} /></label><label className="field"><span>价格</span><input value={value.price} onChange={event => update('price', event.target.value)} /></label><label className="field"><span>跳转链接</span><input value={value.url} onChange={event => update('url', event.target.value)} /></label>{value.gallery?.length ? <div className="gallery">{value.gallery.map(image => <button key={image} onClick={() => update('image', image)}><img src={image} alt="商品图库" /></button>)}</div> : null}</> : null}
  </section>
}

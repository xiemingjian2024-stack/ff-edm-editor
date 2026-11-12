import { useLayoutEffect, useRef, useState } from 'react'
import type { NormalizedProduct, ProductValue } from '../domain/edm'
import { fetchShopifyProduct } from '../shopify/client'
import { MediaControlCard } from './MediaControlCard'
import { getProductMedia, withProductMedia } from '../domain/productMedia'
import { TextHighlightEditor, TextHighlightToggle } from './TextHighlightEditor'

export function ProductSlotEditor({ label, value, onChange, reader = fetchShopifyProduct, showPrice = true, showDescription = false, showActionText = false, defaultActionText = '', defaultTextColor = '#000000', requiredLink = false }: { label: string; value?: ProductValue; onChange: (value: ProductValue) => void; reader?: (url: string) => Promise<NormalizedProduct>; showPrice?: boolean; showDescription?: boolean; showActionText?: boolean; defaultActionText?: string; defaultTextColor?: string; requiredLink?: boolean }) {
  const [url, setUrl] = useState(value?.url ?? ''); const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const product: ProductValue = value
    ? (showActionText ? { ...value, actionText: value.actionText ?? defaultActionText } : value)
    : { image: '', title: '', price: '', url: '', gallery: [], ...(showActionText ? { actionText: defaultActionText } : {}) }
  const load = async () => { setLoading(true); setError(''); try { const next = await reader(url); onChange({ ...next, description: product.description, actionText: product.actionText, titleHighlight: product.titleHighlight, descriptionHighlight: product.descriptionHighlight }) } catch (reason) { setError(reason instanceof Error ? reason.message : '读取失败') } finally { setLoading(false) } }
  const titleRef = useRef<HTMLTextAreaElement | null>(null)
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null)
  useLayoutEffect(() => {
    const textarea = titleRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.max(38, textarea.scrollHeight)}px`
  }, [product.title])
  useLayoutEffect(() => {
    const textarea = descriptionRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.max(38, textarea.scrollHeight)}px`
  }, [product.description])
  const update = <K extends keyof ProductValue>(key: K, next: ProductValue[K]) => onChange({ ...product, [key]: next })
  const updateMedia = (media: ReturnType<typeof getProductMedia>) => onChange(withProductMedia(product, media.image === product.image ? media : { ...media, scale: 1, offsetX: 0, offsetY: 0 }))
  const replaceImage = (image: string) => onChange(withProductMedia(product, { image, url: '', scale: 1, offsetX: 0, offsetY: 0 }))
  return <section className="product-slot-editor"><h3>{label}</h3><label className="field"><span>Shopify 商品链接{requiredLink ? '（必填）' : ''}</span><div className="url-field"><input required={requiredLink} aria-label={`${label} Shopify 链接`} value={url} onChange={event => { const next = event.target.value; setUrl(next); update('url', next) }} /><button onClick={load} disabled={loading || !url} aria-label={`自动填充${label}`}>{loading ? '读取中' : '自动填充'}</button></div></label>
    {error ? <p className="field-error">{error}，可重试或手动填写。</p> : null}
    <div className="product-image-field"><span>商品图片</span><MediaControlCard label={`${label} 商品图片`} value={getProductMedia(product)} onChange={updateMedia} /></div>
    <div className="field"><div className="field-label-row"><span>商品标题</span><TextHighlightToggle value={product.titleHighlight} onChange={next => update('titleHighlight', next)} /></div><textarea className="product-copy-input" rows={1} ref={titleRef} aria-label={`${label} 商品标题`} value={product.title} onChange={event => update('title', event.target.value)} /><TextHighlightEditor text={product.title} textRef={titleRef} value={product.titleHighlight} defaultColor={defaultTextColor} onChange={next => update('titleHighlight', next)} /></div>
    {showDescription ? <div className="field"><div className="field-label-row"><span>商品描述（可不填）</span><TextHighlightToggle value={product.descriptionHighlight} onChange={next => update('descriptionHighlight', next)} /></div><textarea className="product-copy-input" rows={1} ref={descriptionRef} aria-label={`${label} 商品描述`} value={product.description ?? ''} onChange={event => update('description', event.target.value)} /><TextHighlightEditor text={product.description ?? ''} textRef={descriptionRef} value={product.descriptionHighlight} defaultColor={defaultTextColor} onChange={next => update('descriptionHighlight', next)} /></div> : null}
    {showPrice ? <label className="field"><span>价格</span><input aria-label={`${label} 价格`} value={product.price} onChange={event => update('price', event.target.value)} /></label> : null}
    {showActionText ? <label className="field"><span>按钮文案（留空则显示价格）</span><input aria-label={`${label} 按钮文案`} value={product.actionText ?? ''} onChange={event => update('actionText', event.target.value)} /></label> : null}
    {product.gallery?.length ? <div className="gallery">{product.gallery.map(image => <button key={image} onClick={() => replaceImage(image)}><img src={image} alt="商品图库" /></button>)}</div> : null}
  </section>
}

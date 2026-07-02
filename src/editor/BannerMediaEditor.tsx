import { useState } from 'react'
import type { MediaState, NormalizedProduct } from '../domain/edm'
import { fetchShopifyProduct } from '../shopify/client'

export function BannerMediaEditor({ value, onChange, reader = fetchShopifyProduct }: { value: MediaState; onChange: (value: MediaState) => void; reader?: (url: string) => Promise<NormalizedProduct> }) {
  const [url, setUrl] = useState(value.url)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const load = async () => {
    setLoading(true); setError('')
    try {
      const product = await reader(url)
      onChange({ ...value, image: product.image, url })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '商品读取失败')
    } finally { setLoading(false) }
  }
  return <div className="banner-media-editor">
    <label><span>Shopify 商品链接</span><div className="url-field"><input aria-label="Banner Shopify 链接" value={url} onChange={event => setUrl(event.target.value)} /><button type="button" onClick={load} disabled={loading || !url} aria-label="读取商品首图">{loading ? '读取中' : '读取首图'}</button></div></label>
    {error ? <p className="field-error">{error}，可重试或手动上传。</p> : null}
    <label className="banner-upload"><span>手动上传图片</span><input aria-label="手动上传 Banner 图片" type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) { const image = URL.createObjectURL(file); setUrl(''); onChange({ ...value, image, url: '' }) } }} /></label>
    <label className="media-scale"><span>图片缩放</span><div><input aria-label="图片缩放" type="range" min="100" max="300" step="1" value={Math.round(value.scale * 100)} onChange={event => onChange({ ...value, scale: Number(event.target.value) / 100 })} /><output>{Math.round(value.scale * 100)}%</output></div></label>
    <button type="button" className="media-reset" onClick={() => onChange({ ...value, scale: 1, offsetX: 0, offsetY: 0 })} aria-label="重置图片位置">重置图片位置</button>
  </div>
}

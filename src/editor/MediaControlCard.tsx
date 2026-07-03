import { useState } from 'react'
import type { MediaState, NormalizedProduct } from '../domain/edm'

export function MediaControlCard({ label, value, onChange, reader, showTransformControls = true }: { label: string; value: MediaState; onChange: (value: MediaState) => void; reader?: (url: string) => Promise<NormalizedProduct>; showTransformControls?: boolean }) {
  const [url, setUrl] = useState(value.url)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const upload = (file?: File) => {
    if (!file) return
    const image = URL.createObjectURL(file)
    setUrl('')
    onChange({ ...value, image, url: '' })
  }
  const paste = async () => {
    try {
      const items = await navigator.clipboard?.read?.()
      const item = items?.find(candidate => candidate.types.some(type => type.startsWith('image/')))
      const type = item?.types.find(candidate => candidate.startsWith('image/'))
      if (!item || !type) return
      const image = await item.getType(type)
      setUrl('')
      onChange({ ...value, image: URL.createObjectURL(image), url: '' })
    } catch {
      return
    }
  }
  const loadFromUrl = async () => {
    const trimmed = url.trim()
    if (!trimmed) return
    setLoading(true); setError('')
    try {
      if (reader) {
        const product = await reader(trimmed)
        onChange({ ...value, image: product.image, url: trimmed })
      } else {
        onChange({ ...value, image: trimmed, url: trimmed })
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '图片读取失败')
    } finally { setLoading(false) }
  }
  return <div className="media-control-card">
    <div className="media-preview-card">
      {value.image ? <img src={value.image} alt={`${label}预览`} /> : <span>＋ 上传图片</span>}
      <label className="media-preview-upload"><input aria-label={`上传 ${label}`} type="file" accept="image/*" onChange={event => upload(event.target.files?.[0])} /></label>
      {value.image && showTransformControls ? <div className="media-hover-tools">
        <label className="media-hover-upload"><span>重新上传</span><input aria-label={`重新上传 ${label}`} type="file" accept="image/*" onChange={event => upload(event.target.files?.[0])} /></label>
        <button type="button" onClick={() => onChange({ ...value, scale: 1, offsetX: 0, offsetY: 0 })} aria-label={`重置 ${label}位置`}>重置位置</button>
        <label className="media-hover-scale"><span>缩放</span><input aria-label={`${label}缩放`} type="range" min="100" max="300" step="1" value={Math.round(value.scale * 100)} onChange={event => onChange({ ...value, scale: Number(event.target.value) / 100 })} /><output>{Math.round(value.scale * 100)}%</output></label>
      </div> : null}
    </div>
    <div className="media-link-row">
      <input aria-label={`${label}链接`} value={url} onChange={event => setUrl(event.target.value)} placeholder="粘贴 Shopify / 图片链接" />
      <button type="button" onClick={loadFromUrl} disabled={loading || !url.trim()} aria-label={`从链接获取 ${label}`}>{loading ? '读取中' : '从链接获取'}</button>
      <button type="button" onClick={paste} aria-label={`粘贴 ${label}`}>粘贴</button>
    </div>
    {error ? <p className="field-error">{error}，可重试或手动上传。</p> : null}
  </div>
}

import { useState } from 'react'
import type { MediaState, NormalizedProduct } from '../domain/edm'
import { fileToDataUrl } from '../media/fileDataUrl'

export function MediaControlCard({ label, value, onChange, reader, showTransformControls = true, linkAction, stackLinkActions = false, onMultipleUpload, maxUploadFiles }: { label: string; value: MediaState; onChange: (value: MediaState) => void; reader?: (url: string) => Promise<NormalizedProduct>; showTransformControls?: boolean; linkAction?: { label: string; onClick: () => void }; stackLinkActions?: boolean; onMultipleUpload?: (files: File[]) => Promise<void>; maxUploadFiles?: number }) {
  const [url, setUrl] = useState(value.url)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const scalePercent = Math.min(100, Math.max(0, (Math.round(value.scale * 100) - 100) / 2))
  const upload = async (files: File[]) => {
    if (!files.length) return
    setError('')
    if (onMultipleUpload && maxUploadFiles && files.length > maxUploadFiles) {
      setError(`此模板一次最多上传 ${maxUploadFiles} 张图片，请重新选择`)
      return
    }
    setUploading(true)
    try {
      if (onMultipleUpload && files.length > 1) await onMultipleUpload(files)
      else onChange({ ...value, image: await fileToDataUrl(files[0]), url: '' })
      setUrl('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '图片上传失败')
    } finally { setUploading(false) }
  }
  const paste = async () => {
    try {
      const items = await navigator.clipboard?.read?.()
      const item = items?.find(candidate => candidate.types.some(type => type.startsWith('image/')))
      const type = item?.types.find(candidate => candidate.startsWith('image/'))
      if (!item || !type) return
      const image = await item.getType(type)
      setUrl('')
      onChange({ ...value, image: await fileToDataUrl(image), url: '' })
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
      <label className="media-preview-upload"><input aria-label={`上传 ${label}`} type="file" accept="image/*" multiple={Boolean(onMultipleUpload)} disabled={uploading} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void upload(files) }} /></label>
      {value.image && showTransformControls ? <div className="media-hover-tools">
        <label className="media-hover-upload"><span>重新上传</span><input aria-label={`重新上传 ${label}`} type="file" accept="image/*" multiple={Boolean(onMultipleUpload)} disabled={uploading} onChange={event => { const files = Array.from(event.target.files ?? []); event.target.value = ''; void upload(files) }} /></label>
        <button type="button" onClick={() => onChange({ ...value, scale: 1, offsetX: 0, offsetY: 0 })} aria-label={`重置 ${label}位置`}>重置位置</button>
        <label className="media-hover-scale"><span>缩放</span><input aria-label={`${label}缩放`} type="range" min="100" max="300" step="1" value={Math.round(value.scale * 100)} style={{ background: `linear-gradient(to right, #111 0%, #111 ${scalePercent}%, #dedede ${scalePercent}%, #dedede 100%)` }} onChange={event => onChange({ ...value, scale: Number(event.target.value) / 100 })} /><output>{Math.round(value.scale * 100)}%</output></label>
      </div> : null}
    </div>
    <div className={`media-link-row${stackLinkActions ? ' is-stacked' : ''}`}>
      <div className="media-link-control">
        <input aria-label={`${label}链接`} value={url} onChange={event => setUrl(event.target.value)} placeholder="粘贴 Shopify / 图片链接" />
        <button type="button" onClick={loadFromUrl} disabled={loading || !url.trim()} aria-label={`读取链接 ${label}`}>{loading ? '读取中' : '读取链接'}</button>
      </div>
      <div className="media-link-actions">{linkAction ? <button type="button" onClick={linkAction.onClick}>{linkAction.label}</button> : null}<button type="button" onClick={paste} aria-label={`粘贴复制板 ${label}`}>粘贴复制板</button></div>
    </div>
    {uploading ? <p role="status">正在导入图片…</p> : null}
    {error ? <p className="field-error" role="alert">{error}</p> : null}
  </div>
}

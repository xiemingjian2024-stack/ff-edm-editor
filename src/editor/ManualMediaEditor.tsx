import type { MediaState } from '../domain/edm'

export function ManualMediaEditor({ label, value, onChange }: { label: string; value: MediaState; onChange: (value: MediaState) => void }) {
  return <div className="manual-media-editor">
    <label className="banner-upload"><span>上传{label}</span><input aria-label={`上传 ${label}`} type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) onChange({ ...value, image: URL.createObjectURL(file), url: '' }) }} /></label>
    <label className="media-scale"><span>{label}缩放</span><div><input aria-label={`${label}缩放`} type="range" min="100" max="300" step="1" value={Math.round(value.scale * 100)} onChange={event => onChange({ ...value, scale: Number(event.target.value) / 100 })} /><output>{Math.round(value.scale * 100)}%</output></div></label>
    <button type="button" className="media-reset" onClick={() => onChange({ ...value, scale: 1, offsetX: 0, offsetY: 0 })} aria-label={`重置 ${label}位置`}>重置{label}位置</button>
  </div>
}

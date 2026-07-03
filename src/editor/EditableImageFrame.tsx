import { useRef } from 'react'
import type { MediaState } from '../domain/edm'

export function EditableImageFrame({ value, onChange, ariaLabel = '可编辑图片', placeholder = '添加图片', designWidth = 375, fit = 'cover' }: { value: MediaState; onChange?: (value: MediaState) => void; ariaLabel?: string; placeholder?: string; designWidth?: number; fit?: 'cover' | 'contain' }) {
  const drag = useRef<{ x: number; y: number; offsetX: number; offsetY: number; ratio: number } | null>(null)
  return <div
    className={`editable-image-frame ${onChange ? 'is-editable' : ''}`}
    aria-label={ariaLabel}
    onPointerDown={event => {
      if (!onChange || !value.image) return
      const ratio = event.currentTarget.getBoundingClientRect().width / designWidth || 1
      drag.current = { x: event.clientX, y: event.clientY, offsetX: value.offsetX, offsetY: value.offsetY, ratio }
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }}
    onPointerMove={event => {
      if (!onChange || !drag.current) return
      onChange({ ...value, offsetX: drag.current.offsetX + (event.clientX - drag.current.x) / drag.current.ratio, offsetY: drag.current.offsetY + (event.clientY - drag.current.y) / drag.current.ratio })
    }}
    onPointerUp={event => { drag.current = null; event.currentTarget.releasePointerCapture?.(event.pointerId) }}
    onPointerCancel={() => { drag.current = null }}
  >
    {value.image ? <img src={value.image} alt="" draggable={false} style={{ objectFit: fit, transform: `translate(-50%, -50%) translate(${value.offsetX}px, ${value.offsetY}px) scale(${value.scale})` }} /> : <span className="editable-image-placeholder">{placeholder}</span>}
  </div>
}

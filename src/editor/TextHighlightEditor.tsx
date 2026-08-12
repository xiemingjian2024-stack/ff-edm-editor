import type { RefObject } from 'react'
import type { TextHighlight } from '../domain/edm'
import { normalizeTextHighlight } from '../text/HighlightedText'
import { normalizeHexColorInput } from '../themes/colorInput'
import { ColorInput } from './ColorInput'

type SelectableTextControl = HTMLTextAreaElement | HTMLInputElement

export function TextHighlightToggle({
  value,
  onChange,
}: {
  value?: TextHighlight
  onChange: (value: TextHighlight) => void
}) {
  const highlight = normalizeTextHighlight(value)
  return <label className="text-highlight-toggle">
    <input type="checkbox" checked={highlight.enabled} onChange={event => onChange({ ...highlight, enabled: event.target.checked })} />
    <span>强调部分文本</span>
  </label>
}

export function TextHighlightEditor({
  text,
  textRef,
  value,
  defaultColor = '#000000',
  onChange,
}: {
  text: string
  textRef: RefObject<SelectableTextControl | null>
  value?: TextHighlight
  defaultColor?: string
  onChange: (value: TextHighlight) => void
}) {
  const highlight = normalizeTextHighlight(value)
  const update = (next: Partial<TextHighlight>) => onChange({ ...highlight, ...next })
  const useSelectedText = () => {
    const control = textRef.current
    const start = control?.selectionStart ?? 0
    const end = control?.selectionEnd ?? 0
    const selected = start < end ? text.slice(start, end) : ''
    if (selected) update({ text: selected })
  }
  const changeColor = (next: string) => {
    update({ color: next.trim() ? (normalizeHexColorInput(next) ?? next) : '' })
  }
  if (!highlight.enabled) return null
  return <div className="text-highlight-editor">
    <div className="text-highlight-controls">
      <div className="text-highlight-target">
        <input aria-label="重点文字" value={highlight.text ?? ''} placeholder="输入或选择要强调的文字" onChange={event => update({ text: event.target.value })} />
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={useSelectedText}>选中并强调</button>
      </div>
      <ColorInput colorLabel="重点文字颜色" valueLabel="重点文字色值" value={highlight.color ?? ''} fallback={defaultColor} placeholder="默认跟随文字颜色" onChange={changeColor} />
    </div>
  </div>
}

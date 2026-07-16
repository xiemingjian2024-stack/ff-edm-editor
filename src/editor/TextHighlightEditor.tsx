import type { RefObject } from 'react'
import type { TextHighlight } from '../domain/edm'
import { normalizeTextHighlight } from '../text/HighlightedText'
import { getColorPreviewValue, normalizeHexColorInput } from '../themes/colorInput'

type SelectableTextControl = HTMLTextAreaElement | HTMLInputElement

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
  return <div className="text-highlight-editor">
    <label className="text-highlight-toggle">
      <input type="checkbox" checked={highlight.enabled} onChange={event => update({ enabled: event.target.checked })} />
      <span>强调部分文本</span>
    </label>
    {highlight.enabled ? <div className="text-highlight-controls">
      <button type="button" onClick={useSelectedText}>使用当前选中文本</button>
      <input aria-label="重点文字" value={highlight.text ?? ''} placeholder="输入或选择要强调的文字" onChange={event => update({ text: event.target.value })} />
      <div className="color-field text-highlight-color">
        <input aria-label="重点文字颜色" type="color" value={getColorPreviewValue(highlight.color || defaultColor, '#000000')} onChange={event => changeColor(event.target.value)} />
        <input aria-label="重点文字色值" value={highlight.color ?? ''} placeholder="默认跟随文字颜色" onChange={event => changeColor(event.target.value)} />
      </div>
    </div> : null}
  </div>
}

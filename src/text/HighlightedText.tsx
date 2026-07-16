import type { CSSProperties, ReactNode } from 'react'
import type { FloorInstance, TextHighlight } from '../domain/edm'

export function normalizeTextHighlight(value?: TextHighlight): TextHighlight {
  return {
    enabled: value?.enabled === true,
    text: value?.text ?? '',
    bold: value?.bold === true,
    enlarge: value?.enlarge === true,
    color: value?.color ?? '',
  }
}

function getHighlightStyle(highlight: TextHighlight): CSSProperties {
  const style: CSSProperties = {}
  if (highlight.bold) style.fontWeight = 700
  if (highlight.enlarge) style.fontSize = 'calc(1em + 2px)'
  if (highlight.color) style.color = highlight.color
  return style
}

export function renderHighlightedText(text: string | undefined, highlight?: TextHighlight): ReactNode {
  const value = text ?? ''
  const normalized = normalizeTextHighlight(highlight)
  if (!normalized.enabled || !normalized.text) return value
  const index = value.indexOf(normalized.text)
  if (index < 0) return value
  const before = value.slice(0, index)
  const matched = value.slice(index, index + normalized.text.length)
  const after = value.slice(index + normalized.text.length)
  return <>{before}<span className="text-highlight" style={getHighlightStyle(normalized)}>{matched}</span>{after}</>
}

export function floorText(floor: FloorInstance, fieldId: string, fallback = '') {
  return renderHighlightedText(floor.values[fieldId] || fallback, floor.textHighlights?.[fieldId])
}

import { useState } from 'react'
import type { ThemePalette } from '../domain/edm'

export function ThemePalettePicker({ value, palettes, onChange }: { value: string; palettes: ThemePalette[]; onChange: (paletteId: string) => void }) {
  const [open, setOpen] = useState(false)
  const selected = palettes.find(item => item.id === value) ?? palettes[0]
  return <div className="theme-palette-picker">
    <button
      type="button"
      className="theme-palette-trigger"
      aria-label={`配色套餐 ${selected?.name ?? ''}`}
      aria-expanded={open}
      onClick={() => setOpen(current => !current)}
    >
      <span className="palette-swatches">{Object.entries(selected?.slots ?? {}).slice(0, 3).map(([slot, color]) => <i key={slot} style={{ backgroundColor: color }} />)}</span>
      <span><small>配色套餐</small><strong>{selected?.name}</strong></span>
    </button>
    {open ? <div className="theme-palette-menu">
      {palettes.map(palette => <button type="button" key={palette.id} aria-pressed={palette.id === value} onClick={() => { onChange(palette.id); setOpen(false) }}>
        <strong>{palette.name}</strong>
        <span>{Object.entries(palette.slots).map(([slot, color]) => <i key={slot} title={`主题色位 ${slot}: ${color}`} style={{ backgroundColor: color }} />)}</span>
      </button>)}
    </div> : null}
  </div>
}

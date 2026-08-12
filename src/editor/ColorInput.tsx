import { getColorPreviewValue } from '../themes/colorInput'

export function ColorInput({
  colorLabel,
  valueLabel,
  value,
  fallback = '#ffffff',
  placeholder,
  trailingLabel,
  onChange,
}: {
  colorLabel: string
  valueLabel?: string
  value: string
  fallback?: string
  placeholder?: string
  trailingLabel?: string
  onChange: (value: string) => void
}) {
  return <div className="color-input">
    <label className="color-input-swatch" style={{ backgroundColor: getColorPreviewValue(value, fallback) }}>
      <input aria-label={colorLabel} type="color" value={getColorPreviewValue(value, fallback)} onChange={event => onChange(event.target.value)} />
    </label>
    <input className="color-input-value" aria-label={valueLabel ?? `${colorLabel}色值`} value={value} placeholder={placeholder} onChange={event => onChange(event.target.value)} />
    {trailingLabel ? <span className="theme-binding-status color-input-binding">{trailingLabel}</span> : null}
  </div>
}

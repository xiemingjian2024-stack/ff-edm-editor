import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { FloorInstance, MediaState, NavigationItem, TextHighlight, ThemeColorField, ThemeSlot } from '../domain/edm'
import { getTemplate } from '../templates/registry'
import { ProductSlotEditor } from './ProductSlotEditor'
import { InspectorSection } from './InspectorSection'
import { BannerMediaEditor } from './BannerMediaEditor'
import { ManualMediaEditor } from './ManualMediaEditor'
import { getActiveProductSlots } from '../templates/productSlots'
import { fileToDataUrl } from '../media/fileDataUrl'
import { normalizeHexColorInput } from '../themes/colorInput'
import { TextHighlightEditor, TextHighlightToggle } from './TextHighlightEditor'
import { ColorInput } from './ColorInput'
import type { GifDraft } from '../gif/model'

const excludedHighlightFieldIds = new Set(['buttonText', 'cardButtonText', 'pricePrefix', 'actionText'])
const isHighlightEligibleTextField = (field: NonNullable<ReturnType<typeof getTemplate>>['definition']['fields'][number]) => {
  if (field.type !== 'text') return false
  const id = field.id.toLowerCase()
  const label = field.label.toLowerCase()
  if (excludedHighlightFieldIds.has(field.id)) return false
  if (id.includes('button') || id.includes('price') || id.includes('currency') || id.includes('link') || id.includes('url')) return false
  if (label.includes('按钮') || label.includes('价格') || label.includes('货币') || label.includes('链接')) return false
  return true
}

function TextField({ floor, field, onChange, onTextHighlightChange }: { floor: FloorInstance; field: NonNullable<ReturnType<typeof getTemplate>>['definition']['fields'][number]; onChange: (fieldId: string, value: string) => void; onTextHighlightChange: (fieldId: string, value: TextHighlight) => void }) {
  const textRef = useRef<HTMLTextAreaElement | null>(null)
  const value = floor.values[field.id] ?? ''
  const canHighlight = isHighlightEligibleTextField(field)
  const isLink = field.id.toLowerCase().includes('link') || field.id.toLowerCase().includes('url')
  useLayoutEffect(() => {
    const textarea = textRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.max(38, textarea.scrollHeight)}px`
  }, [value])
  return <div className="field" key={field.id}>
    <div className="field-label-row"><span>{field.label}</span>{canHighlight ? <TextHighlightToggle value={floor.textHighlights?.[field.id]} onChange={next => onTextHighlightChange(field.id, next)} /> : null}</div>
    {isLink
      ? <input className="property-text-input" type="url" aria-label={field.label} value={value} onChange={event => onChange(field.id, event.target.value)} />
      : <textarea className="property-copy-input" rows={1} ref={textRef} aria-label={field.label} value={value} onChange={event => onChange(field.id, event.target.value)} />}
    {canHighlight ? <TextHighlightEditor text={value} textRef={textRef} value={floor.textHighlights?.[field.id]} defaultColor={floor.values.textColor || '#000000'} onChange={next => onTextHighlightChange(field.id, next)} /> : null}
  </div>
}

function ChoiceSelect({ label, value, options, onChange }: { label: string; value: string; options: { label: string; value: string }[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const listboxId = useId()
  const selected = options.find(option => option.value === value) ?? options[0]
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    window.addEventListener('keydown', closeWithEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      window.removeEventListener('keydown', closeWithEscape)
    }
  }, [open])
  return <div className="property-choice" ref={rootRef}>
    <button type="button" role="combobox" className="property-choice-trigger" aria-label={label} aria-controls={listboxId} aria-expanded={open} aria-haspopup="listbox" onClick={() => setOpen(value => !value)}><span>{selected?.label}</span><i aria-hidden="true" /></button>
    {open ? <div className="property-choice-menu" id={listboxId} role="listbox" aria-label={`${label}选项`}>{options.map(option => <button type="button" role="option" aria-selected={option.value === value} key={option.value} onClick={() => { onChange(option.value); setOpen(false) }}><span aria-hidden="true">{option.value === value ? '✓' : ''}</span>{option.label}</button>)}</div> : null}
  </div>
}

export function PropertyPanel({ floor, gifDrafts = [], themeFields = [], onChange, onTextHighlightChange, onThemeColorChange, onThemeColorRelink, onNavigationItemChange, onMediaChange, onAnimationChange = () => {}, onMediaSlotChange = () => {}, onProductChange }: { floor?: FloorInstance; gifDrafts?: GifDraft[]; themeFields?: ThemeColorField[]; onChange: (fieldId: string, value: string) => void; onTextHighlightChange: (fieldId: string, value: TextHighlight) => void; onThemeColorChange: (fieldId: string, color: string) => void; onThemeColorRelink: (fieldId: string, slot: ThemeSlot) => void; onNavigationItemChange: (index: number, value: NavigationItem) => void; onMediaChange: (value: MediaState) => void; onAnimationChange?: (value: import('../domain/edm').BannerAnimation) => void; onMediaSlotChange?: (slotId: string, value: MediaState) => void; onProductChange: (slotId: string, value: import('../domain/edm').ProductValue) => void }) {
  const template = floor ? getTemplate(floor.templateId)?.definition : undefined
  const comparisonBottomStyle = floor?.values.bottomStyle === 'action' ? 'action' : 'comparison'
  const colorFields = template?.fields.filter(field => {
    if (field.type !== 'color') return false
    if (template.id === 'comparison-information' && comparisonBottomStyle !== 'action' && (field.id === 'buttonBackground' || field.id === 'buttonTextColor')) return false
    return true
  }) ?? []
  const navigationCount = template?.navigationConfig ? Math.min(template.navigationConfig.maxItems, Math.max(template.navigationConfig.minItems, Number(floor?.values.navigationCount) || template.navigationConfig.minItems)) : 0
  const mediaSlotCount = template?.mediaSlotCountFieldId ? Number(floor?.values[template.mediaSlotCountFieldId]) : template?.mediaSlots?.length
  const visibleMediaSlots = template?.mediaSlots?.slice(0, mediaSlotCount)
  const visibleProductSlots = template && floor ? getActiveProductSlots(template, floor) : []
  const contentFields = template?.fields.filter(field => {
    if (field.type === 'color') return false
    if (field.id === 'pricePrefix' && visibleProductSlots.length) return false
    if (template.id === 'comparison-information') {
      if (comparisonBottomStyle === 'action') return field.id !== 'beforeDescription' && field.id !== 'afterDescription'
      return field.id !== 'actionDescription' && field.id !== 'buttonText' && field.id !== 'buttonWidth'
    }
    if (template.id !== 'selling-points-information') return true
    const match = field.id.match(/^point(\d+)(Title|Description)$/)
    return !match || Number(match[1]) <= (mediaSlotCount ?? 0)
  }) ?? []
  const pricePrefixField = visibleProductSlots.length ? template?.fields.find(field => field.id === 'pricePrefix') : undefined
  const themeLabel = (fieldId: string, slot: ThemeSlot) => fieldId === 'buttonBackground' ? `按钮色 ${slot}` : `背景间隔色 ${slot}`
  const handleColorTextChange = (fieldId: string, value: string, change: (fieldId: string, value: string) => void) => {
    change(fieldId, normalizeHexColorInput(value) ?? value)
  }
  const rangeBackground = (value: string, min: number, max: number) => {
    const progress = Math.min(100, Math.max(0, (Number(value) - min) / (max - min) * 100))
    return `linear-gradient(to right, #111 0%, #111 ${progress}%, #dedede ${progress}%, #dedede 100%)`
  }
  const renderField = (field: NonNullable<typeof template>['fields'][number]) => {
    const themeDeclaration = themeFields.find(item => item.fieldId === field.id)
    const binding = floor?.themeColors?.[field.id]
    const change = field.type === 'color' && themeDeclaration ? onThemeColorChange : onChange
    if (field.type === 'text' && floor) return <TextField key={field.id} floor={floor} field={field} onChange={onChange} onTextHighlightChange={onTextHighlightChange} />
    return <label className={`field${field.type === 'choice' ? ' field--choice' : ''}`} key={field.id}><span>{field.label}</span>
    {field.type === 'color' ? <>
      <ColorInput
        colorLabel={field.label}
        value={floor?.values[field.id] ?? ''}
        trailingLabel={themeDeclaration && binding?.mode !== 'custom' ? themeLabel(field.id, binding?.slot ?? themeDeclaration.defaultSlot) : undefined}
        onChange={value => handleColorTextChange(field.id, value, change)}
      />
      {themeDeclaration && binding?.mode === 'custom' ? <div className="theme-binding-row"><span className="theme-binding-status">自定义颜色</span><button type="button" onClick={() => onThemeColorRelink(field.id, themeDeclaration.defaultSlot)} aria-label={`重新关联${themeLabel(field.id, themeDeclaration.defaultSlot)}`}>重新关联</button></div> : null}
    </> : null}
    {field.type === 'image' ? <div className="upload-field"><input aria-label={field.label} type="file" accept="image/*" onChange={async event => { const file = event.target.files?.[0]; if (file) onChange(field.id, await fileToDataUrl(file)) }} /><span>{floor?.values[field.id] ? '已选择图片' : '选择本地图片'}</span></div> : null}
    {field.type === 'choice' ? <ChoiceSelect label={field.label} value={floor?.values[field.id] ?? field.defaultValue} options={field.options} onChange={value => onChange(field.id, value)} /> : null}
    {field.type === 'range' ? <div className="range-field"><input aria-label={field.label} type="range" min={field.min} max={field.max} step={field.step} value={floor?.values[field.id] ?? field.defaultValue} style={{ background: rangeBackground(floor?.values[field.id] ?? field.defaultValue, field.min, field.max) }} onChange={event => onChange(field.id, event.target.value)} /><output>{floor?.values[field.id] ?? field.defaultValue}{field.unit}</output></div> : null}
  </label>}
  const hasMediaOrProducts = Boolean((template?.mediaConfig && floor?.media) || (visibleMediaSlots && floor?.mediaSlots) || visibleProductSlots.length)
  return <aside className="panel property-panel"><div className="panel-heading"><div><h2>属性</h2><small>{template?.name ?? '选择楼层开始编辑'}</small></div></div>
    {!floor || !template ? <div className="empty-panel"><strong>还没有选中楼层</strong><p>在画布中选择一个楼层后，这里会出现可编辑内容。</p></div> : <>
      {contentFields.length || navigationCount ? <InspectorSection title="内容"><div className="field-list">{contentFields.map(renderField)}{navigationCount ? <div className="navigation-copy-list">{floor.navigationItems?.slice(0, navigationCount).map((item, index) => template.id === 'head-category-navigation' ? <div className="navigation-item-fields" key={index}><strong>导航 {index + 1}</strong><label className="field"><span>文案</span><input className="property-text-input" aria-label={`文案 ${index + 1}`} value={item.text} onChange={event => onNavigationItemChange(index, { ...item, text: event.target.value })} /></label><label className="field"><span>链接</span><input className="property-text-input" type="url" aria-label={`链接 ${index + 1}`} placeholder="https://" value={item.url} onChange={event => onNavigationItemChange(index, { ...item, url: event.target.value })} /></label></div> : <label className="field" key={index}><span>文案 {index + 1}</span><input className="property-text-input" aria-label={`文案 ${index + 1}`} value={item.text} onChange={event => onNavigationItemChange(index, { ...item, text: event.target.value })} /></label>)}</div> : null}</div></InspectorSection> : null}
      {hasMediaOrProducts ? <InspectorSection title="图片与商品">{template.mediaConfig && floor.media ? <BannerMediaEditor value={floor.media} onChange={onMediaChange} animation={floor.animation} onAnimationChange={onAnimationChange} gifDrafts={gifDrafts} /> : null}{visibleMediaSlots && floor.mediaSlots ? <div className="manual-media-list">{visibleMediaSlots.map(slot => <ManualMediaEditor key={slot.id} label={slot.label} value={floor.mediaSlots![slot.id]} onChange={value => onMediaSlotChange(slot.id, value)} />)}</div> : null}{pricePrefixField ? <div className="product-shared-fields">{renderField(pricePrefixField)}</div> : null}{visibleProductSlots.length ? <div className="product-list">{visibleProductSlots.map(slot => <ProductSlotEditor key={slot.id} label={slot.label} value={floor.products[slot.id]} onChange={value => onProductChange(slot.id, value)} showPrice={slot.showPrice !== false} showDescription={slot.showDescription === true} showActionText={slot.showActionText === true} defaultActionText={floor.values.cardButtonText ?? slot.defaultActionText} defaultTextColor={floor.values.textColor || '#000000'} requiredLink={template.category === 'product-card'} />)}</div> : null}</InspectorSection> : null}
      {colorFields.length ? <InspectorSection title="样式" defaultOpen={false}><div className="field-list">{colorFields.map(renderField)}</div></InspectorSection> : null}
    </>}
  </aside>
}

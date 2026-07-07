import type { FloorInstance, MediaState, NavigationItem, ThemeColorField, ThemeSlot } from '../domain/edm'
import { getTemplate } from '../templates/registry'
import { ProductSlotEditor } from './ProductSlotEditor'
import { InspectorSection } from './InspectorSection'
import { BannerMediaEditor } from './BannerMediaEditor'
import { ManualMediaEditor } from './ManualMediaEditor'
import { getActiveProductSlots } from '../templates/productSlots'
import { fileToDataUrl } from '../media/fileDataUrl'
import { getColorPreviewValue, normalizeHexColorInput } from '../themes/colorInput'

export function PropertyPanel({ floor, themeFields = [], onChange, onThemeColorChange, onThemeColorRelink, onNavigationItemChange, onMediaChange, onAnimationChange = () => {}, onMediaSlotChange = () => {}, onProductChange, onDuplicate, onDelete }: { floor?: FloorInstance; themeFields?: ThemeColorField[]; onChange: (fieldId: string, value: string) => void; onThemeColorChange: (fieldId: string, color: string) => void; onThemeColorRelink: (fieldId: string, slot: ThemeSlot) => void; onNavigationItemChange: (index: number, value: NavigationItem) => void; onMediaChange: (value: MediaState) => void; onAnimationChange?: (value: import('../domain/edm').BannerAnimation) => void; onMediaSlotChange?: (slotId: string, value: MediaState) => void; onProductChange: (slotId: string, value: import('../domain/edm').ProductValue) => void; onDuplicate: () => void; onDelete: () => void }) {
  const template = floor ? getTemplate(floor.templateId)?.definition : undefined
  const colorFields = template?.fields.filter(field => field.type === 'color') ?? []
  const navigationCount = template?.navigationConfig ? Math.min(template.navigationConfig.maxItems, Math.max(template.navigationConfig.minItems, Number(floor?.values.navigationCount) || template.navigationConfig.minItems)) : 0
  const mediaSlotCount = template?.mediaSlotCountFieldId ? Number(floor?.values[template.mediaSlotCountFieldId]) : template?.mediaSlots?.length
  const contentFields = template?.fields.filter(field => {
    if (field.type === 'color') return false
    if (template.id !== 'selling-points-information') return true
    const match = field.id.match(/^point(\d+)(Title|Description)$/)
    return !match || Number(match[1]) <= (mediaSlotCount ?? 0)
  }) ?? []
  const visibleMediaSlots = template?.mediaSlots?.slice(0, mediaSlotCount)
  const visibleProductSlots = template && floor ? getActiveProductSlots(template, floor) : []
  const themeLabel = (fieldId: string, slot: ThemeSlot) => fieldId === 'buttonBackground' ? `按钮色 ${slot}` : `背景间隔色 ${slot}`
  const handleColorTextChange = (fieldId: string, value: string, change: (fieldId: string, value: string) => void) => {
    change(fieldId, normalizeHexColorInput(value) ?? value)
  }
  const renderField = (field: NonNullable<typeof template>['fields'][number]) => {
    const themeDeclaration = themeFields.find(item => item.fieldId === field.id)
    const binding = floor?.themeColors?.[field.id]
    const change = field.type === 'color' && themeDeclaration ? onThemeColorChange : onChange
    return <label className="field" key={field.id}><span>{field.label}</span>
    {field.type === 'text' ? <textarea aria-label={field.label} value={floor?.values[field.id] ?? ''} onChange={event => onChange(field.id, event.target.value)} /> : null}
    {field.type === 'color' ? <><div className="color-field"><input aria-label={field.label} type="color" value={getColorPreviewValue(floor?.values[field.id] ?? '', '#ffffff')} onChange={event => change(field.id, event.target.value)} /><input value={floor?.values[field.id] ?? ''} onChange={event => handleColorTextChange(field.id, event.target.value, change)} aria-label={`${field.label}色值`} /></div>{themeDeclaration ? <div className="theme-binding-row"><span className="theme-binding-status">{binding?.mode === 'custom' ? '自定义颜色' : themeLabel(field.id, themeDeclaration.defaultSlot)}</span>{binding?.mode === 'custom' ? <button type="button" onClick={() => onThemeColorRelink(field.id, themeDeclaration.defaultSlot)} aria-label={`重新关联${themeLabel(field.id, themeDeclaration.defaultSlot)}`}>重新关联</button> : null}</div> : null}</> : null}
    {field.type === 'image' ? <div className="upload-field"><input aria-label={field.label} type="file" accept="image/*" onChange={async event => { const file = event.target.files?.[0]; if (file) onChange(field.id, await fileToDataUrl(file)) }} /><span>{floor?.values[field.id] ? '已选择图片' : '选择本地图片'}</span></div> : null}
    {field.type === 'choice' ? <div className={`choice-field${field.id === 'navigationCount' ? ' choice-field--three' : ''}`}>{field.options.map(option => <button type="button" aria-label={option.label} className={floor?.values[field.id] === option.value ? 'is-active' : ''} aria-pressed={floor?.values[field.id] === option.value} key={option.value} onClick={() => onChange(field.id, option.value)}>{option.label}</button>)}</div> : null}
    {field.type === 'range' ? <div className="range-field"><input aria-label={field.label} type="range" min={field.min} max={field.max} step={field.step} value={floor?.values[field.id] ?? field.defaultValue} onChange={event => onChange(field.id, event.target.value)} /><output>{floor?.values[field.id] ?? field.defaultValue}{field.unit}</output></div> : null}
  </label>}
  return <aside className="panel property-panel"><div className="panel-heading"><div><h2>属性</h2><small>内容检查器</small></div>{template ? <span>{template.name}</span> : null}</div>
    {!floor || !template ? <div className="empty-panel"><strong>还没有选中楼层</strong><p>在画布中选择一个楼层后，这里会出现可编辑内容。</p></div> : <>
      {contentFields.length ? <InspectorSection title="内容"><div className="field-list">{contentFields.map(renderField)}{navigationCount ? <div className="navigation-copy-list">{floor.navigationItems?.slice(0, navigationCount).map((item, index) => <label className="field" key={index}><span>文案 {index + 1}</span><input className="property-text-input" aria-label={`文案 ${index + 1}`} value={item.text} onChange={event => onNavigationItemChange(index, { ...item, text: event.target.value })} /></label>)}</div> : null}</div></InspectorSection> : null}
      {template.mediaConfig && floor.media ? <InspectorSection title="图片"><BannerMediaEditor value={floor.media} onChange={onMediaChange} animation={floor.animation} onAnimationChange={onAnimationChange} /></InspectorSection> : null}
      {visibleMediaSlots && floor.mediaSlots ? <InspectorSection title="图片"><div className="manual-media-list">{visibleMediaSlots.map(slot => <ManualMediaEditor key={slot.id} label={slot.label} value={floor.mediaSlots![slot.id]} onChange={value => onMediaSlotChange(slot.id, value)} />)}</div></InspectorSection> : null}
      {colorFields.length ? <InspectorSection title="颜色"><div className="field-list">{colorFields.map(renderField)}</div></InspectorSection> : null}
      {visibleProductSlots.length ? <InspectorSection title="商品"><div className="product-list">{visibleProductSlots.map(slot => <ProductSlotEditor key={slot.id} label={slot.label} value={floor.products[slot.id]} onChange={value => onProductChange(slot.id, value)} showPrice={slot.showPrice !== false} />)}</div></InspectorSection> : null}
      <InspectorSection title="操作"><div className="panel-actions">{floor.templateId !== 'head-brand-logo' && floor.templateId !== 'footer-links' ? <button onClick={onDuplicate} aria-label="复制楼层">复制楼层</button> : null}<button className="danger" onClick={onDelete} aria-label="删除楼层">删除楼层</button></div></InspectorSection>
    </>}
  </aside>
}

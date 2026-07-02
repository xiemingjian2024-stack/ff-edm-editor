import type { FloorInstance, MediaState, NavigationItem, ThemeSlot } from '../domain/edm'
import { getTemplate } from '../templates/registry'
import { ProductSlotEditor } from './ProductSlotEditor'
import { InspectorSection } from './InspectorSection'
import { BannerMediaEditor } from './BannerMediaEditor'
import { ManualMediaEditor } from './ManualMediaEditor'

export function PropertyPanel({ floor, onChange, onThemeColorChange, onThemeColorRelink, onNavigationItemChange, onMediaChange, onMediaSlotChange = () => {}, onProductChange, onDuplicate, onDelete }: { floor?: FloorInstance; onChange: (fieldId: string, value: string) => void; onThemeColorChange: (fieldId: string, color: string) => void; onThemeColorRelink: (fieldId: string, slot: ThemeSlot) => void; onNavigationItemChange: (index: number, value: NavigationItem) => void; onMediaChange: (value: MediaState) => void; onMediaSlotChange?: (slotId: string, value: MediaState) => void; onProductChange: (slotId: string, value: import('../domain/edm').ProductValue) => void; onDuplicate: () => void; onDelete: () => void }) {
  const template = floor ? getTemplate(floor.templateId)?.definition : undefined
  const contentFields = template?.fields.filter(field => field.type !== 'color') ?? []
  const colorFields = template?.fields.filter(field => field.type === 'color') ?? []
  const navigationCount = template?.navigationConfig ? Math.min(template.navigationConfig.maxItems, Math.max(template.navigationConfig.minItems, Number(floor?.values.navigationCount) || template.navigationConfig.minItems)) : 0
  const renderField = (field: NonNullable<typeof template>['fields'][number]) => {
    const themeDeclaration = template?.themeColorFields?.find(item => item.fieldId === field.id)
    const binding = floor?.themeColors?.[field.id]
    const change = field.type === 'color' && themeDeclaration ? onThemeColorChange : onChange
    return <label className="field" key={field.id}><span>{field.label}</span>
    {field.type === 'text' ? <textarea aria-label={field.label} value={floor?.values[field.id] ?? ''} onChange={event => onChange(field.id, event.target.value)} /> : null}
    {field.type === 'color' ? <><div className="color-field"><input aria-label={field.label} type="color" value={floor?.values[field.id] ?? '#ffffff'} onChange={event => change(field.id, event.target.value)} /><input value={floor?.values[field.id] ?? ''} onChange={event => change(field.id, event.target.value)} aria-label={`${field.label}色值`} /></div>{themeDeclaration ? <div className="theme-binding-row"><span className="theme-binding-status">{binding?.mode === 'custom' ? '自定义颜色' : `主题色位 ${binding?.mode === 'theme' ? binding.slot : themeDeclaration.defaultSlot}`}</span>{binding?.mode === 'custom' ? <button type="button" onClick={() => onThemeColorRelink(field.id, themeDeclaration.defaultSlot)} aria-label={`重新关联主题色位 ${themeDeclaration.defaultSlot}`}>重新关联</button> : null}</div> : null}</> : null}
    {field.type === 'image' ? <div className="upload-field"><input aria-label={field.label} type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) onChange(field.id, URL.createObjectURL(file)) }} /><span>{floor?.values[field.id] ? '已选择图片' : '选择本地图片'}</span></div> : null}
    {field.type === 'choice' ? <div className="choice-field">{field.options.map(option => <button type="button" aria-label={option.label} className={floor?.values[field.id] === option.value ? 'is-active' : ''} aria-pressed={floor?.values[field.id] === option.value} key={option.value} onClick={() => onChange(field.id, option.value)}>{option.label}</button>)}</div> : null}
    {field.type === 'range' ? <div className="range-field"><input aria-label={field.label} type="range" min={field.min} max={field.max} step={field.step} value={floor?.values[field.id] ?? field.defaultValue} onChange={event => onChange(field.id, event.target.value)} /><output>{floor?.values[field.id] ?? field.defaultValue}{field.unit}</output></div> : null}
  </label>}
  return <aside className="panel property-panel"><div className="panel-heading"><div><h2>属性</h2><small>内容检查器</small></div>{template ? <span>{template.name}</span> : null}</div>
    {!floor || !template ? <div className="empty-panel"><strong>还没有选中楼层</strong><p>在画布中选择一个楼层后，这里会出现可编辑内容。</p></div> : <>
      {contentFields.length ? <InspectorSection title="内容"><div className="field-list">{contentFields.map(renderField)}</div></InspectorSection> : null}
      {template.mediaConfig && floor.media ? <InspectorSection title="图片"><BannerMediaEditor value={floor.media} onChange={onMediaChange} /></InspectorSection> : null}
      {template.mediaSlots && floor.mediaSlots ? <InspectorSection title="图片"><div className="manual-media-list">{template.mediaSlots.map(slot => <ManualMediaEditor key={slot.id} label={slot.label} value={floor.mediaSlots![slot.id]} onChange={value => onMediaSlotChange(slot.id, value)} />)}</div></InspectorSection> : null}
      {navigationCount ? <InspectorSection title="导航项"><div className="navigation-item-list">{floor.navigationItems?.slice(0, navigationCount).map((item, index) => <fieldset className="navigation-item-editor" key={index}><legend>导航项 {index + 1}</legend><label><span>文案</span><input aria-label={`导航项 ${index + 1} 文案`} value={item.text} onChange={event => onNavigationItemChange(index, { ...item, text: event.target.value })} /></label><label><span>链接（可不填）</span><input aria-label={`导航项 ${index + 1} 链接`} value={item.url} onChange={event => onNavigationItemChange(index, { ...item, url: event.target.value })} placeholder="粘贴链接或其他字符" /></label></fieldset>)}</div></InspectorSection> : null}
      {colorFields.length ? <InspectorSection title="颜色"><div className="field-list">{colorFields.map(renderField)}</div></InspectorSection> : null}
      {template.productSlots.length ? <InspectorSection title="商品"><div className="product-list">{template.productSlots.map(slot => <ProductSlotEditor key={slot.id} label={slot.label} value={floor.products[slot.id]} onChange={value => onProductChange(slot.id, value)} />)}</div></InspectorSection> : null}
      <InspectorSection title="操作"><div className="panel-actions"><button onClick={onDuplicate} aria-label="复制楼层">复制楼层</button><button className="danger" onClick={onDelete} aria-label="删除楼层">删除楼层</button></div></InspectorSection>
    </>}
  </aside>
}

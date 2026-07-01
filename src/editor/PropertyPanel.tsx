import type { FloorInstance } from '../domain/edm'
import { getTemplate } from '../templates/registry'
import { ProductSlotEditor } from './ProductSlotEditor'
import { InspectorSection } from './InspectorSection'

export function PropertyPanel({ floor, onChange, onProductChange, onDuplicate, onDelete }: { floor?: FloorInstance; onChange: (fieldId: string, value: string) => void; onProductChange: (slotId: string, value: import('../domain/edm').ProductValue) => void; onDuplicate: () => void; onDelete: () => void }) {
  const template = floor ? getTemplate(floor.templateId)?.definition : undefined
  const contentFields = template?.fields.filter(field => field.type !== 'color') ?? []
  const colorFields = template?.fields.filter(field => field.type === 'color') ?? []
  const renderField = (field: NonNullable<typeof template>['fields'][number]) => <label className="field" key={field.id}><span>{field.label}</span>
    {field.type === 'text' ? <textarea aria-label={field.label} value={floor?.values[field.id] ?? ''} onChange={event => onChange(field.id, event.target.value)} /> : null}
    {field.type === 'color' ? <div className="color-field"><input aria-label={field.label} type="color" value={floor?.values[field.id] ?? '#ffffff'} onChange={event => onChange(field.id, event.target.value)} /><input value={floor?.values[field.id] ?? ''} onChange={event => onChange(field.id, event.target.value)} aria-label={`${field.label}色值`} /></div> : null}
    {field.type === 'image' ? <div className="upload-field"><input aria-label={field.label} type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) onChange(field.id, URL.createObjectURL(file)) }} /><span>{floor?.values[field.id] ? '已选择图片' : '选择本地图片'}</span></div> : null}
  </label>
  return <aside className="panel property-panel"><div className="panel-heading"><div><h2>属性</h2><small>内容检查器</small></div>{template ? <span>{template.name}</span> : null}</div>
    {!floor || !template ? <div className="empty-panel"><strong>还没有选中楼层</strong><p>在画布中选择一个楼层后，这里会出现可编辑内容。</p></div> : <>
      {contentFields.length ? <InspectorSection title="内容"><div className="field-list">{contentFields.map(renderField)}</div></InspectorSection> : null}
      {colorFields.length ? <InspectorSection title="颜色"><div className="field-list">{colorFields.map(renderField)}</div></InspectorSection> : null}
      {template.productSlots.length ? <InspectorSection title="商品"><div className="product-list">{template.productSlots.map(slot => <ProductSlotEditor key={slot.id} label={slot.label} value={floor.products[slot.id]} onChange={value => onProductChange(slot.id, value)} />)}</div></InspectorSection> : null}
      <InspectorSection title="操作"><div className="panel-actions"><button onClick={onDuplicate} aria-label="复制楼层">复制楼层</button><button className="danger" onClick={onDelete} aria-label="删除楼层">删除楼层</button></div></InspectorSection>
    </>}
  </aside>
}

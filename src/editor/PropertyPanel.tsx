import type { FloorInstance } from '../domain/edm'
import { getTemplate } from '../templates/registry'

export function PropertyPanel({ floor, onChange, onDuplicate, onDelete }: { floor?: FloorInstance; onChange: (fieldId: string, value: string) => void; onDuplicate: () => void; onDelete: () => void }) {
  const template = floor ? getTemplate(floor.templateId)?.definition : undefined
  return <aside className="panel property-panel"><div className="panel-heading"><h2>属性</h2>{template ? <span>{template.name}</span> : null}</div>
    {!floor || !template ? <div className="empty-panel"><strong>还没有选中楼层</strong><p>在画布中选择一个楼层后，这里会出现可编辑内容。</p></div> : <>
      <div className="field-list">{template.fields.map(field => <label className="field" key={field.id}><span>{field.label}</span>
        {field.type === 'text' ? <textarea aria-label={field.label} value={floor.values[field.id]} onChange={event => onChange(field.id, event.target.value)} /> : null}
        {field.type === 'color' ? <div className="color-field"><input aria-label={field.label} type="color" value={floor.values[field.id]} onChange={event => onChange(field.id, event.target.value)} /><input value={floor.values[field.id]} onChange={event => onChange(field.id, event.target.value)} aria-label={`${field.label}色值`} /></div> : null}
        {field.type === 'image' ? <div className="upload-field"><input aria-label={field.label} type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) onChange(field.id, URL.createObjectURL(file)) }} /><span>{floor.values[field.id] ? '已选择图片' : '选择本地图片'}</span></div> : null}
      </label>)}</div>
      <div className="panel-actions"><button onClick={onDuplicate} aria-label="复制楼层">复制楼层</button><button className="danger" onClick={onDelete} aria-label="删除楼层">删除楼层</button></div>
    </>}
  </aside>
}

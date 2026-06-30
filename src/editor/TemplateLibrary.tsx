import { templateRegistry } from '../templates/registry'

const categoryNames = { banner: 'Banner', title: '标题', 'product-card': '商品卡', content: '内容区', promotion: '优惠区', footer: 'Footer' }

export function TemplateLibrary({ onAdd }: { onAdd: (templateId: string) => void }) {
  return <aside className="panel template-library">
    <div className="panel-heading"><h2>楼层库</h2><span>{templateRegistry.length} 个模板</span></div>
    {Object.entries(categoryNames).map(([category, name]) => {
      const templates = templateRegistry.filter(item => item.definition.category === category)
      if (!templates.length) return null
      return <section className="template-category" key={category}><h3>{name}</h3><div className="template-list">
        {templates.map(({ definition }) => <button className="template-tile" key={definition.id} onClick={() => onAdd(definition.id)} aria-label={`添加 ${definition.name}`}>
          <span className={`template-mini template-mini--${definition.category}`}><i /></span><strong>{definition.name}</strong><small>{definition.designWidth} × {definition.designHeight}</small>
        </button>)}
      </div></section>
    })}
  </aside>
}

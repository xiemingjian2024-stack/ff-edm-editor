import { useDeferredValue, useState } from 'react'
import { templateRegistry } from '../templates/registry'
import { Icon } from '../ui/Icon'

const categoryNames = { head: 'HEAD', banner: 'Banner', title: '标题', 'product-card': '商品卡', content: '内容区', promotion: '优惠区', footer: 'Footer' }

export function TemplateLibrary({ onAdd }: { onAdd: (templateId: string) => void }) {
  const [query, setQuery] = useState(''); const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const filtered = templateRegistry.filter(item => item.definition.name.toLowerCase().includes(deferredQuery) || categoryNames[item.definition.category].toLowerCase().includes(deferredQuery))
  return <aside className="panel template-library">
    <div className="library-tabs"><button className="is-active">楼层</button><button disabled>元素</button></div>
    <label className="template-search"><Icon name="search"/><input aria-label="搜索楼层模板" placeholder="搜索楼层..." value={query} onChange={event => setQuery(event.target.value)}/></label>
    {filtered.length === 0 ? <div className="library-empty"><strong>没有匹配的楼层</strong><p>换一个关键词试试</p></div> : null}
    {Object.entries(categoryNames).map(([category, name]) => {
      const templates = filtered.filter(item => item.definition.category === category)
      if (!templates.length) return null
      return <section className="template-category" key={category}><h3>{name}</h3><div className="template-list">
        {templates.map(({ definition }) => <button className="template-tile" key={definition.id} onClick={() => onAdd(definition.id)} aria-label={`添加 ${definition.name}`}>
          <span className={`template-mini template-mini--${definition.category}`}><i /></span><strong>{definition.name}</strong><small>{definition.designWidth} × {definition.designHeight}</small>
          {definition.themeColorFields?.map(item => <em className="theme-slot-tag" key={item.fieldId}>主题色位 {item.defaultSlot}</em>)}
        </button>)}
      </div></section>
    })}
  </aside>
}

import { useDeferredValue, useState } from 'react'
import { templateRegistry } from '../templates/registry'
import { Icon } from '../ui/Icon'
import type { ThemePalette } from '../domain/edm'
import { classicPalette, themePalettes } from '../themes/palettes'

const categoryNames = { head: 'HEAD', banner: 'Banner', title: '标题', 'product-card': '商品卡', content: '内容区', promotion: '优惠区', footer: 'Footer' }

export function TemplateLibrary({ onAdd, paletteId = classicPalette.id, palettes = themePalettes, onPaletteChange = () => {} }: { onAdd: (templateId: string) => void; paletteId?: string; palettes?: ThemePalette[]; onPaletteChange?: (paletteId: string) => void }) {
  const [query, setQuery] = useState(''); const deferredQuery = useDeferredValue(query.trim().toLowerCase())
  const [activeTab, setActiveTab] = useState<'floors' | 'palettes'>('floors')
  const filtered = templateRegistry.filter(item => !item.definition.hiddenInLibrary && (item.definition.name.toLowerCase().includes(deferredQuery) || categoryNames[item.definition.category].toLowerCase().includes(deferredQuery)))
  return <aside className="panel template-library">
    <div className="library-tabs"><button className={activeTab === 'floors' ? 'is-active' : ''} onClick={() => setActiveTab('floors')}>楼层</button><button className={activeTab === 'palettes' ? 'is-active' : ''} onClick={() => setActiveTab('palettes')}>配色</button></div>
    {activeTab === 'palettes' ? <div className="palette-library">
      <header><h2>配色套餐</h2><p>选择后，关联主题色位的楼层会同步更新。</p></header>
      {palettes.map(palette => <button className={`palette-card ${palette.id === paletteId ? 'is-selected' : ''}`} key={palette.id} onClick={() => onPaletteChange(palette.id)} aria-label={`应用配色套餐 ${palette.name}`}>
        <span className="palette-card-title"><strong>{palette.name}</strong>{palette.id === paletteId ? <em>使用中</em> : null}</span>
        <span className="palette-slot-list">{Object.entries(palette.slots).map(([slot, color]) => <span className="palette-slot" key={slot}><i style={{ backgroundColor: color }} /><span><strong>主题色位 {slot}</strong><small>{color}</small></span></span>)}</span>
      </button>)}
    </div> : <>
    <label className="template-search"><Icon name="search"/><input aria-label="搜索楼层模板" placeholder="搜索楼层..." value={query} onChange={event => setQuery(event.target.value)}/></label>
    {filtered.length === 0 ? <div className="library-empty"><strong>没有匹配的楼层</strong><p>换一个关键词试试</p></div> : null}
    {Object.entries(categoryNames).map(([category, name]) => {
      const templates = filtered.filter(item => item.definition.category === category)
      if (!templates.length) return null
      return <section className="template-category" key={category}><h3>{name}</h3><div className="template-list">
        {templates.map(({ definition }) => <button className="template-tile" key={definition.id} onClick={() => onAdd(definition.id)} aria-label={`添加 ${definition.name}`}>
          <span data-testid="template-thumbnail" className={`template-mini template-mini--${definition.category}`}><i /></span><strong>{definition.name}</strong><small>{definition.designWidth} × {definition.designHeight}</small>
        </button>)}
      </div></section>
    })}</>}
  </aside>
}

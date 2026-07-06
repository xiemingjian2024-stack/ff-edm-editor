import { useDeferredValue, useState } from 'react'
import { templateRegistry } from '../templates/registry'
import { Icon } from '../ui/Icon'
import type { ThemePalette } from '../domain/edm'
import { classicPalette, themePalettes } from '../themes/palettes'
import logoThumb from '../assets/thumbnails/缩略图-head-品牌logo.svg'
import navigationThumb from '../assets/thumbnails/缩略图-head-分类导航.svg'
import regularBannerThumb from '../assets/thumbnails/缩略图-banner-常规banner.svg'
import imageCopyBannerThumb from '../assets/thumbnails/缩略图-banner-常规banner-1.svg'
import titleThumb from '../assets/thumbnails/缩略图-标题-常规标题.svg'
import comparisonThumb from '../assets/thumbnails/缩略图-信息-对比信息.svg'
import pointsThumb from '../assets/thumbnails/缩略图-信息-多卖点信息.svg'
import singlePointThumb from '../assets/thumbnails/缩略图-信息-单卖点信息.svg'
import productsThumb from '../assets/thumbnails/缩略图-商品卡-Nx2商品卡.svg'
import productListThumb from '../assets/thumbnails/缩略图-商品卡-Nx1商品卡.svg'
import codeThumb from '../assets/thumbnails/缩略图-信息-CODE.svg'
import productGridThreeThumb from '../assets/thumbnails/缩略图-商品卡-Nx3商品卡.svg'
import footerThumb from '../assets/thumbnails/缩略图-页尾-页尾.svg'

const categoryNames = { head: 'HEAD', banner: 'Banner', title: '标题', information: '信息', 'product-card': '商品卡', content: '内容区', promotion: '优惠区', footer: '页尾' }
const thumbnails: Record<string, string> = { 'head-brand-logo': logoThumb, 'head-category-navigation': navigationThumb, 'banner-regular': regularBannerThumb, 'banner-image-copy': imageCopyBannerThumb, 'title-centered': titleThumb, 'comparison-information': comparisonThumb, 'single-selling-point-information': singlePointThumb, 'selling-points-information': pointsThumb, 'code-information': codeThumb, 'product-grid-n-by-2': productsThumb, 'product-list-n-by-1': productListThumb, 'product-grid-n-by-3': productGridThreeThumb, 'footer-links': footerThumb }

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
          <span data-testid="template-thumbnail" className={`template-mini template-mini--${definition.category}`}>{thumbnails[definition.id] ? <img src={thumbnails[definition.id]} alt="" /> : <i />}</span><strong>{definition.name}</strong><small>{definition.designWidth} × {definition.designHeight}</small>
        </button>)}
      </div></section>
    })}</>}
  </aside>
}

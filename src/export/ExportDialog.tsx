import { useEffect, useState } from 'react'
import type { EdmDraft, ThemePalette } from '../domain/edm'
import { Icon } from '../ui/Icon'
import { classicPalette } from '../themes/palettes'
import { getThemeFieldsForFloors, resolveFloorForRender } from '../themes/resolveThemeColor'
import { getTemplate as getTemplateForDialog } from '../templates/registry'
import { validateDraft } from './validate'
import { buildBrandLogoEmailHtml, buildLightweightBrandLogoEmailHtml } from './logoHtml'
import { buildCategoryNavigationEmailHtml } from './categoryNavigationHtml'
import { buildBannerImageCopyEmailHtml } from './bannerImageCopyHtml'
import { buildTitleCenteredEmailHtml } from './titleCenteredHtml'
import { buildProductGridNBy2EmailHtml } from './productGridNBy2Html'
import { buildProductListNBy1EmailHtml } from './productListNBy1Html'
import { buildProductGridNBy3EmailHtml } from './productGridNBy3Html'
import { buildProductIntroductionCardsEmailHtml } from './productIntroductionCardsHtml'
import { syncBannerImageCopyAsset, syncBrandLogoAsset, syncProductCardAssets, syncProductGridNBy2Assets } from './klaviyoSync'
import { getKlaviyoStatus, type KlaviyoStatus } from '../klaviyo/client'
import { KlaviyoSettingsDialog } from '../klaviyo/KlaviyoSettingsDialog'

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

export function ExportDialog({ draft, palettes = [classicPalette], previewOnly = false, onClose, onExport, onSyncBannerImage = syncBannerImageCopyAsset, onSyncBrandLogo = syncBrandLogoAsset, onSyncProductGridNBy2Images = syncProductGridNBy2Assets, onSyncProductCardImages = syncProductCardAssets }: { draft: EdmDraft; palettes?: ThemePalette[]; previewOnly?: boolean; onClose: () => void; onExport: () => Promise<void>; onSyncBannerImage?: (floorId: string, floor: import('../domain/edm').FloorInstance) => Promise<{ url: string; reused: boolean }>; onSyncBrandLogo?: (floorId: string) => Promise<{ url: string; reused: boolean }>; onSyncProductGridNBy2Images?: (floorId: string) => Promise<string[]>; onSyncProductCardImages?: (floorId: string, templateId: string) => Promise<string[]> }) {
  const issues = validateDraft(draft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [copiedFloorId, setCopiedFloorId] = useState<string | null>(null)
  const [syncingFloorId, setSyncingFloorId] = useState<string | null>(null)
  const [klaviyoStatus, setKlaviyoStatus] = useState<KlaviyoStatus>({ available: true, connected: false, suffix: '' })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const palette = palettes.find(item => item.id === draft.themePaletteId) ?? classicPalette
  const themeFields = getThemeFieldsForFloors(draft.floors)
  const htmlFloors = draft.floors.flatMap(floor => {
    if (floor.templateId !== 'head-brand-logo' && floor.templateId !== 'head-category-navigation' && floor.templateId !== 'banner-image-copy' && floor.templateId !== 'title-centered' && floor.templateId !== 'product-grid-n-by-2' && floor.templateId !== 'product-list-n-by-1' && floor.templateId !== 'product-grid-n-by-3' && floor.templateId !== 'product-introduction-cards') return []
    const entry = getTemplateForDialog(floor.templateId)
    const resolved = entry ? resolveFloorForRender(floor, entry.definition, palette, themeFields[floor.id]) : floor
    const label = floor.templateId === 'head-brand-logo' ? 'Logo' : floor.templateId === 'head-category-navigation' ? '分类导航' : floor.templateId === 'title-centered' ? '常规标题' : floor.templateId === 'product-grid-n-by-2' ? 'N×2 商品卡' : floor.templateId === 'product-list-n-by-1' ? 'N×1 商品卡' : floor.templateId === 'product-grid-n-by-3' ? 'N×3 商品卡' : floor.templateId === 'product-introduction-cards' ? '产品介绍卡' : '图文 Banner'
    return [{ floor: resolved, label }]
  })
  useEffect(() => { void getKlaviyoStatus().then(setKlaviyoStatus) }, [])
  const run = async () => { setBusy(true); setError(''); try { await onExport() } catch (reason) { setError(reason instanceof Error ? reason.message : '导出失败') } finally { setBusy(false) } }
  const copyFloorHtml = async (floorId: string) => {
    const item = htmlFloors.find(candidate => candidate.floor.id === floorId)
    if (!item) return
    const logoNeedsImage = item.floor.templateId === 'head-brand-logo' && item.floor.values.logoHtmlMode !== 'pixel'
    if ((logoNeedsImage || item.floor.templateId === 'banner-image-copy' || item.floor.templateId.startsWith('product-')) && !klaviyoStatus.connected) { setSettingsOpen(true); return }
    try {
      setSyncingFloorId(floorId); setError('')
      let html: string
      if (item.floor.templateId === 'head-brand-logo') html = item.floor.values.logoHtmlMode === 'pixel' ? buildBrandLogoEmailHtml(item.floor) : buildLightweightBrandLogoEmailHtml(item.floor, (await onSyncBrandLogo(floorId)).url)
      else if (item.floor.templateId === 'head-category-navigation') html = buildCategoryNavigationEmailHtml(item.floor)
      else if (item.floor.templateId === 'title-centered') html = buildTitleCenteredEmailHtml(item.floor)
      else if (item.floor.templateId === 'product-grid-n-by-2') html = buildProductGridNBy2EmailHtml(item.floor, await onSyncProductGridNBy2Images(floorId))
      else if (item.floor.templateId === 'product-list-n-by-1') html = buildProductListNBy1EmailHtml(item.floor, await onSyncProductCardImages(floorId, item.floor.templateId))
      else if (item.floor.templateId === 'product-grid-n-by-3') html = buildProductGridNBy3EmailHtml(item.floor, await onSyncProductCardImages(floorId, item.floor.templateId))
      else if (item.floor.templateId === 'product-introduction-cards') html = buildProductIntroductionCardsEmailHtml(item.floor, await onSyncProductCardImages(floorId, item.floor.templateId))
      else html = buildBannerImageCopyEmailHtml(item.floor, (await onSyncBannerImage(floorId, item.floor)).url)
      await copyText(html)
      setCopiedFloorId(floorId)
      window.setTimeout(() => setCopiedFloorId(current => current === floorId ? null : current), 1800)
    } catch (reason) { setError(reason instanceof Error ? reason.message : '复制 HTML 失败，请稍后重试。') }
    finally { setSyncingFloorId(null) }
  }
  return <div className="dialog-backdrop" role="dialog" aria-label={previewOnly ? '完整预览' : '导出切图'}><div className="export-dialog">
    <header><div><h2>{previewOnly ? '完整预览' : '导出检查'}</h2><p>{draft.name} · {draft.floors.length} 个楼层</p></div><div className="export-spec"><span>750 PX JPG</span><span>2× 高清</span><button onClick={onClose} aria-label="关闭预览">关闭</button></div></header>
    <div className="dialog-body"><div className="preview-stack">{draft.floors.map(floor => { const entry = getTemplateForDialog(floor.templateId); return entry ? <entry.Renderer key={floor.id} floor={resolveFloorForRender(floor, entry.definition, palette, themeFields[floor.id])} template={entry.definition} /> : null })}</div><aside>
      <div className="check-heading"><span><Icon name="eye" /></span><div><h3>检查结果</h3><p>导出前确认内容完整</p></div></div>
      {!issues.blockers.length && !issues.warnings.length ? <p className="success">内容完整，可以导出。</p> : null}
      {issues.blockers.map((issue, index) => <p className="issue blocker" key={`b-${issue.floorId}-${index}`}>楼层 {issue.floorNumber}：{issue.message}</p>)}
      {issues.warnings.map((issue, index) => <p className="issue" key={`w-${issue.floorId}-${index}`}>楼层 {issue.floorNumber}：{issue.message}</p>)}
      {error ? <p className="issue blocker">{error}</p> : null}
      {htmlFloors.length ? <section className="html-export-section" aria-label="HTML 代码">
        <div><h3>HTML 代码</h3><p>图文楼层会自动同步图片；原有切图仍会照常导出。</p></div>
        {htmlFloors.some(item => (item.floor.templateId === 'head-brand-logo' && item.floor.values.logoHtmlMode !== 'pixel') || item.floor.templateId === 'banner-image-copy' || item.floor.templateId.startsWith('product-')) ? <div className={`export-connection-status${klaviyoStatus.connected ? ' is-connected' : ''}`}><span aria-hidden="true"/>{klaviyoStatus.connected ? `Klaviyo 已连接 ····${klaviyoStatus.suffix}` : 'Klaviyo 尚未连接'}{!klaviyoStatus.connected ? <button onClick={() => setSettingsOpen(true)}>立即连接</button> : null}</div> : null}
        {htmlFloors.map(({ floor, label }) => <button type="button" className="html-copy-button" disabled={syncingFloorId !== null} key={floor.id} onClick={() => copyFloorHtml(floor.id)}>{syncingFloorId === floor.id ? '正在同步图片…' : copiedFloorId === floor.id ? 'HTML 已复制' : `复制 ${label} HTML`}</button>)}
      </section> : null}
    </aside></div>
    <footer><button onClick={onClose}>返回修改</button>{!previewOnly && !issues.blockers.length ? <button className="primary-button" disabled={busy} onClick={run}>{busy ? '正在生成…' : issues.warnings.length ? '仍然导出' : '下载 ZIP'}</button> : null}</footer>
  </div>{settingsOpen ? <KlaviyoSettingsDialog onClose={() => setSettingsOpen(false)} onStatusChange={setKlaviyoStatus}/> : null}</div>
}

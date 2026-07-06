import { useState } from 'react'
import type { EdmDraft } from '../domain/edm'
import { Icon } from '../ui/Icon'
import { getThemePalette } from '../themes/palettes'
import { getThemeFieldsForFloors, resolveFloorForRender } from '../themes/resolveThemeColor'
import { getTemplate as getTemplateForDialog } from '../templates/registry'
import { validateDraft } from './validate'

export function ExportDialog({ draft, previewOnly = false, onClose, onExport }: { draft: EdmDraft; previewOnly?: boolean; onClose: () => void; onExport: () => Promise<void> }) {
  const issues = validateDraft(draft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const palette = getThemePalette(draft.themePaletteId)
  const themeFields = getThemeFieldsForFloors(draft.floors)
  const run = async () => { setBusy(true); setError(''); try { await onExport() } catch (reason) { setError(reason instanceof Error ? reason.message : '导出失败') } finally { setBusy(false) } }
  return <div className="dialog-backdrop" role="dialog" aria-label={previewOnly ? '完整预览' : '导出切图'}><div className="export-dialog">
    <header><div><h2>{previewOnly ? '完整预览' : '导出检查'}</h2><p>{draft.name} · {draft.floors.length} 个楼层</p></div><div className="export-spec"><span>750 PX JPG</span><span>2× 高清</span><button onClick={onClose} aria-label="关闭预览">关闭</button></div></header>
    <div className="dialog-body"><div className="preview-stack">{draft.floors.map(floor => { const entry = getTemplateForDialog(floor.templateId); return entry ? <entry.Renderer key={floor.id} floor={resolveFloorForRender(floor, entry.definition, palette, themeFields[floor.id])} template={entry.definition} /> : null })}</div><aside>
      <div className="check-heading"><span><Icon name="eye" /></span><div><h3>检查结果</h3><p>导出前确认内容完整</p></div></div>
      {!issues.blockers.length && !issues.warnings.length ? <p className="success">内容完整，可以导出。</p> : null}
      {issues.blockers.map((issue, index) => <p className="issue blocker" key={`b-${issue.floorId}-${index}`}>楼层 {issue.floorNumber}：{issue.message}</p>)}
      {issues.warnings.map((issue, index) => <p className="issue" key={`w-${issue.floorId}-${index}`}>楼层 {issue.floorNumber}：{issue.message}</p>)}
      {error ? <p className="issue blocker">{error}</p> : null}
    </aside></div>
    <footer><button onClick={onClose}>返回修改</button>{!previewOnly && !issues.blockers.length ? <button className="primary-button" disabled={busy} onClick={run}>{busy ? '正在生成…' : issues.warnings.length ? '仍然导出' : '下载 ZIP'}</button> : null}</footer>
  </div></div>
}

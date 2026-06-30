import { useState } from 'react'
import type { EdmDraft } from '../domain/edm'
import { validateDraft } from './validate'

export function ExportDialog({ draft, previewOnly = false, onClose, onExport }: { draft: EdmDraft; previewOnly?: boolean; onClose: () => void; onExport: () => Promise<void> }) {
  const issues = validateDraft(draft); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const run = async () => { setBusy(true); setError(''); try { await onExport() } catch (reason) { setError(reason instanceof Error ? reason.message : '导出失败') } finally { setBusy(false) } }
  return <div className="dialog-backdrop" role="dialog" aria-label={previewOnly ? '完整预览' : '导出切图'}><div className="export-dialog"><header><div><h2>{previewOnly ? '完整预览' : '导出检查'}</h2><p>{draft.floors.length} 个楼层 · 导出宽度 750px</p></div><button onClick={onClose}>关闭</button></header><div className="dialog-body"><div className="preview-stack">{draft.floors.map(floor => { const entry = getTemplateForDialog(floor.templateId); return entry ? <entry.Renderer key={floor.id} floor={floor} template={entry.definition} /> : null })}</div><aside><h3>检查结果</h3>{!issues.blockers.length && !issues.warnings.length ? <p className="success">内容完整，可以导出。</p> : null}{issues.blockers.map(issue => <p className="issue blocker" key={`b-${issue.floorId}`}>楼层 {issue.floorNumber}：{issue.message}</p>)}{issues.warnings.map((issue, index) => <p className="issue" key={`w-${issue.floorId}-${index}`}>楼层 {issue.floorNumber}：{issue.message}</p>)}{error ? <p className="issue blocker">{error}</p> : null}</aside></div><footer><button onClick={onClose}>返回修改</button>{!previewOnly && !issues.blockers.length ? <button className="primary" disabled={busy} onClick={run}>{busy ? '正在生成…' : issues.warnings.length ? '仍然导出' : '下载 ZIP'}</button> : null}</footer></div></div>
}
import { getTemplate as getTemplateForDialog } from '../templates/registry'

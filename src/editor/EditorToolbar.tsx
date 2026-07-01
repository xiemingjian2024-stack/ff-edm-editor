import { Icon } from '../ui/Icon'
import { ToolButton } from '../ui/ToolButton'

export function EditorToolbar({ name, zoom, onNameChange, onBack, onPreview, onExport }: { name: string; zoom: number; onNameChange: (name: string) => void; onBack?: () => void; onPreview: () => void; onExport: () => void }) {
  return <header className="editor-toolbar"><div className="toolbar-identity"><ToolButton label="返回草稿" icon="back" onClick={onBack} /><span className="brand-gem"><i /><i /></span><div><input value={name} onChange={event => onNameChange(event.target.value)} aria-label="EDM 名称"/><small>已保存到当前浏览器</small></div></div><div className="toolbar-viewport"><span>375 PX</span><i /><span>{zoom}%</span></div><div className="toolbar-actions"><ToolButton label="撤销" icon="undo" disabled /><ToolButton label="重做" icon="redo" disabled /><span className="toolbar-divider"/><button className="preview-button" onClick={onPreview}><Icon name="eye"/>完整预览</button><button className="export-button primary-button" onClick={onExport}><Icon name="download"/>导出切图</button></div></header>
}

import edmEditorLogo from '../assets/edm-editor-logo.svg'
import { Icon } from '../ui/Icon'
import { ToolButton } from '../ui/ToolButton'

export function EditorToolbar({ name, onNameChange, onBack, onPreview, onExport }: { name: string; onNameChange: (name: string) => void; onBack?: () => void; onPreview: () => void; onExport: () => void }) {
  return <header className="editor-toolbar"><div className="toolbar-identity"><ToolButton label="返回草稿" icon="back" onClick={onBack} /><img className="project-logo" src={edmEditorLogo} alt="EDM Editor"/></div><div className="toolbar-project"><input value={name} onChange={event => onNameChange(event.target.value)} aria-label="EDM 名称"/><small>自动保存到本机</small></div><div className="toolbar-actions"><button className="preview-button" onClick={onPreview}><Icon name="eye"/>完整预览</button><button className="export-button primary-button" onClick={onExport}><Icon name="download"/>导出切图</button></div></header>
}

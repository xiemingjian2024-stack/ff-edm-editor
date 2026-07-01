import { Icon } from '../ui/Icon'
import { ToolButton } from '../ui/ToolButton'
import type { ThemePalette } from '../domain/edm'
import { ThemePalettePicker } from './ThemePalettePicker'

export function EditorToolbar({ name, zoom, paletteId, palettes, onPaletteChange, onNameChange, onBack, onPreview, onExport }: { name: string; zoom: number; paletteId: string; palettes: ThemePalette[]; onPaletteChange: (paletteId: string) => void; onNameChange: (name: string) => void; onBack?: () => void; onPreview: () => void; onExport: () => void }) {
  return <header className="editor-toolbar"><div className="toolbar-identity"><ToolButton label="返回草稿" icon="back" onClick={onBack} /><span className="brand-gem"><i /><i /></span><div><input value={name} onChange={event => onNameChange(event.target.value)} aria-label="EDM 名称"/><small>已保存到当前浏览器</small></div></div><div className="toolbar-center"><ThemePalettePicker value={paletteId} palettes={palettes} onChange={onPaletteChange}/><div className="toolbar-viewport"><span>375 PX</span><i /><span>{zoom}%</span></div></div><div className="toolbar-actions"><ToolButton label="撤销" icon="undo" disabled /><ToolButton label="重做" icon="redo" disabled /><span className="toolbar-divider"/><button className="preview-button" onClick={onPreview}><Icon name="eye"/>完整预览</button><button className="export-button primary-button" onClick={onExport}><Icon name="download"/>导出切图</button></div></header>
}

import { ToolButton } from '../ui/ToolButton'

export function EditorRail({ onBack }: { onBack?: () => void }) {
  return <nav className="editor-rail" aria-label="编辑工具"><div><ToolButton label="楼层库" icon="layers" active /><ToolButton label="草稿" icon="drafts" onClick={onBack} /><ToolButton label="素材（暂未开放）" icon="image" disabled /></div><ToolButton label="返回草稿首页" icon="back" onClick={onBack} /></nav>
}

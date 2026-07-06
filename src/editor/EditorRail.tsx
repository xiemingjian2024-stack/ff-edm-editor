import { ToolButton } from '../ui/ToolButton'

export function EditorRail() {
  return <nav className="editor-rail" aria-label="编辑工具"><div><ToolButton label="楼层库" icon="layers" active /><ToolButton label="素材（暂未开放）" icon="image" disabled /></div></nav>
}

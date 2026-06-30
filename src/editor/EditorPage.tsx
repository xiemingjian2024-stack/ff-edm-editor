import { useReducer } from 'react'
import { TemplateLibrary } from './TemplateLibrary'
import { Canvas } from './Canvas'
import { PropertyPanel } from './PropertyPanel'
import { editorReducer, initialEditorState } from './reducer'
import './editor.css'

export function EditorPage() {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState)
  const selected = state.draft.floors.find(item => item.id === state.selectedFloorId)
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span>FF</span><div><h1>EDM 搭建器</h1><p>未命名 EDM</p></div></div><div className="topbar-actions"><button>完整预览</button><button className="primary">导出切图</button></div></header>
    <div className="workspace">
      <TemplateLibrary onAdd={templateId => dispatch({ type: 'addFloor', templateId })} />
      <Canvas floors={state.draft.floors} selectedId={state.selectedFloorId} onSelect={floorId => dispatch({ type: 'selectFloor', floorId })} onMove={(floorId, direction) => dispatch({ type: 'moveFloor', floorId, direction })} />
      <PropertyPanel floor={selected} onChange={(fieldId, value) => selected && dispatch({ type: 'updateField', floorId: selected.id, fieldId, value })} onDuplicate={() => selected && dispatch({ type: 'duplicateFloor', floorId: selected.id })} onDelete={() => selected && dispatch({ type: 'deleteFloor', floorId: selected.id })} />
    </div>
  </div>
}

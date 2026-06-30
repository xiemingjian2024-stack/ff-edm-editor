import { useEffect, useReducer, useState } from 'react'
import type { EdmDraft } from '../domain/edm'
import { TemplateLibrary } from './TemplateLibrary'
import { Canvas } from './Canvas'
import { PropertyPanel } from './PropertyPanel'
import { editorReducer, initialEditorState } from './reducer'
import './editor.css'
import { ExportDialog } from '../export/ExportDialog'
import { exportDraftFromDom } from '../export/package'

export function EditorPage({ initialDraft, onBack, onSave }: { initialDraft?: EdmDraft; onBack?: () => void; onSave?: (draft: EdmDraft) => void }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState)
  const [dialog, setDialog] = useState<'preview' | 'export' | null>(null)
  useEffect(() => { if (initialDraft) dispatch({ type: 'loadDraft', draft: initialDraft }) }, [initialDraft])
  useEffect(() => { const timer = window.setTimeout(() => onSave?.(state.draft), 500); return () => window.clearTimeout(timer) }, [state.draft, onSave])
  const selected = state.draft.floors.find(item => item.id === state.selectedFloorId)
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><button className="back-button" onClick={onBack}>←</button><span>FF</span><div><h1>EDM 搭建器</h1><input className="draft-name" value={state.draft.name} onChange={event => dispatch({ type: 'renameDraft', name: event.target.value })} aria-label="EDM 名称" /></div></div><div className="topbar-actions"><button onClick={() => setDialog('preview')}>完整预览</button><button className="primary" onClick={() => setDialog('export')}>导出切图</button></div></header>
    <div className="workspace">
      <TemplateLibrary onAdd={templateId => dispatch({ type: 'addFloor', templateId })} />
      <Canvas floors={state.draft.floors} selectedId={state.selectedFloorId} onSelect={floorId => dispatch({ type: 'selectFloor', floorId })} onMove={(floorId, direction) => dispatch({ type: 'moveFloor', floorId, direction })} />
      <PropertyPanel floor={selected} onChange={(fieldId, value) => selected && dispatch({ type: 'updateField', floorId: selected.id, fieldId, value })} onProductChange={(slotId, value) => selected && dispatch({ type: 'updateProduct', floorId: selected.id, slotId, value })} onDuplicate={() => selected && dispatch({ type: 'duplicateFloor', floorId: selected.id })} onDelete={() => selected && dispatch({ type: 'deleteFloor', floorId: selected.id })} />
    </div>{dialog ? <ExportDialog draft={state.draft} previewOnly={dialog === 'preview'} onClose={() => setDialog(null)} onExport={() => exportDraftFromDom(state.draft)} /> : null}
  </div>
}

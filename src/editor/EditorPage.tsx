import { useEffect, useReducer, useState } from 'react'
import type { EdmDraft } from '../domain/edm'
import { TemplateLibrary } from './TemplateLibrary'
import { Canvas } from './Canvas'
import { PropertyPanel } from './PropertyPanel'
import { editorReducer, initialEditorState } from './reducer'
import './editor.css'
import { ExportDialog } from '../export/ExportDialog'
import { exportDraftFromDom } from '../export/package'
import { EditorToolbar } from './EditorToolbar'
import { EditorRail } from './EditorRail'
import { getThemePalette, themePalettes } from '../themes/palettes'

export function EditorPage({ initialDraft, onBack, onSave }: { initialDraft?: EdmDraft; onBack?: () => void; onSave?: (draft: EdmDraft) => void }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState)
  const [dialog, setDialog] = useState<'preview' | 'export' | null>(null)
  const [zoom, setZoom] = useState(100)
  useEffect(() => { if (initialDraft) dispatch({ type: 'loadDraft', draft: initialDraft }) }, [initialDraft])
  useEffect(() => { const timer = window.setTimeout(() => onSave?.(state.draft), 500); return () => window.clearTimeout(timer) }, [state.draft, onSave])
  const selected = state.draft.floors.find(item => item.id === state.selectedFloorId)
  return <div className="app-shell">
    <EditorToolbar name={state.draft.name} zoom={zoom} onNameChange={name => dispatch({ type: 'renameDraft', name })} onBack={onBack} onPreview={() => setDialog('preview')} onExport={() => setDialog('export')}/>
    <div className="workspace">
      <EditorRail onBack={onBack}/>
      <TemplateLibrary onAdd={templateId => dispatch({ type: 'addFloor', templateId })} paletteId={state.draft.themePaletteId} palettes={themePalettes} onPaletteChange={paletteId => dispatch({ type: 'changeThemePalette', paletteId })} />
      <Canvas floors={state.draft.floors} palette={getThemePalette(state.draft.themePaletteId)} selectedId={state.selectedFloorId} zoom={zoom} onZoomChange={setZoom} onSelect={floorId => dispatch({ type: 'selectFloor', floorId })} onMove={(floorId, direction) => dispatch({ type: 'moveFloor', floorId, direction })} />
      <PropertyPanel floor={selected} onChange={(fieldId, value) => selected && dispatch({ type: 'updateField', floorId: selected.id, fieldId, value })} onThemeColorChange={(fieldId, color) => selected && dispatch({ type: 'overrideThemeColor', floorId: selected.id, fieldId, color })} onThemeColorRelink={(fieldId, slot) => selected && dispatch({ type: 'relinkThemeColor', floorId: selected.id, fieldId, slot })} onNavigationItemChange={(index, value) => selected && dispatch({ type: 'updateNavigationItem', floorId: selected.id, index, value })} onProductChange={(slotId, value) => selected && dispatch({ type: 'updateProduct', floorId: selected.id, slotId, value })} onDuplicate={() => selected && dispatch({ type: 'duplicateFloor', floorId: selected.id })} onDelete={() => selected && dispatch({ type: 'deleteFloor', floorId: selected.id })} />
    </div>{dialog ? <ExportDialog draft={state.draft} previewOnly={dialog === 'preview'} onClose={() => setDialog(null)} onExport={() => exportDraftFromDom(state.draft)} /> : null}
  </div>
}

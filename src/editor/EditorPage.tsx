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
import { classicPalette, themePalettes } from '../themes/palettes'
import { getThemeFieldsForFloors, resolveFloorForRender } from '../themes/resolveThemeColor'
import { getTemplate } from '../templates/registry'

export function EditorPage({ initialDraft, onBack, onSave, onExported, palettes = themePalettes, onPaletteSave, onPaletteDelete }: { initialDraft?: EdmDraft; onBack?: () => void; onSave?: (draft: EdmDraft) => void; onExported?: (draft: EdmDraft) => void | Promise<void>; palettes?: import('../domain/edm').ThemePalette[]; onPaletteSave?: (palette: import('../domain/edm').ThemePalette) => void; onPaletteDelete?: (id: string) => void }) {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState)
  const [dialog, setDialog] = useState<'preview' | 'export' | null>(null)
  const [zoom, setZoom] = useState(100)
  useEffect(() => { if (initialDraft) dispatch({ type: 'loadDraft', draft: initialDraft }) }, [initialDraft])
  useEffect(() => { const timer = window.setTimeout(() => onSave?.(state.draft), 500); return () => window.clearTimeout(timer) }, [state.draft, onSave])
  const selected = state.draft.floors.find(item => item.id === state.selectedFloorId)
  const themeFields = getThemeFieldsForFloors(state.draft.floors)
  const palette = palettes.find(item => item.id === state.draft.themePaletteId) ?? classicPalette
  const selectedTemplate = selected ? getTemplate(selected.templateId)?.definition : undefined
  const resolvedSelected = selected && selectedTemplate ? resolveFloorForRender(selected, selectedTemplate, palette, themeFields[selected.id]) : selected
  return <div className="app-shell">
    <EditorToolbar name={state.draft.name} onNameChange={name => dispatch({ type: 'renameDraft', name })} onBack={onBack} onPreview={() => setDialog('preview')} onExport={() => setDialog('export')}/>
    <div className="workspace">
      <EditorRail/>
      <TemplateLibrary onAdd={templateId => dispatch({ type: 'addFloor', templateId })} paletteId={state.draft.themePaletteId} palettes={palettes} onPaletteChange={paletteId => dispatch({ type: 'changeThemePalette', paletteId })} onPaletteSave={onPaletteSave} onPaletteDelete={onPaletteDelete} />
      <Canvas floors={state.draft.floors} palette={palette} selectedId={state.selectedFloorId} zoom={zoom} onZoomChange={setZoom} onSelect={floorId => dispatch({ type: 'selectFloor', floorId })} onMove={(floorId, direction) => dispatch({ type: 'moveFloor', floorId, direction })} onMediaChange={(floorId, value) => dispatch({ type: 'updateMedia', floorId, value })} onMediaSlotChange={(floorId, slotId, value) => dispatch({ type: 'updateMediaSlot', floorId, slotId, value })} onProductChange={(floorId, slotId, value) => dispatch({ type: 'updateProduct', floorId, slotId, value })} />
      <PropertyPanel floor={resolvedSelected} themeFields={selected ? themeFields[selected.id] : []} onChange={(fieldId, value) => selected && dispatch({ type: 'updateField', floorId: selected.id, fieldId, value })} onThemeColorChange={(fieldId, color) => selected && dispatch({ type: 'overrideThemeColor', floorId: selected.id, fieldId, color })} onThemeColorRelink={(fieldId, slot) => selected && dispatch({ type: 'relinkThemeColor', floorId: selected.id, fieldId, slot })} onNavigationItemChange={(index, value) => selected && dispatch({ type: 'updateNavigationItem', floorId: selected.id, index, value })} onMediaChange={value => selected && dispatch({ type: 'updateMedia', floorId: selected.id, value })} onMediaSlotChange={(slotId, value) => selected && dispatch({ type: 'updateMediaSlot', floorId: selected.id, slotId, value })} onProductChange={(slotId, value) => selected && dispatch({ type: 'updateProduct', floorId: selected.id, slotId, value })} onDuplicate={() => selected && dispatch({ type: 'duplicateFloor', floorId: selected.id })} onDelete={() => selected && dispatch({ type: 'deleteFloor', floorId: selected.id })} />
    </div>{dialog ? <ExportDialog draft={state.draft} previewOnly={dialog === 'preview'} onClose={() => setDialog(null)} onExport={async () => { await exportDraftFromDom(state.draft); await onExported?.(state.draft) }} /> : null}
  </div>
}

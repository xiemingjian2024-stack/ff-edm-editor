import { useCallback, useEffect, useState } from 'react'
import type { EdmDraft, ExportRecord } from './domain/edm'
import { EditorPage } from './editor/EditorPage'
import { DraftHome } from './editor/DraftHome'
import { draftRepository } from './storage/drafts'
import { createFloorInstance } from './editor/reducer'

export function App() {
  const [drafts, setDrafts] = useState<EdmDraft[]>([]); const [exports, setExports] = useState<ExportRecord[]>([]); const [active, setActive] = useState<EdmDraft | null>(null)
  const refresh = useCallback(() => { void Promise.all([draftRepository.list(), draftRepository.listExports()]).then(([nextDrafts, nextExports]) => { setDrafts(nextDrafts); setExports(nextExports) }) }, [])
  useEffect(refresh, [refresh])
  const create = () => { const now = new Date().toISOString(); setActive({ id: crypto.randomUUID(), name: '未命名 EDM', floors: [createFloorInstance('head-brand-logo', crypto.randomUUID()), createFloorInstance('footer-links', crypto.randomUUID())], themePaletteId: 'funnyfuzzy-classic', createdAt: now, updatedAt: now }) }
  const save = useCallback((draft: EdmDraft) => { void draftRepository.save(draft) }, [])
  const duplicate = (source: EdmDraft) => { const now = new Date().toISOString(); setActive({ ...structuredClone(source), id: crypto.randomUUID(), name: `${source.name} - 副本`, floors: source.floors.map(floor => ({ ...floor, id: crypto.randomUUID() })), createdAt: now, updatedAt: now }) }
  const recordExport = async (draft: EdmDraft) => { await draftRepository.saveExport({ id: draft.id, draft: structuredClone(draft), exportedAt: new Date().toISOString() }) }
  if (active) return <EditorPage initialDraft={active} onSave={save} onExported={recordExport} onBack={() => { setActive(null); refresh() }} />
  return <DraftHome drafts={drafts} exports={exports} onCreate={create} onOpen={setActive} onDuplicate={duplicate} onDelete={id => { void draftRepository.delete(id).then(refresh) }} onDeleteExport={id => { void draftRepository.deleteExport(id).then(refresh) }} />
}

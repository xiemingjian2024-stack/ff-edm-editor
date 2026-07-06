import { useCallback, useEffect, useState } from 'react'
import type { EdmDraft } from './domain/edm'
import { EditorPage } from './editor/EditorPage'
import { DraftHome } from './editor/DraftHome'
import { draftRepository } from './storage/drafts'
import { createFloorInstance } from './editor/reducer'

export function App() {
  const [drafts, setDrafts] = useState<EdmDraft[]>([]); const [active, setActive] = useState<EdmDraft | null>(null)
  const refresh = useCallback(() => { void draftRepository.list().then(setDrafts) }, [])
  useEffect(refresh, [refresh])
  const create = () => { const now = new Date().toISOString(); setActive({ id: crypto.randomUUID(), name: '未命名 EDM', floors: [createFloorInstance('head-brand-logo', crypto.randomUUID()), createFloorInstance('footer-links', crypto.randomUUID())], themePaletteId: 'funnyfuzzy-classic', createdAt: now, updatedAt: now }) }
  const save = useCallback((draft: EdmDraft) => { void draftRepository.save(draft) }, [])
  if (active) return <EditorPage initialDraft={active} onSave={save} onBack={() => { setActive(null); refresh() }} />
  return <DraftHome drafts={drafts} onCreate={create} onOpen={setActive} onDelete={id => { void draftRepository.delete(id).then(refresh) }} />
}

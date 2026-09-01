import { useCallback, useEffect, useState } from 'react'
import type { EdmDraft, ThemePalette } from './domain/edm'
import { EditorPage } from './editor/EditorPage'
import { DraftHome } from './editor/DraftHome'
import { draftRepository } from './storage/drafts'
import { createFloorInstance } from './editor/reducer'
import { classicPalette } from './themes/palettes'
import { createTransferCode, parseTransferCode } from './transfer/designTransfer'
import type { GifDraft, GifTemplateId } from './gif/model'
import { createGifDraft } from './gif/model'
import { GifEditorPage } from './gif/GifEditorPage'

export function App() {
  const [drafts, setDrafts] = useState<EdmDraft[]>([]); const [gifDrafts, setGifDrafts] = useState<GifDraft[]>([]); const [customPalettes, setCustomPalettes] = useState<ThemePalette[]>([]); const [active, setActive] = useState<EdmDraft | null>(null); const [activeGif, setActiveGif] = useState<GifDraft | null>(null)
  const [homeTab, setHomeTab] = useState<'edm' | 'gif'>('edm')
  const refresh = useCallback(() => { void Promise.all([draftRepository.list(), draftRepository.listGifs(), draftRepository.listPalettes()]).then(([nextDrafts, nextGifs, nextPalettes]) => { setDrafts(nextDrafts); setGifDrafts(nextGifs); setCustomPalettes(nextPalettes) }) }, [])
  useEffect(refresh, [refresh])
  const create = () => { const now = new Date().toISOString(); setActive({ id: crypto.randomUUID(), name: '未命名 EDM', floors: [createFloorInstance('head-brand-logo', crypto.randomUUID()), createFloorInstance('footer-links', crypto.randomUUID())], themePaletteId: 'funnyfuzzy-classic', createdAt: now, updatedAt: now }) }
  const save = useCallback((draft: EdmDraft) => { void draftRepository.save(draft) }, [])
  const createGif = (templateId: GifTemplateId) => {
    const draft = createGifDraft(templateId)
    setGifDrafts(current => [draft, ...current.filter(item => item.id !== draft.id)])
    void draftRepository.saveGif(draft)
    setActiveGif(draft)
  }
  const saveGif = useCallback((draft: GifDraft) => {
    setGifDrafts(current => [draft, ...current.filter(item => item.id !== draft.id)].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)))
    void draftRepository.saveGif(draft)
  }, [])
  const duplicateGif = (source: GifDraft) => {
    const now = new Date().toISOString()
    const copy = { ...structuredClone(source), id: crypto.randomUUID(), name: `${source.name} - 副本`, scenes: source.scenes.map(scene => ({ ...scene, id: crypto.randomUUID() })), createdAt: now, updatedAt: now }
    setGifDrafts(current => [copy, ...current])
    void draftRepository.saveGif(copy)
    setActiveGif(copy)
  }
  const duplicate = (source: EdmDraft) => { const now = new Date().toISOString(); setActive({ ...structuredClone(source), id: crypto.randomUUID(), name: `${source.name} - 副本`, floors: source.floors.map(floor => ({ ...floor, id: crypto.randomUUID() })), createdAt: now, updatedAt: now }) }
  const savePalette = async (palette: ThemePalette) => { await draftRepository.savePalette(palette); setCustomPalettes(await draftRepository.listPalettes()) }
  const deletePalette = async (id: string) => { await draftRepository.deletePalette(id); setCustomPalettes(await draftRepository.listPalettes()) }
  const makeTransferCode = (draft: EdmDraft) => createTransferCode(draft, [classicPalette, ...customPalettes])
  const receiveTransferCode = async (code: string) => {
    const payload = await parseTransferCode(code)
    const now = new Date().toISOString()
    let themePaletteId = payload.draft.themePaletteId
    if (payload.palette && payload.palette.id !== classicPalette.id) {
      const existing = [classicPalette, ...customPalettes].find(item => item.id === payload.palette?.id)
      const palette = existing && JSON.stringify(existing.slots) !== JSON.stringify(payload.palette.slots)
        ? { ...payload.palette, id: crypto.randomUUID(), name: `${payload.palette.name} - 接收` }
        : payload.palette
      themePaletteId = palette.id
      await draftRepository.savePalette(palette)
      setCustomPalettes(await draftRepository.listPalettes())
    }
    const imported: EdmDraft = { ...structuredClone(payload.draft), id: crypto.randomUUID(), name: `${payload.draft.name} - 接收副本`, themePaletteId, floors: payload.draft.floors.map(floor => ({ ...structuredClone(floor), id: crypto.randomUUID() })), createdAt: now, updatedAt: now }
    await draftRepository.save(imported)
    setActive(imported)
    refresh()
  }
  if (active) return <EditorPage initialDraft={active} gifDrafts={gifDrafts} palettes={[classicPalette, ...customPalettes]} onPaletteSave={palette => { void savePalette(palette) }} onPaletteDelete={id => { void deletePalette(id) }} onSave={save} onBack={() => { setHomeTab('edm'); setActive(null); refresh() }} />
  if (activeGif) return <GifEditorPage initialDraft={activeGif} onSave={saveGif} onBack={() => { setHomeTab('gif'); setActiveGif(null); refresh() }}/>
  return <DraftHome drafts={drafts} gifDrafts={gifDrafts} initialTab={homeTab} onCreate={create} onCreateGif={createGif} onOpen={setActive} onOpenGif={setActiveGif} onDuplicate={duplicate} onDuplicateGif={duplicateGif} onMakeTransferCode={makeTransferCode} onReceiveTransferCode={receiveTransferCode} onDelete={id => { void draftRepository.delete(id).then(refresh) }} onDeleteGif={id => { void draftRepository.deleteGif(id).then(refresh) }} />
}

import 'fake-indexeddb/auto'
import { openDB } from 'idb'
import { createDraftRepository } from './drafts'
import { initialEditorState } from '../editor/reducer'

it('保存、列出、重命名和删除草稿', async () => {
  const repo = createDraftRepository(`test-${crypto.randomUUID()}`)
  await repo.save({ ...initialEditorState.draft, id: 'a', name: '第一封' })
  expect((await repo.list())[0].name).toBe('第一封')
  await repo.rename('a', '夏日 EDM')
  expect((await repo.load('a'))?.name).toBe('夏日 EDM')
  await repo.delete('a'); expect(await repo.list()).toEqual([])
})

it('每个 EDM 只保留最近一次导出快照', async () => {
  const repo = createDraftRepository(`test-${crypto.randomUUID()}`)
  const first = { ...initialEditorState.draft, id: 'same', name: '第一版' }
  const latest = { ...initialEditorState.draft, id: 'same', name: '第二版' }
  await repo.saveExport({ id: 'same', draft: first, exportedAt: '2026-07-01T10:00:00.000Z' })
  await repo.saveExport({ id: 'same', draft: latest, exportedAt: '2026-07-01T11:00:00.000Z' })
  expect(await repo.listExports()).toEqual([expect.objectContaining({ id: 'same', draft: expect.objectContaining({ name: '第二版' }) })])
})

it('保存、覆盖和删除自定义配色套餐', async () => {
  const repo = createDraftRepository(`test-${crypto.randomUUID()}`)
  await repo.savePalette({ id: 'summer', name: '夏日', slots: { A: '#FFFFFF', B: '#FFAC33', C: '#000000' } })
  await repo.savePalette({ id: 'summer', name: '夏日新版', slots: { A: '#FFF000', B: '#FFAC33', C: '#111111' } })
  expect(await repo.listPalettes()).toEqual([expect.objectContaining({ id: 'summer', name: '夏日新版' })])
  await repo.deletePalette('summer')
  expect(await repo.listPalettes()).toEqual([])
})

it('加载旧草稿时补充配色套餐', async () => {
  const repo = createDraftRepository(`test-${crypto.randomUUID()}`)
  await repo.save({ ...initialEditorState.draft, id: 'legacy', themePaletteId: undefined } as never)
  expect((await repo.load('legacy'))?.themePaletteId).toBe('funnyfuzzy-classic')
})

it('首次启动时自动迁移旧版本数据库中的设计稿、导出记录和配色', async () => {
  const legacyName = `ff-edm-editor-${crypto.randomUUID()}`
  const currentName = `ff-edm-builder-${crypto.randomUUID()}`
  const legacyDb = await openDB(legacyName, 3, { upgrade(db) {
    db.createObjectStore('drafts', { keyPath: 'id' })
    db.createObjectStore('exports', { keyPath: 'id' })
    db.createObjectStore('palettes', { keyPath: 'id' })
  } })
  const legacyDraft = { ...initialEditorState.draft, id: 'legacy-draft', name: '旧包设计稿', updatedAt: '2026-07-10T10:00:00.000Z' }
  await legacyDb.put('drafts', legacyDraft)
  await legacyDb.put('exports', { id: legacyDraft.id, draft: legacyDraft, exportedAt: '2026-07-10T11:00:00.000Z' })
  await legacyDb.put('palettes', { id: 'legacy-palette', name: '旧配色', slots: { A: '#111111', B: '#222222', C: '#333333' } })
  legacyDb.close()

  const repo = createDraftRepository(currentName, { legacyNames: [legacyName] })
  expect((await repo.list()).map(item => item.name)).toContain('旧包设计稿')
  expect((await repo.listExports()).map(item => item.draft.name)).toContain('旧包设计稿')
  expect((await repo.listPalettes()).map(item => item.name)).toContain('旧配色')
})

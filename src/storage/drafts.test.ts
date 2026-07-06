import 'fake-indexeddb/auto'
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

it('加载旧草稿时补充配色套餐', async () => {
  const repo = createDraftRepository(`test-${crypto.randomUUID()}`)
  await repo.save({ ...initialEditorState.draft, id: 'legacy', themePaletteId: undefined } as never)
  expect((await repo.load('legacy'))?.themePaletteId).toBe('funnyfuzzy-classic')
})

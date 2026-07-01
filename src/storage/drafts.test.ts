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

it('加载旧草稿时补充配色套餐', async () => {
  const repo = createDraftRepository(`test-${crypto.randomUUID()}`)
  await repo.save({ ...initialEditorState.draft, id: 'legacy', themePaletteId: undefined } as never)
  expect((await repo.load('legacy'))?.themePaletteId).toBe('funnyfuzzy-classic')
})

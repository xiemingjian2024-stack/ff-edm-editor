import { validateDraft } from './validate'
import { initialEditorState, editorReducer } from '../editor/reducer'

it('将缺少必填图片设为阻断，将缺少链接设为提醒', () => {
  let state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'banner-simple' })
  const result = validateDraft(state.draft)
  expect(result.blockers[0].message).toContain('图片')
})

it('商品卡缺少链接时给出提醒', () => {
  let state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'product-grid-two' })
  expect(validateDraft(state.draft).warnings.some(item => item.message.includes('链接'))).toBe(true)
})

it('新版 Banner 缺少图片时阻断导出', () => {
  const state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'banner-regular' })
  expect(validateDraft(state.draft).blockers.some(item => item.message.includes('图片'))).toBe(true)
})

it('新版 Banner 设置图片后允许导出', () => {
  let state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'banner-regular' })
  const floorId = state.draft.floors[0].id
  state = editorReducer(state, { type: 'updateMedia', floorId, value: { image: 'product.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 } })
  expect(validateDraft(state.draft).blockers).toHaveLength(0)
})

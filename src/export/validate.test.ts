import { validateDraft } from './validate'
import { initialEditorState, editorReducer } from '../editor/reducer'

it('将缺少必填图片设为阻断，将缺少链接设为提醒', () => {
  let state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'banner-simple' })
  const result = validateDraft(state.draft)
  expect(result.blockers[0].message).toContain('图片')
})

it('商品卡缺少链接时给出提醒', () => {
  let state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'product-grid-n-by-2' })
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

it('对比信息缺少任一图片时阻断导出', () => {
  let state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'comparison-information' })
  const floorId = state.draft.floors[0].id
  state = editorReducer(state, { type: 'updateMediaSlot', floorId, slotId: 'before', value: { image: 'before.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 } })
  const result = validateDraft(state.draft)
  expect(result.blockers).toHaveLength(1)
  expect(result.blockers[0].message).toContain('After 图片')
})

it('卖点信息只校验当前显示的图片槽位', () => {
  let state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'selling-points-information' })
  const floorId = state.draft.floors[0].id
  for (const slotId of ['point1', 'point2']) state = editorReducer(state, { type: 'updateMediaSlot', floorId, slotId, value: { image: `${slotId}.jpg`, url: '', scale: 1, offsetX: 0, offsetY: 0 } })
  expect(validateDraft(state.draft).blockers).toHaveLength(0)
  state = editorReducer(state, { type: 'updateField', floorId, fieldId: 'itemCount', value: '4' })
  expect(validateDraft(state.draft).blockers.map(item => item.message)).toEqual(['卖点 3 图片尚未设置', '卖点 4 图片尚未设置'])
})

it('动态商品模板只校验当前显示的商品槽位', () => {
  let state = editorReducer(initialEditorState, { type: 'addFloor', templateId: 'product-grid-n-by-2' })
  const floorId = state.draft.floors[0].id
  for (const slotId of ['product-1', 'product-2']) state = editorReducer(state, { type: 'updateProduct', floorId, slotId, value: { image: 'image.jpg', title: 'Title', price: '$10', url: 'link' } })
  expect(validateDraft(state.draft).warnings).toHaveLength(0)
  state = editorReducer(state, { type: 'updateField', floorId, fieldId: 'productCount', value: '4' })
  expect(validateDraft(state.draft).warnings).toHaveLength(4)
})

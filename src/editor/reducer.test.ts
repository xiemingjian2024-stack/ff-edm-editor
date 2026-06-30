import { createEditorReducer, initialEditorState } from './reducer'

const ids = ['floor-1', 'floor-2', 'floor-3']
const reducer = createEditorReducer(() => ids.shift()!)

it('添加楼层并自动选中', () => {
  const state = reducer(initialEditorState, { type: 'addFloor', templateId: 'title-centered' })
  expect(state.draft.floors).toHaveLength(1)
  expect(state.selectedFloorId).toBe('floor-1')
})

it('复制楼层时生成新 ID 并保留内容', () => {
  let state = reducer(initialEditorState, { type: 'addFloor', templateId: 'title-centered' })
  state = reducer(state, { type: 'updateField', floorId: 'floor-2', fieldId: 'title', value: '新品上线' })
  state = reducer(state, { type: 'duplicateFloor', floorId: 'floor-2' })
  expect(state.draft.floors[1].id).not.toBe('floor-2')
  expect(state.draft.floors[1].values.title).toBe('新品上线')
})

it('忽略模板未声明的字段', () => {
  let state = reducer(initialEditorState, { type: 'addFloor', templateId: 'title-centered' })
  const id = state.draft.floors[0].id
  state = reducer(state, { type: 'updateField', floorId: id, fieldId: 'fontSize', value: '99' })
  expect(state.draft.floors[0].values.fontSize).toBeUndefined()
})

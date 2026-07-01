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

it('新增主题模板时建立默认色位关联', () => {
  const localReducer = createEditorReducer(() => 'head-1')
  const state = localReducer(initialEditorState, { type: 'addFloor', templateId: 'head-brand-logo' })
  expect(state.draft.floors[0].themeColors?.background).toEqual({ mode: 'theme', slot: 'A' })
})

it('手动改色后脱离主题，并可重新关联', () => {
  const localReducer = createEditorReducer(() => 'head-1')
  let state = localReducer(initialEditorState, { type: 'addFloor', templateId: 'head-brand-logo' })
  state = localReducer(state, { type: 'overrideThemeColor', floorId: 'head-1', fieldId: 'background', color: '#EFEFEF' })
  expect(state.draft.floors[0].themeColors?.background).toEqual({ mode: 'custom', color: '#EFEFEF' })
  state = localReducer(state, { type: 'relinkThemeColor', floorId: 'head-1', fieldId: 'background', slot: 'A' })
  expect(state.draft.floors[0].themeColors?.background).toEqual({ mode: 'theme', slot: 'A' })
})

it('切换套餐不会重写楼层自定义颜色', () => {
  const localReducer = createEditorReducer(() => 'head-1')
  let state = localReducer(initialEditorState, { type: 'addFloor', templateId: 'head-brand-logo' })
  state = localReducer(state, { type: 'overrideThemeColor', floorId: 'head-1', fieldId: 'background', color: '#EFEFEF' })
  state = localReducer(state, { type: 'changeThemePalette', paletteId: 'another-palette' })
  expect(state.draft.themePaletteId).toBe('another-palette')
  expect(state.draft.floors[0].themeColors?.background).toEqual({ mode: 'custom', color: '#EFEFEF' })
})

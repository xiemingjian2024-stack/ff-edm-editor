import { createEditorReducer, initialEditorState } from './reducer'

const ids = ['floor-1', 'floor-2', 'floor-3']
const reducer = createEditorReducer(() => ids.shift()!)

it('添加楼层并自动选中', () => {
  const state = reducer(initialEditorState, { type: 'addFloor', templateId: 'title-centered' })
  expect(state.draft.floors).toHaveLength(1)
  expect(state.selectedFloorId).toBe('floor-1')
})

it('加载旧标题草稿时补齐新版模板默认字段', () => {
  const legacyDraft = { ...initialEditorState.draft, floors: [{ id: 'old-title', templateId: 'title-centered', values: { title: '旧标题', textColor: '#111111', background: '#ffffff' }, products: {} }] }
  const state = reducer(initialEditorState, { type: 'loadDraft', draft: legacyDraft })
  expect(state.draft.floors[0].values).toMatchObject({ title: '旧标题', description: 'Give them a snug, supportive place to curl up, settle in and enjoy the journey.', buttonText: 'SHOP NOW', alignment: 'center' })
})

it('加载旧页尾草稿时补齐四个固定链接', () => {
  const legacyDraft = { ...initialEditorState.draft, floors: [{ id: 'old-footer', templateId: 'footer-links', values: {}, products: {}, navigationItems: [{ text: 'HOME', url: '' }] }] }
  const state = reducer(initialEditorState, { type: 'loadDraft', draft: legacyDraft })
  expect(state.draft.floors[0].navigationItems).toEqual([
    { text: 'HOME', url: '' },
    { text: 'Contact Us', url: '' },
    { text: 'FAQ', url: '' },
    { text: 'Privacy Policy', url: '' },
  ])
})

it('忽略模板未声明的字段', () => {
  let state = reducer(initialEditorState, { type: 'addFloor', templateId: 'title-centered' })
  const id = state.draft.floors[0].id
  state = reducer(state, { type: 'updateField', floorId: id, fieldId: 'fontSize', value: '99' })
  expect(state.draft.floors[0].values.fontSize).toBeUndefined()
})

it('新增模板时不写入固定色位关联', () => {
  const localReducer = createEditorReducer(() => 'head-1')
  const state = localReducer(initialEditorState, { type: 'addFloor', templateId: 'head-brand-logo' })
  expect(state.draft.floors[0].themeColors?.background).toBeUndefined()
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

it('更新导航项时保留其他导航项', () => {
  const state = {
    ...initialEditorState,
    draft: { ...initialEditorState.draft, floors: [{ id: 'nav-1', templateId: 'head-category-navigation', values: { navigationCount: '2' }, products: {}, navigationItems: [{ text: 'Home', url: '' }, { text: 'Travel', url: 'old' }, { text: 'Hidden', url: 'keep' }] }] },
  }
  const next = reducer(state, { type: 'updateNavigationItem', floorId: 'nav-1', index: 1, value: { text: 'Carrier & Travel', url: '/travel' } })
  expect(next.draft.floors[0].navigationItems).toEqual([{ text: 'Home', url: '' }, { text: 'Carrier & Travel', url: '/travel' }, { text: 'Hidden', url: 'keep' }])
})

it('更新媒体状态时不影响其他楼层', () => {
  const media = { image: 'old.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 }
  const state = {
    ...initialEditorState,
    draft: { ...initialEditorState.draft, floors: [
      { id: 'banner-1', templateId: 'banner-regular', values: {}, products: {}, media },
      { id: 'banner-2', templateId: 'banner-regular', values: {}, products: {}, media },
    ] },
  }
  const next = reducer(state, { type: 'updateMedia', floorId: 'banner-1', value: { image: 'new.jpg', url: '/product', scale: 1.5, offsetX: 12, offsetY: -8 } })
  expect(next.draft.floors[0].media).toMatchObject({ image: 'new.jpg', url: '/product', scale: 1.5, offsetX: 12, offsetY: -8 })
  expect(next.draft.floors[1].media).toEqual(media)
})

it('新增具名媒体模板并独立更新其中一个槽位', () => {
  const mediaSlots = {
    before: { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 },
    after: { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 },
  }
  const state = reducer({ ...initialEditorState, draft: { ...initialEditorState.draft, floors: [{ id: 'comparison-1', templateId: 'comparison-information', values: {}, products: {}, mediaSlots }] } }, { type: 'updateMediaSlot', floorId: 'comparison-1', slotId: 'before', value: { image: 'before.jpg', url: '', scale: 1.4, offsetX: 10, offsetY: -6 } })
  expect(state.draft.floors[0].mediaSlots?.before.image).toBe('before.jpg')
  expect(state.draft.floors[0].mediaSlots?.after.image).toBe('')
})

it('Logo 固定首层、页尾固定末层，普通楼层新增在页尾之前', () => {
  const localReducer = createEditorReducer(() => `id-${Math.random()}`)
  let state = localReducer(initialEditorState, { type: 'addFloor', templateId: 'footer-links' })
  state = localReducer(state, { type: 'addFloor', templateId: 'title-centered' })
  state = localReducer(state, { type: 'addFloor', templateId: 'head-brand-logo' })
  state = localReducer(state, { type: 'addFloor', templateId: 'product-grid-n-by-2' })
  expect(state.draft.floors.map(floor => floor.templateId)).toEqual(['head-brand-logo', 'title-centered', 'product-grid-n-by-2', 'footer-links'])
})

it('拖拽楼层可跨层排序但不会越过 Logo 和页尾', () => {
  const state = {
    ...initialEditorState,
    draft: { ...initialEditorState.draft, floors: [
      { id: 'logo', templateId: 'head-brand-logo', values: {}, products: {} },
      { id: 'title', templateId: 'title-centered', values: {}, products: {} },
      { id: 'banner', templateId: 'banner-regular', values: {}, products: {} },
      { id: 'products', templateId: 'product-grid-n-by-2', values: {}, products: {} },
      { id: 'footer', templateId: 'footer-links', values: {}, products: {} },
    ] },
  }
  const reordered = reducer(state, { type: 'reorderFloor', floorId: 'products', overFloorId: 'title' })
  expect(reordered.draft.floors.map(floor => floor.id)).toEqual(['logo', 'products', 'title', 'banner', 'footer'])
  const clampedToTop = reducer(state, { type: 'reorderFloor', floorId: 'products', overFloorId: 'logo' })
  expect(clampedToTop.draft.floors.map(floor => floor.id)).toEqual(['logo', 'products', 'title', 'banner', 'footer'])
  const clampedToBottom = reducer(state, { type: 'reorderFloor', floorId: 'title', overFloorId: 'footer' })
  expect(clampedToBottom.draft.floors.map(floor => floor.id)).toEqual(['logo', 'banner', 'products', 'title', 'footer'])
})

it('Logo 和页尾不可重复添加但可以删除', () => {
  const localReducer = createEditorReducer(() => `id-${Math.random()}`)
  let state = localReducer(initialEditorState, { type: 'addFloor', templateId: 'head-brand-logo' })
  state = localReducer(state, { type: 'addFloor', templateId: 'footer-links' })
  const logoId = state.draft.floors[0].id
  state = localReducer(state, { type: 'addFloor', templateId: 'head-brand-logo' })
  expect(state.draft.floors.filter(floor => floor.templateId === 'head-brand-logo')).toHaveLength(1)
  state = localReducer(state, { type: 'deleteFloor', floorId: logoId })
  expect(state.draft.floors.some(floor => floor.templateId === 'head-brand-logo')).toBe(false)
})

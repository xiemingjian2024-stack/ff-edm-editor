import { expect, it } from 'vitest'
import { applyGifImageBatch, createGifDraft, emptyGifMedia, getSplitBannerImages } from './model'

it('宫格批量上传按顺时针槽位共享到四帧，且不修改原草稿', () => {
  const source = createGifDraft('grid-slideshow')
  const next = applyGifImageBatch(source, ['a', 'b', 'c', 'd'])
  expect(next.scenes).toHaveLength(4)
  for (const scene of next.scenes) expect(scene.images.map(image => image.image)).toEqual(['a', 'b', 'c', 'd'])
  expect(source.scenes[0].images[0].image).toBe('')
})

it('左右轮播四张批量上传后仍按既定组合播放', () => {
  const next = applyGifImageBatch(createGifDraft('split-banner'), ['a', 'b', 'c', 'd'])
  expect(next.scenes.map(scene => scene.images.map(image => image.image))).toEqual([['a', 'b'], ['c', 'b'], ['c', 'd'], ['a', 'd']])
})

it.each(['grid-slideshow', 'split-banner'] as const)('%s 少于四张时保留剩余图片和裁切设置', template => {
  const source = applyGifImageBatch(createGifDraft(template), ['old1', 'old2', 'old3', 'old4'])
  source.scenes.forEach(scene => scene.images.forEach(image => { image.scale = 2; image.offsetX = 17 }))
  const next = applyGifImageBatch(source, ['new1', 'new2'])
  const images = template === 'split-banner' ? getSplitBannerImages(next) : next.scenes[0].images
  expect(images.map(image => image.image)).toEqual(['new1', 'new2', 'old3', 'old4'])
  expect(images[0]).toEqual({ ...emptyGifMedia(), image: 'new1' })
  expect(images[2]).toMatchObject({ scale: 2, offsetX: 17 })
})

it('N图轮播从默认两张自动扩展到五张，保留原场景身份和公共配置', () => {
  const source = createGifDraft('image-slideshow')
  source.canvasHeight = 420
  const next = applyGifImageBatch(source, ['a', 'b', 'c', 'd', 'e'])
  expect(next.scenes.map(scene => scene.images[0].image)).toEqual(['a', 'b', 'c', 'd', 'e'])
  expect(next.scenes.slice(0, 2).map(scene => scene.id)).toEqual(source.scenes.map(scene => scene.id))
  expect(new Set(next.scenes.map(scene => scene.id)).size).toBe(5)
  expect(next.canvasHeight).toBe(420)
  const partial = applyGifImageBatch(next, ['x', 'y'])
  expect(partial.scenes.map(scene => scene.images[0].image)).toEqual(['x', 'y', 'c', 'd', 'e'])
})

it.each([['grid-slideshow', 4], ['split-banner', 4], ['image-slideshow', 5], ['promo-flash', 1]] as const)('%s 拒绝超出上限的批量', (template, limit) => {
  expect(() => applyGifImageBatch(createGifDraft(template), Array(limit + 1).fill('image'))).toThrow(`最多上传 ${limit} 张`)
})

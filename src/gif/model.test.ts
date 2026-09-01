import { describe, expect, it } from 'vitest'
import { createGifDraft, duplicateGifScene, gifTemplates, normalizeGifDraft, normalizeGridSlideshowDraft } from './model'

describe('GIF 作品模型', () => {
  it.each(gifTemplates)('$name 会按模板建立正确的画布内容', template => {
    const draft = createGifDraft(template.id)
    expect(draft.templateId).toBe(template.id)
    expect(draft.scenes.length).toBeGreaterThanOrEqual(2)
    expect(draft.scenes[0].images).toHaveLength(template.imageCount)
    expect(draft.scenes.every(scene => scene.id && scene.images.every(image => image.scale === 1))).toBe(true)
  })

  it('复制场景会保留内容并生成新 id', () => {
    const source = createGifDraft('split-banner').scenes[0]
    source.images[0].image = 'data:image/png;base64,test'
    const copy = duplicateGifScene(source)
    expect(copy.id).not.toBe(source.id)
    expect(copy.images[0].image).toBe(source.images[0].image)
  })

  it('宫格轮播固定为四帧并让四帧共享同一组图片', () => {
    const draft = createGifDraft('grid-slideshow')
    draft.scenes = draft.scenes.slice(0, 2)
    draft.scenes[1].images[2].image = 'data:image/png;base64,third'
    const normalized = normalizeGridSlideshowDraft(draft)
    expect(normalized.scenes).toHaveLength(4)
    expect(normalized.scenes.every(scene => scene.images[2].image === 'data:image/png;base64,third')).toBe(true)
  })

  it('促销文字动画固定两帧并共享背景图片与文案', () => {
    const draft = createGifDraft('promo-flash')
    draft.scenes.push(duplicateGifScene(draft.scenes[0]))
    draft.scenes[0].images[0].image = 'data:image/png;base64,promo'
    draft.scenes[0].title = 'FLASH\nSALE'
    const normalized = normalizeGifDraft(draft)
    expect(normalized.scenes).toHaveLength(2)
    expect(normalized.scenes.every(scene => scene.images[0].image === 'data:image/png;base64,promo')).toBe(true)
    expect(normalized.scenes.every(scene => scene.title === 'FLASH\nSALE')).toBe(true)
    expect(normalized.common.textColor).toBe('#FFFFFF')
    expect(normalized.common.eyebrowColor).toBe('#FFAC33')
    expect(normalized.common.highlightColor).toBe('#FFAC33')
    expect(normalized.common.buttonColor).toBe('#FFAC33')
    expect(normalized.common.buttonTextColor).toBe('#000000')
  })

  it('双图轮播固定四帧，并按 1+2、3+2、3+4、1+4 组合图片', () => {
    const draft = createGifDraft('split-banner')
    draft.canvasHeight = 900
    draft.scenes[0].images[0].image = 'image-1'
    draft.scenes[0].images[1].image = 'image-2'
    draft.scenes[1].images[0].image = 'image-3'
    draft.scenes[2].images[1].image = 'image-4'
    const normalized = normalizeGifDraft(draft)
    expect(normalized.canvasHeight).toBe(750)
    expect(normalized.scenes).toHaveLength(4)
    expect(normalized.scenes.map(scene => scene.images.map(image => image.image))).toEqual([
      ['image-1', 'image-2'],
      ['image-3', 'image-2'],
      ['image-3', 'image-4'],
      ['image-1', 'image-4'],
    ])
  })
})

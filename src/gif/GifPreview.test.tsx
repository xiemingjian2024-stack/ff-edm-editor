import { act, cleanup, render } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { GifPreview, GifTemplatePreview } from './GifPreview'
import { createGifTemplateDemo, demoImageColors } from './templatePreview'
import { createGifDraft, getGifCanvasHeight, normalizeGifDraft } from './model'
import { GifStage } from './GifStage'

afterEach(() => { cleanup(); vi.useRealTimers() })

it('模板示意采用有序的低饱和配色，不影响实际新建作品的默认色与尺寸', () => {
  const grid = createGifTemplateDemo('grid-slideshow')
  expect(grid.scenes[0].images.map(image => decodeURIComponent(image.image).match(/fill="(#[A-F0-9]+)"/)?.[1])).toEqual(demoImageColors)
  const promo = createGifTemplateDemo('promo-flash')
  expect(promo.common.buttonColor).toBe('#D8CEBD')
  expect(createGifDraft('promo-flash').common.buttonColor).toBe('#FFAC33')
  expect(getGifCanvasHeight(createGifTemplateDemo('split-banner'))).toBe(187.5)
})

it('作品封面按真实时长播放完整场景，包含蒙层和四帧循环', () => {
  vi.useFakeTimers()
  const draft = createGifTemplateDemo('grid-slideshow')
  const { container } = render(<GifPreview draft={draft}/>)
  const preview = container.querySelector('.gif-live-preview')!
  expect(preview).toHaveAttribute('data-preview-frame', '0')
  expect(container.querySelectorAll('.is-dimmed')).toHaveLength(3)
  act(() => vi.advanceTimersByTime(draft.intervalMs))
  expect(preview).toHaveAttribute('data-preview-frame', '1')
  expect(container.querySelector('.is-position-2')).not.toHaveClass('is-dimmed')
  act(() => vi.advanceTimersByTime(draft.intervalMs * 3))
  expect(preview).toHaveAttribute('data-preview-frame', '0')
})

it('促销示意图保留固定背景与蒙层，只让文字占位块变色', () => {
  vi.useFakeTimers()
  const { container } = render(<GifTemplatePreview templateId="promo-flash"/>)
  const image = container.querySelector('img')!.getAttribute('src')
  expect(container.querySelector('.gif-promo-overlay')).toBeInTheDocument()
  expect(container.querySelectorAll('.gif-demo-title')).toHaveLength(2)
  expect(container.querySelector('h2')).not.toBeInTheDocument()
  act(() => vi.advanceTimersByTime(1000))
  expect(container.querySelector('.gif-promo-overlay')).toHaveClass('is-emphasis-frame')
  expect(container.querySelector('img')).toHaveAttribute('src', image)
})

it('左右示意图使用四种不同色块，并保持规定的组合顺序', () => {
  const draft = createGifTemplateDemo('split-banner')
  const frames = draft.scenes.map(scene => scene.images.map(image => image.image))
  expect(new Set(frames.flat()).size).toBe(4)
  expect(frames[0][1]).toBe(frames[1][1])
  expect(frames[1][0]).toBe(frames[2][0])
  expect(frames[2][1]).toBe(frames[3][1])
  expect(frames[3][0]).toBe(frames[0][0])
})

it('左右轮播导出默认宽750高375，最大高度750，不再被重复放大', () => {
  const draft = createGifDraft('split-banner')
  expect(draft.canvasHeight).toBe(375)
  expect(getGifCanvasHeight(draft) * 2).toBe(375)
  const { container } = render(<GifStage draft={draft} scene={draft.scenes[0]} exportMode/>)
  expect(container.firstChild).toHaveStyle({ height: '187.5px' })
  expect(getGifCanvasHeight(normalizeGifDraft({ ...draft, canvasHeight: 750 })) * 2).toBe(750)
})

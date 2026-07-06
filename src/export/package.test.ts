import { expect, it } from 'vitest'
import JSZip from 'jszip'
import { addRenderedFloorsToZip, getAnimatedBannerFileName, isAnimatedBanner, type RenderedFloor } from './package'

it('不把 includeFull=false 的整层 JPG 写入 ZIP', () => {
  const zip = new JSZip()
  const floor: RenderedFloor = {
    fullName: '01-head-full.jpg', full: new Blob(['full']), width: 750, height: 92, includeFull: false,
    regions: [{ name: '01-head-item-01.jpg', blob: new Blob(['item']) }, { name: '01-head-item-02.jpg', blob: new Blob(['item']) }],
  }
  addRenderedFloorsToZip(zip, [floor])
  expect(Object.keys(zip.files)).toEqual(['01-head-item-01.jpg', '01-head-item-02.jpg'])
})

it('普通模板仍写入整层 JPG', () => {
  const zip = new JSZip()
  const floor: RenderedFloor = { fullName: '01-banner-full.jpg', full: new Blob(['full']), width: 750, height: 500, includeFull: true, regions: [] }
  addRenderedFloorsToZip(zip, [floor])
  expect(Object.keys(zip.files)).toEqual(['01-banner-full.jpg'])
})

it('只把启用且至少有两帧的 Banner 作为 GIF 导出', () => {
  const floor = { templateId: 'banner-regular', animation: { enabled: true, intervalMs: 1000, frames: [{ image: 'a' }, { image: 'b' }] } }
  expect(isAnimatedBanner(floor as never)).toBe(true)
  expect(isAnimatedBanner({ ...floor, animation: { ...floor.animation, enabled: false } } as never)).toBe(false)
  expect(isAnimatedBanner({ ...floor, templateId: 'title-centered' } as never)).toBe(false)
  expect(getAnimatedBannerFileName(3)).toBe('03-banner-item-01.gif')
})

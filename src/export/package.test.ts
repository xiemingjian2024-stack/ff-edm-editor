import { expect, it, vi } from 'vitest'
import JSZip from 'jszip'
import { addRenderedFloorsToZip, captureAnimatedBanner, getAnimatedBannerFileName, isAnimatedBanner, isWholeFloorRegion, type RenderedFloor } from './package'

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

it('识别覆盖完整楼层的切片以直接复用原始捕获图', () => {
  expect(isWholeFloorRegion({ x: 0, y: 0, width: 750, height: 840 }, 840)).toBe(true)
  expect(isWholeFloorRegion({ x: 0, y: 0, width: 750, height: 839 }, 840)).toBe(false)
})

it('GIF Banner 使用真实楼层逐帧截图并在完成后恢复图片状态', async () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 1 })
  vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 1, height: 1 })))
  const context = { drawImage: vi.fn(), getImageData: vi.fn(() => ({ data: new Uint8ClampedArray([255, 0, 0, 255]) })) }
  const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never)
  const node = document.createElement('section')
  const holder = document.createElement('div'); holder.className = 'editable-image-frame'
  const image = document.createElement('img'); image.src = 'original.jpg'; image.style.transform = 'scale(0.8)'
  holder.append(image); node.append(holder)
  const capturedSources: string[] = []
  await captureAnimatedBanner(node, [
    { image: 'frame-1.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 },
    { image: 'frame-2.jpg', url: '', scale: 1.2, offsetX: 3, offsetY: 4 },
  ], 1000, async captureNode => {
    expect(captureNode).toBe(node)
    capturedSources.push(image.getAttribute('src')!)
    return new Blob(['frame'])
  })
  expect(capturedSources).toEqual(['frame-1.jpg', 'frame-2.jpg'])
  expect(image.getAttribute('src')).toBe('original.jpg')
  expect(image.style.transform).toBe('scale(0.8)')
  getContext.mockRestore()
  vi.unstubAllGlobals()
})

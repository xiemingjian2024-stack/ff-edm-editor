import { GIFEncoder, applyPalette, quantize } from 'gifenc'

export interface RgbaFrame { width: number; height: number; data: Uint8ClampedArray }
export interface GifDynamicRect { x: number; y: number; width: number; height: number }

const maxPaletteSamplePixels = 1_000_000

/**
 * GIF 最多只能保存 256 色。所有帧必须共用同一套色板，否则相同的静态区域
 * 会因每帧照片内容不同而被量化成不同颜色，播放时就会出现背景闪色。
 */
export function createSharedPaletteSample(frames: RgbaFrame[], maxPixels = maxPaletteSamplePixels) {
  const sampleParts = frames.map(frame => {
    const pixelCount = frame.data.length / 4
    const frameBudget = Math.max(1, Math.floor(maxPixels / frames.length))
    const step = Math.max(1, Math.ceil(pixelCount / frameBudget))
    const sampleCount = Math.ceil(pixelCount / step)
    const sample = new Uint8ClampedArray(sampleCount * 4)

    let target = 0
    for (let sourcePixel = 0; sourcePixel < pixelCount; sourcePixel += step) {
      const source = sourcePixel * 4
      sample[target] = frame.data[source]
      sample[target + 1] = frame.data[source + 1]
      sample[target + 2] = frame.data[source + 2]
      sample[target + 3] = frame.data[source + 3]
      target += 4
    }
    return target === sample.length ? sample : sample.slice(0, target)
  })

  const length = sampleParts.reduce((total, sample) => total + sample.length, 0)
  const combined = new Uint8ClampedArray(length)
  let offset = 0
  sampleParts.forEach(sample => {
    combined.set(sample, offset)
    offset += sample.length
  })
  return combined
}

export function stabilizeGifOutsideDynamicRect(frames: RgbaFrame[], rect: GifDynamicRect) {
  if (frames.length < 2) return frames
  const first = frames[0]
  const left = Math.max(0, Math.floor(rect.x))
  const top = Math.max(0, Math.floor(rect.y))
  const right = Math.min(first.width, Math.ceil(rect.x + rect.width))
  const bottom = Math.min(first.height, Math.ceil(rect.y + rect.height))

  frames.slice(1).forEach(frame => {
    for (let y = 0; y < first.height; y += 1) {
      for (let x = 0; x < first.width; x += 1) {
        if (x >= left && x < right && y >= top && y < bottom) continue
        const offset = (y * first.width + x) * 4
        frame.data[offset] = first.data[offset]
        frame.data[offset + 1] = first.data[offset + 1]
        frame.data[offset + 2] = first.data[offset + 2]
        frame.data[offset + 3] = first.data[offset + 3]
      }
    }
  })
  return frames
}

export function stabilizeMatchingGifIndexes(frames: RgbaFrame[], indexedFrames: Uint8Array[]) {
  if (frames.length < 2 || indexedFrames.length !== frames.length) return indexedFrames
  const firstPixels = frames[0].data
  const firstIndexes = indexedFrames[0]
  frames.slice(1).forEach((frame, frameOffset) => {
    const indexes = indexedFrames[frameOffset + 1]
    for (let pixel = 0; pixel < firstIndexes.length; pixel += 1) {
      const offset = pixel * 4
      if (
        frame.data[offset] === firstPixels[offset]
        && frame.data[offset + 1] === firstPixels[offset + 1]
        && frame.data[offset + 2] === firstPixels[offset + 2]
        && frame.data[offset + 3] === firstPixels[offset + 3]
      ) indexes[pixel] = firstIndexes[pixel]
    }
  })
  return indexedFrames
}

export function encodeGifFrames(frames: RgbaFrame[], delayMs: number): Uint8Array {
  if (!frames.length) throw new Error('GIF 至少需要一帧图片')
  const { width, height } = frames[0]
  if (frames.some(frame => frame.width !== width || frame.height !== height)) throw new Error('GIF 帧尺寸必须一致')

  const gif = GIFEncoder()
  const palette = quantize(createSharedPaletteSample(frames), 256)
  const indexedFrames = stabilizeMatchingGifIndexes(frames, frames.map(frame => applyPalette(frame.data, palette)))
  indexedFrames.forEach((indexed, index) => {
    const options = {
      ...(index === 0 ? { palette } : {}),
      delay: delayMs,
      repeat: index === 0 ? 0 : undefined,
    }
    // gifenc 的运行时支持后续帧复用首帧全局色表，但它附带的类型声明
    // 将 palette 错写为必填；这里按其官方 API 省略后续帧局部色表。
    gif.writeFrame(indexed, width, height, options as Parameters<typeof gif.writeFrame>[3])
  })
  gif.finish()
  return gif.bytes()
}

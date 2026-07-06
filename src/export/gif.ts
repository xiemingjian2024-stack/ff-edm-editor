import { GIFEncoder, applyPalette, quantize } from 'gifenc'

export interface RgbaFrame { width: number; height: number; data: Uint8ClampedArray }

export function encodeGifFrames(frames: RgbaFrame[], delayMs: number): Uint8Array {
  if (!frames.length) throw new Error('GIF 至少需要一帧图片')
  const { width, height } = frames[0]
  if (frames.some(frame => frame.width !== width || frame.height !== height)) throw new Error('GIF 帧尺寸必须一致')

  const gif = GIFEncoder()
  frames.forEach((frame, index) => {
    const palette = quantize(frame.data, 256)
    const indexed = applyPalette(frame.data, palette)
    gif.writeFrame(indexed, width, height, { palette, delay: delayMs, repeat: index === 0 ? 0 : undefined })
  })
  gif.finish()
  return gif.bytes()
}

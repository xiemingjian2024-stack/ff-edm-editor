import { describe, expect, it } from 'vitest'
import { createSharedPaletteSample, encodeGifFrames, stabilizeGifOutsideDynamicRect, stabilizeMatchingGifIndexes } from './gif'

describe('encodeGifFrames', () => {
  it('encodes multiple RGBA frames as a looping GIF', () => {
    const red = { width: 2, height: 1, data: new Uint8ClampedArray([255, 0, 0, 255, 255, 0, 0, 255]) }
    const blue = { width: 2, height: 1, data: new Uint8ClampedArray([0, 0, 255, 255, 0, 0, 255, 255]) }

    const bytes = encodeGifFrames([red, blue], 1000)

    expect(new TextDecoder().decode(bytes.slice(0, 6))).toBe('GIF89a')
    expect(bytes.at(-1)).toBe(0x3b)
  })

  it('rejects frames with different dimensions', () => {
    const first = { width: 1, height: 1, data: new Uint8ClampedArray(4) }
    const second = { width: 2, height: 1, data: new Uint8ClampedArray(8) }

    expect(() => encodeGifFrames([first, second], 1000)).toThrow('GIF 帧尺寸必须一致')
  })

  it('builds one palette sample from every frame', () => {
    const first = { width: 2, height: 1, data: new Uint8ClampedArray([255, 0, 0, 255, 10, 20, 30, 255]) }
    const second = { width: 2, height: 1, data: new Uint8ClampedArray([0, 0, 255, 255, 10, 20, 30, 255]) }

    expect(Array.from(createSharedPaletteSample([first, second]))).toEqual([
      255, 0, 0, 255, 10, 20, 30, 255,
      0, 0, 255, 255, 10, 20, 30, 255,
    ])
  })

  it('uses one global palette for every frame', () => {
    const first = { width: 2, height: 1, data: new Uint8ClampedArray([239, 230, 216, 255, 255, 0, 0, 255]) }
    const second = { width: 2, height: 1, data: new Uint8ClampedArray([239, 230, 216, 255, 0, 0, 255, 255]) }
    const bytes = encodeGifFrames([first, second], 1000)

    // 后续帧不写局部色表，直接复用第一帧的全局色表。
    const imageDescriptorOffsets = Array.from(bytes.entries())
      .filter(([, value]) => value === 0x2c)
      .map(([index]) => index)
    expect(imageDescriptorOffsets).toHaveLength(2)
    const secondDescriptor = imageDescriptorOffsets[1]
    expect(bytes[secondDescriptor + 9] & 0x80).toBe(0)
  })

  it('keeps text and background pixels outside the image frame unchanged', () => {
    const first = { width: 2, height: 2, data: new Uint8ClampedArray([
      10, 10, 10, 255, 20, 20, 20, 255,
      30, 30, 30, 255, 40, 40, 40, 255,
    ]) }
    const second = { width: 2, height: 2, data: new Uint8ClampedArray([
      99, 99, 99, 255, 88, 88, 88, 255,
      77, 77, 77, 255, 66, 66, 66, 255,
    ]) }

    stabilizeGifOutsideDynamicRect([first, second], { x: 0, y: 0, width: 2, height: 1 })

    expect(Array.from(second.data)).toEqual([
      99, 99, 99, 255, 88, 88, 88, 255,
      30, 30, 30, 255, 40, 40, 40, 255,
    ])
  })

  it('forces identical pixels to use the same palette index across frames', () => {
    const first = { width: 2, height: 1, data: new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]) }
    const second = { width: 2, height: 1, data: new Uint8ClampedArray([10, 20, 30, 255, 70, 80, 90, 255]) }
    const firstIndexes = new Uint8Array([3, 4])
    const secondIndexes = new Uint8Array([9, 8])

    stabilizeMatchingGifIndexes([first, second], [firstIndexes, secondIndexes])

    expect(Array.from(secondIndexes)).toEqual([3, 8])
  })
})

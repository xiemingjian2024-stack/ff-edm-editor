import { describe, expect, it } from 'vitest'
import { encodeGifFrames } from './gif'

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
})

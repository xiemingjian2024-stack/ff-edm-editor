import { describe, expect, it } from 'vitest'
import { isHexColorInput, normalizeHexColorInput } from './colorInput'

describe('颜色输入格式', () => {
  it('同时接受带 # 和不带 # 的 6 位色值，并统一保存为大写 #RRGGBB', () => {
    expect(isHexColorInput('#111111')).toBe(true)
    expect(isHexColorInput('111111')).toBe(true)
    expect(normalizeHexColorInput('#ffac33')).toBe('#FFAC33')
    expect(normalizeHexColorInput('ffac33')).toBe('#FFAC33')
  })

  it('拒绝非 6 位十六进制色值', () => {
    expect(isHexColorInput('错误')).toBe(false)
    expect(isHexColorInput('#FFF')).toBe(false)
    expect(normalizeHexColorInput('错误')).toBeNull()
  })
})

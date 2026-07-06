import { act, renderHook } from '@testing-library/react'
import { useBannerFrame } from './useBannerFrame'

it('每秒循环切换 Banner 帧', () => {
  vi.useFakeTimers()
  const frames = [{ image: '1', url: '', scale: 1, offsetX: 0, offsetY: 0 }, { image: '2', url: '', scale: 1, offsetX: 0, offsetY: 0 }]
  const { result } = renderHook(() => useBannerFrame({ enabled: true, intervalMs: 1000, frames }, frames[0]))
  expect(result.current.image).toBe('1')
  act(() => vi.advanceTimersByTime(1000)); expect(result.current.image).toBe('2')
  act(() => vi.advanceTimersByTime(1000)); expect(result.current.image).toBe('1')
  vi.useRealTimers()
})

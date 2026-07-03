import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ManualMediaEditor } from './ManualMediaEditor'

it('从系统剪贴板读取图片并更新媒体', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  const image = new Blob(['image'], { type: 'image/png' })
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { read: vi.fn().mockResolvedValue([{ types: ['image/png'], getType: vi.fn().mockResolvedValue(image) }]) } })
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn().mockReturnValue('blob:clipboard-image') })
  render(<ManualMediaEditor label="卖点图片" value={{ image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }} onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: '粘贴 卖点图片' }))
  expect(onChange).toHaveBeenCalledWith({ image: 'blob:clipboard-image', url: '', scale: 1, offsetX: 0, offsetY: 0 })
})

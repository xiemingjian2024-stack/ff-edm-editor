import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { ManualMediaEditor } from './ManualMediaEditor'

it('从系统剪贴板读取图片并更新媒体', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  const image = new Blob(['image'], { type: 'image/png' })
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { read: vi.fn().mockResolvedValue([{ types: ['image/png'], getType: vi.fn().mockResolvedValue(image) }]) } })
  render(<ManualMediaEditor label="卖点图片" value={{ image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }} onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: '粘贴复制板 卖点图片' }))
  await waitFor(() => expect(onChange).toHaveBeenCalledWith({ image: expect.stringMatching(/^data:image\/png;base64,/), url: '', scale: 1, offsetX: 0, offsetY: 0 }))
})

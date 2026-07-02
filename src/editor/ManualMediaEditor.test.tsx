import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { ManualMediaEditor } from './ManualMediaEditor'

const empty = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

it('按槽位名称上传图片且不产生链接', async () => {
  const onChange = vi.fn()
  const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:before')
  render(<ManualMediaEditor label="Before 图片" value={empty} onChange={onChange} />)
  await userEvent.upload(screen.getByLabelText('上传 Before 图片'), new File(['image'], 'before.jpg', { type: 'image/jpeg' }))
  expect(onChange).toHaveBeenLastCalledWith({ ...empty, image: 'blob:before', url: '' })
  createObjectURL.mockRestore()
})

it('缩放和重置只更新当前媒体值', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  render(<ManualMediaEditor label="After 图片" value={{ ...empty, image: 'after.jpg', scale: 1.5, offsetX: 8, offsetY: 12 }} onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: '重置 After 图片位置' }))
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ image: 'after.jpg', scale: 1, offsetX: 0, offsetY: 0 }))
})

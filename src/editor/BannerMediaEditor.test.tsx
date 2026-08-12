import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { BannerMediaEditor } from './BannerMediaEditor'

const empty = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

it('Shopify 读取首图并保留同一链接', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  const reader = vi.fn().mockResolvedValue({ title: 'Bed', image: 'first.jpg', gallery: ['first.jpg'], price: '$99', url: 'https://shop/products/bed' })
  render(<BannerMediaEditor value={empty} onChange={onChange} reader={reader} />)
  await user.type(screen.getByLabelText('Banner 图片链接'), 'https://shop/products/bed')
  await user.click(screen.getByRole('button', { name: '读取链接 Banner 图片' }))
  expect(onChange).toHaveBeenLastCalledWith({ ...empty, image: 'first.jpg', url: 'https://shop/products/bed' })
})

it('启用 GIF 后默认创建两帧并支持增加到四帧', async () => {
  const user = userEvent.setup(); const onAnimationChange = vi.fn()
  const value = { image: 'one.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 }
  const { rerender } = render(<BannerMediaEditor value={value} onChange={() => {}} onAnimationChange={onAnimationChange} />)
  expect(screen.getByRole('tablist', { name: 'Banner 格式' })).toBeVisible()
  expect(screen.getByRole('tab', { name: '静态图片' })).toHaveAttribute('aria-selected', 'true')
  await user.click(screen.getByRole('tab', { name: 'GIF 动画' }))
  expect(onAnimationChange).toHaveBeenCalledWith(expect.objectContaining({ enabled: true, intervalMs: 1000, frames: [value, expect.objectContaining({ image: '' })] }))
  const animation = onAnimationChange.mock.calls[0][0]
  rerender(<BannerMediaEditor value={value} onChange={() => {}} animation={animation} onAnimationChange={onAnimationChange} />)
  expect(screen.getByText('帧 1')).toBeVisible(); expect(screen.getByText('帧 2')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '添加帧' }))
  expect(onAnimationChange).toHaveBeenLastCalledWith(expect.objectContaining({ frames: expect.arrayContaining([expect.any(Object), expect.any(Object), expect.any(Object)]) }))
})

it('GIF 帧可排序且最少保留两帧', async () => {
  const user = userEvent.setup(); const onAnimationChange = vi.fn()
  const frames = ['one.jpg', 'two.jpg', 'three.jpg'].map(image => ({ image, url: '', scale: 1, offsetX: 0, offsetY: 0 }))
  render(<BannerMediaEditor value={frames[0]} onChange={() => {}} animation={{ enabled: true, intervalMs: 1000, frames }} onAnimationChange={onAnimationChange} />)
  await user.click(screen.getByRole('button', { name: '下移帧 1' }))
  expect(onAnimationChange).toHaveBeenLastCalledWith(expect.objectContaining({ frames: [frames[1], frames[0], frames[2]] }))
  await user.click(screen.getByRole('button', { name: '删除帧 3' }))
  expect(onAnimationChange).toHaveBeenLastCalledWith(expect.objectContaining({ frames: [frames[0], frames[1]] }))
})

it('缩放和重置使用通用媒体状态', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  render(<BannerMediaEditor value={{ ...empty, image: 'a.jpg', scale: 1.5, offsetX: 10, offsetY: 20 }} onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: '重置 Banner 图片位置' }))
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ scale: 1, offsetX: 0, offsetY: 0 }))
})

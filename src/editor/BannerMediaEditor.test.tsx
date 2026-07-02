import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { BannerMediaEditor } from './BannerMediaEditor'

const empty = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

it('Shopify 读取首图并保留同一链接', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  const reader = vi.fn().mockResolvedValue({ title: 'Bed', image: 'first.jpg', gallery: ['first.jpg'], price: '$99', url: 'https://shop/products/bed' })
  render(<BannerMediaEditor value={empty} onChange={onChange} reader={reader} />)
  await user.type(screen.getByLabelText('Banner Shopify 链接'), 'https://shop/products/bed')
  await user.click(screen.getByRole('button', { name: '读取商品首图' }))
  expect(onChange).toHaveBeenLastCalledWith({ ...empty, image: 'first.jpg', url: 'https://shop/products/bed' })
})

it('缩放和重置使用通用媒体状态', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  render(<BannerMediaEditor value={{ ...empty, image: 'a.jpg', scale: 1.5, offsetX: 10, offsetY: 20 }} onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: '重置图片位置' }))
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ scale: 1, offsetX: 0, offsetY: 0 }))
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { MediaControlCard } from './MediaControlCard'

const empty = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

it('空状态只展示上传卡片、链接获取和粘贴入口', () => {
  render(<MediaControlCard label="卖点图片" value={empty} onChange={vi.fn()} />)
  expect(screen.getByText('＋ 上传图片')).toBeInTheDocument()
  expect(screen.getByLabelText('卖点图片链接')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '从链接获取 卖点图片' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '粘贴 卖点图片' })).toBeInTheDocument()
  expect(screen.queryByLabelText('卖点图片缩放')).not.toBeInTheDocument()
})

it('已有图片时在预览卡片内提供 hover 编辑操作', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<MediaControlCard label="卖点图片" value={{ ...empty, image: 'cover.jpg', scale: 1.35, offsetX: 10, offsetY: 12 }} onChange={onChange} />)
  expect(screen.getByRole('img', { name: '卖点图片预览' })).toHaveAttribute('src', 'cover.jpg')
  expect(screen.getByText('重新上传')).toBeInTheDocument()
  expect(screen.getByLabelText('卖点图片缩放')).toHaveValue('135')
  await user.click(screen.getByRole('button', { name: '重置 卖点图片位置' }))
  expect(onChange).toHaveBeenCalledWith({ image: 'cover.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 })
})

it('普通图片链接会直接写入图片地址', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<MediaControlCard label="卖点图片" value={empty} onChange={onChange} />)
  await user.type(screen.getByLabelText('卖点图片链接'), 'https://cdn.example.com/a.jpg')
  await user.click(screen.getByRole('button', { name: '从链接获取 卖点图片' }))
  expect(onChange).toHaveBeenCalledWith({ ...empty, image: 'https://cdn.example.com/a.jpg', url: 'https://cdn.example.com/a.jpg' })
})

it('可以接入读取器从 Shopify 链接读取图片', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  const reader = vi.fn().mockResolvedValue({ title: 'Bed', image: 'first.jpg', gallery: ['first.jpg'], price: '$99', url: 'https://shop/products/bed' })
  render(<MediaControlCard label="Banner 图片" value={empty} onChange={onChange} reader={reader} />)
  await user.type(screen.getByLabelText('Banner 图片链接'), 'https://shop/products/bed')
  await user.click(screen.getByRole('button', { name: '从链接获取 Banner 图片' }))
  expect(onChange).toHaveBeenCalledWith({ ...empty, image: 'first.jpg', url: 'https://shop/products/bed' })
})

it('上传图片时保存可持久化的数据地址', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  render(<MediaControlCard label="卖点图片" value={empty} onChange={onChange} />)
  await user.upload(screen.getByLabelText('上传 卖点图片'), new File(['image'], 'point.png', { type: 'image/png' }))
  await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ image: expect.stringMatching(/^data:image\/png;base64,/), url: '' })))
})

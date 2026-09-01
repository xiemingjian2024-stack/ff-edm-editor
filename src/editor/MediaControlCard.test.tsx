import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { MediaControlCard } from './MediaControlCard'

const empty = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

it('空状态只展示上传卡片、链接获取和粘贴入口', () => {
  render(<MediaControlCard label="卖点图片" value={empty} onChange={vi.fn()} />)
  expect(screen.getByText('＋ 上传图片')).toBeInTheDocument()
  expect(screen.getByLabelText('卖点图片链接')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '读取链接 卖点图片' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '粘贴复制板 卖点图片' })).toBeInTheDocument()
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
  await user.click(screen.getByRole('button', { name: '读取链接 卖点图片' }))
  expect(onChange).toHaveBeenCalledWith({ ...empty, image: 'https://cdn.example.com/a.jpg', url: 'https://cdn.example.com/a.jpg' })
})

it('可以接入读取器从 Shopify 链接读取图片', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  const reader = vi.fn().mockResolvedValue({ title: 'Bed', image: 'first.jpg', gallery: ['first.jpg'], price: '$99', url: 'https://shop/products/bed' })
  render(<MediaControlCard label="Banner 图片" value={empty} onChange={onChange} reader={reader} />)
  await user.type(screen.getByLabelText('Banner 图片链接'), 'https://shop/products/bed')
  await user.click(screen.getByRole('button', { name: '读取链接 Banner 图片' }))
  expect(onChange).toHaveBeenCalledWith({ ...empty, image: 'first.jpg', url: 'https://shop/products/bed' })
})

it('上传图片时保存可持久化的数据地址', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  render(<MediaControlCard label="卖点图片" value={empty} onChange={onChange} />)
  await user.upload(screen.getByLabelText('上传 卖点图片'), new File(['image'], 'point.png', { type: 'image/png' }))
  await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ image: expect.stringMatching(/^data:image\/png;base64,/), url: '' })))
})

it('多选上传和重新上传都将有序文件列表交给批量处理器', async () => {
  const user = userEvent.setup(); const onChange = vi.fn(); const onMultipleUpload = vi.fn().mockResolvedValue(undefined)
  render(<MediaControlCard label="图片 1" value={{ ...empty, image: 'old.png' }} onChange={onChange} onMultipleUpload={onMultipleUpload} maxUploadFiles={4} />)
  const files = ['b', 'a'].map(name => new File([name], `${name}.png`, { type: 'image/png' }))
  for (const label of ['上传 图片 1', '重新上传 图片 1']) {
    const input = screen.getByLabelText(label)
    expect(input).toHaveAttribute('multiple')
    await user.upload(input, files)
    await waitFor(() => expect(input).not.toBeDisabled())
    expect(input).toHaveValue('')
  }
  expect(onMultipleUpload).toHaveBeenCalledTimes(2)
  expect(onMultipleUpload).toHaveBeenLastCalledWith(files)
  expect(onChange).not.toHaveBeenCalled()
})

it('开启多选后只选一张仍走当前图片替换', async () => {
  const user = userEvent.setup(); const onChange = vi.fn(); const onMultipleUpload = vi.fn()
  render(<MediaControlCard label="图片 3" value={empty} onChange={onChange} onMultipleUpload={onMultipleUpload} maxUploadFiles={4} />)
  await user.upload(screen.getByLabelText('上传 图片 3'), new File(['one'], 'one.png', { type: 'image/png' }))
  await waitFor(() => expect(onChange).toHaveBeenCalledOnce())
  expect(onMultipleUpload).not.toHaveBeenCalled()
})

it('超过上限拒绝整批并提示，不截断或覆盖已有图片', async () => {
  const user = userEvent.setup(); const onChange = vi.fn(); const onMultipleUpload = vi.fn()
  render(<MediaControlCard label="图片 1" value={empty} onChange={onChange} onMultipleUpload={onMultipleUpload} maxUploadFiles={4} />)
  await user.upload(screen.getByLabelText('上传 图片 1'), Array.from({ length: 5 }, (_, i) => new File(['x'], `${i}.png`, { type: 'image/png' })))
  expect(screen.getByRole('alert')).toHaveTextContent('一次最多上传 4 张')
  expect(onMultipleUpload).not.toHaveBeenCalled()
  expect(onChange).not.toHaveBeenCalled()
})

it('批量读取失败显示错误且恢复上传入口', async () => {
  const user = userEvent.setup()
  render(<MediaControlCard label="图片 1" value={empty} onChange={vi.fn()} onMultipleUpload={vi.fn().mockRejectedValue(new Error('图片读取失败'))} maxUploadFiles={4} />)
  const input = screen.getByLabelText('上传 图片 1')
  await user.upload(input, ['a', 'b'].map(name => new File(['x'], `${name}.png`, { type: 'image/png' })))
  expect(await screen.findByRole('alert')).toHaveTextContent('图片读取失败')
  expect(input).not.toBeDisabled()
})

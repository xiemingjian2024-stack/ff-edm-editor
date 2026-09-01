import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { BannerMediaEditor } from './BannerMediaEditor'
import { createGifDraft } from '../gif/model'
import { captureFloorPng } from '../export/render'

vi.mock('../export/render', () => ({ captureFloorPng: vi.fn(async () => new Blob(['png'], { type: 'image/png' })) }))

const empty = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }

it('Shopify 读取首图并保留同一链接', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  const reader = vi.fn().mockResolvedValue({ title: 'Bed', image: 'first.jpg', gallery: ['first.jpg'], price: '$99', url: 'https://shop/products/bed' })
  render(<BannerMediaEditor value={empty} onChange={onChange} reader={reader} />)
  await user.type(screen.getByLabelText('Banner 图片链接'), 'https://shop/products/bed')
  await user.click(screen.getByRole('button', { name: '读取链接 Banner 图片' }))
  expect(onChange).toHaveBeenLastCalledWith({ ...empty, image: 'first.jpg', url: 'https://shop/products/bed' })
})

it('移除 Banner 内逐帧编辑并可引用独立 GIF 草稿', async () => {
  const user = userEvent.setup(); const onAnimationChange = vi.fn(); const onChange = vi.fn()
  const value = { image: 'one.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 }
  const gif = createGifDraft('image-slideshow'); gif.name = '商品轮播'; gif.scenes[0].images[0].image = 'first.jpg'; gif.scenes[1].images[0].image = 'second.jpg'
  render(<BannerMediaEditor value={value} onChange={onChange} onAnimationChange={onAnimationChange} gifDrafts={[gif]} />)
  expect(screen.queryByRole('tablist', { name: 'Banner 格式' })).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '引用 GIF 作品' }))
  expect(screen.getByRole('dialog', { name: '引用 GIF 作品' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /商品轮播.*选择/ }))
  expect(onAnimationChange).toHaveBeenCalledWith(expect.objectContaining({ enabled: true, sourceGifDraftId: gif.id, sourceGifDraftName: '商品轮播', frames: [expect.objectContaining({ image: 'first.jpg' }), expect.objectContaining({ image: 'second.jpg' })] }))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ image: 'first.jpg' }))
})

it('弹窗显示全部 GIF 类型，并将复合模板完整渲染为引用帧', async () => {
  const user = userEvent.setup(); const onAnimationChange = vi.fn()
  const sources = ['grid-slideshow', 'image-slideshow', 'promo-flash', 'split-banner'].map(id => createGifDraft(id as Parameters<typeof createGifDraft>[0]))
  sources[0].name = '宫格作品'
  render(<BannerMediaEditor value={empty} onChange={() => {}} onAnimationChange={onAnimationChange} gifDrafts={sources} />)
  await user.click(screen.getByRole('button', { name: '引用 GIF 作品' }))
  expect(screen.getAllByText(/未命名 GIF -/)).toHaveLength(3)
  await user.click(screen.getByRole('button', { name: /宫格作品.*选择/ }))
  await waitFor(() => expect(onAnimationChange).toHaveBeenCalledWith(expect.objectContaining({ sourceGifDraftId: sources[0].id, frames: expect.arrayContaining([expect.objectContaining({ image: expect.stringMatching(/^data:image\/png;base64,/) })]) })))
  expect(captureFloorPng).toHaveBeenCalledTimes(4)
  expect(onAnimationChange.mock.calls[0][0].frames).toHaveLength(4)
})

it('引用的 GIF 可取消并恢复静态图片模式', async () => {
  const user = userEvent.setup(); const onAnimationChange = vi.fn()
  const frames = ['one.jpg', 'two.jpg', 'three.jpg'].map(image => ({ image, url: '', scale: 1, offsetX: 0, offsetY: 0 }))
  render(<BannerMediaEditor value={frames[0]} onChange={() => {}} animation={{ enabled: true, intervalMs: 1000, frames }} onAnimationChange={onAnimationChange} />)
  await user.click(screen.getByRole('button', { name: '取消引用' }))
  expect(onAnimationChange).toHaveBeenLastCalledWith(expect.objectContaining({ enabled: false, frames: [] }))
})

it('缩放和重置使用通用媒体状态', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  render(<BannerMediaEditor value={{ ...empty, image: 'a.jpg', scale: 1.5, offsetX: 10, offsetY: 20 }} onChange={onChange} />)
  await user.click(screen.getByRole('button', { name: '重置 Banner 图片位置' }))
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ scale: 1, offsetX: 0, offsetY: 0 }))
})

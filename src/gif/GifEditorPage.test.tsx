import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { GifEditorPage } from './GifEditorPage'
import { createGifDraft, type GifDraft } from './model'

it.each(['grid-slideshow', 'split-banner', 'image-slideshow'] as const)('%s 批量上传一次保存并可继续单张替换', async templateId => {
  const user = userEvent.setup(); const onSave = vi.fn()
  render(<GifEditorPage initialDraft={createGifDraft(templateId)} onSave={onSave} onBack={vi.fn()} />)
  const count = templateId === 'image-slideshow' ? 5 : 4
  const uploadLabel = templateId === 'image-slideshow' ? '上传 场景 1 图片 1' : '上传 图片 1'
  const files = Array.from({ length: count }, (_, i) => new File([String(i)], `${i}.png`, { type: 'image/png' }))
  await user.upload(screen.getByLabelText(uploadLabel), files)
  await waitFor(() => expect(onSave).toHaveBeenCalledOnce())
  const next: GifDraft = onSave.mock.calls[0][0]
  expect(next.scenes).toHaveLength(count)
  expect(next.scenes.every(scene => scene.images.every(image => image.image.startsWith('data:image/png;base64,')))).toBe(true)
  if (templateId !== 'image-slideshow') await user.click(screen.getByLabelText('选择并拖拽图片 3'))
  const singleLabel = templateId === 'image-slideshow' ? uploadLabel : '上传 图片 3'
  await user.upload(screen.getByLabelText(singleLabel), new File(['replacement'], 'new.png', { type: 'image/png' }))
  await waitFor(() => expect(onSave).toHaveBeenCalledTimes(2))
  const updated: GifDraft = onSave.mock.calls[1][0]
  const image = templateId === 'grid-slideshow' ? updated.scenes[0].images[2] : templateId === 'split-banner' ? updated.scenes[1].images[0] : updated.scenes[0].images[0]
  expect(image.image).toBe(`data:image/png;base64,${btoa('replacement')}`)
})

it('单图文字模板仍仅允许单图上传', () => {
  render(<GifEditorPage initialDraft={createGifDraft('promo-flash')} onSave={vi.fn()} onBack={vi.fn()} />)
  expect(screen.getByLabelText('上传 场景 1 图片 1')).not.toHaveAttribute('multiple')
})

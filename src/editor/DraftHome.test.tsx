import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { DraftHome } from './DraftHome'

const draft = { id: 'a', name: '夏日 EDM', floors: [], themePaletteId: 'funnyfuzzy-classic', createdAt: '2026-07-01T09:00:00.000Z', updatedAt: '2026-07-01T10:30:00.000Z' }
const media = { image: 'banner-cover.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 }

it('草稿卡显示名称、楼层数量和修改时间', () => {
  render(<DraftHome drafts={[draft]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  expect(screen.getByRole('img', { name: 'EDM Editor' })).toBeVisible()
  expect(screen.getByText('夏日 EDM')).toBeVisible()
  expect(screen.getByLabelText('0 个楼层')).toHaveClass('draft-count-badge')
  expect(screen.getByText(/修改于/)).toBeVisible()
  expect(screen.getByRole('button', { name: '打开 夏日 EDM' })).toBeVisible()
  expect(screen.getByRole('img', { name: '夏日 EDM 封面' })).toBeVisible()
  expect(screen.getByTestId('draft-card-meta')).toHaveTextContent(/0.*夏日 EDM.*修改于/s)
  expect(screen.queryByRole('button', { name: '发送 夏日 EDM' })).not.toBeInTheDocument()
})

it('作品封面优先展示第一个 Banner 图片', () => {
  const draftWithBanner = { ...draft, floors: [
    { id: 'title', templateId: 'title-centered', values: {}, products: {} },
    { id: 'banner', templateId: 'banner-image-copy', values: {}, products: {}, media },
    { id: 'banner-2', templateId: 'banner-regular', values: {}, products: {}, media: { ...media, image: 'second-banner.jpg' } },
  ] }
  render(<DraftHome drafts={[draftWithBanner]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  expect(screen.getByRole('img', { name: '夏日 EDM 封面' })).toHaveAttribute('src', 'banner-cover.jpg')
})

it('GIF Banner 优先使用第一张有效帧作为作品封面', () => {
  const draftWithGifBanner = { ...draft, floors: [{ id: 'banner', templateId: 'banner-regular', values: {}, products: {}, media: { ...media, image: 'static.jpg' }, animation: { enabled: true, intervalMs: 1000, frames: [{ ...media, image: '' }, { ...media, image: 'gif-frame.jpg' }] } }] }
  render(<DraftHome drafts={[draftWithGifBanner]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  expect(screen.getByRole('img', { name: '夏日 EDM 封面' })).toHaveAttribute('src', 'gif-frame.jpg')
})

it('没有 Banner 图片时作品封面展示默认图', () => {
  render(<DraftHome drafts={[draft]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  expect(screen.getByRole('img', { name: '夏日 EDM 封面' })).toHaveAttribute('src', expect.stringContaining('empty-order'))
})

it('在草稿与最近导出之间切换并可复制为草稿', async () => {
  const user = userEvent.setup(); const onDuplicate = vi.fn()
  render(<DraftHome drafts={[draft]} exports={[{ id: 'a', draft, exportedAt: '2026-07-01T11:00:00.000Z' }]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={onDuplicate} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  await user.click(screen.getByRole('button', { name: '更多操作 夏日 EDM' }))
  await user.click(screen.getByRole('button', { name: '复制 夏日 EDM' }))
  expect(onDuplicate).toHaveBeenCalledWith(draft)
  await user.click(screen.getByRole('button', { name: '已导出' }))
  expect(screen.getByText(/导出于/)).toBeVisible()
  await user.click(screen.getByRole('button', { name: '更多操作 夏日 EDM' }))
  await user.click(screen.getByRole('button', { name: '将 夏日 EDM 复制为草稿' }))
  expect(onDuplicate).toHaveBeenCalledTimes(2)
})

it('通过 edm 文件发送和接收设计稿', async () => {
  const user = userEvent.setup()
  const onReceiveTransferCode = vi.fn(async () => {})
  render(<DraftHome drafts={[draft]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-abc'} onReceiveTransferCode={onReceiveTransferCode} />)
  await user.click(screen.getByRole('button', { name: '更多操作 夏日 EDM' }))
  await user.click(screen.getByRole('button', { name: '发送 夏日 EDM' }))
  expect(await screen.findByRole('button', { name: '下载 .edm 文件' })).toBeVisible()
  expect(screen.queryByLabelText('设计稿编码')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '关闭' }))
  await user.click(screen.getByRole('button', { name: '接收设计稿' }))
  expect(screen.getByText('导入 .edm 文件')).toBeVisible()
  expect(screen.queryByLabelText('设计稿编码')).not.toBeInTheDocument()
  const file = new File(['FFEDM1-abc'], '夏日.edm', { type: 'text/plain' })
  await user.upload(screen.getByLabelText('导入 .edm 文件'), file)
  expect(onReceiveTransferCode).toHaveBeenCalledWith('FFEDM1-abc')
})

it('作品卡片使用数字色块、满幅封面和悬浮更多菜单', async () => {
  const user = userEvent.setup()
  render(<DraftHome drafts={[draft]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  expect(screen.getByLabelText('0 个楼层')).toHaveClass('draft-count-badge')
  await user.click(screen.getByRole('button', { name: '更多操作 夏日 EDM' }))
  expect(screen.getByRole('menu')).toBeVisible()
  const css = readFileSync('src/editor/editor.css', 'utf8')
  expect(css).toMatch(/\.draft-preview \{[^}]*padding: 0;[^}]*overflow: hidden;/)
  expect(css).toMatch(/\.draft-preview \{[^}]*aspect-ratio: 1 \/ 1;/)
  expect(css).toMatch(/\.draft-cover-image \{[^}]*width: 100%;[^}]*object-fit: cover;/)
  expect(css).toMatch(/\.draft-count-badge \{[^}]*background: var\(--draft-count-bg, #FFAC33\);[^}]*color: #fff;/)
  expect(css).toMatch(/\.draft-more \{[^}]*opacity: 0;/)
  expect(css).toMatch(/\.draft-action-menu button \{[^}]*color: #FFAC33;/)
})

it('楼层数字标签按楼层数量使用不同颜色', () => {
  const oneFloorDraft = { ...draft, id: 'one', name: '1 层 EDM', floors: [{ id: 'f1', templateId: 'title-centered', values: {}, products: {} }] }
  const twoFloorDraft = { ...draft, id: 'two', name: '2 层 EDM', floors: [
    { id: 'f1', templateId: 'title-centered', values: {}, products: {} },
    { id: 'f2', templateId: 'title-centered', values: {}, products: {} },
  ] }
  render(<DraftHome drafts={[oneFloorDraft, twoFloorDraft]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  expect(screen.getByLabelText('1 个楼层')).toHaveStyle({ '--draft-count-bg': '#FFAC33' })
  expect(screen.getByLabelText('2 个楼层')).toHaveStyle({ '--draft-count-bg': '#5B8DEF' })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DraftHome } from './DraftHome'

const draft = { id: 'a', name: '夏日 EDM', floors: [], themePaletteId: 'funnyfuzzy-classic', createdAt: '2026-07-01T09:00:00.000Z', updatedAt: '2026-07-01T10:30:00.000Z' }

it('草稿卡显示名称、楼层数量和修改时间', () => {
  render(<DraftHome drafts={[draft]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  expect(screen.getByRole('img', { name: 'EDM Editor' })).toBeVisible()
  expect(screen.getByText('夏日 EDM')).toBeVisible()
  expect(screen.getByText('0 个楼层')).toBeVisible()
  expect(screen.getByText(/修改于/)).toBeVisible()
  expect(screen.getByRole('button', { name: '打开 夏日 EDM' })).toBeVisible()
})

it('在草稿与最近导出之间切换并可复制为草稿', async () => {
  const user = userEvent.setup(); const onDuplicate = vi.fn()
  render(<DraftHome drafts={[draft]} exports={[{ id: 'a', draft, exportedAt: '2026-07-01T11:00:00.000Z' }]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={onDuplicate} onMakeTransferCode={async () => 'FFEDM1-test'} onReceiveTransferCode={async () => {}} />)
  await user.click(screen.getByRole('button', { name: '复制 夏日 EDM' }))
  expect(onDuplicate).toHaveBeenCalledWith(draft)
  await user.click(screen.getByRole('button', { name: '已导出' }))
  expect(screen.getByText(/导出于/)).toBeVisible()
  await user.click(screen.getByRole('button', { name: '将 夏日 EDM 复制为草稿' }))
  expect(onDuplicate).toHaveBeenCalledTimes(2)
})

it('通过 edm 文件发送和接收设计稿', async () => {
  const user = userEvent.setup()
  const onReceiveTransferCode = vi.fn(async () => {})
  render(<DraftHome drafts={[draft]} exports={[]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} onDuplicate={() => {}} onMakeTransferCode={async () => 'FFEDM1-abc'} onReceiveTransferCode={onReceiveTransferCode} />)
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

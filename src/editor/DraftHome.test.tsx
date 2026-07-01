import { render, screen } from '@testing-library/react'
import { DraftHome } from './DraftHome'

it('草稿卡显示名称、楼层数量和修改时间', () => {
  render(<DraftHome drafts={[{ id: 'a', name: '夏日 EDM', floors: [], themePaletteId: 'funnyfuzzy-classic', createdAt: '2026-07-01T09:00:00.000Z', updatedAt: '2026-07-01T10:30:00.000Z' }]} onCreate={() => {}} onOpen={() => {}} onDelete={() => {}} />)
  expect(screen.getByText('夏日 EDM')).toBeVisible()
  expect(screen.getByText('0 个楼层')).toBeVisible()
  expect(screen.getByText(/修改于/)).toBeVisible()
  expect(screen.getByRole('button', { name: '打开 夏日 EDM' })).toBeVisible()
})

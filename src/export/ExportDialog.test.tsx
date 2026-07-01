import { render, screen } from '@testing-library/react'
import { ExportDialog } from './ExportDialog'

it('显示导出规格和检查结果', () => {
  render(<ExportDialog draft={{ id: 'a', name: '测试', floors: [], themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '' }} onClose={() => {}} onExport={async () => {}} />)
  expect(screen.getByText('750 PX JPG')).toBeVisible()
  expect(screen.getByRole('heading', { name: '导出检查' })).toBeVisible()
  expect(screen.getByRole('button', { name: '下载 ZIP' })).toHaveClass('primary-button')
})

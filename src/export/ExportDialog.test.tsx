import { render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { vi } from 'vitest'
import { ExportDialog } from './ExportDialog'
import { classicPalette } from '../themes/palettes'

it('显示导出规格和检查结果', () => {
  render(<ExportDialog draft={{ id: 'a', name: '测试', floors: [], themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '' }} onClose={() => {}} onExport={async () => {}} />)
  expect(screen.getByText('750 PX JPG')).toBeVisible()
  expect(screen.getByRole('heading', { name: '导出检查' })).toBeVisible()
  expect(screen.getByRole('button', { name: '下载 ZIP' })).toHaveClass('primary-button')
})

it('完整预览使用解析后的主题颜色', () => {
  render(<ExportDialog draft={{
    id: 'a', name: '主题预览', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '',
    floors: [{ id: 'head-1', templateId: 'head-brand-logo', values: { background: '#123456', logoColor: '#000000' }, products: {}, themeColors: { background: { mode: 'theme', slot: 'A' } } }],
  }} previewOnly onClose={() => {}} onExport={async () => {}} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#FFFFFF' })
})

it('完整预览支持自创建的配色套餐', () => {
  const customPalette = { id: 'custom-palette', name: '自定义套餐', slots: { A: '#123456', B: '#ABCDEF', C: '#222222' } }
  render(<ExportDialog draft={{
    id: 'a', name: '自定义预览', themePaletteId: customPalette.id, createdAt: '', updatedAt: '',
    floors: [{ id: 'head-1', templateId: 'head-brand-logo', values: { background: '#FFFFFF', logoColor: '#000000' }, products: {}, themeColors: { background: { mode: 'theme', slot: 'A' } } }],
  }} palettes={[classicPalette, customPalette]} previewOnly onClose={() => {}} onExport={async () => {}} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#123456' })
})

it('弹窗外壳样式不会覆盖模板内部的标题与描述字号', () => {
  const css = readFileSync('src/editor/editor.css', 'utf8')
  expect(css).not.toMatch(/\.export-dialog\s+h2\s*\{/)
  expect(css).not.toMatch(/\.export-dialog\s+header\s+p\s*\{/)
  expect(css).toContain('.export-dialog > header h2')
  expect(css).toContain('.export-dialog > header p')
})

it('下载按钮在非悬停状态也保持黑底白字', () => {
  const css = readFileSync('src/editor/editor.css', 'utf8')
  expect(css).toMatch(/\.export-dialog > footer \.primary-button \{[^}]*background: #111;[^}]*color: #fff;/)
  expect(css).toMatch(/\.export-dialog > footer \.primary-button:disabled \{[^}]*background: #e8e8e8;[^}]*color: #777;/)
})

it('同一楼层存在多个导出问题时不会产生重复列表标识', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const media = { image: '', url: '', scale: 1, offsetX: 0, offsetY: 0 }
  render(<ExportDialog draft={{ id: 'a', name: '卖点', themePaletteId: 'funnyfuzzy-classic', createdAt: '', updatedAt: '', floors: [{ id: 'points', templateId: 'selling-points-information', values: { itemCount: '4' }, products: {}, mediaSlots: { point1: media, point2: media, point3: media, point4: media } }] }} onClose={() => {}} onExport={async () => {}} />)
  expect(error).not.toHaveBeenCalled()
  error.mockRestore()
})

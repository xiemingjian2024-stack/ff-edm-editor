import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateLibrary } from './TemplateLibrary'
import { classicPalette } from '../themes/palettes'
import { readFileSync } from 'node:fs'

it('按名称搜索模板并显示空结果', async () => {
  const user = userEvent.setup(); render(<TemplateLibrary onAdd={() => {}} />)
  expect(screen.getByRole('button', { name: '添加 N×2 商品卡' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 N×1 商品卡' })).toBeVisible()
  expect(screen.queryByRole('button', { name: '添加 双列商品卡' })).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('搜索楼层模板'), '标题')
  expect(screen.getByRole('button', { name: '添加 常规标题' })).toBeVisible()
  await user.clear(screen.getByLabelText('搜索楼层模板')); await user.type(screen.getByLabelText('搜索楼层模板'), '不存在')
  expect(screen.getByText('没有匹配的楼层')).toBeVisible()
})

it('模板卡片不展示主题色位且预览框使用统一标识', () => {
  render(<TemplateLibrary onAdd={() => {}} />)
  expect(screen.getByRole('heading', { name: 'HEAD' })).toBeVisible()
  expect(screen.queryByText('主题色位 A')).not.toBeInTheDocument()
  const previews = screen.getAllByTestId('template-thumbnail')
  expect(previews).toHaveLength(screen.getAllByRole('button', { name: /添加/ }).length)
})

it('商品卡 SVG 缩略图不叠加旧占位色块', () => {
  const css = readFileSync('src/editor/editor.css', 'utf8')
  expect(css).not.toContain('.template-mini--product-card::before')
  expect(css).not.toContain('.template-mini--product-card::after')
})

it('在楼层和配色内容之间切换', async () => {
  const user = userEvent.setup()
  render(<TemplateLibrary onAdd={() => {}} paletteId={classicPalette.id} palettes={[classicPalette]} onPaletteChange={() => {}} />)
  await user.click(screen.getByRole('button', { name: '配色' }))
  expect(screen.getByText('FunnyFuzzy 经典')).toBeVisible()
  expect(screen.queryByLabelText('搜索楼层模板')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '楼层' }))
  expect(screen.getByLabelText('搜索楼层模板')).toBeVisible()
})

it('只展示两个新 Banner，不展示旧临时 Banner', () => {
  render(<TemplateLibrary onAdd={() => {}} />)
  expect(screen.getByRole('button', { name: '添加 常规 Banner' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 图文 Banner' })).toBeVisible()
  expect(screen.queryByRole('button', { name: '添加 夏日主视觉' })).not.toBeInTheDocument()
})

it('在信息分组展示对比信息模板', () => {
  render(<TemplateLibrary onAdd={() => {}} />)
  expect(screen.getByRole('heading', { name: '信息' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 对比信息' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 CODE' })).toBeVisible()
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateLibrary } from './TemplateLibrary'
import { classicPalette } from '../themes/palettes'
import { readFileSync } from 'node:fs'

it('按名称搜索模板并显示空结果', async () => {
  const user = userEvent.setup(); render(<TemplateLibrary onAdd={() => {}} />)
  expect(screen.getByRole('button', { name: '添加 N×2 商品卡' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 N×1 商品卡' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 N×3 商品卡' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 页尾' })).toBeVisible()
  expect(screen.queryByRole('button', { name: '添加 双列商品卡' })).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('搜索楼层模板'), '标题')
  expect(screen.getByRole('button', { name: '添加 常规标题' })).toBeVisible()
  await user.clear(screen.getByLabelText('搜索楼层模板')); await user.type(screen.getByLabelText('搜索楼层模板'), '不存在')
  expect(screen.getByText('没有匹配的楼层')).toBeVisible()
})

it('在页尾分组展示页尾模板', () => {
  render(<TemplateLibrary onAdd={() => {}} />)
  expect(screen.getByRole('heading', { name: '页尾' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 页尾' })).toBeVisible()
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

it('顶部横幅使用指定 SVG 缩略图', () => {
  render(<TemplateLibrary onAdd={() => {}} />)
  const tile = screen.getByRole('button', { name: /添加 顶部横幅/ })
  expect(tile.querySelector('img')?.getAttribute('src')).toContain('D2D4E4')
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

it('创建自定义配色并校验十六进制颜色', async () => {
  const user = userEvent.setup(); const onPaletteSave = vi.fn()
  render(<TemplateLibrary onAdd={() => {}} paletteId={classicPalette.id} palettes={[classicPalette]} onPaletteSave={onPaletteSave} />)
  await user.click(screen.getByRole('button', { name: '配色' }))
  await user.click(screen.getByRole('button', { name: '新建配色' }))
  await user.type(screen.getByLabelText('配色名称'), '暖秋')
  await user.clear(screen.getByLabelText('背景间隔色 A 色值')); await user.type(screen.getByLabelText('背景间隔色 A 色值'), '错误')
  expect(screen.getByRole('button', { name: '保存配色' })).toBeDisabled()
  await user.clear(screen.getByLabelText('背景间隔色 A 色值')); await user.type(screen.getByLabelText('背景间隔色 A 色值'), 'FFF7EA')
  await user.click(screen.getByRole('button', { name: '保存配色' }))
  expect(onPaletteSave).toHaveBeenCalledWith(expect.objectContaining({ name: '暖秋', slots: { A: '#FFF7EA', B: '#FFAC33', C: '#000000' } }))
})

it('经典配色只读，自定义配色可编辑、复制和删除', async () => {
  const user = userEvent.setup(); const custom = { id: 'custom', name: '自定义', slots: { A: '#EEEEEE', B: '#FFAC33', C: '#111111' } }
  render(<TemplateLibrary onAdd={() => {}} palettes={[classicPalette, custom]} onPaletteSave={() => {}} onPaletteDelete={() => {}} />)
  await user.click(screen.getByRole('button', { name: '配色' }))
  expect(screen.queryByRole('button', { name: `编辑 ${classicPalette.name}` })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '编辑 自定义' })).toBeVisible()
  expect(screen.getByRole('button', { name: '复制 自定义' })).toBeVisible()
  expect(screen.getByRole('button', { name: '删除 自定义' })).toBeVisible()
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

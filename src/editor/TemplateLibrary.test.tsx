import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateLibrary } from './TemplateLibrary'
import { classicPalette } from '../themes/palettes'

it('按名称搜索模板并显示空结果', async () => {
  const user = userEvent.setup(); render(<TemplateLibrary onAdd={() => {}} />)
  await user.type(screen.getByLabelText('搜索楼层模板'), '标题')
  expect(screen.getByRole('button', { name: '添加 标题居中' })).toBeVisible()
  expect(screen.queryByRole('button', { name: '添加 双列商品卡' })).not.toBeInTheDocument()
  await user.clear(screen.getByLabelText('搜索楼层模板')); await user.type(screen.getByLabelText('搜索楼层模板'), '不存在')
  expect(screen.getByText('没有匹配的楼层')).toBeVisible()
})

it('显示 HEAD 品牌 Logo 及其主题色位标签', () => {
  render(<TemplateLibrary onAdd={() => {}} />)
  expect(screen.getByRole('heading', { name: 'HEAD' })).toBeVisible()
  expect(screen.getByRole('button', { name: '添加 品牌 Logo' })).toBeVisible()
  expect(screen.getByText('主题色位 A')).toBeVisible()
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

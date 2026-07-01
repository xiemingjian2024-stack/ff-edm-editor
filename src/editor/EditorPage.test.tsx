import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditorPage } from './EditorPage'

it('添加、编辑、复制并删除楼层', async () => {
  const user = userEvent.setup()
  render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: /添加 标题居中/ }))
  const input = screen.getByLabelText('标题文案')
  await user.clear(input)
  await user.type(input, 'Summer Picks')
  expect(screen.getByRole('heading', { name: 'Summer Picks' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: '复制楼层' }))
  expect(screen.getAllByRole('heading', { name: 'Summer Picks' })).toHaveLength(2)
  await user.click(screen.getByRole('button', { name: '删除楼层' }))
  expect(screen.getAllByRole('heading', { name: 'Summer Picks' })).toHaveLength(1)
})

it('不提供字号和位置编辑控件', async () => {
  const user = userEvent.setup()
  render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: /添加 标题居中/ }))
  expect(screen.queryByLabelText('字号')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('位置')).not.toBeInTheDocument()
})

it('商品卡属性按颜色、商品和操作分组', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: /添加 双列商品卡/ }))
  expect(screen.getByRole('heading', { name: '颜色' })).toBeVisible()
  expect(screen.getByRole('heading', { name: '商品' })).toBeVisible()
  expect(screen.getByRole('heading', { name: '操作' })).toBeVisible()
  expect(screen.queryByLabelText('字号')).not.toBeInTheDocument()
})

it('可从左侧配色 Tab 查看套餐，再切换 Logo 颜色并覆盖或恢复主题背景', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  expect(screen.queryByRole('button', { name: /配色套餐 FunnyFuzzy 经典/ })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '配色' }))
  expect(screen.getByText('FunnyFuzzy 经典')).toBeVisible()
  expect(screen.getByText('主题色位 A')).toBeVisible()
  expect(screen.getByText('主题色位 B')).toBeVisible()
  expect(screen.getByText('主题色位 C')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '楼层' }))
  await user.click(screen.getByRole('button', { name: /添加 品牌 Logo/ }))
  expect(screen.getByText('主题色位 A', { selector: '.theme-binding-status' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: '白色' }))
  expect(screen.getByRole('img', { name: 'FunnyFuzzy' })).toHaveStyle({ filter: 'invert(1)' })
  await user.clear(screen.getByLabelText('背景颜色色值'))
  await user.type(screen.getByLabelText('背景颜色色值'), '#EFEFEF')
  expect(screen.getByText('自定义颜色')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '重新关联主题色位 A' }))
  expect(screen.getByText('主题色位 A', { selector: '.theme-binding-status' })).toBeVisible()
})

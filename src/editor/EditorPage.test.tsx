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

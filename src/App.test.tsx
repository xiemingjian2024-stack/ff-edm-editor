import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

it('显示 EDM 工作区', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'EDM 搭建器' })).toBeVisible()
})

it('新建 EDM 默认包含品牌 Logo 和页尾且均可删除', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: '新建 EDM' }))
  expect(screen.getByTestId('head-brand-logo')).toBeVisible()
  expect(screen.getByTestId('footer-links')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '删除楼层' }))
  expect(screen.queryByTestId('head-brand-logo')).not.toBeInTheDocument()
  expect(screen.getByTestId('footer-links')).toBeVisible()
})

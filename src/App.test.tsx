import { render, screen } from '@testing-library/react'
import { App } from './App'

it('显示 EDM 工作区', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'EDM 搭建器' })).toBeVisible()
})

import { render, screen } from '@testing-library/react'
import { ToolButton } from './ToolButton'

it('提供可访问名称和工具状态', () => {
  render(<><ToolButton label="楼层" icon="layers" active /><ToolButton label="素材" icon="image" disabled /></>)
  expect(screen.getByRole('button', { name: '楼层' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: '素材' })).toBeDisabled()
})

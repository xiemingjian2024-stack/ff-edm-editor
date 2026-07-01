import { render, screen } from '@testing-library/react'
import { Canvas } from './Canvas'
import { classicPalette } from '../themes/palettes'

it('缩放只作用于画布预览层', () => {
  const { container } = render(<Canvas floors={[]} selectedId={null} zoom={80} onSelect={() => {}} onMove={() => {}} />)
  expect(container.querySelector('.canvas-zoom-layer')).toHaveStyle({ transform: 'scale(0.8)' })
  expect(container.querySelector('.edm-canvas')).toHaveStyle({ width: '375px' })
})

it('关联主题色位时使用套餐颜色，自定义后使用覆盖颜色', () => {
  const floor = {
    id: 'head-1', templateId: 'head-brand-logo', values: { background: '#123456', logoColor: '#000000' }, products: {},
    themeColors: { background: { mode: 'theme' as const, slot: 'A' } },
  }
  const { rerender } = render(<Canvas floors={[floor]} palette={classicPalette} selectedId={null} onSelect={() => {}} onMove={() => {}} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#FFFFFF' })
  rerender(<Canvas floors={[{ ...floor, themeColors: { background: { mode: 'custom' as const, color: '#EFEFEF' } } }]} palette={classicPalette} selectedId={null} onSelect={() => {}} onMove={() => {}} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#EFEFEF' })
})

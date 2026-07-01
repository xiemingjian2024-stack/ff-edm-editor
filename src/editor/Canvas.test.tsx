import { render } from '@testing-library/react'
import { Canvas } from './Canvas'

it('缩放只作用于画布预览层', () => {
  const { container } = render(<Canvas floors={[]} selectedId={null} zoom={80} onSelect={() => {}} onMove={() => {}} />)
  expect(container.querySelector('.canvas-zoom-layer')).toHaveStyle({ transform: 'scale(0.8)' })
  expect(container.querySelector('.edm-canvas')).toHaveStyle({ width: '375px' })
})

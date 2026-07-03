import { fireEvent, render, screen } from '@testing-library/react'
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

it('将商品图片拖动回写到对应楼层和商品槽位', () => {
  const onProductChange = vi.fn()
  const floor = {
    id: 'products-1', templateId: 'product-list-n-by-1',
    values: { title: 'Title', description: '', buttonText: '', cardButtonText: '', productCount: '1', pricePrefix: 'From', background: '#FFFFFF', cardBackground: '#F5E1C9', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' },
    products: { 'product-1': { image: 'product.png', title: 'Product', price: '$10', url: '/product' } },
  }
  render(<Canvas floors={[floor]} selectedId={floor.id} onSelect={() => {}} onMove={() => {}} onProductChange={onProductChange} />)
  const frame = screen.getByLabelText('N×1 商品卡 商品 1 图片')
  vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, width: 181.5, height: 160, top: 0, right: 181.5, bottom: 160, left: 0, toJSON: () => ({}) })
  fireEvent.pointerDown(frame, { pointerId: 1, clientX: 50, clientY: 50 })
  fireEvent.pointerMove(frame, { pointerId: 1, clientX: 60, clientY: 45 })
  expect(onProductChange).toHaveBeenCalledWith('products-1', 'product-1', expect.objectContaining({ imageOffsetX: 10, imageOffsetY: -5 }))
})

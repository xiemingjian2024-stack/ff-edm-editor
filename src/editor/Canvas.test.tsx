import { fireEvent, render, screen } from '@testing-library/react'
import { Canvas } from './Canvas'
import { classicPalette } from '../themes/palettes'
import type { FloorInstance } from '../domain/edm'

it('缩放只作用于画布预览层', () => {
  const { container } = render(<Canvas floors={[]} selectedId={null} zoom={80} onSelect={() => {}} />)
  expect(container.querySelector('.canvas-zoom-layer')).toHaveStyle({ transform: 'scale(0.8)' })
  expect(container.querySelector('.edm-canvas')).toHaveStyle({ width: '375px' })
})

it('普通楼层显示拖拽手柄，Logo 和页尾手柄保持锁定', () => {
  const floors: FloorInstance[] = [
    { id: 'logo', templateId: 'head-brand-logo', values: { background: '#FFFFFF', logoColor: '#000000' }, products: {} },
    { id: 'title', templateId: 'title-centered', values: { title: 'Title', description: '', buttonText: '', background: '#FFFFFF', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF', alignment: 'center', descriptionSize: 'small', buttonWidth: 'content' }, products: {} },
    { id: 'footer', templateId: 'footer-links', values: { navigationCount: '1' }, products: {}, navigationItems: [{ text: 'HOME', url: '' }] },
  ]
  render(<Canvas floors={floors} selectedId="title" onSelect={() => {}} />)
  expect(screen.getByRole('button', { name: '品牌 Logo位置固定' })).toBeDisabled()
  const titleHandle = screen.getByRole('button', { name: '拖拽移动常规标题' })
  expect(titleHandle).toBeEnabled()
  expect(titleHandle).toHaveTextContent('02 · 常规标题')
  expect(screen.getByRole('button', { name: '页尾位置固定' })).toBeDisabled()
  expect(screen.queryByRole('button', { name: '上移楼层' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '下移楼层' })).not.toBeInTheDocument()
})

it('关联主题色位时使用套餐颜色，自定义后使用覆盖颜色', () => {
  const floor = {
    id: 'head-1', templateId: 'head-brand-logo', values: { background: '#123456', logoColor: '#000000' }, products: {},
    themeColors: { background: { mode: 'theme' as const, slot: 'A' } },
  }
  const { rerender } = render(<Canvas floors={[floor]} palette={classicPalette} selectedId={null} onSelect={() => {}} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#FFFFFF' })
  rerender(<Canvas floors={[{ ...floor, themeColors: { background: { mode: 'custom' as const, color: '#EFEFEF' } } }]} palette={classicPalette} selectedId={null} onSelect={() => {}} />)
  expect(screen.getByTestId('head-brand-logo')).toHaveStyle({ backgroundColor: '#EFEFEF' })
})

it('将商品图片拖动回写到对应楼层和商品槽位', () => {
  const onProductChange = vi.fn()
  const floor = {
    id: 'products-1', templateId: 'product-list-n-by-1',
    values: { title: 'Title', description: '', buttonText: '', cardButtonText: '', productCount: '1', pricePrefix: 'From', background: '#FFFFFF', cardBackground: '#F5E1C9', textColor: '#000000', buttonBackground: '#000000', buttonTextColor: '#FFFFFF' },
    products: { 'product-1': { image: 'product.png', title: 'Product', price: '$10', url: '/product' } },
  }
  render(<Canvas floors={[floor]} selectedId={floor.id} onSelect={() => {}} onProductChange={onProductChange} />)
  const frame = screen.getByLabelText('N×1 商品卡 商品 1 图片')
  vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, width: 181.5, height: 160, top: 0, right: 181.5, bottom: 160, left: 0, toJSON: () => ({}) })
  fireEvent.pointerDown(frame, { pointerId: 1, clientX: 50, clientY: 50 })
  fireEvent.pointerMove(frame, { pointerId: 1, clientX: 60, clientY: 45 })
  expect(onProductChange).toHaveBeenCalledWith('products-1', 'product-1', expect.objectContaining({ imageOffsetX: 10, imageOffsetY: -5 }))
})

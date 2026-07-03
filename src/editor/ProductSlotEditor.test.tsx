import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductSlotEditor } from './ProductSlotEditor'

it('读取商品并允许修改自动填充内容', async () => {
  const user = userEvent.setup(); const onChange = vi.fn()
  const reader = vi.fn().mockResolvedValue({ title: 'Cloud Bed', image: 'https://cdn/a.jpg', gallery: ['https://cdn/a.jpg'], price: '99.00', url: 'https://shop/products/a' })
  render(<ProductSlotEditor label="商品 1" value={undefined} onChange={onChange} reader={reader} />)
  await user.type(screen.getByLabelText('商品 1 Shopify 链接'), 'https://shop/products/a')
  await user.click(screen.getByRole('button', { name: '自动填充商品 1' }))
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cloud Bed', price: '99.00' }))
})

it('使用 Shopify 商品链接作为跳转链接且不显示重复输入框', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ProductSlotEditor label="商品 3" value={{ title: 'Bed', image: 'a.jpg', price: '$19', url: '' }} onChange={onChange} />)
  expect(screen.getByLabelText('商品 3 商品标题')).toBeVisible()
  expect(screen.getByLabelText('商品 3 价格')).toBeVisible()
  expect(screen.queryByLabelText('商品 3 跳转链接')).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('商品 3 Shopify 链接'), 'a')
  expect(onChange).toHaveBeenLastCalledWith({ title: 'Bed', image: 'a.jpg', price: '$19', url: 'a' })
})

it('没有 Shopify 链接时也能手动填写商品内容', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ProductSlotEditor label="商品 2" value={undefined} onChange={onChange} />)

  expect(screen.getByLabelText('上传 商品 2 商品图片')).toBeVisible()
  await user.type(screen.getByLabelText('商品 2 商品标题'), '手')
  expect(onChange).toHaveBeenLastCalledWith({
    image: '',
    title: '手',
    price: '',
    url: '',
    gallery: [],
  })
})

it('可以通过图片链接手动填写商品图片并保留其他内容', async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  render(<ProductSlotEditor label="商品 4" value={{ image: '', title: 'Cloud Bed', price: '$99', url: '/products/cloud', gallery: [] }} onChange={onChange} />)

  await user.type(screen.getByLabelText('商品 4 商品图片链接'), 'https://cdn.example.com/cloud.jpg')
  await user.click(screen.getByRole('button', { name: '从链接获取 商品 4 商品图片' }))
  expect(onChange).toHaveBeenLastCalledWith({
    image: 'https://cdn.example.com/cloud.jpg',
    title: 'Cloud Bed',
    price: '$99',
    url: '/products/cloud',
    gallery: [],
    imageScale: 1,
    imageOffsetX: 0,
    imageOffsetY: 0,
  })
})

it('为商品图片提供独立缩放并写回商品数据', () => {
  const onChange = vi.fn()
  render(<ProductSlotEditor label="商品 1" value={{ image: 'bed.png', title: 'Bed', price: '$19', url: '/bed', imageScale: 1.2, imageOffsetX: 4, imageOffsetY: -3 }} onChange={onChange} />)

  const scale = screen.getByLabelText('商品 1 商品图片缩放')
  expect(scale).toHaveValue('120')
  fireEvent.change(scale, { target: { value: '150' } })
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ imageScale: 1.5, imageOffsetX: 4, imageOffsetY: -3 }))
})

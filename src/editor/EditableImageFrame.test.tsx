import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { EditableImageFrame } from './EditableImageFrame'

it('按设计坐标记录图片拖拽位移', () => {
  const onChange = vi.fn()
  render(<EditableImageFrame value={{ image: 'image.jpg', url: '', scale: 1, offsetX: 0, offsetY: 0 }} onChange={onChange} ariaLabel="Banner 图片" />)
  const frame = screen.getByLabelText('Banner 图片')
  vi.spyOn(frame, 'getBoundingClientRect').mockReturnValue({ x: 0, y: 0, width: 375, height: 300, top: 0, right: 375, bottom: 300, left: 0, toJSON: () => ({}) })
  fireEvent.pointerDown(frame, { pointerId: 1, clientX: 100, clientY: 100 })
  fireEvent.pointerMove(frame, { pointerId: 1, clientX: 122, clientY: 91 })
  expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ offsetX: 22, offsetY: -9 }))
})

it('只读模式仍应用缩放和位移', () => {
  const { container } = render(<EditableImageFrame value={{ image: 'image.jpg', url: '', scale: 1.5, offsetX: 12, offsetY: -8 }} ariaLabel="预览图片" />)
  expect(container.querySelector('img')).toHaveStyle({ transform: 'translate(-50%, -50%) translate(12px, -8px) scale(1.5)' })
})

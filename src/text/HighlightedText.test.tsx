import { render, screen } from '@testing-library/react'
import { renderHighlightedText } from './HighlightedText'

test('renders a selected text fragment with controlled emphasis styles', () => {
  render(<p>{renderHighlightedText('Use code 0711WEEKEND today', { enabled: true, text: '0711WEEKEND', bold: true, enlarge: true, color: '#FFAC33' })}</p>)
  const highlighted = screen.getByText('0711WEEKEND')
  expect(highlighted).toHaveClass('text-highlight')
  expect(highlighted).toHaveStyle({ color: '#FFAC33', fontWeight: '700', fontSize: 'calc(1em + 2px)' })
})

test('returns plain text when highlight is disabled or not found', () => {
  const { container } = render(<p>{renderHighlightedText('Plain copy', { enabled: true, text: 'missing', bold: true })}</p>)
  expect(container.querySelector('.text-highlight')).toBeNull()
  expect(container).toHaveTextContent('Plain copy')
})

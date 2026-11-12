import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KlaviyoSettingsDialog } from './KlaviyoSettingsDialog'

afterEach(() => { delete window.edmDesktop })

it('使用与应用一致的弹窗完成密钥校验并隐藏完整密钥', async () => {
  const user = userEvent.setup()
  const connect = vi.fn(async () => ({ available: true, connected: true, suffix: '9XYZ' }))
  window.edmDesktop = { klaviyo: { status: async () => ({ available: true, connected: false, suffix: '' }), connect, disconnect: async () => ({ available: true, connected: false, suffix: '' }), uploadImage: async () => ({ url: '', reused: false }) } }
  render(<KlaviyoSettingsDialog onClose={() => {}} />)
  const input = await screen.findByLabelText('Klaviyo Private API Key')
  expect(input).toHaveAttribute('type', 'password')
  await user.type(input, 'pk_example123456789XYZ')
  await user.click(screen.getByRole('button', { name: '测试并连接' }))
  await waitFor(() => expect(connect).toHaveBeenCalledWith('pk_example123456789XYZ'))
  expect(screen.getByText('Private API Key ····9XYZ')).toBeVisible()
  expect(screen.queryByDisplayValue('pk_example123456789XYZ')).not.toBeInTheDocument()
})

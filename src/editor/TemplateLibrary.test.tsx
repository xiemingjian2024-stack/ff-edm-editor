import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TemplateLibrary } from './TemplateLibrary'

it('按名称搜索模板并显示空结果', async () => {
  const user = userEvent.setup(); render(<TemplateLibrary onAdd={() => {}} />)
  await user.type(screen.getByLabelText('搜索楼层模板'), '标题')
  expect(screen.getByRole('button', { name: '添加 标题居中' })).toBeVisible()
  expect(screen.queryByRole('button', { name: '添加 双列商品卡' })).not.toBeInTheDocument()
  await user.clear(screen.getByLabelText('搜索楼层模板')); await user.type(screen.getByLabelText('搜索楼层模板'), '不存在')
  expect(screen.getByText('没有匹配的楼层')).toBeVisible()
})

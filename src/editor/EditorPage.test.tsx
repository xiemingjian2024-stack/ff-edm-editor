import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditorPage } from './EditorPage'

it('添加、编辑、复制并删除楼层', async () => {
  const user = userEvent.setup()
  render(<EditorPage />)
  expect(screen.getByRole('img', { name: 'EDM Editor' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /添加 常规标题/ }))
  const input = screen.getByLabelText('标题', { selector: 'textarea' })
  await user.clear(input)
  await user.type(input, 'Summer Picks')
  expect(screen.getByRole('heading', { name: 'Summer Picks' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: '复制楼层' }))
  expect(screen.getAllByRole('heading', { name: 'Summer Picks' })).toHaveLength(2)
  await user.click(screen.getByRole('button', { name: '删除楼层' }))
  expect(screen.getAllByRole('heading', { name: 'Summer Picks' })).toHaveLength(1)
})

it('顶部将 EDM 标题居中且不再展示画布规格', () => {
  render(<EditorPage />)
  expect(screen.getByLabelText('EDM 名称').parentElement).toHaveClass('toolbar-project')
  expect(screen.getByText('已保存到当前浏览器')).toBeVisible()
  expect(screen.queryByText('375 PX')).not.toBeInTheDocument()
  expect(screen.queryByText('100%', { selector: '.toolbar-viewport span' })).not.toBeInTheDocument()
})

it('左侧工具栏不再展示底部返回按钮', () => {
  render(<EditorPage />)
  expect(screen.getByRole('button', { name: '返回草稿' })).toBeVisible()
  expect(screen.queryByRole('button', { name: '返回草稿首页' })).not.toBeInTheDocument()
})

it('不提供字号和位置编辑控件', async () => {
  const user = userEvent.setup()
  render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: /添加 常规标题/ }))
  expect(screen.queryByLabelText('字号')).not.toBeInTheDocument()
  expect(screen.queryByLabelText('位置')).not.toBeInTheDocument()
})

it('商品卡属性按颜色、商品和操作分组', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: /添加 N×2 商品卡/ }))
  expect(screen.getByRole('heading', { name: '颜色' })).toBeVisible()
  expect(screen.getByRole('heading', { name: '商品' })).toBeVisible()
  expect(screen.getByRole('heading', { name: '操作' })).toBeVisible()
  expect(screen.queryByLabelText('字号')).not.toBeInTheDocument()
})

it('N×1 商品卡的右侧商品填写区跟随 1 至 4 个商品增减', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: '添加 N×1 商品卡' }))
  expect(screen.getAllByLabelText(/Shopify 链接$/)).toHaveLength(1)
  await user.click(screen.getByRole('button', { name: '4 个商品' }))
  expect(screen.getAllByLabelText(/Shopify 链接$/)).toHaveLength(4)
  expect(screen.getAllByTestId('product-list-n-card')).toHaveLength(4)
})

it('N×3 商品卡固定三个商品坑位且不显示价格字段', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: '添加 N×3 商品卡' }))
  expect(screen.getAllByLabelText(/Shopify 链接$/)).toHaveLength(3)
  expect(screen.queryByLabelText(/商品 \d 价格/)).not.toBeInTheDocument()
  expect(screen.getAllByTestId('product-grid-n-by-3-card')).toHaveLength(3)
})

it('可从左侧配色 Tab 查看套餐，再切换 Logo 颜色并覆盖或恢复主题背景', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  expect(screen.queryByRole('button', { name: /配色套餐 FunnyFuzzy 经典/ })).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '配色' }))
  expect(screen.getByText('FunnyFuzzy 经典')).toBeVisible()
  expect(screen.getByText('主题色位 A')).toBeVisible()
  expect(screen.getByText('主题色位 B')).toBeVisible()
  expect(screen.getByText('主题色位 C')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '楼层' }))
  await user.click(screen.getByRole('button', { name: /添加 品牌 Logo/ }))
  expect(screen.getByText('主题色位 A', { selector: '.theme-binding-status' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: '白色' }))
  expect(screen.getByRole('img', { name: 'FunnyFuzzy' })).toHaveStyle({ filter: 'invert(1)' })
  await user.clear(screen.getByLabelText('背景颜色色值'))
  await user.type(screen.getByLabelText('背景颜色色值'), '#EFEFEF')
  expect(screen.getByText('自定义颜色')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '重新关联主题色位 A' }))
  expect(screen.getByText('主题色位 A', { selector: '.theme-binding-status' })).toBeVisible()
})

it('分类导航只编辑文案并保留隐藏项', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: '添加 分类导航' }))
  expect(screen.getByLabelText('文案 1')).toHaveValue('Home')
  expect(screen.getByLabelText('文案 1')).toHaveClass('property-text-input')
  expect(screen.queryByRole('heading', { name: '导航项' })).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: '导航项 1' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('导航项 1 链接')).not.toBeInTheDocument()
  expect(screen.queryByText('主题色位 B', { selector: '.theme-binding-status' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: '2 项' }).parentElement).toHaveClass('choice-field--three')
  await user.clear(screen.getByLabelText('文案 3'))
  await user.type(screen.getByLabelText('文案 3'), 'Dog Beds')
  await user.click(screen.getByRole('button', { name: '2 项' }))
  expect(screen.queryByLabelText('文案 3')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '3 项' }))
  expect(screen.getByLabelText('文案 3')).toHaveValue('Dog Beds')
})

it('页尾链接数量同步控制画布和右侧文案输入框', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: '添加 页尾' }))
  expect(screen.getAllByTestId('footer-link')).toHaveLength(3)
  expect(screen.getByLabelText('文案 3')).toHaveValue('Sofa Covers')
  await user.click(screen.getByRole('button', { name: '6 个链接' }))
  expect(screen.getAllByTestId('footer-link')).toHaveLength(6)
  expect(screen.getByLabelText('文案 6')).toBeVisible()
  await user.click(screen.getByRole('button', { name: '1 个链接' }))
  expect(screen.getAllByTestId('footer-link')).toHaveLength(1)
  expect(screen.queryByLabelText('文案 2')).not.toBeInTheDocument()
})

it('常规 Banner 支持动态高度、文案位置、对齐和遮罩', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: '添加 常规 Banner' }))
  expect(screen.getByTestId('banner-regular')).toHaveStyle({ height: '375px' })
  fireEvent.change(screen.getByLabelText('楼层高度'), { target: { value: '420' } })
  expect(screen.getByTestId('banner-regular')).toHaveStyle({ height: '420px' })
  await user.click(screen.getByRole('button', { name: '顶部' }))
  expect(screen.getByTestId('banner-copy')).toHaveAttribute('data-position', 'top')
  await user.click(screen.getByRole('button', { name: '左对齐' }))
  expect(screen.getByTestId('banner-copy')).toHaveStyle({ textAlign: 'left' })
  await user.click(screen.getByRole('button', { name: '关闭遮罩' }))
  expect(screen.queryByTestId('banner-overlay')).not.toBeInTheDocument()
})

it('图文 Banner 图片区高度变化时总高度同步变化', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: '添加 图文 Banner' }))
  expect(screen.getByTestId('banner-image-copy')).toHaveStyle({ height: '480px' })
  fireEvent.change(screen.getByLabelText('图片区域高度'), { target: { value: '360' } })
  expect(screen.getByTestId('banner-image-copy')).toHaveStyle({ height: '540px' })
  expect(screen.getByTestId('banner-image-stage')).toHaveStyle({ height: '360px' })
})

it('单卖点信息提供图片高度和单图编辑控件', async () => {
  const user = userEvent.setup(); render(<EditorPage />)
  await user.click(screen.getByRole('button', { name: '添加 单卖点信息' }))
  expect(screen.getByTestId('single-selling-point-information')).toBeVisible()
  expect(screen.getByLabelText('图片高度')).toHaveValue('200')
  expect(screen.getByLabelText('上传 卖点图片')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '粘贴 卖点图片' })).toBeInTheDocument()
})

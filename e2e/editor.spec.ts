import { test, expect } from '@playwright/test'

test('创建、编辑、保存并恢复 EDM 草稿', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '新建 EDM' }).click()
  await page.getByRole('button', { name: '添加 标题居中' }).click()
  await page.getByLabel('标题文案').fill('SUMMER PICKS')
  await expect(page.getByRole('heading', { name: 'SUMMER PICKS' })).toBeVisible()
  await page.waitForTimeout(650)
  await page.getByRole('button', { name: '←' }).click()
  await expect(page.getByText('未命名 EDM')).toBeVisible()
  await page.getByRole('button', { name: '打开 未命名 EDM' }).click()
  await expect(page.getByRole('heading', { name: 'SUMMER PICKS' })).toBeVisible()
  await page.getByRole('button', { name: '完整预览' }).click()
  await expect(page.getByRole('dialog', { name: '完整预览' })).toBeVisible()
})

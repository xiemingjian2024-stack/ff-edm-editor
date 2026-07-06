import { expect, it } from 'vitest'
import { fileToDataUrl } from './fileDataUrl'

it('把上传图片转换为刷新后仍可使用的数据地址', async () => {
  const file = new File(['hello'], 'sample.png', { type: 'image/png' })
  const result = await fileToDataUrl(file)
  expect(result).toMatch(/^data:image\/png;base64,/)
})

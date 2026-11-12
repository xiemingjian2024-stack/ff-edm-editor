import { expect, it } from 'vitest'
import { normalizeKlaviyoPrivateKey } from './klaviyo-local.mjs'

it('清理复制 API Key 时混入的空格与不可见字符', () => {
  expect(normalizeKlaviyoPrivateKey(' \uFEFFpk_test-key\n\u200B')).toBe('pk_test-key')
})

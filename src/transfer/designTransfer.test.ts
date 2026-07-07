import { describe, expect, it } from 'vitest'
import { createTransferCode, parseTransferCode, createTransferFileName } from './designTransfer'
import type { EdmDraft, ThemePalette } from '../domain/edm'

const draft: EdmDraft = {
  id: 'draft-1',
  name: '夏日 EDM',
  themePaletteId: 'summer',
  createdAt: '2026-07-01T09:00:00.000Z',
  updatedAt: '2026-07-01T10:00:00.000Z',
  floors: [{ id: 'floor-1', templateId: 'title-centered', values: { title: 'Hello' }, products: {} }],
}

const palette: ThemePalette = { id: 'summer', name: '夏日配色', slots: { A: '#FFFFFF', B: '#FFAC33', C: '#000000' } }

describe('design transfer', () => {
  it('把草稿和当前自定义配色套餐编码到传送码里', async () => {
    const code = await createTransferCode(draft, [palette])
    expect(code.startsWith('FFEDM1-')).toBe(true)

    const parsed = await parseTransferCode(code)
    expect(parsed.draft.name).toBe('夏日 EDM')
    expect(parsed.draft.floors[0].values.title).toBe('Hello')
    expect(parsed.palette).toEqual(palette)
  })

  it('经典配色不会额外写入套餐数据', async () => {
    const code = await createTransferCode({ ...draft, themePaletteId: 'funnyfuzzy-classic' }, [palette])
    expect((await parseTransferCode(code)).palette).toBeUndefined()
  })

  it('拒绝无法识别的设计稿编码', async () => {
    await expect(parseTransferCode('bad-code')).rejects.toThrow('无法识别')
  })

  it('生成安全的 edm 文件名', () => {
    expect(createTransferFileName('【US 7-4】 Protect / Sofa')).toBe('US-7-4-Protect-Sofa.edm')
  })
})

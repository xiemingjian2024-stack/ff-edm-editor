import { expect, it } from 'vitest'
import JSZip from 'jszip'
import { addRenderedFloorsToZip, type RenderedFloor } from './package'

it('不把 includeFull=false 的整层 JPG 写入 ZIP', () => {
  const zip = new JSZip()
  const floor: RenderedFloor = {
    fullName: '01-head-full.jpg', full: new Blob(['full']), width: 750, height: 92, includeFull: false,
    regions: [{ name: '01-head-item-01.jpg', blob: new Blob(['item']) }, { name: '01-head-item-02.jpg', blob: new Blob(['item']) }],
  }
  addRenderedFloorsToZip(zip, [floor])
  expect(Object.keys(zip.files)).toEqual(['01-head-item-01.jpg', '01-head-item-02.jpg'])
})

it('普通模板仍写入整层 JPG', () => {
  const zip = new JSZip()
  const floor: RenderedFloor = { fullName: '01-banner-full.jpg', full: new Blob(['full']), width: 750, height: 500, includeFull: true, regions: [] }
  addRenderedFloorsToZip(zip, [floor])
  expect(Object.keys(zip.files)).toEqual(['01-banner-full.jpg'])
})

import { captureFloor, captureTransparentPng } from './render'
import { captureAnimatedBanner, captureUploadedGifBanner, getExportFloorNode, isAnimatedBanner, isUploadedGifBanner } from './package'
import { uploadKlaviyoImage } from '../klaviyo/client'
import type { FloorInstance } from '../domain/edm'

export async function syncBannerImageCopyAsset(floorId: string, floorData: FloorInstance) {
  const floor = getExportFloorNode(floorId)
  const stage = floor?.querySelector<HTMLElement>('.banner-image-stage')
  if (!stage) throw new Error('无法读取图文 Banner 图片区域')
  const blob = isAnimatedBanner(floorData)
    ? (await captureAnimatedBanner(stage, floorData.animation!.frames, floorData.animation!.intervalMs)).gif
    : isUploadedGifBanner(floorData)
      ? (await captureUploadedGifBanner(stage, floorData.media!)).gif
      : await captureFloor(stage)
  return uploadKlaviyoImage(blob)
}

export async function syncBrandLogoAsset(floorId: string) {
  const floor = getExportFloorNode(floorId)
  const logo = floor?.querySelector<HTMLElement>('.head-brand-logo img') ?? floor?.querySelector<HTMLElement>('img')
  if (!logo) throw new Error('无法读取品牌 Logo')
  return uploadKlaviyoImage(await captureTransparentPng(logo))
}

export async function syncProductGridNBy2Assets(floorId: string) {
  const floor = getExportFloorNode(floorId)
  const imageNodes = [...(floor?.querySelectorAll<HTMLElement>('.product-grid-n-image') ?? [])]
  if (!imageNodes.length) throw new Error('无法读取 N×2 商品卡图片区域')
  return Promise.all(imageNodes.map(async node => (await uploadKlaviyoImage(await captureFloor(node))).url))
}

const productImageSelectors: Record<string, string> = {
  'product-list-n-by-1': '.product-list-n-image',
  'product-grid-n-by-3': '.product-grid-n-by-3-image',
  'product-introduction-cards': '.product-introduction-image',
}

export async function syncProductCardAssets(floorId: string, templateId: string) {
  const selector = productImageSelectors[templateId]
  const floor = getExportFloorNode(floorId)
  const imageNodes = selector ? [...(floor?.querySelectorAll<HTMLElement>(selector) ?? [])] : []
  if (!imageNodes.length) throw new Error('无法读取商品卡图片区域')
  return Promise.all(imageNodes.map(async node => (await uploadKlaviyoImage(await captureFloor(node))).url))
}

import { toJpeg } from 'html-to-image'
import type { ExportRegion } from '../domain/edm'

export interface PixelRegion extends ExportRegion { x: number; y: number; width: number; height: number }
export function scaleRegion(region: ExportRegion): PixelRegion {
  const x = Math.round(region.x * 2), y = Math.round(region.y * 2)
  return { ...region, x, y, width: Math.round((region.x + region.width) * 2) - x, height: Math.round((region.y + region.height) * 2) - y }
}
export const scaleRegions = (regions: ExportRegion[]) => regions.map(scaleRegion)
const dataUrlToBlob = async (url: string) => (await fetch(url)).blob()
export async function captureFloor(node: HTMLElement) {
  await document.fonts?.ready
  await Promise.all([...node.querySelectorAll('img')].map(image => image.decode().catch(() => { throw new Error(`图片无法加载：${image.alt || image.src}`) })))
  return dataUrlToBlob(await toJpeg(node, { pixelRatio: 2, quality: .92, backgroundColor: '#ffffff', cacheBust: true }))
}
export async function cropJpeg(source: Blob, region: PixelRegion) {
  const bitmap = await createImageBitmap(source); const canvas = document.createElement('canvas'); canvas.width = region.width; canvas.height = region.height
  canvas.getContext('2d')!.drawImage(bitmap, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height)
  return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('切图生成失败')), 'image/jpeg', .92))
}

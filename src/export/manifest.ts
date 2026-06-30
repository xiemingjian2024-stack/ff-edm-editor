import Papa from 'papaparse'

export interface ManifestRow { floorNumber: number; floorName: string; fileName: string; regionName: string; width: number; height: number; url: string }
export function makeFileNames(number: number, category: string, regionIds: string[]) {
  const prefix = `${String(number).padStart(2, '0')}-${category}`
  return { full: `${prefix}-full.jpg`, regions: regionIds.map((_, index) => `${prefix}-item-${String(index + 1).padStart(2, '0')}.jpg`) }
}
export const makeManifestCsv = (rows: ManifestRow[]) => '\ufeff' + Papa.unparse(rows.map(row => ({ 楼层编号: row.floorNumber, 楼层名称: row.floorName, 文件名: row.fileName, 区域名称: row.regionName, 宽度: row.width, 高度: row.height, 目标链接: row.url })))

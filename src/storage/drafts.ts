import { openDB } from 'idb'
import type { EdmDraft, ExportRecord, ThemePalette } from '../domain/edm'
import type { GifDraft } from '../gif/model'
import { migrateDraftTheme } from '../themes/resolveThemeColor'

const CURRENT_DB_VERSION = 5
const migrationMetaKey = 'startup-data-migration-v1'
const defaultLegacyDatabaseNames = ['ff-edm-editor', 'ff-edm-editor-local', 'edm-editor', 'edm-builder', 'ff-edm-builder-v1', 'ff-edm-builder-v2']
const legacyLocalStorageKeys = [
  'ff-edm-editor:drafts',
  'ff-edm-builder:drafts',
  'edm-editor:drafts',
  'edm-builder:drafts',
  'ff-edm-editor:palettes',
  'ff-edm-builder:palettes',
]

type RepositoryOptions = { legacyNames?: string[] }

function isDataCandidateName(name: string, currentName: string) {
  return name !== currentName && /edm|ff-edm/i.test(name)
}

function newerDate(a?: string, b?: string) {
  if (!a) return false
  if (!b) return true
  return a > b
}

async function listCandidateLegacyDatabases(currentName: string, configuredLegacyNames: string[] = []) {
  const names = new Set([...defaultLegacyDatabaseNames, ...configuredLegacyNames].filter(name => isDataCandidateName(name, currentName)))
  const maybeIndexedDB = indexedDB as IDBFactory & { databases?: () => Promise<Array<{ name?: string }>> }
  if (typeof maybeIndexedDB.databases === 'function') {
    try {
      const databases = await maybeIndexedDB.databases()
      for (const database of databases) {
        if (database.name && isDataCandidateName(database.name, currentName)) names.add(database.name)
      }
    } catch {
      // 部分浏览器不允许列出数据库，保留内置历史名称即可。
    }
  }
  return [...names]
}

async function getAllIfStoreExists<T>(db: Awaited<ReturnType<typeof openDB>>, storeName: string) {
  if (!db.objectStoreNames.contains(storeName)) return [] as T[]
  return await db.getAll(storeName) as T[]
}

async function mergeDrafts(targetDb: Awaited<ReturnType<typeof openDB>>, drafts: EdmDraft[]) {
  for (const item of drafts) {
    if (!item?.id || !item?.name || !Array.isArray(item.floors)) continue
    const migrated = migrateDraftTheme(item)
    const existing = await targetDb.get('drafts', migrated.id) as EdmDraft | undefined
    if (!existing || newerDate(migrated.updatedAt, existing.updatedAt)) await targetDb.put('drafts', structuredClone(migrated))
  }
}

async function mergeExports(targetDb: Awaited<ReturnType<typeof openDB>>, exports: ExportRecord[]) {
  for (const item of exports) {
    if (!item?.id || !item?.draft || !item.exportedAt) continue
    const existing = await targetDb.get('exports', item.id) as ExportRecord | undefined
    if (!existing || newerDate(item.exportedAt, existing.exportedAt)) await targetDb.put('exports', structuredClone({ ...item, draft: migrateDraftTheme(item.draft) }))
  }
}

async function mergePalettes(targetDb: Awaited<ReturnType<typeof openDB>>, palettes: ThemePalette[]) {
  for (const item of palettes) {
    if (!item?.id || !item.name || !item.slots) continue
    const existing = await targetDb.get('palettes', item.id) as ThemePalette | undefined
    if (!existing) await targetDb.put('palettes', structuredClone(item))
  }
}

function readLegacyLocalStorageArray<T>(key: string) {
  if (typeof localStorage === 'undefined') return [] as T[]
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return [] as T[]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as T[] : []
  } catch {
    return [] as T[]
  }
}

async function migrateFromLegacySources(targetDb: Awaited<ReturnType<typeof openDB>>, currentName: string, options: RepositoryOptions) {
  const meta = await targetDb.get('meta', migrationMetaKey)
  if (meta?.completed) return

  for (const legacyName of await listCandidateLegacyDatabases(currentName, options.legacyNames)) {
    let legacyDb: Awaited<ReturnType<typeof openDB>> | undefined
    try {
      legacyDb = await openDB(legacyName)
      await mergeDrafts(targetDb, await getAllIfStoreExists<EdmDraft>(legacyDb, 'drafts'))
      await mergeExports(targetDb, await getAllIfStoreExists<ExportRecord>(legacyDb, 'exports'))
      await mergePalettes(targetDb, await getAllIfStoreExists<ThemePalette>(legacyDb, 'palettes'))
    } catch {
      // 旧数据读取失败时不阻塞用户打开工具。
    } finally {
      legacyDb?.close()
    }
  }

  await mergeDrafts(targetDb, legacyLocalStorageKeys.flatMap(key => key.endsWith(':drafts') ? readLegacyLocalStorageArray<EdmDraft>(key) : []))
  await mergePalettes(targetDb, legacyLocalStorageKeys.flatMap(key => key.endsWith(':palettes') ? readLegacyLocalStorageArray<ThemePalette>(key) : []))
  await targetDb.put('meta', { id: migrationMetaKey, completed: true, completedAt: new Date().toISOString() })
}

export function createDraftRepository(name = 'ff-edm-builder', options: RepositoryOptions = {}) {
  const database = openDB(name, CURRENT_DB_VERSION, { upgrade(db) {
    if (!db.objectStoreNames.contains('drafts')) db.createObjectStore('drafts', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('exports')) db.createObjectStore('exports', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('palettes')) db.createObjectStore('palettes', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('gifDrafts')) db.createObjectStore('gifDrafts', { keyPath: 'id' })
  } })
  const migration = database.then(db => migrateFromLegacySources(db, name, options))
  async function readyDatabase() {
    const db = await database
    await migration
    return db
  }
  return {
    async save(draft: EdmDraft) { (await readyDatabase()).put('drafts', structuredClone(draft)) },
    async list() { const items = await (await readyDatabase()).getAll('drafts') as EdmDraft[]; return items.map(item => migrateDraftTheme(item)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) },
    async load(id: string) { const draft = await (await readyDatabase()).get('drafts', id) as EdmDraft | undefined; return draft ? migrateDraftTheme(draft) : undefined },
    async rename(id: string, name: string) { const db = await readyDatabase(); const draft = await db.get('drafts', id) as EdmDraft; if (draft) await db.put('drafts', { ...draft, name, updatedAt: new Date().toISOString() }) },
    async delete(id: string) { (await readyDatabase()).delete('drafts', id) },
    async saveExport(record: ExportRecord) { (await readyDatabase()).put('exports', structuredClone(record)) },
    async listExports() { const items = await (await readyDatabase()).getAll('exports') as ExportRecord[]; return items.sort((a, b) => b.exportedAt.localeCompare(a.exportedAt)) },
    async deleteExport(id: string) { (await readyDatabase()).delete('exports', id) },
    async savePalette(palette: ThemePalette) { (await readyDatabase()).put('palettes', structuredClone(palette)) },
    async listPalettes() { return await (await readyDatabase()).getAll('palettes') as ThemePalette[] },
    async deletePalette(id: string) { (await readyDatabase()).delete('palettes', id) },
    async saveGif(draft: GifDraft) { await (await readyDatabase()).put('gifDrafts', structuredClone(draft)) },
    async listGifs() { const items = await (await readyDatabase()).getAll('gifDrafts') as GifDraft[]; return items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) },
    async deleteGif(id: string) { await (await readyDatabase()).delete('gifDrafts', id) },
  }
}
export const draftRepository = createDraftRepository()

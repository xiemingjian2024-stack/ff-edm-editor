import { openDB } from 'idb'
import type { EdmDraft, ExportRecord } from '../domain/edm'
import { migrateDraftTheme } from '../themes/resolveThemeColor'

export function createDraftRepository(name = 'ff-edm-builder') {
  const database = openDB(name, 2, { upgrade(db) {
    if (!db.objectStoreNames.contains('drafts')) db.createObjectStore('drafts', { keyPath: 'id' })
    if (!db.objectStoreNames.contains('exports')) db.createObjectStore('exports', { keyPath: 'id' })
  } })
  return {
    async save(draft: EdmDraft) { (await database).put('drafts', structuredClone(draft)) },
    async list() { const items = await (await database).getAll('drafts') as EdmDraft[]; return items.map(item => migrateDraftTheme(item)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) },
    async load(id: string) { const draft = await (await database).get('drafts', id) as EdmDraft | undefined; return draft ? migrateDraftTheme(draft) : undefined },
    async rename(id: string, name: string) { const db = await database; const draft = await db.get('drafts', id) as EdmDraft; if (draft) await db.put('drafts', { ...draft, name, updatedAt: new Date().toISOString() }) },
    async delete(id: string) { (await database).delete('drafts', id) },
    async saveExport(record: ExportRecord) { (await database).put('exports', structuredClone(record)) },
    async listExports() { const items = await (await database).getAll('exports') as ExportRecord[]; return items.sort((a, b) => b.exportedAt.localeCompare(a.exportedAt)) },
    async deleteExport(id: string) { (await database).delete('exports', id) },
  }
}
export const draftRepository = createDraftRepository()

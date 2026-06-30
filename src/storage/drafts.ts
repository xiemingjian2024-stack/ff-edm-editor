import { openDB } from 'idb'
import type { EdmDraft } from '../domain/edm'

export function createDraftRepository(name = 'ff-edm-builder') {
  const database = openDB(name, 1, { upgrade(db) { db.createObjectStore('drafts', { keyPath: 'id' }) } })
  return {
    async save(draft: EdmDraft) { (await database).put('drafts', structuredClone(draft)) },
    async list() { const items = await (await database).getAll('drafts') as EdmDraft[]; return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) },
    async load(id: string) { return (await database).get('drafts', id) as Promise<EdmDraft | undefined> },
    async rename(id: string, name: string) { const db = await database; const draft = await db.get('drafts', id) as EdmDraft; if (draft) await db.put('drafts', { ...draft, name, updatedAt: new Date().toISOString() }) },
    async delete(id: string) { (await database).delete('drafts', id) }
  }
}
export const draftRepository = createDraftRepository()

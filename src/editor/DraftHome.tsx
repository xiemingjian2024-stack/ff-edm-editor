import type { EdmDraft } from '../domain/edm'

export function DraftHome({ drafts, onCreate, onOpen, onDelete }: { drafts: EdmDraft[]; onCreate: () => void; onOpen: (draft: EdmDraft) => void; onDelete: (id: string) => void }) {
  return <main className="draft-home"><header><div className="brand"><span>FF</span><h1>EDM 搭建器</h1></div><button className="primary" onClick={onCreate}>新建 EDM</button></header><section><div className="home-title"><h2>我的草稿</h2><p>草稿仅保存在此浏览器，清理站点数据会删除草稿。</p></div><div className="draft-grid">{drafts.map(draft => <article key={draft.id}><button className="draft-preview" aria-label={`打开 ${draft.name}`} onClick={() => onOpen(draft)}><span>{draft.floors.length}</span><small>个楼层</small></button><div><strong>{draft.name}</strong><button onClick={() => onDelete(draft.id)}>删除</button></div></article>)}</div>{!drafts.length ? <div className="home-empty"><h3>还没有 EDM 草稿</h3><p>创建第一封，开始组合楼层模板。</p></div> : null}</section></main>
}

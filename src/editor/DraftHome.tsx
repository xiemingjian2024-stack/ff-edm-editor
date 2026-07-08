import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import edmEditorLogo from '../assets/edm-editor-logo.svg'
import emptyOrderImage from '../assets/empty-order.png'
import type { EdmDraft, ExportRecord } from '../domain/edm'
import { Icon } from '../ui/Icon'
import { createTransferFileName } from '../transfer/designTransfer'

const bannerTemplateIds = new Set(['banner-regular', 'banner-image-copy'])
const floorCountBadgeColors = ['#FFAC33', '#5B8DEF', '#58B368', '#A66CFF', '#F56C6C', '#2FB8AC']

function getDraftCoverImage(draft: EdmDraft) {
  for (const floor of draft.floors) {
    if (!bannerTemplateIds.has(floor.templateId)) continue
    const animatedImage = floor.animation?.enabled ? floor.animation.frames.find(frame => frame.image)?.image : ''
    const image = animatedImage || floor.media?.image
    if (image) return image
  }
  return emptyOrderImage
}

function getFloorCountBadgeColor(count: number) {
  const normalizedCount = Math.max(1, count)
  return floorCountBadgeColors[(normalizedCount - 1) % floorCountBadgeColors.length]
}

export function DraftHome({ drafts, exports, onCreate, onOpen, onDelete, onDuplicate, onMakeTransferCode, onReceiveTransferCode, onDeleteExport = () => {} }: { drafts: EdmDraft[]; exports: ExportRecord[]; onCreate: () => void; onOpen: (draft: EdmDraft) => void; onDelete: (id: string) => void; onDuplicate: (draft: EdmDraft) => void; onMakeTransferCode: (draft: EdmDraft) => Promise<string>; onReceiveTransferCode: (code: string) => Promise<void>; onDeleteExport?: (id: string) => void }) {
  const [tab, setTab] = useState<'drafts' | 'exports'>('drafts')
  const [sendDraft, setSendDraft] = useState<EdmDraft | null>(null)
  const [sendCode, setSendCode] = useState('')
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const formatTime = (value: string) => value ? new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '刚刚'
  const sheet = (draft: EdmDraft) => <div className="draft-sheet"><img className="draft-cover-image" src={getDraftCoverImage(draft)} alt={`${draft.name} 封面`} /></div>
  const meta = (draft: EdmDraft, timeLabel: string, menuId: string, children: ReactNode) => <div className="draft-meta" data-testid="draft-card-meta">
    <div className="draft-title-row"><span className="draft-count-badge" aria-label={`${draft.floors.length} 个楼层`} style={{ '--draft-count-bg': getFloorCountBadgeColor(draft.floors.length) } as CSSProperties}>{draft.floors.length}</span><strong>{draft.name}</strong><button className="draft-more" aria-label={`更多操作 ${draft.name}`} aria-expanded={openMenuId === menuId} onClick={() => setOpenMenuId(openMenuId === menuId ? null : menuId)}>…</button></div>
    <small>{timeLabel}</small>
    {openMenuId === menuId ? <div className="draft-action-menu" role="menu">{children}</div> : null}
  </div>
  const openSend = async (draft: EdmDraft) => {
    setSendDraft(draft); setSendCode(''); setMessage(''); setBusy(true)
    try { setSendCode(await onMakeTransferCode(draft)) } catch (error) { setMessage(error instanceof Error ? error.message : '设计稿编码生成失败') } finally { setBusy(false) }
  }
  const downloadTransferFile = () => {
    if (!sendDraft || !sendCode) return
    const url = URL.createObjectURL(new Blob([sendCode], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = createTransferFileName(sendDraft.name); anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const receive = async (code: string) => {
    setMessage(''); setBusy(true)
    try { await onReceiveTransferCode(code); setReceiveOpen(false) } catch (error) { setMessage(error instanceof Error ? error.message : '设计稿接收失败') } finally { setBusy(false) }
  }
  const importFile = async (file?: File) => {
    if (!file) return
    await receive(await file.text())
  }
  return <><main className="draft-home"><header><div className="draft-brand"><img className="project-logo" src={edmEditorLogo} alt="EDM Editor"/><h1 className="visually-hidden">EDM 搭建器</h1></div><div className="home-actions"><button className="secondary-button new-draft-button" onClick={() => { setReceiveOpen(true); setMessage('') }}>接收设计稿</button><button className="primary-button new-draft-button" onClick={onCreate}><Icon name="plus"/>新建 EDM</button></div></header><section>
    <div className="home-title"><div><h2>我的作品</h2><p>创建、编辑并导出你的 EDM 设计</p></div><small>内容仅保存在此浏览器，清理站点数据会删除记录。</small></div>
    <div className="work-tabs"><button className={tab === 'drafts' ? 'is-active' : ''} onClick={() => setTab('drafts')}>草稿</button><button className={tab === 'exports' ? 'is-active' : ''} onClick={() => setTab('exports')}>已导出</button></div>
    {tab === 'drafts' ? <><div className="draft-grid">{drafts.map(draft => <article key={draft.id}><button className="draft-preview" aria-label={`打开 ${draft.name}`} onClick={() => onOpen(draft)}>{sheet(draft)}</button>{meta(draft, `修改于 ${formatTime(draft.updatedAt)}`, `draft-${draft.id}`, <><button aria-label={`发送 ${draft.name}`} onClick={() => { setOpenMenuId(null); void openSend(draft) }}>发送</button><button aria-label={`复制 ${draft.name}`} onClick={() => { setOpenMenuId(null); onDuplicate(draft) }}>复制</button><button onClick={() => { setOpenMenuId(null); onDelete(draft.id) }}>删除</button></>)}</article>)}</div>{!drafts.length ? <div className="home-empty"><span><Icon name="drafts" size={22}/></span><h3>还没有 EDM 草稿</h3><p>创建第一封，开始组合楼层模板。</p><button className="primary-button" onClick={onCreate}>创建第一个 EDM</button></div> : null}</> : <><div className="draft-grid">{exports.map(record => <article key={record.id}><div className="draft-preview export-preview">{sheet(record.draft)}</div>{meta(record.draft, `导出于 ${formatTime(record.exportedAt)}`, `export-${record.id}`, <><button aria-label={`发送 ${record.draft.name}`} onClick={() => { setOpenMenuId(null); void openSend(record.draft) }}>发送</button><button aria-label={`将 ${record.draft.name} 复制为草稿`} onClick={() => { setOpenMenuId(null); onDuplicate(record.draft) }}>复制为草稿</button><button onClick={() => { setOpenMenuId(null); onDeleteExport(record.id) }}>删除</button></>)}</article>)}</div>{!exports.length ? <div className="home-empty"><span><Icon name="download" size={22}/></span><h3>还没有导出记录</h3><p>成功导出 EDM 后，最近版本会显示在这里。</p></div> : null}</>}
  </section></main>
  {sendDraft ? <div className="dialog-backdrop" role="dialog" aria-label="发送设计稿"><div className="export-dialog transfer-dialog"><header><div><h2>发送设计稿</h2><p>{sendDraft.name}</p></div><button onClick={() => setSendDraft(null)}>关闭</button></header><div className="transfer-body"><p>请下载 .edm 文件，通过飞书发送给同事。对方在「接收设计稿」中选择这个文件即可生成新草稿。</p>{message ? <p className="issue blocker">{message}</p> : null}{busy ? <p className="success">正在准备 .edm 文件…</p> : null}</div><footer><button className="primary-button" onClick={downloadTransferFile} disabled={!sendCode}>下载 .edm 文件</button></footer></div></div> : null}
  {receiveOpen ? <div className="dialog-backdrop" role="dialog" aria-label="接收设计稿"><div className="export-dialog transfer-dialog"><header><div><h2>接收设计稿</h2><p>选择同事发来的 .edm 文件，工具会生成一个新的草稿。</p></div><button onClick={() => setReceiveOpen(false)}>关闭</button></header><div className="transfer-body"><label className="transfer-file"><span>导入 .edm 文件</span><input aria-label="导入 .edm 文件" type="file" accept=".edm,.txt" onChange={event => void importFile(event.target.files?.[0])}/></label>{message ? <p className="issue blocker">{message}</p> : null}{busy ? <p className="success">正在生成新草稿…</p> : null}</div><footer><button onClick={() => setReceiveOpen(false)}>取消</button></footer></div></div> : null}
  </>
}

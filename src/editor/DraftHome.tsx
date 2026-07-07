import { useState } from 'react'
import edmEditorLogo from '../assets/edm-editor-logo.svg'
import type { EdmDraft, ExportRecord } from '../domain/edm'
import { Icon } from '../ui/Icon'
import { createTransferFileName } from '../transfer/designTransfer'

export function DraftHome({ drafts, exports, onCreate, onOpen, onDelete, onDuplicate, onMakeTransferCode, onReceiveTransferCode, onDeleteExport = () => {} }: { drafts: EdmDraft[]; exports: ExportRecord[]; onCreate: () => void; onOpen: (draft: EdmDraft) => void; onDelete: (id: string) => void; onDuplicate: (draft: EdmDraft) => void; onMakeTransferCode: (draft: EdmDraft) => Promise<string>; onReceiveTransferCode: (code: string) => Promise<void>; onDeleteExport?: (id: string) => void }) {
  const [tab, setTab] = useState<'drafts' | 'exports'>('drafts')
  const [sendDraft, setSendDraft] = useState<EdmDraft | null>(null)
  const [sendCode, setSendCode] = useState('')
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [receiveCode, setReceiveCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const formatTime = (value: string) => value ? new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '刚刚'
  const sheet = (draft: EdmDraft) => <div className="draft-sheet"><span>{draft.floors.length} 个楼层</span><i/><i/><i/></div>
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
  const receive = async (code = receiveCode) => {
    setMessage(''); setBusy(true)
    try { await onReceiveTransferCode(code); setReceiveOpen(false); setReceiveCode('') } catch (error) { setMessage(error instanceof Error ? error.message : '设计稿接收失败') } finally { setBusy(false) }
  }
  const importFile = async (file?: File) => {
    if (!file) return
    await receive(await file.text())
  }
  return <><main className="draft-home"><header><div className="draft-brand"><img className="project-logo" src={edmEditorLogo} alt="EDM Editor"/><h1 className="visually-hidden">EDM 搭建器</h1></div><div className="home-actions"><button className="secondary-button new-draft-button" onClick={() => { setReceiveOpen(true); setMessage(''); setReceiveCode('') }}>接收设计稿</button><button className="primary-button new-draft-button" onClick={onCreate}><Icon name="plus"/>新建 EDM</button></div></header><section>
    <div className="home-title"><div><h2>我的作品</h2><p>创建、编辑并导出你的 EDM 设计</p></div><small>内容仅保存在此浏览器，清理站点数据会删除记录。</small></div>
    <div className="work-tabs"><button className={tab === 'drafts' ? 'is-active' : ''} onClick={() => setTab('drafts')}>草稿</button><button className={tab === 'exports' ? 'is-active' : ''} onClick={() => setTab('exports')}>已导出</button></div>
    {tab === 'drafts' ? <><div className="draft-grid">{drafts.map(draft => <article key={draft.id}><button className="draft-preview" aria-label={`打开 ${draft.name}`} onClick={() => onOpen(draft)}>{sheet(draft)}</button><div className="draft-meta"><div><strong>{draft.name}</strong><small>修改于 {formatTime(draft.updatedAt)}</small></div><span className="draft-actions"><button aria-label={`发送 ${draft.name}`} onClick={() => void openSend(draft)}>发送</button><button aria-label={`复制 ${draft.name}`} onClick={() => onDuplicate(draft)}>复制</button><button onClick={() => onDelete(draft.id)}>删除</button></span></div></article>)}</div>{!drafts.length ? <div className="home-empty"><span><Icon name="drafts" size={22}/></span><h3>还没有 EDM 草稿</h3><p>创建第一封，开始组合楼层模板。</p><button className="primary-button" onClick={onCreate}>创建第一个 EDM</button></div> : null}</> : <><div className="draft-grid">{exports.map(record => <article key={record.id}><div className="draft-preview export-preview">{sheet(record.draft)}</div><div className="draft-meta"><div><strong>{record.draft.name}</strong><small>导出于 {formatTime(record.exportedAt)}</small></div><span className="draft-actions"><button aria-label={`发送 ${record.draft.name}`} onClick={() => void openSend(record.draft)}>发送</button><button aria-label={`将 ${record.draft.name} 复制为草稿`} onClick={() => onDuplicate(record.draft)}>复制为草稿</button><button onClick={() => onDeleteExport(record.id)}>删除</button></span></div></article>)}</div>{!exports.length ? <div className="home-empty"><span><Icon name="download" size={22}/></span><h3>还没有导出记录</h3><p>成功导出 EDM 后，最近版本会显示在这里。</p></div> : null}</>}
  </section></main>
  {sendDraft ? <div className="dialog-backdrop" role="dialog" aria-label="发送设计稿"><div className="export-dialog transfer-dialog"><header><div><h2>发送设计稿</h2><p>{sendDraft.name}</p></div><button onClick={() => setSendDraft(null)}>关闭</button></header><div className="transfer-body"><p>复制下面的设计稿编码发给同事，对方在「接收设计稿」中粘贴即可生成新草稿。</p>{message ? <p className="issue blocker">{message}</p> : null}<textarea aria-label="设计稿编码" readOnly value={busy ? '正在生成编码…' : sendCode}/></div><footer><button onClick={downloadTransferFile} disabled={!sendCode}>下载 .edm 文件</button><button className="primary-button" onClick={() => sendCode && navigator.clipboard?.writeText(sendCode)} disabled={!sendCode}>复制编码</button></footer></div></div> : null}
  {receiveOpen ? <div className="dialog-backdrop" role="dialog" aria-label="接收设计稿"><div className="export-dialog transfer-dialog"><header><div><h2>接收设计稿</h2><p>粘贴编码，或选择同事发来的 .edm 文件。</p></div><button onClick={() => setReceiveOpen(false)}>关闭</button></header><div className="transfer-body"><label><span>设计稿编码</span><textarea aria-label="设计稿编码" value={receiveCode} onChange={event => setReceiveCode(event.target.value)} placeholder="粘贴 FFEDM1- 开头的编码"/></label><label className="transfer-file"><span>导入 .edm 文件</span><input type="file" accept=".edm,.txt" onChange={event => void importFile(event.target.files?.[0])}/></label>{message ? <p className="issue blocker">{message}</p> : null}</div><footer><button onClick={() => setReceiveOpen(false)}>取消</button><button className="primary-button" disabled={busy || !receiveCode.trim()} onClick={() => void receive()}>{busy ? '正在生成…' : '生成新草稿'}</button></footer></div></div> : null}
  </>
}

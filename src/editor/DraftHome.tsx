import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import edmEditorLogo from '../assets/edm-editor-logo.svg'
import emptyOrderImage from '../assets/empty-order.png'
import receiveDesignIcon from '../assets/receive-design.svg'
import type { EdmDraft, ExportRecord } from '../domain/edm'
import { Icon } from '../ui/Icon'
import { createTransferFileName } from '../transfer/designTransfer'
import type { GifDraft, GifTemplateId } from '../gif/model'
import { gifTemplates } from '../gif/model'
import { GifPreview, GifTemplatePreview } from '../gif/GifPreview'
import { KlaviyoSettingsDialog } from '../klaviyo/KlaviyoSettingsDialog'

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

export function DraftHome({ drafts, gifDrafts = [], initialTab = 'edm', onCreate, onCreateGif = () => {}, onOpen, onOpenGif = () => {}, onDelete, onDeleteGif = () => {}, onDuplicate, onDuplicateGif = () => {}, onMakeTransferCode, onReceiveTransferCode }: { drafts: EdmDraft[]; gifDrafts?: GifDraft[]; exports?: ExportRecord[]; initialTab?: 'edm' | 'gif'; onCreate: () => void; onCreateGif?: (templateId: GifTemplateId) => void; onOpen: (draft: EdmDraft) => void; onOpenGif?: (draft: GifDraft) => void; onDelete: (id: string) => void; onDeleteGif?: (id: string) => void; onDuplicate: (draft: EdmDraft) => void; onDuplicateGif?: (draft: GifDraft) => void; onMakeTransferCode: (draft: EdmDraft) => Promise<string>; onReceiveTransferCode: (code: string) => Promise<void> }) {
  const [tab, setTab] = useState<'edm' | 'gif'>(initialTab)
  const [sendDraft, setSendDraft] = useState<EdmDraft | null>(null)
  const [sendCode, setSendCode] = useState('')
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [gifPickerOpen, setGifPickerOpen] = useState(false)
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)
  const [klaviyoSettingsOpen, setKlaviyoSettingsOpen] = useState(false)
  const edmWorks = [...drafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const gifWorks = [...gifDrafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
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
  return <><main className="draft-home"><header><div className="draft-brand"><img className="project-logo" src={edmEditorLogo} alt="EDM Editor"/><h1 className="visually-hidden">EDM 搭建器</h1></div><div className="home-actions"><div className="home-settings"><button className="secondary-button new-draft-button" aria-expanded={settingsMenuOpen} onClick={() => setSettingsMenuOpen(value => !value)}><Icon name="settings"/>设置<Icon name="chevron" size={13}/></button>{settingsMenuOpen ? <div className="home-settings-menu" role="menu"><button role="menuitem" onClick={() => { setSettingsMenuOpen(false); setKlaviyoSettingsOpen(true) }}><span><strong>Klaviyo 连接</strong><small>图片同步与 HTML 导出</small></span><Icon name="chevron" size={13}/></button></div> : null}</div><button className="secondary-button new-draft-button" onClick={() => { setReceiveOpen(true); setMessage('') }}><img className="button-icon" src={receiveDesignIcon} alt=""/>接收设计稿</button><button className="secondary-button new-draft-button" onClick={() => setGifPickerOpen(true)}><Icon name="plus"/>新建 GIF</button><button className="primary-button new-draft-button" onClick={onCreate}><Icon name="plus"/>新建 EDM</button></div></header><section>
    <div className="home-title"><div><h2>我的作品</h2><p>创建、编辑并导出 EDM 与 GIF 设计</p></div><small>设计稿保存在本机，建议定期备份重要作品。</small></div>
    <div className="work-tabs"><button className={tab === 'edm' ? 'is-active' : ''} onClick={() => { setTab('edm'); setOpenMenuId(null) }}>EDM</button><button className={tab === 'gif' ? 'is-active' : ''} onClick={() => { setTab('gif'); setOpenMenuId(null) }}>GIF</button></div>
    {tab === 'edm' ? <><div className="draft-grid">{edmWorks.map(draft => <article key={draft.id}><button className="draft-preview" aria-label={`打开 ${draft.name}`} onClick={() => onOpen(draft)}>{sheet(draft)}</button>{meta(draft, `修改于 ${formatTime(draft.updatedAt)}`, `draft-${draft.id}`, <><button aria-label={`发送 ${draft.name}`} onClick={() => { setOpenMenuId(null); void openSend(draft) }}>发送</button><button aria-label={`复制 ${draft.name}`} onClick={() => { setOpenMenuId(null); onDuplicate(draft) }}>复制</button><button onClick={() => { setOpenMenuId(null); onDelete(draft.id) }}>删除</button></>)}</article>)}</div>{!edmWorks.length ? <div className="home-empty"><span><Icon name="drafts" size={22}/></span><h3>还没有 EDM 作品</h3><p>创建第一封 EDM 开始设计。</p><button className="primary-button" onClick={onCreate}>创建第一个 EDM</button></div> : null}</> : <><div className="draft-grid">{gifWorks.map(draft => <article key={draft.id}><button className="draft-preview gif-draft-preview" aria-label={`打开 ${draft.name}`} onClick={() => onOpenGif(draft)}><GifPreview draft={draft}/><em>GIF · {draft.scenes.length} 帧</em></button><div className="draft-meta"><div className="draft-title-row"><span className="draft-count-badge" style={{ '--draft-count-bg': '#111111' } as CSSProperties}>G</span><strong>{draft.name}</strong><button className="draft-more" aria-label={`更多操作 ${draft.name}`} onClick={() => setOpenMenuId(openMenuId === `gif-${draft.id}` ? null : `gif-${draft.id}`)}>…</button></div><small>修改于 {formatTime(draft.updatedAt)}</small>{openMenuId === `gif-${draft.id}` ? <div className="draft-action-menu"><button onClick={() => { setOpenMenuId(null); onDuplicateGif(draft) }}>复制</button><button onClick={() => { setOpenMenuId(null); onDeleteGif(draft.id) }}>删除</button></div> : null}</div></article>)}</div>{!gifWorks.length ? <div className="home-empty"><span><Icon name="image" size={22}/></span><h3>还没有 GIF 作品</h3><p>从 GIF 模板开始制作第一张动画。</p><button className="primary-button" onClick={() => setGifPickerOpen(true)}>创建第一个 GIF</button></div> : null}</>}
  </section></main>
  {sendDraft ? <div className="dialog-backdrop" role="dialog" aria-label="发送设计稿"><div className="export-dialog transfer-dialog"><header><div><h2>发送设计稿</h2><p>{sendDraft.name}</p></div><button onClick={() => setSendDraft(null)}>关闭</button></header><div className="transfer-body"><p>请下载 .edm 文件，通过飞书发送给同事。对方在「接收设计稿」中选择这个文件即可生成新草稿。</p>{message ? <p className="issue blocker">{message}</p> : null}{busy ? <p className="success">正在准备 .edm 文件…</p> : null}</div><footer><button className="primary-button" onClick={downloadTransferFile} disabled={!sendCode}>下载 .edm 文件</button></footer></div></div> : null}
  {receiveOpen ? <div className="dialog-backdrop" role="dialog" aria-label="接收设计稿"><div className="export-dialog transfer-dialog"><header><div><h2>接收设计稿</h2><p>选择同事发来的 .edm 文件，工具会生成一个新的草稿。</p></div><button onClick={() => setReceiveOpen(false)}>关闭</button></header><div className="transfer-body"><label className="transfer-file"><span>导入 .edm 文件</span><input aria-label="导入 .edm 文件" type="file" accept=".edm,.txt" onChange={event => void importFile(event.target.files?.[0])}/></label>{message ? <p className="issue blocker">{message}</p> : null}{busy ? <p className="success">正在生成新草稿…</p> : null}</div><footer><button onClick={() => setReceiveOpen(false)}>取消</button></footer></div></div> : null}
  {gifPickerOpen ? <div className="dialog-backdrop" role="dialog" aria-label="选择 GIF 模板"><div className="gif-template-dialog"><header><div><h2>新建 GIF</h2><p>选择一个模板开始，之后只需替换图片和文案。</p></div><button onClick={() => setGifPickerOpen(false)}>关闭</button></header><div className="gif-template-grid">{gifTemplates.map(template => <button key={template.id} onClick={() => { setGifPickerOpen(false); onCreateGif(template.id) }}><GifTemplatePreview templateId={template.id}/><strong>{template.name}</strong><small>{template.description}</small><em>{template.width * 2} × {template.height * 2}px</em></button>)}</div></div></div> : null}
  {klaviyoSettingsOpen ? <KlaviyoSettingsDialog onClose={() => setKlaviyoSettingsOpen(false)}/> : null}
  </>
}

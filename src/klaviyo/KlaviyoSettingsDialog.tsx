import { useEffect, useState } from 'react'
import { connectKlaviyo, disconnectKlaviyo, getKlaviyoStatus, type KlaviyoStatus } from './client'

export function KlaviyoSettingsDialog({ onClose, onStatusChange }: { onClose: () => void; onStatusChange?: (status: KlaviyoStatus) => void }) {
  const [status, setStatus] = useState<KlaviyoStatus>({ available: true, connected: false, suffix: '' })
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [busy, setBusy] = useState(true)
  const [message, setMessage] = useState('')
  const updateStatus = (next: KlaviyoStatus) => { setStatus(next); onStatusChange?.(next) }
  useEffect(() => { void getKlaviyoStatus().then(updateStatus).finally(() => setBusy(false)) }, [])
  const connect = async () => {
    setBusy(true); setMessage('')
    try { updateStatus(await connectKlaviyo(key)); setKey(''); setMessage('连接成功，之后复制 HTML 时会自动同步图片。') }
    catch (error) { setMessage(error instanceof Error ? error.message : '连接失败') }
    finally { setBusy(false) }
  }
  const disconnect = async () => { setBusy(true); setMessage(''); try { updateStatus(await disconnectKlaviyo()) } finally { setBusy(false) } }
  return <div className="dialog-backdrop" role="dialog" aria-label="Klaviyo 连接设置"><div className="export-dialog klaviyo-settings-dialog">
    <header><div><h2>Klaviyo 连接</h2><p>连接一次，复制 HTML 时自动同步需要的图片。</p></div><button onClick={onClose}>关闭</button></header>
    <div className="klaviyo-settings-body">
      <div className={`connection-status-card${status.connected ? ' is-connected' : ''}`}><span aria-hidden="true"/><div><strong>{status.connected ? '已连接 Klaviyo' : '尚未连接'}</strong><small>{status.connected ? `Private API Key ····${status.suffix}` : '需要 Images Read 与 Images Write 权限'}</small></div></div>
      {!status.available ? <p className="issue">当前环境无法启用系统安全存储，请使用本机启动地址或桌面安装包。</p> : status.connected ? <div className="klaviyo-connected-actions"><p>密钥已安全保存在当前电脑，不会写入设计稿或导出文件。</p><button onClick={() => void disconnect()} disabled={busy}>断开连接</button></div> : <label className="klaviyo-key-field"><span>Private API Key</span><div><input aria-label="Klaviyo Private API Key" type={showKey ? 'text' : 'password'} placeholder="pk_••••••••••••••••" value={key} onChange={event => setKey(event.target.value)}/><button type="button" onClick={() => setShowKey(value => !value)}>{showKey ? '隐藏' : '显示'}</button></div><small>浏览器模式保存在 macOS 钥匙串；安装包使用系统加密存储。</small></label>}
      {message ? <p className={status.connected ? 'success' : 'issue blocker'}>{message}</p> : null}
    </div>
    <footer><button onClick={onClose}>取消</button>{status.available && !status.connected ? <button className="primary-button" onClick={() => void connect()} disabled={busy || !key.trim()}>{busy ? '正在验证…' : '测试并连接'}</button> : null}</footer>
  </div></div>
}

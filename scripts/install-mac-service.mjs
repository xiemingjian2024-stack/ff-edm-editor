import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { homedir, userInfo } from 'node:os'

if (process.platform !== 'darwin') {
  console.error('这个后台服务安装脚本只适用于 macOS。')
  process.exit(1)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const distIndex = resolve(projectRoot, 'dist', 'index.html')
const label = 'com.funnyfuzzy.edm-editor'
const plistDir = resolve(homedir(), 'Library', 'LaunchAgents')
const logDir = resolve(homedir(), 'Library', 'Logs')
const plistPath = resolve(plistDir, `${label}.plist`)
const uid = userInfo().uid

if (!existsSync(distIndex)) {
  console.error('没有找到构建文件，请先运行：npm run build')
  process.exit(1)
}

mkdirSync(plistDir, { recursive: true })
mkdirSync(logDir, { recursive: true })

const xmlValue = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xmlValue(process.execPath)}</string>
    <string>${xmlValue(resolve(projectRoot, 'server', 'local-app.mjs'))}</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${xmlValue(projectRoot)}</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PORT</key>
    <string>5174</string>
    <key>EDM_NO_OPEN</key>
    <string>1</string>
    <key>EDM_STRICT_PORT</key>
    <string>1</string>
  </dict>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${xmlValue(resolve(logDir, 'edm-editor.log'))}</string>
  <key>StandardErrorPath</key>
  <string>${xmlValue(resolve(logDir, 'edm-editor.err.log'))}</string>
</dict>
</plist>
`

writeFileSync(plistPath, plist)

const run = (command, args, options = {}) => {
  try { execFileSync(command, args, { stdio: 'ignore', ...options }) }
  catch (error) { if (!options.ignoreError) throw error }
}

run('launchctl', ['bootout', `gui/${uid}`, plistPath], { ignoreError: true })
run('launchctl', ['bootstrap', `gui/${uid}`, plistPath])
run('launchctl', ['kickstart', '-k', `gui/${uid}/${label}`])

console.log('EDM EDITOR 后台服务已安装。')
console.log('固定地址：http://127.0.0.1:5174/')
console.log(`服务文件：${plistPath}`)


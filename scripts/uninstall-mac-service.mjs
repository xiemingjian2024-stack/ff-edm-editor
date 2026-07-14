import { execFileSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { homedir, userInfo } from 'node:os'

if (process.platform !== 'darwin') {
  console.error('这个后台服务卸载脚本只适用于 macOS。')
  process.exit(1)
}

const label = 'com.funnyfuzzy.edm-editor'
const plistPath = resolve(homedir(), 'Library', 'LaunchAgents', `${label}.plist`)
const uid = userInfo().uid

try { execFileSync('launchctl', ['bootout', `gui/${uid}`, plistPath], { stdio: 'ignore' }) }
catch {}

if (existsSync(plistPath)) rmSync(plistPath)

console.log('EDM EDITOR 后台服务已卸载。')


import { packager } from '@electron/packager'
import { execFileSync } from 'node:child_process'
import { chmod, mkdir, rm, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const releaseRoot = join(root, 'release')
const desktopRoot = join(releaseRoot, 'desktop')
const appName = 'EDM EDITOR'
const platform = process.argv[2] || 'win32'
const arch = process.argv[3] || 'x64'
const appVersion = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
const icon = platform === 'darwin'
  ? join(root, 'build', 'icon.icns')
  : platform === 'win32'
    ? join(root, 'build', 'icon.ico')
    : join(root, 'build', 'icon.png')

const ignoredPaths = [
  /^\/\.git($|\/)/,
  /^\/\.playwright-cli($|\/)/,
  /^\/output($|\/)/,
  /(^|\/)\.DS_Store$/,
  /^\/docs($|\/)/,
  /^\/e2e($|\/)/,
  /^\/public($|\/)/,
  /^\/release($|\/)/,
  /^\/scripts($|\/)/,
  /^\/src($|\/)/,
  /^\/test-results($|\/)/,
  /^\/server\/.*\.test\./,
  /^\/electron\/.*\.test\./,
  /^\/.*\.test\./,
  /^\/playwright\.config\.ts$/,
  /^\/vitest\.config\.ts$/,
  /^\/vite\.config\.ts$/,
  /^\/tsconfig\.json$/,
]

const windowsUsage = `EDM EDITOR 桌面试用版

Windows 使用方式：
1. 解压整个文件夹，不要只拖出 exe。
2. 双击「EDM EDITOR.exe」。
3. 如果系统提示未知发布者，选择“更多信息”后继续运行。

说明：
- 不需要安装 Node.js。
- 草稿仍保存在当前电脑的应用数据中。
- Shopify 商品读取需要电脑能正常访问商品页。
- 导出文件会下载到系统默认下载目录。
`

const macUsage = `EDM EDITOR Mac 测试版

Mac 使用方式：
1. 解压整个 zip。
2. 双击「EDM EDITOR.app」。
3. 如果提示无法验证开发者，请右键点击「EDM EDITOR.app」，选择“打开”，再确认打开。
4. 如果提示“已损坏，无法打开”，请联系设计同事重新发送新版安装包，或在终端执行：
   xattr -cr /Applications/EDM\\ EDITOR.app

说明：
- 不需要安装 Node.js。
- 草稿保存在当前电脑的应用数据中。
- Shopify 商品读取需要电脑能正常访问商品页。
- 导出文件会下载到系统默认下载目录。
`

await rm(desktopRoot, { recursive: true, force: true })
await mkdir(desktopRoot, { recursive: true })

execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' })

const appPaths = await packager({
  dir: root,
  name: appName,
  platform,
  arch,
  out: desktopRoot,
  overwrite: true,
  asar: false,
  prune: true,
  ignore: ignoredPaths,
  appVersion,
  executableName: 'EDM EDITOR',
  icon,
})

const appPath = appPaths[0]
if (platform === 'darwin') {
  execFileSync('xattr', ['-cr', join(appPath, `${appName}.app`)], { stdio: 'inherit' })
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', join(appPath, `${appName}.app`)], { stdio: 'inherit' })
}
await writeFile(join(appPath, platform === 'darwin' ? 'README-MAC.txt' : 'README-WINDOWS.txt'), platform === 'darwin' ? macUsage : windowsUsage)
const platformLabel = platform === 'win32' ? 'win' : platform === 'darwin' ? 'Mac' : platform
const archLabel = platform === 'darwin' && arch !== 'arm64' ? `-${arch}` : ''
const zipName = `EDM-EDITOR-v${appVersion}-${platformLabel}${archLabel}.zip`
const zipPath = join(releaseRoot, zipName)
await rm(zipPath, { force: true })
execFileSync('zip', ['-qr', zipPath, basename(appPath)], { cwd: dirname(appPath), stdio: 'inherit' })
await chmod(zipPath, 0o644)
console.log(`桌面应用包已生成：${zipPath}`)

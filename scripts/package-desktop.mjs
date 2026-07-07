import { packager } from '@electron/packager'
import { execFileSync } from 'node:child_process'
import { chmod, mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const releaseRoot = join(root, 'release')
const desktopRoot = join(releaseRoot, 'desktop')
const appName = 'EDM EDITOR'
const platform = process.argv[2] || 'win32'
const arch = process.argv[3] || 'x64'

const ignoredPaths = [
  /^\/\.git($|\/)/,
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

const usage = `EDM EDITOR 桌面试用版

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
  appVersion: '0.1.0',
  executableName: 'EDM EDITOR',
})

const appPath = appPaths[0]
await writeFile(join(appPath, 'README-WINDOWS.txt'), usage)
const zipName = `EDM-EDITOR-${platform}-${arch}.zip`
const zipPath = join(releaseRoot, zipName)
await rm(zipPath, { force: true })
execFileSync('zip', ['-qr', zipPath, basename(appPath)], { cwd: dirname(appPath), stdio: 'inherit' })
await chmod(zipPath, 0o644)
console.log(`桌面应用包已生成：${zipPath}`)

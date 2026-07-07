import { execFileSync } from 'node:child_process'
import { chmod, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const releaseRoot = join(root, 'release')
const packageName = 'FF-EDM-Editor-local'
const packageDir = join(releaseRoot, packageName)
const zipPath = join(releaseRoot, `${packageName}.zip`)

const rootPackage = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const runtimePackage = {
  name: 'ff-edm-editor-local',
  private: true,
  type: 'module',
  scripts: { start: 'node server/local-app.mjs' },
  dependencies: {
    express: rootPackage.dependencies.express,
  },
}

const usage = `# EDM EDITOR 本地试用版

## 第一次使用

1. 先确认电脑已安装 Node.js 20 或更高版本。
2. Mac 用户双击「START-MAC.command」。
3. Windows 用户双击「START-WINDOWS.bat」。
4. 第一次启动会自动安装运行依赖，可能需要等 1–3 分钟。
5. 浏览器会自动打开 EDM EDITOR；如果没有自动打开，请看启动窗口里的本地地址。

## 日常使用

- 草稿保存在当前电脑、当前浏览器里。
- 不要清理浏览器站点数据，否则草稿可能会丢失。
- Shopify 商品读取需要电脑能访问对应商品页。
- 导出文件会下载到浏览器默认下载目录。

## 关闭工具

关闭启动窗口，或在启动窗口里按 Ctrl + C。

## 常见问题

- 如果提示找不到 node/npm：请先安装 Node.js 20+。
- 如果端口被占用：工具会自动尝试下一个端口，按窗口里的地址访问即可。
- 如果 Shopify 读取失败：先确认商品链接能在浏览器中正常打开。
`

const macCommand = `#!/bin/zsh
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "未检测到 Node.js。请先安装 Node.js 20 或更高版本。"
  echo "安装后重新双击本文件。"
  read "?按回车关闭..."
  exit 1
fi
if [ ! -d "node_modules" ]; then
  echo "首次启动，正在安装运行依赖..."
  npm install --omit=dev
fi
npm start
read "?工具已停止，按回车关闭..."
`

const windowsCommand = `@echo off
cd /d %~dp0
where node >nul 2>nul
if errorlevel 1 (
  echo 未检测到 Node.js。请先安装 Node.js 20 或更高版本。
  pause
  exit /b 1
)
if not exist node_modules (
  echo 首次启动，正在安装运行依赖...
  npm install --omit=dev
)
npm start
pause
`

await rm(packageDir, { recursive: true, force: true })
await rm(zipPath, { force: true })
await mkdir(packageDir, { recursive: true })

execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' })

await cp(join(root, 'dist'), join(packageDir, 'dist'), { recursive: true })
await mkdir(join(packageDir, 'server'), { recursive: true })
await cp(join(root, 'server', 'local-app.mjs'), join(packageDir, 'server', 'local-app.mjs'))
await writeFile(join(packageDir, 'package.json'), JSON.stringify(runtimePackage, null, 2) + '\n')
await writeFile(join(packageDir, 'README.md'), usage)
await writeFile(join(packageDir, 'START-MAC.command'), macCommand)
await writeFile(join(packageDir, 'START-WINDOWS.bat'), windowsCommand)
await chmod(join(packageDir, 'START-MAC.command'), 0o755)

execFileSync('zip', ['-qr', zipPath, packageName], { cwd: releaseRoot, stdio: 'inherit' })
console.log(`本地试用包已生成：${zipPath}`)

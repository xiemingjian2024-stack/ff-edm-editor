# EDM 品牌字体实施计划

> **供执行人员使用：** 必须使用 `superpowers:subagent-driven-development` 或 `superpowers:executing-plans`，按任务逐项实施。

**目标：** 将 Euclid Circular A 的五个正常体字重嵌入项目，并仅应用于 EDM 楼层、完整预览和导出内容。

**架构：** 字体以本地 WOFF2 文件存放在 `public/fonts/`，通过独立 CSS 声明五个 `@font-face`。模板根节点 `.floor-render` 使用品牌字体栈，编辑器 UI 不继承该字体；现有导出等待 `document.fonts.ready`。

**技术栈：** WOFF2、CSS `@font-face`、Vitest、Playwright、浏览器 Font Loading API。

---

## 任务 1：转换和登记字体资源

**文件：**

- 创建：`public/fonts/EuclidCircularA-Light.woff2`
- 创建：`public/fonts/EuclidCircularA-Regular.woff2`
- 创建：`public/fonts/EuclidCircularA-Medium.woff2`
- 创建：`public/fonts/EuclidCircularA-Semibold.woff2`
- 创建：`public/fonts/EuclidCircularA-Bold.woff2`
- 创建：`src/templates/fonts.css`

- [ ] 使用本地字体转换工具将五个 TTF 正常体转换为 WOFF2，不修改源文件。
- [ ] 检查五个输出文件均存在且大小大于 0。
- [ ] 在 `fonts.css` 中为同一字体族声明 300、400、500、600、700，并设置 `font-style: normal` 与 `font-display: swap`。
- [ ] 字体 URL 使用 `/fonts/<filename>.woff2`，保证开发和生产构建路径一致。

## 任务 2：限制品牌字体作用范围

**文件：**

- 修改：`src/templates/templateStyles.css`
- 修改：`src/templates/registry.ts`
- 测试：`src/templates/registry.test.tsx`

- [ ] 先增加失败测试，确认 `.floor-render` 使用 `--edm-font-family`，编辑器根节点没有该类。
- [ ] 在模板入口引入 `fonts.css`。
- [ ] 定义 `--edm-font-family: "Euclid Circular A", "PingFang SC", "Microsoft YaHei", sans-serif`。
- [ ] 将 `.floor-render` 的字体改为 `var(--edm-font-family)`。
- [ ] 不修改 UI 设计令牌中的系统字体。
- [ ] 运行模板测试、类型检查和构建。
- [ ] 提交 `feat: embed EDM brand fonts`。

## 任务 3：浏览器与导出验证

**文件：**

- 修改：`e2e/editor.spec.ts`

- [ ] 在端到端测试中断言楼层计算字体包含 `Euclid Circular A`，工具栏计算字体不包含该字体。
- [ ] 使用应用内浏览器检查五个 WOFF2 请求无 404，`document.fonts.check()` 对 300、400、500、600、700 均返回 true。
- [ ] 输入英文和中文草稿标记，确认英文使用 Euclid、中文可以正常显示。
- [ ] 打开完整预览，确认楼层字体和编辑画布一致。
- [ ] 运行 `npm test && npm run typecheck && npm run build && npm run test:e2e`。
- [ ] 提交 `test: verify EDM brand fonts`。

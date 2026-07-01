# HEAD 分类导航模板实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 新增可配置 2–4 项的 HEAD 分类导航模板，只导出等分 JPG，并将每项链接字符串写入链接清单。

**架构：** 模板协议增加可选导航配置，楼层保存通用 `navigationItems`。动态导出区域由纯函数根据模板、楼层和当前数量生成；导出包继续捕获整层作为切图源和长图预览，但可按模板声明不把整层 JPG 写入 ZIP。

**技术栈：** React、TypeScript、Vitest、Testing Library、JSZip、html-to-image、Playwright

---

### 任务 1：导航项数据与动态区域

**文件：**
- 修改：`src/domain/edm.ts`
- 修改：`src/templates/schema.ts`
- 新建：`src/export/regions.ts`
- 新建：`src/export/regions.test.ts`
- 修改：`src/editor/reducer.ts`
- 修改：`src/editor/reducer.test.ts`

- [ ] 写失败测试：新增分类导航楼层后有 3 个默认导航项；改为 2 项时隐藏数据不删除；`getFloorExportRegions` 对 2/3/4 项生成无缝区域且 2 倍总宽为 750。
- [ ] 运行 `npm test -- src/export/regions.test.ts src/editor/reducer.test.ts`，确认类型和动作不存在而失败。
- [ ] 增加 `NavigationItem { text; url }`、楼层 `navigationItems`、模板 `navigationConfig` 与 `exportFullImage?: boolean`。
- [ ] 增加 `updateNavigationItem` reducer 动作；`createFloor` 从模板默认项初始化数组，数量仍保存于普通 `navigationCount` 选项字段。
- [ ] 实现 `getFloorExportRegions(template, floor)`：普通模板返回静态区域；导航模板按数量生成带 `navigationItemIndex` 的等分区域。
- [ ] 运行定向测试并提交 `feat: add dynamic navigation export regions`。

### 任务 2：分类导航模板与同组属性编辑

**文件：**
- 新建：`src/templates/head-category-navigation/index.tsx`
- 修改：`src/templates/registry.ts`
- 修改：`src/templates/registry.test.tsx`
- 修改：`src/templates/templateStyles.css`
- 修改：`src/editor/PropertyPanel.tsx`
- 修改：`src/editor/EditorPage.tsx`
- 修改：`src/editor/EditorPage.test.tsx`
- 修改：`src/editor/editor.css`

- [ ] 写失败测试：模板为 375×46、主题色位 A/B、默认 3 项；属性面板每项同时显示“文案”和“链接”；数量切换为 2 后第三项隐藏，再切回 3 时内容恢复。
- [ ] 运行 `npm test -- src/templates/registry.test.tsx src/editor/EditorPage.test.tsx`，确认模板尚未注册而失败。
- [ ] 创建模板：背景 `background` 关联 A，文字 `textColor` 关联 B，`navigationCount` 为 2/3/4 选项，默认文案为 Home、Carrier & Travel、Couch Covers。
- [ ] 渲染器固定 375×46、11px 品牌字体、等宽网格、固定竖线、两行省略。
- [ ] 属性面板增加导航项分组，每项包含文案输入与链接输入；链接不校验、不跳转。
- [ ] 运行定向测试并提交 `feat: add HEAD category navigation template`。

### 任务 3：仅输出分片并完成验收

**文件：**
- 修改：`src/export/package.ts`
- 修改：`src/export/manifest.ts`
- 修改：`src/export/manifest.test.ts`
- 修改：`src/export/render.test.ts`
- 修改：`e2e/editor.spec.ts`

- [ ] 写失败测试：导航区域链接来自 `navigationItems[index].url`；`buildExportZip` 在 `includeFull=false` 时不写整层 JPG，但仍写分片和 `full-preview.jpg`。
- [ ] 运行导出测试并确认失败。
- [ ] 导出流程改用 `getFloorExportRegions`，清单区域名使用导航文案、链接使用对应字符串；`RenderedFloor` 增加 `includeFull`，ZIP 按该值决定是否写整层 JPG。
- [ ] 增加端到端流程：添加模板、切换数量、编辑同组文案和链接、打开导出检查。
- [ ] 运行 `npm test && npm run typecheck && npm run build && npm run test:e2e`。
- [ ] 在 `http://127.0.0.1:5174/` 检查 375×46、两行省略、A/B 主题状态和属性面板分组。
- [ ] 提交 `test: cover category navigation export workflow`。

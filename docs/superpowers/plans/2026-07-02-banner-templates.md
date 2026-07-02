# 两个 Banner 模板实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 用常规 Banner 和图文 Banner 替换模板库中的临时 Banner，并提供可复用的图片拖拽、缩放、重置、Shopify 首图和动态高度能力。

**架构：** 楼层保存通用 `media` 状态，`EditableImageFrame` 只负责裁切、拖拽和变换，`BannerMediaEditor` 只负责 Shopify 读取、上传、缩放与重置。模板协议声明媒体框、动态高度和模板库可见性；两个 Banner 共享编辑组件，只保留各自布局。

**技术栈：** React、TypeScript、Pointer Events、Vitest、Testing Library、html-to-image、Playwright

---

### 任务 1：通用媒体状态与动态高度

**文件：**
- 修改：`src/domain/edm.ts`
- 修改：`src/templates/schema.ts`
- 新建：`src/templates/floorGeometry.ts`
- 新建：`src/templates/floorGeometry.test.ts`
- 修改：`src/editor/reducer.ts`
- 修改：`src/editor/reducer.test.ts`
- 修改：`src/export/regions.ts`

- [ ] 写失败测试：媒体模板新增楼层时初始化 `{ image:'', url:'', scale:1, offsetX:0, offsetY:0 }`；媒体更新不影响其他楼层；常规 Banner 高度限制为 250–600；图文 Banner 总高等于图片区高度 + 180。
- [ ] 运行定向测试，确认类型、动作和几何函数不存在而失败。
- [ ] 增加 `MediaState`、模板 `mediaConfig`、`heightConfig`、`hiddenInLibrary`，以及 `range` 字段类型。
- [ ] 实现 `getFloorHeight(template, floor)`，并让动态整层导出区域使用实际高度。
- [ ] 增加 `updateMedia` reducer 动作，媒体模板创建时初始化状态。
- [ ] 运行测试并提交 `feat: add reusable media and floor geometry`。

### 任务 2：可复用自由图片编辑组件

**文件：**
- 新建：`src/editor/EditableImageFrame.tsx`
- 新建：`src/editor/EditableImageFrame.test.tsx`
- 新建：`src/editor/BannerMediaEditor.tsx`
- 新建：`src/editor/BannerMediaEditor.test.tsx`
- 修改：`src/domain/edm.ts`
- 修改：`src/editor/Canvas.tsx`
- 修改：`src/editor/EditorPage.tsx`
- 修改：`src/editor/PropertyPanel.tsx`
- 修改：`src/editor/editor.css`

- [ ] 写失败测试：指针移动按画布比例更新 offset；缩放滑杆写入 1–3；重置恢复 1/0/0；Shopify 成功写入首图和同一 URL；手动上传清空 URL。
- [ ] 运行测试并确认失败。
- [ ] 实现 `EditableImageFrame`：100% cover、overflow hidden、指针捕获、设计坐标换算；没有 `onChange` 时只渲染，供预览和导出使用。
- [ ] 扩展 `FloorRenderProps` 可选 `onMediaChange`；Canvas 传入更新回调，ExportDialog 不传。
- [ ] 实现 `BannerMediaEditor`，复用现有 Shopify 读取函数并展示上传、缩放、重置和错误状态。
- [ ] 属性面板在媒体模板中展示该编辑器；Canvas 拖拽与面板共用同一 `updateMedia` 动作。
- [ ] 运行测试并提交 `feat: add reusable free image editor`。

### 任务 3：新增两个 Banner 并隐藏旧模板

**文件：**
- 新建：`src/templates/banner-regular/index.tsx`
- 新建：`src/templates/banner-image-copy/index.tsx`
- 修改：`src/templates/registry.ts`
- 修改：`src/templates/registry.test.tsx`
- 修改：`src/templates/templateStyles.css`
- 修改：`src/editor/TemplateLibrary.tsx`
- 修改：`src/editor/TemplateLibrary.test.tsx`
- 修改：`src/editor/PropertyPanel.tsx`
- 修改：`src/editor/EditorPage.test.tsx`

- [ ] 写失败测试：模板库只显示两个新 Banner；旧模板仍可由 ID 读取；默认尺寸、主题色位和字段规则正确。
- [ ] 写编辑器失败测试：高度范围、上下位置、左右中对齐、遮罩开关、描述留空和图文图片区高度均更新画布。
- [ ] 实现常规 Banner：动态总高、全图媒体框、上下文案、渐变遮罩、固定文字规格和 A/C/B 色位。
- [ ] 实现图文 Banner：动态图片区、固定 180px 文案区、A/B 颜色映射和共用文字布局。
- [ ] 模板库过滤 `hiddenInLibrary`，旧 `banner-simple` 标记隐藏并保持注册。
- [ ] 实现 `range` 属性控件和 Banner 共用字段布局。
- [ ] 运行测试并提交 `feat: add replacement banner templates`。

### 任务 4：动态导出与完整验收

**文件：**
- 修改：`src/export/package.ts`
- 修改：`src/export/validate.ts`
- 修改：`src/export/render.test.ts`
- 修改：`src/export/package.test.ts`
- 修改：`src/export/ExportDialog.test.tsx`
- 修改：`e2e/editor.spec.ts`

- [ ] 写失败测试：动态高度以 2 倍输出；媒体 URL进入整层区域链接；无图片阻止导出；手动图片的链接为空。
- [ ] 导出流程使用 `getFloorHeight`，整层区域链接读取媒体 URL，长图仍使用实际高度。
- [ ] 预览按动态尺寸渲染；验证 Shopify 图、手动图、拖拽、缩放、重置和两种模板。
- [ ] 运行 `npm test && npm run typecheck && npm run build && npm run test:e2e`。
- [ ] 在 `http://127.0.0.1:5174/` 检查两个模板的默认布局、拖拽状态、文本省略、遮罩和属性面板。
- [ ] 提交 `test: cover banner media and export workflows`。

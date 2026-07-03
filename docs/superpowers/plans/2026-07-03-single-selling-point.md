# 单卖点信息模板实施计划

> **供智能执行者使用：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务执行。所有步骤使用复选框跟踪。

**目标：** 新增可编辑单张图片、可变图片高度和可选按钮的“单卖点信息”楼层模板。

**架构：** 新模板使用独立渲染器和模板定义，复用 `EditableImageFrame`、媒体槽位、主题色位和自动高度导出能力。模板库通过现有注册表自动展示，右侧属性面板通过字段和媒体槽位自动生成控件。

**技术栈：** React、TypeScript、Vitest、Testing Library、Vite。

---

### 任务 1：锁定模板契约

**文件：**
- 修改：`src/templates/registry.test.tsx`

- [x] 增加失败测试，断言“单卖点信息”属于信息分组、自动高度开启、图片高度范围为 100–300px、媒体槽位为 `feature`、主题色位与多卖点一致、完整楼层导出。
- [x] 增加渲染测试，断言默认图片高度为 200px，按钮留空时隐藏，填写后位于图片之后。
- [x] 运行 `npm test -- src/templates/registry.test.tsx`，确认因模板尚未注册而失败。

### 任务 2：实现和注册模板

**文件：**
- 新建：`src/templates/single-selling-point-information/index.tsx`
- 修改：`src/templates/registry.ts`

- [x] 实现标题、可选描述、单张可编辑图片和可选按钮渲染。
- [x] 定义 `imageHeight` 范围字段、`feature` 媒体槽位、颜色字段、主题色位和完整楼层导出区域。
- [x] 将模板注册到两个现有信息模板之间。
- [x] 运行模板测试，确认模板契约通过。

### 任务 3：实现视觉规则

**文件：**
- 修改：`src/templates/templateStyles.css`

- [x] 复用多卖点标题区样式，图片宽度铺满且高度由字段控制。
- [x] 将按钮与图片的间距设为 20px，楼层底部边距设为 24px。
- [x] 运行 `npm test`，确认全部测试通过。

### 任务 4：完整验证与提交

**文件：**
- 验证：全部改动文件

- [x] 运行 `npm run build`，确认类型检查和生产构建通过。
- [x] 运行 `git diff --check`，确认无格式错误。
- [x] 提交模板、测试、样式与中文设计文档。

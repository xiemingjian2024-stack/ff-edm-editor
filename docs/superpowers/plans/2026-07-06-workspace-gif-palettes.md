# 工作台、GIF Banner 与配色管理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成作品生命周期、可创建配色和 GIF Banner 设计能力。

**Architecture:** IndexedDB 分别保存草稿、最近导出快照和自定义配色；编辑器组件保持专注，Banner 动效使用可复用帧序列模型。主页统一展示 EDM 与后续 GIF Banner 作品。

**Tech Stack:** React、TypeScript、IndexedDB、Vitest、html-to-image

---

### Task 1: 作品导航与最近导出

- [x] 编写失败测试：唯一返回入口、草稿/已导出 Tab、复制作品。
- [x] 升级存储，按 EDM ID 覆盖保存最新导出快照。
- [x] 在成功导出后写入快照，并在主页展示和复制。
- [ ] 完整验证并提交。

### Task 2: 自定义配色套餐

- [ ] 编写失败测试：创建、校验、编辑、复制、删除套餐。
- [ ] 增加配色仓库和内联表单，经典套餐保持只读。
- [ ] 完整验证并提交。

### Task 3: Banner 帧动画

- [ ] 编写失败测试：静态/GIF 模式、2–4 帧、排序与帧编辑。
- [ ] 扩展 Banner 数据模型和右侧属性面板，画布循环预览。
- [ ] 导出 GIF，并保持文字按钮覆盖层静止。
- [ ] 完整验证并提交。

### Task 4: 独立 GIF Banner 作品

- [ ] 编写失败测试：从主页新建 GIF Banner、选择两种 Banner 模版。
- [ ] 复用 Banner 编辑器，限制为单 Banner 画布和 Banner 尺寸。
- [ ] 增加 CTA 呼吸缩放预设及最近导出记录。
- [ ] 完整验证并提交。

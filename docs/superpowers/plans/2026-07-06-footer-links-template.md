# 页尾链接模版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增加由固定图片和 1–6 条可编辑链接文案组成的页尾模版，并分区导出 JPG。

**Architecture:** 复用导航项数据承载动态文案，模版通过 DOM 区域标记提供精确切图。右侧属性面板沿用现有数量选择与文案输入逻辑。

**Tech Stack:** React、TypeScript、Vitest、html-to-image

---

### Task 1: 模版与素材

- [x] 先为注册、渲染、数量联动编写失败测试并确认失败。
- [x] 添加两张固定 JPG、页尾 Renderer、注册项和画布样式。
- [x] 在左侧增加“页尾”分组并用展示区图片作为缩略图。

### Task 2: 动态导出

- [x] 先为导出区域顺序与动态数量编写失败测试并确认失败。
- [x] 让 DOM 导出区域按链接数量过滤，并用当前链接文案命名。
- [x] 运行完整测试、构建与本地预览检查。

# EDM 品牌字体设计规格

## 目标

所有 EDM 楼层内容统一使用 Euclid Circular A 品牌字体，确保编辑预览、完整预览和 JPG 导出的字体一致。编辑器界面、草稿名称和属性面板继续使用系统 UI 字体。

## 字体来源与格式

源文件位于 `/Users/ff-sheji/Documents/谢/字体/`。

将以下正常体字重转换为 WOFF2 并放入项目字体资源目录：

- Light：300
- Regular：400
- Medium：500
- Semibold：600
- Bold：700

首版不接入斜体，因为当前模板没有斜体配置需求。

## 使用范围

- `.floor-render` 内所有文字强制使用品牌字体。
- 完整预览复用楼层渲染组件，因此同样使用品牌字体。
- 导出舞台复用楼层渲染组件，因此同样使用品牌字体。
- 编辑器工具栏、模板库、属性面板、草稿首页和弹窗控制文字不使用品牌字体。

## 中文回退

Euclid Circular A 不包含中文字形时，中文回退到系统中文字体。字体栈为：

```css
"Euclid Circular A", "PingFang SC", "Microsoft YaHei", sans-serif
```

英文和其他已包含字符始终优先使用 Euclid Circular A；中文回退仅用于运营草稿标记。

## 加载与导出

- 使用本地 `@font-face`，不依赖外部网络。
- 每个字重声明正确的 `font-weight` 和 `font-style: normal`。
- 使用 `font-display: swap` 保证编辑界面可及时显示。
- 导出前必须等待 `document.fonts.ready`；现有导出流程已包含该等待逻辑。
- 字体加载失败时，浏览器使用回退字体，但开发测试必须检查资源请求无错误。

## 验收

- 楼层英文文本的计算字体为 Euclid Circular A。
- 编辑器 UI 的计算字体不是 Euclid Circular A。
- 300、400、500、600、700 字重均可加载。
- 中文草稿标记可以显示，不出现方框字符。
- 编辑画布、完整预览和 JPG 导出字体一致。
- 字体资源全部来自项目本地，无外部网络请求。
- 单元测试、类型检查、构建和端到端测试通过。

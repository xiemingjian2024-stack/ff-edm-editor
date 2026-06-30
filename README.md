# FunnyFuzzy EDM 搭建器

本项目是一个本地交互原型。运营可以按楼层组合 EDM，限制式修改文案、颜色、图片和 Shopify 商品信息，并导出完整楼层 JPG、点击区域 JPG、完整长图和链接清单。

## 本地运行

需要 Node.js 20 或更高版本。打开两个终端：

```bash
npm install
npm run dev:server
```

```bash
npm run dev
```

浏览器访问终端显示的本地地址。

## 检查命令

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
```

## 原型限制

- 草稿保存在当前浏览器的 IndexedDB 中，清理站点数据会删除草稿。
- Shopify 自动读取需要同时启动本地商品服务。
- JPG 本身不携带链接，请按 `link-manifest.csv` 在投放平台配置。
- 原型不包含账号、云端同步、多人协作或正式部署。

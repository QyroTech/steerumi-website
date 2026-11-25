## 本地开发

推荐 **Node.js 24 LTS**（最低 22.12）。项目使用已有、锁定的依赖，不需要另建 Astro 工程。

```bash
npm install
npm run dev
```

打开终端显示的地址，默认 `http://localhost:4321`。

```bash
npm run build       # Astro 类型检查 + 静态构建，输出 dist/
npm test            # 检查生成页面的结构、资源路径和媒体配置
npm run preview     # 本地预览生产产物
```

可设置 `ASTRO_TELEMETRY_DISABLED=1` 关闭 Astro 遥测。页面使用系统字体，无需请求 Google Fonts。

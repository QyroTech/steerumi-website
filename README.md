# Robotics Research Project Page

基于 **Astro 6、Tailwind CSS 4 和 TypeScript** 的单页学术机器人项目网站。静态生成、无后端；交互仅使用轻量 TypeScript，没有 React 客户端岛、分析服务或第三方视频播放器。

**首页内容在 `src/data/project.ts` 中维护**，包括项目摘要、图表、指标和演示视频。

## 保密与内容状态

- 防索引标签 `noindex, nofollow, noarchive` 与部署保护仍启用。这些标签不构成访问控制；未经许可的内容不得公开。
- **研究内容仅来自提供的 SteerUMI 论文**。采集参数使用论文中的总体部署规模、每实验设备数、采集频率、训练 episode 配额、采样数与延迟，不展示其他研究的数据集统计或采集分类。
- 任务演示只保留论文评估的五项任务：折衣服、折毛巾、堆方块、清理桌面、盖笔帽。原图数值未修改；没有从曲线图猜测未报告的精确数据。
- **01 / SteerUMI Collection** 将五项任务的采集图示和对应任务卡放在同一个模块内，上下对齐；窄屏可一起横向滑动。每个任务有 3 段第一视角录像与 2 张并行采集实拍。点击录像编号切换封面，点击播放时才加载视频。OOD 检测与 AR 引导说明放在模块下方。
- **02 / Automated Policy Iteration** 先展示四轮在线 DAgger 视频，再用四步串联并行采集、上传质检、达到配额后启动训练和部署下一轮。系统总图直接显示在四个步骤下方。**03 / Experiments** 开头展示 5 段真机执行短片，使用 4:3 横向取景，等宽排成一行，窄屏可横向滑动。短片为单独导出的加速版本，仅在播放的前 3 秒于画面右上角标注相对原视频的导出倍速，原视频保留。下方依次是常规 UMI 对比、两次独立运行的重复性、HG-DAgger 对比和 AR 消融。资源项缺少 URL 时不可点击；引用区展示可复制的 BibTeX，部署保护仍保留。
- 本地开发、构建和 Git 推送**不会自动部署**。GitHub Pages workflow 仅手动触发，且检查保密与草稿状态。

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

## 目录结构

```text
src/
  data/project.ts             # 项目信息、论文内容、图表、指标、视频及引用
  layouts/Layout.astro        # 页面外壳、元信息、样式和交互脚本
  pages/index.astro           # 页面区域的组合与顺序
  components/
    Navigation.astro          # 响应式导航
    Hero.astro                # 简洁题目与已配置的资源按钮
    Teaser.astro               # 首屏概览图 / 自定义 teaser
    Abstract.astro
    UmiCollection.astro       # 五任务采集画廊、第一视角录像与并行采集实拍
    Workflow.astro            # 云端学习流程、框架图与 DAgger 视频
    Results.astro              # 逐任务曲线、采集效率、AR 消融与紧凑对比图
    TaskProgressCurves.astro   # 论文图 4 改编的五任务合图，真机主实验仅展示两种方法
    RobotDemonstrations.astro
    VideoGallery.astro        # 任务 / 版本切换，或原生网格与多视角同步
    ProjectFigure.astro       # 响应式优化图片与原图放大
    ImageLightbox.astro       # 原生 dialog，键盘关闭与焦点恢复
    BibTeX.astro
    Footer.astro
  scripts/interactions.ts     # 导航、复制、图片与视频交互
  scripts/task-gallery.ts     # 可访问任务选择与录像版本切换
  styles/site.css             # 新页面的学术视觉层
  styles/global.css           # 保留已有 Tailwind 与 MDX 组件样式
  assets/                     # 论文原图（Astro 本地优化）
public/
  images/                     # 本地视频封面 / 非优化图片
  videos/                     # 本地 MP4（含 58 秒 DAgger 短片和未剪辑版本）
  papers/                     # 将来添加的 PDF
scripts/check-site.mjs         # 静态页面完整性检查
.github/workflows/astro.yml    # 仅手动确认后发布
```

首页不使用模板视频、YouTube 或 3D 示例。论文图的放大链接指向本地原图；缩略图由 Astro 优化。

### Clarity-inspired 视觉与媒体组织

页面借鉴 [Clarity](https://github.com/lorenmt/clarity-template) 的阅读宽度、宽幅插图和媒体切换思路，使用本项目的 Astro / TypeScript / CSS 实现；未导入其全局样式、脚本、付费字体或 Pro 图标。

- 标题下显示 arXiv / Code / BibTeX 资源项；BibTeX 跳转到引用区，未配置真实 URL 的 arXiv / Code 不可点击。
- UMI Collection 位于摘要之后，每张任务卡默认显示第一段 UMI 采集视频（`source` 缺省为 `"umi"`）的封面；点击播放后才替换为原生播放器。
- 采集设置区展示五个任务的多人并行采集照片，上排为开始阶段、下排为后续动作或状态，任务名置于每列下方；点击可查看未裁切大图。
- 摘要最大宽度为 900px，一般正文阅读宽度为 700px，图片和结果内容使用 1120px 宽区域；夜间模式和原始图像保持不变。
- 标题下方的开场视频使用英文讲解 v3 原片。顶部导航仅对应三个正文主章节：**SteerUMI Collection**、**Automated Policy Iteration**、**Experiments**。真机录像（`source: "robot"`）位于实验区顶部，点击封面在原位播放；第一视角录像在 01 的任务卡内切换。
- 在线 DAgger 短片为 58 秒。深蓝背景居中显示仪表盘，没有侧栏；框外短标签标出第 1 轮的关键步骤，背景虚化，采集阶段在原有 `QC passed` 卡片内突出实际进度。第 2–4 轮快进。
- 未启用 JavaScript 时，已选录像以海报链接展示。

## 修改页面内容

编辑 `src/data/project.ts`，展示组件不会硬编码作者、实验指标、外链或视频路径。

### 题目、作者与链接

标题区仅显示论文标题和资源按钮。作者信息可在数据源中维护，但不会在当前标题区显示。

```ts
// 仅填写已核实且获准公开的信息：
authors: [
  { name: "VERIFIED_AUTHOR_NAME", affiliation: "VERIFIED_AFFILIATION", url: "https://AUTHOR_WEBSITE" },
],
resources: [
  { label: "arXiv", url: "https://arxiv.org/abs/VERIFIED_ID" },
  { label: "Code" },
  { label: "BibTeX", url: "#citation" },
],
```

未提供 `url` 的资源按钮显示为不可点击状态，不显示“Link pending”提示，也没有假的 `href="#"`。

### 添加图像 / teaser

推荐将图像放在 `src/assets/` 并导入，交由 Astro 优化：

```ts
import teaserImage from "../assets/teaser.png";
// project.teaser:
figure: {
  image: teaserImage,
  alt: "Accurate description of the actual figure",
  caption: "Verified caption",
},
```

也可使用 `public/images/` 下的文件，配置 `image: "images/figure.png"` 以及真实 `width`、`height`。

视频 teaser 配置：

```ts
teaser: {
  video: "videos/teaser.mp4",
  poster: "images/teaser-poster.jpg",
  caption: "Verified teaser caption",
},
```

首页在标题和资源按钮之后、摘要之前展示英文项目介绍视频。视频显示封面，点击播放器后才播放，不会自动播放或循环。第一视角 UMI 采集与真机执行分别位于摘要之后和实验结果之后。

### 添加论文对应的 MP4

将视频放在 `public/videos/`，海报放在 `public/images/`，再填现有 `VideoItem` 的 `src` 和可选 `poster`：

```ts
{
  id: "fold-clothes",
  label: "Folding clothes",
  src: "videos/fold-clothes.mp4",
  poster: "images/fold-clothes.jpg",
}
```

路径相对 `public/`，**不要**添加 `public/` 或仓库名前缀。所有本地路径经 `withBase()` 自动处理 GitHub Pages 子目录。

每个 `VideoGroup` 可配置：

```ts
{
  id: "evaluated-tasks",            // 同一 gallery 内唯一
  label: "Evaluated manipulation tasks",
  description: "Five tasks reported in the paper",
  columns: 3,                       // 2 或 3，手机自动调整
  sync: false,                      // 不同任务不强制同步
  videos: [/* 仅填写论文对应任务的视频 */],
}
```

- 默认网格布局支持 2/3 列，平板 2 列，小手机 1 列。任务布局只显示所选录像，桌面在侧边展示版本缩略图，手机在播放器下方展示；默认视频比例为 16:9。第一视角 UMI 采集视频配置 `aspectRatio: "1 / 1"`，保留方形画面；各视频使用 contain，不裁切实际画面。
- 原生播放器提供播放/暂停、时间轴和静音等控制；视频默认静音且可循环。
- 各视频使用原生播放器独立播放，不提供批量播放、批量暂停或分组选择控件；组间不是同一示范，**不会**强制逐帧同步。
- `sync: true` 的组会等待所有已配置视角就绪，从同一时间启动，联动原生暂停、seek、播放速率，并定期校正漂移；按最短视角的时长一起循环。
- 同步是浏览器端的近似媒体时间同步，不保证硬件级/逐帧同步。视频应预先裁切到相同起点并尽量保持相同时长、帧率和编码。
- 初始 `preload="none"`，进入视口时仅绑定源/海报，播放才加载媒体。建议提供海报并使用 H.264 MP4、`+faststart` 编码。
- 文件缺失、加载失败或浏览器拒绝播放会显示可读错误状态；页面隐藏时自动暂停。

### 实验结果与 BibTeX

- `results`：主实验展示一张五任务合图（论文图 4 去掉重复性阴影和图例项的版本），最终 TPS 表可展开。叠方块的两次运行和范围仍在独立的重复性实验中；图上位置不作为精确数值来源。HG-DAgger 对比图可点击放大，AR 消融摘要与详细表共用 `ablations` 数据。
- `citation.bibtex`：维护页面中可复制的引用条目。顶部 BibTeX 按钮跳转到引用区。`citation.isDraft: true` 时仍保留隐藏的部署阻断标记；只有核实引用且获准发布后才将草稿状态设为 `false`。
- `footer`：填写确认的研究团队、联系邮箱、仓库 URL、致谢与版权。空值不会虚构信息。

## GitHub Pages 项目子路径

本地默认 `base: "/"`，未指定 `site`，不需要知道将来仓库地址。用环境变量测试目标路径：

```bash
ASTRO_TELEMETRY_DISABLED=1 \
SITE_URL=https://USERNAME.github.io \
BASE_PATH=/REPOSITORY/ \
npm run build

BASE_PATH=/REPOSITORY/ npm test
npm run preview
```

预览访问 `http://localhost:4321/REPOSITORY/`（端口以终端输出为准）。测试结束后，重新执行普通 `npm run build` 恢复根路径。

如果使用用户主页仓库 `USERNAME.github.io`，将 `BASE_PATH=/`。自定义域名时使用真实 `SITE_URL` 和合适的根路径。

## 以后迁移到单独仓库与发布

**下面是未来需要你主动执行的步骤。本次实现没有推送、建立仓库、上传或部署。**

1. 确认保密稿和所有素材可以公开，核对作者、结果、论文内容及版权。
2. 设置 `project.confidential = false`；修正引用草稿并将 `citation.isDraft` 设为 `false`。仅修改开关不能替代实际核验。
3. 建立你选定的仓库 `USERNAME/REPOSITORY`，将本地源码放入该仓库；保留 `package-lock.json`。
4. 在该仓库 Settings → Pages 将 Source 改为 **GitHub Actions**。
5. 在 Actions → **Publish Astro site to GitHub Pages** → Run workflow，输入 `PUBLISH` 手动确认。
6. workflow 自动使用当前仓库的 Pages `origin` 与 `base_path`，运行 `npm ci`、`npm run build`、`npm test`，再上传静态产物并发布。

变更仓库不需要在源码中硬编码 GitHub 用户名；部署路径自动从目标仓库解析。需要改的是 `project.resources` / `footer.repository` 中的真实研究资源链接，以及本地测试使用的 `SITE_URL` / `BASE_PATH`。

workflow 没有 `push` trigger。保密标签或引用草稿未移除时，发布就绪检查会阻止部署。只有在确认内容可公开后，才考虑增加自动部署触发条件。

## 无障碍、性能与隐私

- 原生锚点与平滑导航；遵守 `prefers-reduced-motion`。
- 导航右侧的月亮 / 太阳按钮切换日间与夜间模式。默认跟随系统，手动选择保存在当前浏览器，并同步同源标签页；浏览器存储不可用时仍可切换。主题在首次绘制前初始化；无 JS 时跟随系统。深色模式覆盖正文、占位、表格、图表、引用和弹窗，原始论文图片与视频不反色；打印保持浅色。
- 手机导航支持键盘；“Skip to content”、清晰焦点样式、表格标题及行列 scope。
- 原图 lightbox 使用 `<dialog>`，支持 Escape、关闭按钮、背景点击与焦点恢复；无 JS 时链接仍可打开原图。
- BibTeX 复制失败时自动选中文本，提示手动复制；不假报复制成功。
- 无服务端、统计跟踪、外部视频 embed、运行时 CDN 或 Google 字体。此实现未向外部服务发送论文或图片。
- 将保密稿放在公开静态服务器上仍会暴露内容；`noindex` 不等于私有托管。

## 模板来源与许可

本项目保留既有模板文件，源自 Roman Hauksson-Neill 的 Academic Project Page Template；其原说明标注 **Creative Commons Attribution-ShareAlike 4.0**，并说明借鉴了 Eliahu Horwitz 与 Nerfies 的学术项目模板。沿用模板时请保留相关署名并核对适用许可；论文与实验素材的权利不由模板许可决定。

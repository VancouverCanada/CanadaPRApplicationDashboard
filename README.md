# Canada PR Application Dashboard

## English

### What this project is
An open-source, bilingual (EN/中文) dashboard that aggregates multiple public Google Sheets to show live PR application progress (AOR / BIL / Medical / ADR / PAL / PVO / SVO / PPR / eCOPR). Data refreshes every 30 minutes with server-side caching, deduplication, and light cleanup to make crowd-sourced spreadsheets easier to read. The site is built with Next.js (App Router), Tailwind, Recharts, and Vercel Analytics.

I’m Sebastian, a developer who enjoys shipping useful tools and obsessing over data details. If you find the project helpful, issues and PRs are warmly welcome.

### Core features
- Live aggregation of multiple Google Sheets (see `src/lib/sources.ts` for current list).
- Bilingual UI toggle (EN/中文) with localized copy and abbreviations.
- Key metrics: total visible records, province coverage, ADR/return count, AOR ETA (30d mean), AOR progress, PVO/SVO distribution, province distribution, latest updates, timeline.
- Calculators & analysis: AOR estimator (30-day average), 3-month AOR trend, stage duration analysis (AOR → BIL → Medical → PAL → FD → P1 → P2 → eCOPR/PPR).
- Data hygiene: province normalization, office name cleanup, date validation, outlier drops for timeline spikes.
- Vercel Web Analytics integrated via `@vercel/analytics`.

### Data pipeline & normalization
- Sources: Public Google Sheets, fetched via GViz JSON (`src/lib/sheet.ts`). Defaults are in `SOURCES`; environment overrides via `NEXT_PUBLIC_SHEET_ID` / `NEXT_PUBLIC_SHEET_GID`.
- Refresh & cache: API endpoint `/api/tracker` refreshes on first request, caches in-memory for 30 minutes per source key.
- Header detection: finds a header row by heuristics (`name`, `province`, `pnp`, `stream`).
- Date parsing: accepts ISO-like `YYYY-MM-DD` and GViz `Date(Y, M, D)`; rejects invalid years (<2010 or >2035).
- Submission headers: rows with a date in column 2 and few other values are treated as submission headers; that date is stored as `__submissionDate` for following rows.
- Valid records: must have at least 2 non-empty cells and a non-date-like `name`; rows labeled “total” or with date-like names are dropped.
- Province normalization: maps full names/variants to abbreviations (ON/BC/AB/MB/SK/QC/PE/NB/NS/NL/NT/NU/YT); strips noise.
- Office normalization: ignores blanks, `-`, overlong strings, obvious dates; keeps reasonable PVO/SVO text.
- ADR/stream/name fallback: pulls from multiple column aliases to maximize coverage.

### Calculations & formulas (mirrors the in-app “Math & Formulas” card)
- Timeline: use earliest valid date per record (AOR/AR/medical/etc.). After counting, drop dates whose count > 200 to avoid obvious spreadsheet spikes.
- AOR ETA (30d average): take samples with AOR in the last 30 days; compute mean (AOR - submission). For user input, ETA = submission + mean days.
- AOR trend (last 3 months): bucket by AOR month within last 90 days; average days from submission to AOR per month.
- Stage duration: for records that reached PAL in the window, average (to - from) days per step:
  - AOR → BIL → Medical → PAL → FD → P1 → P2 → eCOPR / PPR
- Latest updates: sort records by latest valid date (pal/aor/bil/medical/etc.), keep those within last 30 days.
- PVO/SVO distribution: clean values and count top 10.
- Province distribution: count normalized province codes.
- Outlier handling: date validation, province/office cleaning, timeline spike filtering (count > 200).

### Running locally
Prerequisites: Node 18+ (Node 20 recommended; repo tested with Node 20), npm.
```bash
npm install
npm run dev
# open http://localhost:3000
```

Build & lint:
```bash
npm run build
npm run lint
```

Environment variables (optional overrides):
- `NEXT_PUBLIC_SHEET_ID` / `NEXT_PUBLIC_SHEET_GID`: override default Google Sheet.
- `NEXT_PUBLIC_SITE_URL`: for absolute links if needed.

### Deployment
- Vercel: works out-of-the-box; includes `@vercel/analytics`.
- Other platforms: any Node environment supporting Next.js App Router. Run `npm run build` then `npm start`.

### Directory guide
- `src/app/page.tsx` — main dashboard UI, filters, charts, normalization post-processing.
- `src/app/api/tracker/route.ts` — data fetch, cache, source merge.
- `src/lib/sheet.ts` — GViz parsing, header detection, record normalization.
- `src/lib/sources.ts` — source list (sheet IDs, gid, labels).
- `src/lib/abbreviations.ts` — bilingual glossary groups.

### Contributing & feedback
- Issues: https://github.com/VancouverCanada/CanadaPRApplicationDashboard/issues
- PRs welcome: please describe data source changes, parsing tweaks, or UI ideas.
- If you want to add a new sheet, include the public link, `sheetId`, and `gid`.

### About the author
Hi, I’m Sebastian (热爱 coding 的人). I enjoy building transparent, data-heavy tools that help people make better decisions. If this dashboard saves you time, consider starring the repo or sharing feedback.

---

## 中文

### 项目简介
这是一个开源的双语（英文/中文）看板，聚合多份公开的 Google 表格，实时展示加拿大 PR 进度（AOR / BIL / 体检 / ADR / PAL / PVO / SVO / PPR / eCOPR）。服务端每 30 分钟刷新并缓存，自动合并、清洗与去重，帮助大家直观看到群体数据。技术栈：Next.js（App Router）、Tailwind、Recharts、Vercel Analytics。

作者自述：我是 Sebastian，一名热爱编码与数据细节的开发者，欢迎通过 Issue/PR 交流与贡献。

### 核心特性
- 多源合并：聚合多张公开 Google Sheet（列表见 `src/lib/sources.ts`）。
- 双语界面：中英文切换，文案和缩写说明同步翻译。
- 关键指标：可见记录数、省份覆盖、有 ADR/Return 数、AOR 预估（30 天均值）、AOR 进度、PVO/SVO 分布、省份分布、最新动态、时间轴。
- 计算与分析：AOR 预估计算器（30 日均值）、近 3 个月 AOR 趋势、阶段耗时分析（AOR → BIL → 体检 → PAL → FD → P1 → P2 → eCOPR/PPR）。
- 数据清洗：省份标准化、签证办公室名称清理、日期校验、时间轴异常值过滤。
- Vercel Web Analytics 内置。

### 数据管线与清洗
- 数据源：公开 Google Sheet，通过 GViz JSON 读取（`src/lib/sheet.ts`）。默认来源写在 `SOURCES`；可用 `NEXT_PUBLIC_SHEET_ID` / `NEXT_PUBLIC_SHEET_GID` 覆盖。
- 刷新与缓存：`/api/tracker` 首次请求拉取数据，并按 source key 缓存 30 分钟。
- 表头识别：通过包含 `name` / `province` / `pnp` / `stream` 的行来定位表头。
- 日期解析：接受 `YYYY-MM-DD` 和 GViz `Date(Y, M, D)`，年份不在 2010–2035 则舍弃。
- 提交分组：第二列出现日期且非空行数少时，视为提交分组头，日期写入 `__submissionDate` 供后续行使用。
- 有效记录：至少 2 个非空字段且有非日期化的 `name`；名称为 “total” 或日期样式的行会被丢弃。
- 省份标准化：把全称/别名转成省份缩写（ON/BC/AB/MB/SK/QC/PE/NB/NS/NL/NT/NU/YT），并清理杂字符。
- 办公室清理：忽略空值、`-`、过长字符串、明显的日期；保留合理的 PVO/SVO 文本。
- ADR/类别/姓名回退：多个候选列兜底，尽量补齐字段。

### 算法与公式（与页面公式卡一致）
- 时间轴：每条记录取最早有效日期（AOR/AR/体检等）计数；计完后剔除计数 > 200 的日期，避免表格批量错误造成尖刺。
- AOR 预估（近 30 天均值）：统计最近 30 天内有 AOR 的样本，平均 (AOR - 提交) 天数；用户输入提交日后，预估 = 提交日 + 均值。
- AOR 趋势（近 3 个月）：按 AOR 发生月份（近 90 天）分桶，计算提交到 AOR 的平均天数。
- 阶段耗时：在时间窗内已到 PAL 的样本，按阶段计算 (到 - 起) 平均天数：
  - AOR → BIL → 体检 → PAL → FD → P1 → P2 → eCOPR / PPR
- 最新动态：按最新有效日期（PAL/AOR/BIL/体检等）排序，取近 30 天记录。
- PVO/SVO 分布：清洗无效值后统计 Top 10。
- 省份分布：基于标准化省份计数。
- 异常处理：日期验证、省份/办公室清洗、时间轴尖刺过滤（>200）。

### 本地运行
前置：Node 18+（推荐 Node 20）、npm。
```bash
npm install
npm run dev
# 浏览器打开 http://localhost:3000
```

构建与检查：
```bash
npm run build
npm run lint
```

可选环境变量：
- `NEXT_PUBLIC_SHEET_ID` / `NEXT_PUBLIC_SHEET_GID`：覆盖默认数据源。
- `NEXT_PUBLIC_SITE_URL`：需要绝对链接时使用。

### 部署
- Vercel：直接部署即可，内置 `@vercel/analytics`。
- 其它平台：支持 Next.js App Router 的 Node 环境即可。运行 `npm run build` 后 `npm start`。

### 目录说明
- `src/app/page.tsx`：主看板 UI、筛选、图表与后处理。
- `src/app/api/tracker/route.ts`：数据获取、缓存、合并。
- `src/lib/sheet.ts`：GViz 解析、表头识别、记录标准化。
- `src/lib/sources.ts`：数据源列表（sheetId、gid、标签）。
- `src/lib/abbreviations.ts`：双语缩写分组。

### 反馈与贡献
- Issue：<https://github.com/VancouverCanada/CanadaPRApplicationDashboard/issues>
- 欢迎 PR：描述数据源变更、解析规则或体验改进。
- 如要添加新表，请附上公开链接、`sheetId`、`gid`。

### 关于作者
Hi，我是 Sebastian，一名热爱 coding 的开发者，喜欢把数据做得透明、可审计、对社区有用。如果这个看板帮到了你，欢迎点亮 Star、分享或留言。***

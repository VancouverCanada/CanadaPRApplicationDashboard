"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SheetRecord, ParsedRecord } from "@/lib/sheet";
import { SOURCES } from "@/lib/sources";
import { ABBREVIATION_GROUPS } from "@/lib/abbreviations";

type Language = "en" | "zh";

const COPY: Record<Language, Record<string, string>> = {
  en: {
    tagline: "Canada PR Live Tracker",
    title: "PR Application Tracker",
    subtitle:
      "Aggregates public Google Sheets to show AOR / Medical / ADR progress in near real time.",
    allCombined: "All Combined",
    viewSources: "View Sources",
    updatedAt: "Updated at",
    statsRecords: "Records",
    statsRecordsHint: "Visible entries after filters",
    statsProvinces: "Provinces",
    statsProvincesHint: "Unique provinces detected",
    statsAdr: "ADR / Returns",
    statsAdrHint: "Contains ADR or Return fields",
    statsProcessing: "AOR ETA (30d avg)",
    statsProcessingHint: "Estimated AOR date using 30-day average",
    statsAorProgress: "AOR Progress",
    statsAorProgressHint:
      "Latest date seen in sheets (submission header / AOR header)",
    filtersTitle: "Filters & Search",
    searchPlaceholder: "Search name / province / stream",
    allProvinces: "All Provinces",
    timelineTitle: "Application Timeline",
    timelineHint: "Counts by earliest date (usually AR/AOR)",
    provinceDistTitle: "Province Distribution",
    latestEventsTitle: "Latest Updates",
    latestEventsHint: "Sorted by latest date within last 30 days",
    noMatches: "No matching records. Try adjusting filters.",
    onlyTop: "Showing top",
    latestNoData: "No recent records.",
    errorLoad: "Load failed",
    loading: "Loading...",
    trendTitle: "AOR Processing Trend (Last 3 Months)",
    trendHint: "Grouped by AOR month, showing average days from submit to AOR",
    calcTitle: "AOR Estimator",
    calcHint: "Based on 30-day average duration",
    submitDate: "Submission Date",
    calcPlaceholder: "Enter submission date to see the estimate (30d avg)",
    calcNotice:
      "Note: Estimates are indicative; actual timelines vary by stream/office.",
    stageTitle: "Stage Duration Analysis",
    stageHint:
      "Based on samples reaching PAL in the last {months} months; average days per stage",
    sampleCount: "Samples",
    abbreviations: "Abbreviations",
    abbreviationsHint: "Grouped by stage",
    recordsListTitle: "Records (latest 50)",
    recordsListHint: "Only first 50 shown; refine search to narrow scope.",
    recordsListCount: "Total {count}",
    tableName: "Name",
    tableProvince: "Province",
    tableStream: "Stream",
    tableEarliest: "Earliest Date",
    tableAdr: "ADR / Return",
    tablePvoSvo: "PVO / SVO",
    tableSource: "Source",
    tableNoMatch: "No matching records. Try adjusting filters.",
    sourcesModalTitle: "All Source Links",
    close: "Close",
    aboutTitle: "About",
    aboutBody:
      "Canada PR Live Tracker is an open-source aggregated dashboard for PR applicants. It merges public Google Sheets (public documents), refreshes every 30 minutes with caching, parses AOR/BIL/ADR dates, filters outliers, maps submission groups, and computes durations. Metrics: AOR progress, 30d mean time, 3-month trend, province breakdown, timeline, and latest updates. Open-source on GitHub; data sources, parsing rules, and caching are transparent. Contributions via PR/Issue are welcome.",
    githubRepo: "GitHub Repo",
    phasesCardTitle: "Phase Duration (last {months} months)",
    pvoTitle: "PVO Distribution",
    svoTitle: "SVO Distribution",
    sampleLabel: "Samples",
  },
  zh: {
    tagline: "Canada PR Live Tracker",
    title: "PR 申请全流程追踪面板",
    subtitle: "聚合公开 Google 表格，展示 AOR / 医学体检 / ADR 等进度。",
    allCombined: "全部合并",
    viewSources: "查看源表",
    updatedAt: "更新于",
    statsRecords: "当前记录",
    statsRecordsHint: "过滤条件后的可见条目",
    statsProvinces: "覆盖省份",
    statsProvincesHint: "基于省份字段聚合",
    statsAdr: "有 ADR/补料",
    statsAdrHint: "包含 ADR 或 Return 字段",
    statsProcessing: "AOR 处理时间预估",
    statsProcessingHint: "最近 30 天平均耗时预估 AOR 日期",
    statsAorProgress: "AOR 进度",
    statsAorProgressHint: "按表中出现的最新日期推断（提交日/AOR 头部日期）",
    filtersTitle: "筛选与搜索",
    searchPlaceholder: "按姓名 / 省份 / 类别搜索",
    allProvinces: "全部省份",
    timelineTitle: "申请时间轴",
    timelineHint: "根据最早日期字段统计每日数量",
    provinceDistTitle: "省份分布",
    latestEventsTitle: "最新动态",
    latestEventsHint: "近 30 天内按最新日期排序",
    noMatches: "没有匹配记录，尝试调整筛选条件。",
    onlyTop: "Top",
    latestNoData: "暂无最新记录。",
    errorLoad: "加载失败",
    loading: "加载中...",
    trendTitle: "AOR 处理时间趋势（近 3 个月）",
    trendHint: "按 AOR 发生月份聚合，展示提交到 AOR 的平均天数",
    calcTitle: "AOR 预估计算器",
    calcHint: "基于最近 30 天平均耗时，估算你的 AOR 日期",
    submitDate: "提交日期",
    calcPlaceholder: "输入提交日期后显示估算结果（近 30 天均值）。",
    calcNotice: "提示：估算仅供参考，实际进度取决于个案、省份、项目及签证办公室。",
    stageTitle: "阶段耗时分析",
    stageHint:
      "基于近 {months} 个月内至少到达 PAL 的样本，统计各阶段平均耗时（天）",
    sampleCount: "样本数",
    abbreviations: "常用缩写说明",
    abbreviationsHint: "按阶段分组",
    recordsListTitle: "记录列表（最新 50 条）",
    recordsListHint: "仅展示前 50 条。可通过搜索缩小范围。",
    recordsListCount: "共 {count} 条",
    tableName: "姓名",
    tableProvince: "省份",
    tableStream: "类别",
    tableEarliest: "最早日期",
    tableAdr: "ADR/返回",
    tablePvoSvo: "PVO / SVO",
    tableSource: "来源",
    tableNoMatch: "没有匹配记录，尝试调整筛选条件。",
    sourcesModalTitle: "全部源表链接",
    close: "关闭",
    aboutTitle: "关于项目",
    aboutBody:
      "Canada PR Live Tracker 是一个开源的聚合式数据看板，面向等待 PR 的申请人。核心能力：1）数据来源：公开 Google Sheet（网络公开文档），多数据源合并；2）数据处理：服务端定期拉取并缓存 30 分钟，解析 AOR/BIL/ADR 等日期字段，过滤异常值，支持提交分组映射与 AOR 时长计算；3）指标与可视化：AOR 进度、近 30 天处理均值、近 3 个月 AOR 平均耗时趋势，分省分布、时间轴、最新动态等；4）开源治理：源码在 GitHub，数据源名单公开，解析规则与缓存策略可审计。欢迎通过 PR/Issue 提供新的数据源、改进解析或优化体验。",
    githubRepo: "GitHub 仓库",
    phasesCardTitle: "阶段耗时分析",
    pvoTitle: "PVO 分布",
    svoTitle: "SVO 分布",
    sampleLabel: "样本数",
  },
};

const getTranslation = (lang: Language) => {
  return (key: string, params?: Record<string, string | number>) => {
    const text = COPY[lang][key] ?? COPY.en[key] ?? key;
    if (!params) return text;
    return Object.entries(params).reduce(
      (acc, [k, v]) => acc.replace(`{${k}}`, String(v)),
      text,
    );
  };
};
type NormalizedRecord = {
  name: string;
  province: string;
  stream: string;
  firstDate: string | null;
  latestDate: string | null;
  adr: string;
  pvo: string;
  svo: string;
  source?: string;
  raw: SheetRecord;
};

const REFRESH_MS = 30 * 60 * 1000; // 30 minutes

const toTitle = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

const toValidDate = (value: unknown): Date | null => {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(value);
  const year = parsed.getUTCFullYear();
  if (Number.isNaN(parsed.getTime())) return null;
  if (year < 2020 || year > 2030) return null;
  return parsed;
};

const normalizeRecords = (records: SheetRecord[]): NormalizedRecord[] => {
  const normalizeProvince = (value: string | undefined | null) => {
    if (!value) return "";
    const cleaned = value.trim().toUpperCase();
    const simplified = cleaned.replace(/[^A-Z]/g, "");

    const map: Record<string, string> = {
      AB: "AB",
      ALBERTA: "AB",
      BC: "BC",
      BRITISHCOLUMBIA: "BC",
      MB: "MB",
      MANITOBA: "MB",
      ON: "ON",
      ONTARIO: "ON",
      PE: "PE",
      PEI: "PE",
      PRINCEEDWARDISLAND: "PE",
      SK: "SK",
      SASKATCHEWAN: "SK",
      NB: "NB",
      NEWBRUNSWICK: "NB",
      NS: "NS",
      NOVASCOTIA: "NS",
      NL: "NL",
      NEWFOUNDLANDANDLABRADOR: "NL",
      NT: "NT",
      NWT: "NT",
      NORTHWESTTERRITORIES: "NT",
      NU: "NU",
      NUNAVUT: "NU",
      YT: "YT",
      YUKON: "YT",
      QC: "QC",
      QUEBEC: "QC",
    };

    if (map[simplified]) return map[simplified];
    if (simplified.includes("OINP") || simplified.includes("ONTARIO")) return "ON";
    if (simplified.includes("BRITISHCOLUMBIA")) return "BC";
    if (simplified.includes("MANITOBA")) return "MB";
    if (simplified.includes("SASKATCHEWAN")) return "SK";
    if (simplified.includes("ALBERTA")) return "AB";
    if (simplified.includes("YUKON")) return "YT";
    if (simplified.includes("NUNAVUT")) return "NU";
    if (simplified.includes("NORTHWESTTERRITORIES") || simplified.includes("NWT")) return "NT";
    return cleaned.length <= 3 ? cleaned : "";
  };

  const normalizeOffice = (value: string | undefined | null) => {
    if (!value) return "";
    const trimmed = value.trim();
    if (!trimmed || trimmed === "-") return "";
    if (toValidDate(trimmed)) return "";
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(trimmed)) return "";
    if (trimmed.length > 40) return "";
    return trimmed;
  };

  const findDate = (record: SheetRecord, selector: "first" | "last") => {
    const dates = Object.entries(record)
      .map(([, value]) => toValidDate(value))
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (!dates.length) return null;
    const picked = selector === "first" ? dates[0] : dates[dates.length - 1];
    return picked.toISOString().slice(0, 10);
  };

  return records.map((record) => {
    const name =
      (record.name as string | undefined) ??
      (record.col_2 as string | undefined) ??
      "";
    const province =
      normalizeProvince((record.province as string | undefined) ??
      (record.col_3 as string | undefined) ??
      "") || "";
    const stream =
      (record.pnp_category as string | undefined) ??
      (record.stream as string | undefined) ??
      (record.col_4 as string | undefined) ??
      "";

    const adrEntry =
      (record.adr_if_any_return_date as string | undefined) ??
      (record.adr as string | undefined) ??
      (record.col_7 as string | undefined) ??
      "";

    const pvoEntry =
      normalizeOffice(record.pvo_inland as string | undefined) ??
      normalizeOffice(record.col_10 as string | undefined) ??
      "";
    const svoEntry =
      normalizeOffice(record.svo_inland as string | undefined) ??
      normalizeOffice(record.col_11 as string | undefined) ??
      "";

    const firstDate = findDate(record, "first");
    const latestDate = findDate(record, "last");

    return {
      name: name.trim(),
      province: province.trim(),
      stream: stream.trim(),
      firstDate,
      latestDate,
      adr: adrEntry?.toString().trim() ?? "",
      pvo: pvoEntry?.toString().trim() ?? "",
      svo: svoEntry?.toString().trim() ?? "",
      source: (record as SheetRecord & { __source?: string }).__source,
      raw: record,
    };
  });
};

const aggregateByProvince = (records: NormalizedRecord[]) => {
  const counts: Record<string, number> = {};
  records.forEach((record) => {
    const province = record.province || "未知";
    counts[province] = (counts[province] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([province, value]) => ({ province, value }))
    .sort((a, b) => b.value - a.value);
};

const aggregateTimeline = (records: NormalizedRecord[]) => {
  const counts: Record<string, number> = {};
  records.forEach((record) => {
    const dateString =
      record.__submissionDate ?? record.firstDate ?? record.latestDate;
    const parsed = toValidDate(dateString);
    if (!parsed) return;
    const key = parsed.toISOString().slice(0, 10);
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const formatDays = (value: number | null, lang: Language) => {
  if (value === null || Number.isNaN(value)) return "-";
  const rounded = Math.round(value);
  return `${rounded} ${lang === "en" ? "days" : "天"}`;
};

const StatsCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-blue-500/5 backdrop-blur">
    <div className="text-sm text-white/70">{label}</div>
    <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    {hint ? <div className="mt-1 text-xs text-white/60">{hint}</div> : null}
  </div>
);

export default function Home() {
  const [records, setRecords] = useState<(ParsedRecord & { __source?: string })[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [query, setQuery] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [sourceKey, setSourceKey] = useState<string>("all");
  const [latestAorDate, setLatestAorDate] = useState<string | null>(null);
  const [showRecords, setShowRecords] = useState(false);
  const [showSourcesModal, setShowSourcesModal] = useState(false);
  const [userSubmissionDate, setUserSubmissionDate] = useState<string>("");
  const [durationWindowMonths, setDurationWindowMonths] = useState(3);
  const [lang, setLang] = useState<Language>("en");
  const t = useMemo(() => getTranslation(lang), [lang]);
  const [visitCount, setVisitCount] = useState<number>(0);

  useEffect(() => {
    // 简单访问计数（本地浏览器持久化），仅在客户端执行一次
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("visit-count");
        const current = raw ? parseInt(raw, 10) || 0 : 0;
        const next = current + 1;
        localStorage.setItem("visit-count", String(next));
        setVisitCount(next);
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const load = async () => {
      try {
        const response = await fetch(
          `/api/tracker?source=${sourceKey}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          throw new Error(t("errorLoad"));
        }
        const data = await response.json();
        if (!active) return;
        setRecords(data.records ?? []);
        setLatestAorDate(data.latestSubmissionWithAor ?? null);
        setLastUpdated(new Date(data.fetchedAt ?? Date.now()));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorLoad"));
      } finally {
        setLoading(false);
        timer = setTimeout(load, REFRESH_MS);
      }
    };

    load();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [sourceKey, lang, t]);

  const normalized = useMemo(() => normalizeRecords(records), [records]);

  const provinces = useMemo(() => {
    const set = new Set(
      normalized
        .map((record) => record.province)
        .filter(Boolean)
        .map((province) => province.toUpperCase()),
    );
    return Array.from(set).sort();
  }, [normalized]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return normalized.filter((record) => {
      const matchesProvince =
        provinceFilter === "all" ||
        record.province.toUpperCase() === provinceFilter;

      if (!matchesProvince) return false;
      if (!keyword) return true;

      return [record.name, record.province, record.stream].some((field) =>
        field.toLowerCase().includes(keyword),
      );
    });
  }, [normalized, query, provinceFilter]);

  const sortedByLatest = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aDate = toValidDate(a.latestDate) ?? toValidDate(a.firstDate);
      const bDate = toValidDate(b.latestDate) ?? toValidDate(b.firstDate);
      if (aDate && bDate) return bDate.getTime() - aDate.getTime();
      if (bDate) return 1;
      if (aDate) return -1;
      return 0;
    });
  }, [filtered]);

  const provinceData = useMemo(
    () => aggregateByProvince(filtered),
    [filtered],
  );
  const timelineData = useMemo(() => aggregateTimeline(filtered), [filtered]);
  const pvoData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((record) => {
      const city = record.pvo || (record.raw.pvo_inland as string) || "";
      if (!city || toValidDate(city)) return;
      const key = city.toString().trim();
      if (!key || key === "-") return;
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([city, value]) => ({ city, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered]);

  const svoData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((record) => {
      const city = record.svo || (record.raw.svo_inland as string) || "";
      if (!city || toValidDate(city)) return;
      const key = city.toString().trim();
      if (!key || key === "-") return;
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([city, value]) => ({ city, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filtered]);

  const durationWindowStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() - durationWindowMonths * 30 * 24 * 60 * 60 * 1000);
  }, [durationWindowMonths]);

  const stepDurations = useMemo(() => {
    const dateFromKeys = (record: SheetRecord, keys: string[]) => {
      for (const key of keys) {
        const value = record[key];
        const parsed = toValidDate(value);
        if (parsed) return parsed;
      }
      return null;
    };

    const steps: { label: string; from: string[]; to: string[] }[] = [
      { label: "AOR → BIL", from: ["aor", "col_5"], to: ["bil", "col_6"] },
      { label: "BIL → Medical", from: ["bil", "col_6"], to: ["medical", "mp", "medical_date_outland", "col_9"] },
      { label: "Medical → PAL", from: ["medical", "mp", "medical_date_outland", "col_9"], to: ["pal", "pre_arrival", "col_13"] },
      { label: "PAL → FD", from: ["pal", "pre_arrival", "col_13"], to: ["fd", "final_decision", "final", "col_14"] },
      { label: "FD → P1", from: ["fd", "final_decision", "final", "col_14"], to: ["p1", "portal1", "col_15"] },
      { label: "P1 → P2", from: ["p1", "portal1", "col_15"], to: ["p2", "portal2", "col_16"] },
      { label: "P2 → PPR", from: ["p2", "portal2", "col_16"], to: ["ppr", "passport_request", "rfv", "col_17"] },
      { label: "PPR → eCOPR", from: ["ppr", "passport_request", "rfv", "col_17"], to: ["ecopr", "copr", "col_18"] },
    ];

    type Stat = { label: string; total: number; count: number };
    const stats: Stat[] = steps.map((s) => ({ label: s.label, total: 0, count: 0 }));

    filtered.forEach((record) => {
      const raw = record.raw as SheetRecord;
      const palDate = dateFromKeys(raw, ["pal", "pre_arrival", "col_13"]);
      if (!palDate) return; // 只统计到 PAL 及之后

      const lastStageDate =
        dateFromKeys(raw, ["ecopr", "copr", "col_18"]) ||
        dateFromKeys(raw, ["ppr", "passport_request", "rfv", "col_17"]) ||
        dateFromKeys(raw, ["p2", "portal2", "col_16"]) ||
        dateFromKeys(raw, ["p1", "portal1", "col_15"]) ||
        dateFromKeys(raw, ["fd", "final_decision", "final", "col_14"]) ||
        palDate;

      if (!lastStageDate || lastStageDate < durationWindowStart) return;

      steps.forEach((step, index) => {
        const from = dateFromKeys(raw, step.from);
        const to = dateFromKeys(raw, step.to);
        if (!from || !to) return;
        const diff = Math.max(
          0,
          Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)),
        );
        stats[index].total += diff;
        stats[index].count += 1;
      });
    });

    return stats.map((s) => ({
      label: s.label,
      avgDays: s.count ? s.total / s.count : null,
      count: s.count,
    }));
  }, [filtered, durationWindowStart]);
  const processingTrend = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    type Bucket = { total: number; count: number };
    const buckets: Record<string, Bucket> = {};

    filtered.forEach((record) => {
      const submission =
        toValidDate(record.__submissionDate) ?? toValidDate(record.firstDate);
      const aorValue =
        toValidDate((record.raw as SheetRecord).aor as string) ||
        toValidDate((record.raw as SheetRecord).col_5 as string) ||
        toValidDate(record.latestDate);

      if (!submission || !aorValue) return;
      if (aorValue < start || aorValue > now) return;

      const diff = Math.max(
        0,
        Math.round(
          (aorValue.getTime() - submission.getTime()) / (24 * 60 * 60 * 1000),
        ),
      );

      const key = aorValue.toISOString().slice(0, 7); // YYYY-MM
      if (!buckets[key]) buckets[key] = { total: 0, count: 0 };
      buckets[key].total += diff;
      buckets[key].count += 1;
    });

    return Object.entries(buckets)
      .map(([month, value]) => ({
        month,
        avgDays: value.count ? value.total / value.count : 0,
        count: value.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);
  const avgProcessingDays = useMemo(() => {
    const now = new Date();
    const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const toDaysDiff = (a: Date, b: Date) =>
      Math.max(0, Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000)));

    let total = 0;
    let count = 0;

    filtered.forEach((record) => {
      const submission =
        toValidDate(record.__submissionDate) ?? toValidDate(record.firstDate);
      const aorValue =
        toValidDate((record.raw as SheetRecord).aor as string) ||
        toValidDate((record.raw as SheetRecord).col_5 as string) ||
        toValidDate(record.latestDate);

      if (!submission || !aorValue) return;
      if (aorValue < days30Ago || aorValue > now) return;

      const diff = toDaysDiff(submission, aorValue);
      total += diff;
      count += 1;
    });

    if (!count) return null;
    return total / count;
  }, [filtered]);

  const avgProcessingDays30 = avgProcessingDays;

  const adrCount = filtered.filter((record) => record.adr).length;
  const latestEvents = useMemo(() => {
    const now = new Date();
    const days30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return [...filtered]
      .filter((record) => {
        const date = toValidDate(record.latestDate);
        return date && date >= days30Ago && date <= now;
      })
      .sort((a, b) => (b.latestDate ?? "").localeCompare(a.latestDate ?? ""))
      .slice(0, 8);
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-blue-500/10 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200/70">
                {t("tagline")}
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-2 text-sm text-white/70">
                {t("subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setLang("en")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    lang === "en"
                      ? "bg-teal-400/90 text-slate-900"
                      : "border border-white/10 bg-white/5 text-white hover:border-teal-200/60"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLang("zh")}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    lang === "zh"
                      ? "bg-teal-400/90 text-slate-900"
                      : "border border-white/10 bg-white/5 text-white hover	border-teal-200/60"
                  }`}
                >
                  中文
                </button>
              </div>
              <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1">
                <button
                  onClick={() => {
                    setLoading(true);
                    setSourceKey("all");
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    sourceKey === "all"
                      ? "bg-teal-400/90 text-slate-900"
                      : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {t("allCombined")}
                  </button>
                {SOURCES.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setLoading(true);
                      setSourceKey(item.key);
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      sourceKey === item.key
                        ? "bg-teal-400/90 text-slate-900"
                        : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {lang === "en" ? item.labelEn : item.labelZh}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowSourcesModal(true)}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-teal-200/60 hover:bg-white/20"
              >
                {t("viewSources")}
              </button>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {lastUpdated
                  ? `${t("updatedAt")} ${lastUpdated.toLocaleTimeString()}`
                  : t("updatedAt")}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              label={t("statsRecords")}
              value={
                lang === "en"
                  ? `${filtered.length}`
                  : `${filtered.length} 条`
              }
              hint={t("statsRecordsHint")}
            />
            <StatsCard
              label={t("statsProvinces")}
              value={
                lang === "en"
                  ? `${provinces.length}`
                  : `${provinces.length} 个`
              }
              hint={t("statsProvincesHint")}
            />
            <StatsCard
              label={t("statsAdr")}
              value={lang === "en" ? `${adrCount}` : `${adrCount} 份`}
              hint={t("statsAdrHint")}
            />
            <StatsCard
              label={t("statsProcessing")}
              value={
                avgProcessingDays !== null
                  ? formatDays(avgProcessingDays, lang)
                  : "-"
              }
              hint={t("statsProcessingHint")}
            />
            <StatsCard
              label={t("statsAorProgress")}
              value={latestAorDate ?? "-"}
              hint={t("statsAorProgressHint")}
            />
          </div>
        </header>

        <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">
              {t("filtersTitle")}
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-teal-200/60 focus:bg-white/15 sm:w-64"
              />
              <select
                value={provinceFilter}
                onChange={(event) => setProvinceFilter(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-teal-200/60 focus:bg-white/15 sm:w-44"
              >
                <option value="all">{t("allProvinces")}</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {t("timelineTitle")}
                </h3>
                <p className="text-xs text-white/60">
                  {t("timelineHint")}
                </p>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    tickMargin={8}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    tickMargin={8}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "white",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22d3ee"
                    fill="url(#colorArea)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {t("provinceDistTitle")}
              </h3>
              <span className="text-xs text-white/60">{t("onlyTop")} 6</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={provinceData.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="province"
                    type="category"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "white",
                    }}
                  />
                  <Bar dataKey="value" fill="#a5b4fc" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t("pvoTitle")}</h3>
              <span className="text-xs text-white/60">{t("onlyTop")} 10</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={pvoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="city"
                    type="category"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "white",
                    }}
                  />
                  <Bar dataKey="value" fill="#34d399" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{t("svoTitle")}</h3>
              <span className="text-xs text-white/60">{t("onlyTop")} 10</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={svoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    type="number"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="city"
                    type="category"
                    tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      color: "white",
                    }}
                  />
                  <Bar dataKey="value" fill="#60a5fa" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{t("stageTitle")}</h3>
              <p className="text-xs text-white/60">
                {t("stageHint", { months: durationWindowMonths })}
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((month) => (
                <button
                  key={month}
                  onClick={() => setDurationWindowMonths(month)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    durationWindowMonths === month
                      ? "bg-teal-400/90 text-slate-900"
                      : "border border-white/10 bg-white/5 text-white hover:border-teal-200/60"
                  }`}
                >
                  {lang === "en" ? `Last ${month} mo` : `近 ${month} 个月`}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stepDurations.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="text-sm font-semibold text-white">
                  {item.label}
                </div>
                <div className="mt-1 text-2xl font-semibold text-white">
                  {formatDays(item.avgDays, lang)}
                </div>
                <div className="text-xs text-white/60">
                  {t("sampleLabel")}：{item.count}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {t("trendTitle")}
                </h3>
                <p className="text-xs text-white/60">
                  {t("trendHint")}
                </p>
              </div>
              <span className="text-xs text-white/60">
                {t("sampleLabel")}：{processingTrend.reduce((sum, item) => sum + item.count, 0)}
              </span>
            </div>
            {processingTrend.length === 0 ? (
              <p className="text-sm text-white/60">
                {lang === "en"
                  ? "No calculable data in last 90 days."
                  : "近 90 天内暂无可计算的数据。"}
              </p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <AreaChart data={processingTrend}>
                    <defs>
                      <linearGradient id="colorProc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                      tickMargin={8}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
                      tickMargin={8}
                      allowDecimals={false}
                      label={{
                      value: lang === "en" ? "days" : "天",
                        angle: -90,
                        position: "insideLeft",
                        fill: "rgba(255,255,255,0.7)",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(15,23,42,0.9)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        color: "white",
                      }}
                    formatter={(value: number) =>
                      `${value.toFixed(1)} ${lang === "en" ? "days" : "天"}`
                    }
                    />
                    <Area
                      type="monotone"
                      dataKey="avgDays"
                      stroke="#f59e0b"
                      fill="url(#colorProc)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{t("calcTitle")}</h3>
                <p className="text-xs text-white/60">{t("calcHint")}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-sm text-white/80">{t("submitDate")}</label>
              <input
                type="date"
                value={userSubmissionDate}
                onChange={(e) => setUserSubmissionDate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none transition focus:border-teal-200/60 focus:bg-white/15"
              />
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                {userSubmissionDate && avgProcessingDays30 !== null ? (
                  <div className="space-y-1">
                    <div>
                      {lang === "en"
                        ? `30d avg duration: ${formatDays(avgProcessingDays30, lang)}`
                        : `最近 30 天平均耗时：${formatDays(avgProcessingDays30, lang)}`}
                    </div>
                    <div className="text-lg font-semibold text-white">
                      {lang === "en" ? "Estimated AOR:" : "预计 AOR："}
                      {(() => {
                        const base = new Date(userSubmissionDate);
                        const estimate = new Date(
                          base.getTime() + avgProcessingDays30 * 24 * 60 * 60 * 1000,
                        );
                        return ` ${estimate.toISOString().slice(0, 10)}`;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div>{t("calcPlaceholder")}</div>
                )}
              </div>
              <p className="text-xs text-white/60">
                {t("calcNotice")}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{t("latestEventsTitle")}</h3>
            <span className="text-xs text-white/60">{t("latestEventsHint")}</span>
          </div>
          <div className="flex flex-col gap-3">
            {latestEvents.slice(0, 5).map((record) => {
              const maskedName =
                record.name && record.name.length > 0
                  ? `${record.name[0].toUpperCase()}***`
                  : lang === "en"
                    ? "Unnamed"
                    : "未命名";
            return (
                <div
                  key={`${record.name}-${record.latestDate}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white">
                      {maskedName}
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs text-emerald-100">
                      {record.latestDate ?? "-"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-white/70">
                    {toTitle(record.stream) || (lang === "en" ? "Unspecified" : "未填写类别")}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/60">
                    {record.province && (
                      <span className="rounded-full bg-white/10 px-2 py-1">
                        {record.province}
                      </span>
                    )}
                    {record.adr && (
                      <span className="rounded-full bg-amber-400/15 px-2 py-1 text-amber-50">
                        ADR: {record.adr}
                      </span>
                    )}
                    {[record.pvo, record.svo].filter(Boolean).length > 0 && (
                      <span className="rounded-full bg-indigo-400/10 px-2 py-1 text-indigo-100">
                        {[record.pvo, record.svo].filter(Boolean).join(" / ")}
                      </span>
                    )}
                    {record.source && (
                      <span className="rounded-full bg-white/10 px-2 py-1">
                        {record.source}
                      </span>
                    )}
                    {record.latestDate && (
                      <span className="rounded-full bg-teal-400/10 px-2 py-1 text-teal-100">
                        {lang === "en" ? "Latest" : "AOR/最新"}: {record.latestDate}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {latestEvents.length === 0 && (
              <p className="text-sm text-white/60">{t("latestNoData")}</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{t("abbreviations")}</h3>
            <span className="text-xs text-white/60">{t("abbreviationsHint")}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ABBREVIATION_GROUPS.map((group) => (
              <div
                key={group.titleEn}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <h4 className="text-sm font-semibold text-white">
                  {lang === "en" ? group.titleEn : group.titleZh}
                </h4>
                <div className="mt-2 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <div key={item.key} className="rounded-xl bg-white/5 px-3 py-2">
                      <div className="text-sm font-semibold text-white">
                        {item.label}
                      </div>
                      <p className="text-xs text-white/70">
                        {lang === "en" ? item.descriptionEn : item.descriptionZh}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <details
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            open={showRecords}
            onToggle={(event) =>
              setShowRecords((event.target as HTMLDetailsElement).open)
            }
          >
            <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white">
              {t("recordsListTitle")}
              <span className="text-xs text-white/60">
                {loading
                  ? t("loading")
                  : t("recordsListCount", { count: filtered.length })}
              </span>
            </summary>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-7 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70">
                <div>{t("tableName")}</div>
                <div>{t("tableProvince")}</div>
                <div>{t("tableStream")}</div>
                <div>{t("tableEarliest")}</div>
                <div>{t("tableAdr")}</div>
                <div>{t("tablePvoSvo")}</div>
                <div>{t("tableSource")}</div>
              </div>
              <div className="divide-y divide-white/5">
                {sortedByLatest.slice(0, 50).map((record, index) => {
                  const maskedName =
                    record.name && record.name.length > 0
                      ? `${record.name[0].toUpperCase()}***`
                      : "-";
                  return (
                    <div
                      key={`${record.name}-${record.latestDate}-${index}`}
                      className="grid grid-cols-7 items-center px-4 py-3 text-sm text-white/80"
                    >
                      <div className="truncate font-medium text-white">
                        {maskedName}
                      </div>
                      <div className="truncate text-white/70">
                        {record.province || "-"}
                      </div>
                      <div className="truncate text-white/70">
                        {record.stream || "-"}
                      </div>
                      <div className="text-white/70">
                        {record.firstDate ?? "-"}
                      </div>
                      <div className="truncate text-teal-200/80">
                        {record.adr || "-"}
                      </div>
                      <div className="truncate text-indigo-200/80">
                        {[record.pvo, record.svo].filter(Boolean).join(" / ") ||
                          "-"}
                      </div>
                      <div className="truncate text-white/60">
                        {record.source ?? "-"}
                      </div>
                    </div>
                  );
                })}
                {sortedByLatest.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-white/60">
                    {t("tableNoMatch")}
                  </div>
                )}
              </div>
            </div>
            {sortedByLatest.length > 50 && (
              <p className="mt-2 text-xs text-white/60">
                {t("recordsListHint")}
              </p>
            )}
          </details>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {t("errorLoad")}：{error}
          </div>
        ) : null}

        {showSourcesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
            <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-slate-900/90 p-5 shadow-2xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{t("sourcesModalTitle")}</h3>
                <button
                  onClick={() => setShowSourcesModal(false)}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                >
                  {t("close")}
                </button>
              </div>
              <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
                {SOURCES.map((item) => (
                  <a
                    key={item.key}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:border-teal-300/60 hover:bg-white/10"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">
                        {lang === "en" ? item.labelEn : item.labelZh}
                      </span>
                      <span className="break-all text-xs text-white/60">
                        {item.link}
                      </span>
                    </div>
                    <span className="shrink-0 rounded-full bg-teal-400/10 px-2 py-1 text-xs text-teal-100">
                      gid: {item.gid}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <footer className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white">{t("aboutTitle")}</h4>
              <p className="text-sm text-white/70">{t("aboutBody")}</p>
              <p className="text-xs text-white/60">
                {lang === "en"
                  ? `Local visits on this device: ${visitCount}`
                  : `当前设备访问次数：${visitCount}`}
              </p>
            </div>
            <a
              href="https://github.com/VancouverCanada/CanadaPRApplicationDashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:border-teal-200/60 hover:bg-white/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.486 2 12.02c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.238-.009-.868-.013-1.703-2.782.605-3.37-1.342-3.37-1.342-.454-1.156-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.532 2.341 1.09 2.91.833.091-.648.35-1.09.636-1.341-2.221-.253-4.556-1.114-4.556-4.957 0-1.095.39-1.99 1.03-2.69-.104-.253-.447-1.272.098-2.65 0 0 .84-.27 2.75 1.028A9.564 9.564 0 0 1 12 6.8c.85.004 1.705.115 2.503.337 1.909-1.298 2.748-1.028 2.748-1.028.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.69 0 3.853-2.339 4.701-4.566 4.95.36.31.681.92.681 1.855 0 1.339-.012 2.42-.012 2.75 0 .268.18.579.688.48A10.022 10.022 0 0 0 22 12.02C22 6.486 17.523 2 12 2Z"
                  clipRule="evenodd"
                />
              </svg>
              {t("githubRepo")}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

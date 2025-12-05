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
      (record.province as string | undefined) ??
      (record.col_3 as string | undefined) ??
      "";
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
      (record.pvo_inland as string | undefined) ??
      (record.col_10 as string | undefined) ??
      "";
    const svoEntry =
      (record.svo_inland as string | undefined) ??
      (record.col_11 as string | undefined) ??
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
    const date = record.firstDate;
    if (!date) return;
    counts[date] = (counts[date] ?? 0) + 1;
  });
  return Object.entries(counts)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
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
          throw new Error("加载失败");
        }
        const data = await response.json();
        if (!active) return;
        setRecords(data.records ?? []);
        setLatestAorDate(data.latestSubmissionWithAor ?? null);
        setLastUpdated(new Date(data.fetchedAt ?? Date.now()));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "加载失败");
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
  }, [sourceKey]);

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
                Canada PR Live Tracker
              </p>
              <h1 className="mt-2 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                PR 申请全流程追踪面板
              </h1>
              <p className="mt-2 text-sm text-white/70">
                实时从公开 Google 表格同步，展示 AOR / 医学体检 / ADR 等进度。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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
                  全部合并
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
                    {item.label}
                  </button>
                ))}
              </div>
              <a
                href={
                  SOURCES.find((item) => item.key === sourceKey)?.link ??
                  SOURCES[0]?.link
                }
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-teal-200/60 hover:bg-white/20"
              >
                查看源表
              </a>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                {lastUpdated
                  ? `更新于 ${lastUpdated.toLocaleTimeString()}`
                  : "实时拉取中"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              label="当前记录"
              value={filtered.length.toString()}
              hint="过滤条件后的可见条目"
            />
            <StatsCard
              label="覆盖省份"
              value={provinces.length.toString()}
              hint="基于省份字段聚合"
            />
            <StatsCard
              label="有 ADR/补料"
              value={adrCount.toString()}
              hint="包含 ADR 或 Return 字段"
            />
            <StatsCard
              label="AOR 处理时间预估"
              value={
                avgProcessingDays !== null
                  ? `${avgProcessingDays.toFixed(1)} 天`
                  : "-"
              }
              hint="近 30 天获 AOR 的提交到 AOR 平均天数"
            />
            <StatsCard
              label="AOR 进度"
              value={latestAorDate ?? "-"}
              hint="按表中出现的最新日期推断（提交日/AOR 头部日期）"
            />
          </div>
        </header>

        <section className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-white">
              筛选与搜索
            </h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="按姓名 / 省份 / 类别搜索"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-teal-200/60 focus:bg-white/15 sm:w-64"
              />
              <select
                value={provinceFilter}
                onChange={(event) => setProvinceFilter(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-0 transition focus:border-teal-200/60 focus:bg-white/15 sm:w-44"
              >
                <option value="all">全部省份</option>
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
                  申请时间轴
                </h3>
                <p className="text-xs text-white/60">
                  根据最早日期字段（通常是 AR/AOR）统计每日数量
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
                省份分布
              </h3>
              <span className="text-xs text-white/60">Top 6</span>
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

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">最新动态</h3>
            <span className="text-xs text-white/60">近 30 天内按最新日期排序</span>
          </div>
          <div className="flex flex-col gap-3">
            {latestEvents.slice(0, 5).map((record) => {
              const maskedName =
                record.name && record.name.length > 0
                  ? `${record.name[0].toUpperCase()}***`
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
                    {toTitle(record.stream) || "未填写类别"}
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
                        AOR/最新: {record.latestDate}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {latestEvents.length === 0 && (
              <p className="text-sm text-white/60">暂无最新日期记录。</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-blue-500/10 backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">常用缩写说明</h3>
            <span className="text-xs text-white/60">按阶段分组</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ABBREVIATION_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <h4 className="text-sm font-semibold text-white">
                  {group.title}
                </h4>
                <div className="mt-2 flex flex-col gap-2">
                  {group.items.map((item) => (
                    <div key={item.key} className="rounded-xl bg-white/5 px-3 py-2">
                      <div className="text-sm font-semibold text-white">
                        {item.label}
                      </div>
                      <p className="text-xs text-white/70">{item.description}</p>
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
              记录列表（最新 50 条）
              <span className="text-xs text-white/60">
                {loading ? "加载中..." : `共 ${filtered.length} 条`}
              </span>
            </summary>
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-7 bg-white/5 px-4 py-2 text-xs font-semibold text-white/70">
                <div>姓名</div>
                <div>省份</div>
                <div>类别</div>
                <div>最早日期</div>
                <div>ADR/返回</div>
                <div>PVO / SVO</div>
                <div>来源</div>
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
                    没有匹配记录，尝试调整筛选条件。
                  </div>
                )}
              </div>
            </div>
            {sortedByLatest.length > 50 && (
              <p className="mt-2 text-xs text-white/60">
                仅展示前 50 条。可通过搜索缩小范围。
              </p>
            )}
          </details>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            数据加载出错：{error}
          </div>
        ) : null}
      </div>
    </div>
  );
}

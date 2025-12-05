import { NextRequest, NextResponse } from "next/server";
import { fetchSheetData } from "@/lib/sheet";
import { SOURCES } from "@/lib/sources";

type CachedEntry = {
  data: unknown;
  fetchedAt: number;
};

const TTL_MS = 30 * 60 * 1000; // 30 minutes
const cache: Map<string, CachedEntry> = new Map();

const buildKey = (source: string) => `tracker_${source}`;

const getSourceList = (sourceKey: string) => {
  if (sourceKey === "all") return SOURCES;
  const match = SOURCES.find((item) => item.key === sourceKey);
  return match ? [match] : [];
};

export async function GET(req: NextRequest) {
  const sourceParam = req.nextUrl.searchParams.get("source") ?? "all";
  const cacheKey = buildKey(sourceParam);
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.fetchedAt < TTL_MS) {
    return NextResponse.json(cached.data);
  }

  const sources = getSourceList(sourceParam);
  if (!sources.length) {
    return NextResponse.json(
      { error: "数据源不存在" },
      { status: 400 },
    );
  }

  const results = await Promise.all(
    sources.map(async (item) => {
      const res = await fetchSheetData({
        sheetId: item.sheetId,
        gid: item.gid,
      });
      return {
        source: item,
        ...res,
      };
    }),
  );

  const mergedRecords = results.flatMap((result) =>
    result.records.map((record) => ({
      ...record,
      __source: result.source.label,
    })),
  );

  const latestAor =
    results
      .map((result) => result.latestSubmissionWithAor)
      .filter((date): date is string => Boolean(date))
      .sort()
      .pop() ?? null;

  const payload = {
    records: mergedRecords,
    latestSubmissionWithAor: latestAor,
    fetchedAt: new Date().toISOString(),
    sourceKey: sourceParam,
  };

  cache.set(cacheKey, { data: payload, fetchedAt: now });

  return NextResponse.json(payload);
}


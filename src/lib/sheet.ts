export type SheetSource = {
  sheetId?: string;
  gid?: string;
};

const defaultSource: Required<SheetSource> = {
  sheetId:
    process.env.NEXT_PUBLIC_SHEET_ID ??
    "1ioxtqGnbHi6khSQ4ErvA1SgLgJgmo2LbPxEb01YRRx8",
  gid: process.env.NEXT_PUBLIC_SHEET_GID ?? "397033753",
};

const buildUrl = (source?: SheetSource) => {
  const sheetId = source?.sheetId ?? defaultSource.sheetId;
  const gid = source?.gid ?? defaultSource.gid;
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${gid}`;
};

type RawCell =
  | {
      v?: string | number | null;
      f?: string | number | null;
    }
  | null;

export type SheetRecord = Record<string, string | number | null>;
export type ParsedRecord = SheetRecord & {
  __submissionDate?: string | null;
};

const normalizeHeader = (header: string | number | null, index: number) => {
  if (!header || typeof header !== "string") {
    return `col_${index + 1}`;
  }

  return header
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .replace(/_{2,}/g, "_");
};

const parseDate = (value: string) => {
  const trimmed = value.trim();
  const gvizMatch = trimmed.match(/^Date\((\d+),\s*(\d+),\s*(\d+)\)$/);

  if (gvizMatch) {
    const [, year, month, day] = gvizMatch.map(Number);
    const parsed = new Date(year, month, day);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
};

const parseCell = (cell: RawCell): string | number | null => {
  if (!cell) return null;
  const raw = cell.v ?? cell.f;
  if (raw === null || raw === undefined) return null;

  if (typeof raw === "string") {
    const maybeDate = parseDate(raw);
    if (maybeDate) return maybeDate;
    return raw.trim();
  }

  if (typeof raw === "number") return raw;

  return null;
};

const extractPayload = (text: string) => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("GViz payload not found");
  }

  return JSON.parse(text.slice(start, end + 1));
};

const rowToValues = (row: { c: RawCell[] }) => row.c.map((cell) => parseCell(cell));

const findHeaderRow = (rows: (string | number | null)[][]) =>
  rows.findIndex((row) =>
    row.some(
      (cell) =>
        typeof cell === "string" &&
        ["name", "province", "pnp", "stream"].some((needle) =>
          cell.toLowerCase().includes(needle),
        ),
    ),
  );

const isMostlyEmpty = (row: (string | number | null)[]) =>
  row.filter((cell) => cell !== null && cell !== "").length < 2;

const looksLikeDateString = (value: string) =>
  Boolean(parseDate(value)) || /^\d{1,2}-[A-Za-z]{3}-\d{4}$/.test(value);

const isDataRow = (row: SheetRecord) => {
  const name = row.name as string | undefined;
  if (name && looksLikeDateString(name)) return false;
  if (name && name.toLowerCase() === "total") return false;

  const nonEmpty = Object.values(row).filter(
    (value) => value !== null && value !== "",
  ).length;

  return nonEmpty >= 2 && Boolean(name);
};

export type SheetResponse = {
  records: ParsedRecord[];
  headers: string[];
  fetchedAt: string;
  latestDateAllCells: string | null;
  latestSubmissionWithAor: string | null;
};

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const toValidIso = (value: string | number | null) => {
  if (typeof value !== "string") return null;
  if (!isIsoDate(value)) return null;
  const parsed = new Date(value);
  const year = parsed.getUTCFullYear();
  if (Number.isNaN(parsed.getTime())) return null;
  if (year < 2010 || year > 2035) return null;
  return value;
};

export const fetchSheetData = async (
  source?: SheetSource,
): Promise<SheetResponse> => {
  const url = buildUrl(source);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("无法读取 Google Sheet 数据");
  }

  const text = await response.text();
  const payload = extractPayload(text);

  const rows = payload?.table?.rows ?? [];
  const rawRows = rows.map(rowToValues);
  const headerIndex = findHeaderRow(rawRows);

  const headerRow =
    headerIndex >= 0 ? rawRows[headerIndex] : rawRows[0] ?? [];
  const headers = headerRow.map(normalizeHeader);

  const aorColumnIndices: number[] = [];
  headers.forEach((header: string, index: number) => {
    if (header.includes("aor")) {
      aorColumnIndices.push(index);
    }
  });
  if (aorColumnIndices.length === 0) {
    // Fallback: in这份表 AOR 通常在第 5 列（索引 4）
    aorColumnIndices.push(4);
  }

  let currentSubmissionDate: string | null = null;
  const submissionDateToMaxAor: Record<string, string> = {};
  let globalMaxAor: string | null = null;

  rawRows.forEach((row: (string | number | null)[]) => {
    const isoAtIndex1 = typeof row[1] === "string" ? toValidIso(row[1]) : null;
    const isoAtIndex0 = typeof row[0] === "string" ? toValidIso(row[0]) : null;
    const headerDate = isoAtIndex1 ?? isoAtIndex0;
    const nonEmpty = row.filter((cell) => cell !== null && cell !== "").length;
    const looksLikeSubmissionHeader = !!headerDate && nonEmpty <= 3;

    if (looksLikeSubmissionHeader) {
      currentSubmissionDate = headerDate;
      return;
    }

    if (currentSubmissionDate) {
      const aorDates = aorColumnIndices
        .map((idx) => row[idx])
        .map((value) => (typeof value === "string" ? toValidIso(value) : null))
        .filter((value): value is string => Boolean(value));

      if (aorDates.length > 0) {
        const maxAorForRow = aorDates.sort().slice(-1)[0];
        if (maxAorForRow) {
          const existing = submissionDateToMaxAor[currentSubmissionDate];
          if (!existing || maxAorForRow > existing) {
            submissionDateToMaxAor[currentSubmissionDate] = maxAorForRow;
          }
          if (!globalMaxAor || maxAorForRow > globalMaxAor) {
            globalMaxAor = maxAorForRow;
          }
        }
      }
    }
  });

  const latestSubmissionWithAor =
    globalMaxAor
      ? Object.entries(submissionDateToMaxAor)
          .filter(([, aorDate]) => aorDate === globalMaxAor)
          .map(([submission]) => submission)
          .sort()
          .pop() ?? null
      : null;

  const latestDateAllCells =
    rawRows
      .flat()
      .map((value: string | number | null) =>
        toValidIso(typeof value === "string" ? value : null),
      )
      .filter((value: string | null): value is string => Boolean(value))
      .sort()
      .pop() ?? null;

  const records: ParsedRecord[] = [];
  let currentSubmissionDateForRecords: string | null = null;

  rawRows.slice(headerIndex + 1).forEach((row: (string | number | null)[]) => {
    const isoAtIndex1 = typeof row[1] === "string" ? toValidIso(row[1]) : null;
    const isoAtIndex0 = typeof row[0] === "string" ? toValidIso(row[0]) : null;
    const headerDate = isoAtIndex1 ?? isoAtIndex0;
    const nonEmpty = row.filter((cell) => cell !== null && cell !== "").length;
    const looksLikeSubmissionHeader = !!headerDate && nonEmpty <= 3;

    if (looksLikeSubmissionHeader) {
      currentSubmissionDateForRecords = headerDate;
      return;
    }

    if (isMostlyEmpty(row)) {
      return;
    }

    const record: ParsedRecord = {};
    headers.forEach((key: string, idx: number) => {
      record[key] = row[idx] ?? null;
    });
    record.__submissionDate = currentSubmissionDateForRecords;

    if (isDataRow(record)) {
      records.push(record);
    }
  });

  return {
    records,
    headers,
    fetchedAt: new Date().toISOString(),
    latestDateAllCells,
    latestSubmissionWithAor,
  };
};

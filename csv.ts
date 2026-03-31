import Papa from "papaparse";

export type CsvRow = Record<string, string>;

export async function loadCsvFromPublic(path: string): Promise<CsvRow[]> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`CSV yüklenemedi: ${path} (HTTP ${res.status})`);
  const text = await res.text();

  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  if (parsed.errors?.length) {
    const first = parsed.errors[0];
    throw new Error(`CSV parse hatası: ${first.message} (satır: ${first.row})`);
  }

  return (parsed.data || []).filter((r) => Object.keys(r).length > 0);
}

export function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}


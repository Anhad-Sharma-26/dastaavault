/**
 * @module section-mapping
 * @description Lookup helpers for the Income Tax Act 1961 ↔ 2025
 * section mapping table.
 *
 * The mapping data lives in `@/data/section-mapping.json` and is
 * imported at build-time via `resolveJsonModule`.
 */

import mappingData from "@/data/section-mapping.json";

/** Shape of a single row in the mapping table. */
export interface SectionEntry {
  old: string;
  new: string;
  name: string;
  typical_deadline_days: number | null;
}

/** Result returned by the lookup helpers. */
export interface SectionLookupResult extends SectionEntry {
  /** Which act version the queried section belongs to. */
  matched_act: "1961" | "2025";
}

// Pre-index for O(1) lookups
const byOld = new Map<string, SectionEntry>();
const byNew = new Map<string, SectionEntry>();

for (const entry of mappingData.sections as SectionEntry[]) {
  byOld.set(entry.old, entry);
  byNew.set(entry.new, entry);
}

/**
 * Look up a section by its 1961-Act number.
 *
 * @param section - e.g. "143(1)"
 * @returns The matching entry or `null`.
 */
export function lookupByOldSection(section: string): SectionEntry | null {
  return byOld.get(section) ?? null;
}

/**
 * Look up a section by its 2025-Act number.
 *
 * @param section - e.g. "221(1)"
 * @returns The matching entry or `null`.
 */
export function lookupByNewSection(section: string): SectionEntry | null {
  return byNew.get(section) ?? null;
}

/**
 * Try both the old and new section indexes.
 *
 * @param section - Section number (could be from either Act).
 * @returns The entry plus which Act it matched, or `null`.
 */
export function lookupSection(section: string): SectionLookupResult | null {
  const oldMatch = byOld.get(section);
  if (oldMatch) {
    return { ...oldMatch, matched_act: "1961" };
  }

  const newMatch = byNew.get(section);
  if (newMatch) {
    return { ...newMatch, matched_act: "2025" };
  }

  return null;
}

/**
 * Return all mapping entries as a summary for inclusion in LLM prompt context.
 */
export function getSectionMappingForPrompt(): SectionEntry[] {
  return mappingData.sections as SectionEntry[];
}

/**
 * Return the mapping dataset version string.
 *
 * @example "2026-11-07_v1"
 */
export function getMappingVersion(): string {
  return mappingData.mapping_version;
}

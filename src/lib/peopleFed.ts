export const PEOPLE_FED_BASE = 400_000;
/** 2026-08-24T00:00:00Z — the day the owner gave the ~400k figure. */
export const PEOPLE_FED_EPOCH = Date.UTC(2026, 7, 24);
/** Fleet-wide rough average, owner-confirmed 2026-08-24. */
export const PEOPLE_FED_PER_DAY = 300;

const MS_PER_DAY = 86_400_000;

/** People fed at `nowMs` (epoch ms). Clamped so early client clocks never dip below base. */
export function peopleFed(nowMs: number): number {
  const elapsed = Math.max(0, nowMs - PEOPLE_FED_EPOCH);
  return PEOPLE_FED_BASE + Math.floor((elapsed / MS_PER_DAY) * PEOPLE_FED_PER_DAY);
}

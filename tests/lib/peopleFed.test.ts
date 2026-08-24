import { describe, expect, it } from "vitest";
import {
  PEOPLE_FED_BASE,
  PEOPLE_FED_EPOCH,
  PEOPLE_FED_PER_DAY,
  peopleFed,
} from "../../src/lib/peopleFed";

const MS_PER_DAY = 86_400_000;
// One person every 288 seconds at 300/day.
const MS_PER_PERSON = MS_PER_DAY / PEOPLE_FED_PER_DAY;

describe("peopleFed", () => {
  it("returns the base figure at the epoch", () => {
    expect(peopleFed(PEOPLE_FED_EPOCH)).toBe(PEOPLE_FED_BASE);
  });

  it("adds the daily rate after one full day", () => {
    expect(peopleFed(PEOPLE_FED_EPOCH + MS_PER_DAY)).toBe(PEOPLE_FED_BASE + PEOPLE_FED_PER_DAY);
  });

  it("floors partial persons", () => {
    expect(peopleFed(PEOPLE_FED_EPOCH + MS_PER_PERSON - 1)).toBe(PEOPLE_FED_BASE);
    expect(peopleFed(PEOPLE_FED_EPOCH + MS_PER_PERSON)).toBe(PEOPLE_FED_BASE + 1);
  });

  it("clamps clocks set before the epoch to the base", () => {
    expect(peopleFed(PEOPLE_FED_EPOCH - MS_PER_DAY)).toBe(PEOPLE_FED_BASE);
  });
});

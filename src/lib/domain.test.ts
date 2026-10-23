import { describe, it, expect } from "vitest";
import { ageOnDate, isEligibleForCategory, advanceMatch, computeStandings } from "./domain";

describe("eligibility uses competition reference date", () => {
  it("age computed on reference date, not today", () => {
    expect(ageOnDate("2015-08-01", "2026-07-31")).toBe(10);
    expect(ageOnDate("2015-08-01", "2026-08-01")).toBe(11);
  });
  it("U-12 rejects a player who is 12 on the reference date", () => {
    expect(isEligibleForCategory("2014-01-01", 12, "2026-06-01")).toBe(false);
    expect(isEligibleForCategory("2015-01-01", 12, "2026-06-01")).toBe(true);
  });
});

describe("match states", () => {
  it("follows Scheduled → Ready → Live → Awaiting → Finalized", () => {
    expect(advanceMatch("scheduled")).toBe("ready");
    expect(advanceMatch("live")).toBe("awaiting");
    expect(advanceMatch("awaiting")).toBe("finalized");
  });
  it("finalized result cannot advance", () => {
    expect(() => advanceMatch("finalized")).toThrow();
  });
});

describe("standings only from official results", () => {
  it("ignores non-finalized matches", () => {
    const s = computeStandings([
      { home: "A", away: "B", homeGoals: 2, awayGoals: 0, state: "finalized" },
      { home: "B", away: "A", homeGoals: 5, awayGoals: 0, state: "awaiting" },
    ]);
    expect(s[0]).toMatchObject({ team: "A", pts: 3, p: 1 });
    expect(s[1]).toMatchObject({ team: "B", pts: 0, p: 1 });
  });
});

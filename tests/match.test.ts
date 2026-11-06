import { describe, expect, it } from "vitest";
import { ageToStage, matchProgram } from "@/lib/match";
import type { Profile, Program } from "@/lib/types";

const base: Profile = {
  residence: { pref: "福岡県", city: "福岡市" },
  parentKind: "mother",
  children: [{ age: 3 }, { age: 9 }, { age: 16 }],
  incomeBand: "lt200",
  housing: "rent",
  employment: "parttime",
  flags: [],
};

function program(partial: Partial<Program>): Program {
  return {
    id: "t",
    name: "t",
    level: "national",
    jurisdiction: {},
    category: "cash",
    summary: "",
    amount: "",
    eligibility: { rules: [], notes: [] },
    applyTo: "",
    howToApply: "",
    sourceUrl: "https://example.com",
    sourceName: "",
    sourceCheckedAt: "2026-11-06",
    ...partial,
  };
}

describe("ageToStage", () => {
  it("maps ages to school stages", () => {
    expect(ageToStage(0)).toBe("preschool");
    expect(ageToStage(5)).toBe("preschool");
    expect(ageToStage(6)).toBe("elementary");
    expect(ageToStage(12)).toBe("junior");
    expect(ageToStage(15)).toBe("high");
    expect(ageToStage(18)).toBe("adult");
  });
});

describe("matchProgram", () => {
  it("is eligible when all rules pass", () => {
    const p = program({
      eligibility: { rules: [{ type: "childAge", max: 18 }, { type: "incomeBand", max: "lt400", soft: true }], notes: [] },
    });
    expect(matchProgram(p, base).status).toBe("eligible");
  });

  it("is 'no' when a hard rule fails (residence)", () => {
    const p = program({
      level: "municipality",
      eligibility: { rules: [{ type: "residence", pref: "福岡県", cities: ["北九州市"] }], notes: [] },
    });
    const r = matchProgram(p, base);
    expect(r.status).toBe("no");
    expect(r.reasons[0]).toContain("北九州市");
  });

  it("is 'check' when only a soft rule fails (income over)", () => {
    const p = program({
      eligibility: { rules: [{ type: "incomeBand", max: "lt130", soft: true }], notes: [] },
    });
    expect(matchProgram(p, base).status).toBe("check");
  });

  it("is 'check' when income is unknown", () => {
    const p = program({ eligibility: { rules: [{ type: "incomeBand", max: "lt300" }], notes: [] } });
    expect(matchProgram(p, { ...base, incomeBand: "unknown" }).status).toBe("check");
  });

  it("hard rule wins over soft rule", () => {
    const p = program({
      eligibility: {
        rules: [
          { type: "incomeBand", max: "lt130", soft: true },
          { type: "childStage", in: ["preschool"] },
        ],
        notes: [],
      },
    });
    expect(matchProgram(p, { ...base, children: [{ age: 10 }] }).status).toBe("no");
  });

  it("childStage passes if any child matches", () => {
    const p = program({ eligibility: { rules: [{ type: "childStage", in: ["high"] }], notes: [] } });
    expect(matchProgram(p, base).status).toBe("eligible");
  });

  it("parentKind bereaved-only excludes mother", () => {
    const p = program({ eligibility: { rules: [{ type: "parentKind", in: ["bereaved"] }], notes: [] } });
    expect(matchProgram(p, base).status).toBe("no");
    expect(matchProgram(p, { ...base, parentKind: "bereaved" }).status).toBe("eligible");
  });
});

import type {
  IncomeBand,
  Profile,
  Program,
  Rule,
  SchoolStage,
} from "./types";

export type MatchStatus = "eligible" | "check" | "no";

export interface MatchResult {
  program: Program;
  status: MatchStatus;
  reasons: string[]; // 「要確認」「対象外」になった理由（人が読む文）
}

const INCOME_ORDER: IncomeBand[] = ["lt130", "lt200", "lt300", "lt400", "ge400"];

export const INCOME_LABEL: Record<IncomeBand, string> = {
  lt130: "130万円未満",
  lt200: "130〜200万円",
  lt300: "200〜300万円",
  lt400: "300〜400万円",
  ge400: "400万円以上",
  unknown: "わからない",
};

export function ageToStage(age: number): SchoolStage {
  if (age <= 5) return "preschool";
  if (age <= 11) return "elementary";
  if (age <= 14) return "junior";
  if (age <= 17) return "high";
  return "adult";
}

export const STAGE_LABEL: Record<SchoolStage, string> = {
  preschool: "未就学",
  elementary: "小学生",
  junior: "中学生",
  high: "高校生",
  adult: "18歳以上",
};

type RuleOutcome = { ok: true } | { ok: false; soft: boolean; reason: string };

function evalRule(rule: Rule, p: Profile): RuleOutcome {
  switch (rule.type) {
    case "residence": {
      if (rule.pref && p.residence.pref !== rule.pref) {
        return { ok: false, soft: false, reason: `${rule.pref}にお住まいの方が対象` };
      }
      if (rule.cities && rule.cities.length > 0 && !rule.cities.includes(p.residence.city)) {
        return { ok: false, soft: false, reason: `${rule.cities.join("・")}にお住まいの方が対象` };
      }
      return { ok: true };
    }
    case "parentKind":
      return rule.in.includes(p.parentKind)
        ? { ok: true }
        : { ok: false, soft: false, reason: "この制度は該当するご家庭の種類が限られています" };
    case "childAge": {
      const hit = p.children.some((c) => c.age <= rule.max);
      return hit
        ? { ok: true }
        : { ok: false, soft: false, reason: `${rule.max}歳以下のお子さんがいるご家庭が対象` };
    }
    case "childCount":
      return p.children.length >= rule.min
        ? { ok: true }
        : { ok: false, soft: false, reason: `お子さん${rule.min}人以上のご家庭が対象` };
    case "childStage": {
      const hit = p.children.some((c) => rule.in.includes(ageToStage(c.age)));
      return hit
        ? { ok: true }
        : {
            ok: false,
            soft: false,
            reason: `${rule.in.map((s) => STAGE_LABEL[s]).join("・")}のお子さんがいるご家庭が対象`,
          };
    }
    case "incomeBand": {
      if (p.incomeBand === "unknown") {
        return { ok: false, soft: true, reason: "所得制限があります。収入の目安で判定できます" };
      }
      const userIdx = INCOME_ORDER.indexOf(p.incomeBand);
      const maxIdx = INCOME_ORDER.indexOf(rule.max);
      if (userIdx <= maxIdx) return { ok: true };
      return {
        ok: false,
        soft: rule.soft ?? false,
        reason: `所得制限の目安（${INCOME_LABEL[rule.max]}）を超えている可能性があります`,
      };
    }
    case "housing":
      return rule.in.includes(p.housing)
        ? { ok: true }
        : { ok: false, soft: false, reason: "今の住まいの状況では対象になりにくい制度です" };
    case "employment":
      return rule.in.includes(p.employment)
        ? { ok: true }
        : { ok: false, soft: rule.soft ?? false, reason: "就労状況によっては対象になります" };
    case "flag":
      return p.flags.includes(rule.key)
        ? { ok: true }
        : { ok: false, soft: rule.soft ?? false, reason: flagReason(rule.key) };
  }
}

function flagReason(key: string): string {
  switch (key) {
    case "wantsQualification":
      return "資格取得や職業訓練を考えている方が対象";
    case "childDisability":
      return "障がいのあるお子さんがいるご家庭が対象";
    default:
      return "条件に当てはまる場合に対象";
  }
}

export function matchProgram(program: Program, p: Profile): MatchResult {
  const reasons: string[] = [];
  let status: MatchStatus = "eligible";
  for (const rule of program.eligibility.rules) {
    const r = evalRule(rule, p);
    if (r.ok) continue;
    reasons.push(r.reason);
    if (!r.soft) {
      status = "no";
    } else if (status === "eligible") {
      status = "check";
    }
  }
  return { program, status, reasons };
}

export function matchAll(programs: Program[], p: Profile): MatchResult[] {
  const order: Record<MatchStatus, number> = { eligible: 0, check: 1, no: 2 };
  return programs
    .map((pr) => matchProgram(pr, p))
    .sort((a, b) => order[a.status] - order[b.status]);
}

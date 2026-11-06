import type { Category, Level, Program } from "./types";
import national from "@/data/national.json";
import fukuokaPref from "@/data/fukuoka-pref.json";
import fukuokaCity from "@/data/fukuoka-city.json";
import kitakyushuCity from "@/data/kitakyushu-city.json";

// すべての制度（ビルド時に静的に束ねる）
export const PROGRAMS: Program[] = [
  ...(national as Program[]),
  ...(fukuokaPref as Program[]),
  ...(fukuokaCity as Program[]),
  ...(kitakyushuCity as Program[]),
];

export function getProgram(id: string): Program | undefined {
  return PROGRAMS.find((p) => p.id === id);
}

// ある居住地の人に関係しうる制度（national + その県 + その市）
// 同じ group 内では、最も身近な実施主体（市 > 県 > 国）のものだけ残す
const LEVEL_RANK: Record<Level, number> = { municipality: 0, prefecture: 1, national: 2 };

export function programsForArea(pref: string, city: string): Program[] {
  const inArea = PROGRAMS.filter((p) => {
    if (p.level === "national") return true;
    if (p.jurisdiction.pref && p.jurisdiction.pref !== pref) return false;
    if (p.level === "municipality") return p.jurisdiction.city === city;
    return true;
  });
  const bestLevel = new Map<string, number>();
  for (const p of inArea) {
    if (!p.group) continue;
    const r = LEVEL_RANK[p.level];
    if (r < (bestLevel.get(p.group) ?? 99)) bestLevel.set(p.group, r);
  }
  return inArea.filter((p) => !p.group || LEVEL_RANK[p.level] === bestLevel.get(p.group));
}

export const CATEGORY_LABEL: Record<Category, string> = {
  cash: "手当・給付",
  medical: "医療費",
  housing: "住まい",
  education: "教育・就学",
  work: "仕事・資格",
  loan: "貸付",
  tax: "税・保険料",
  childcare: "保育・預かり",
  daily: "生活の割引",
  other: "その他",
};

export const LEVEL_LABEL: Record<Level, string> = {
  national: "国",
  prefecture: "県",
  municipality: "市",
};

export function levelLabel(p: Program): string {
  if (p.level === "national") return "国の制度";
  if (p.level === "prefecture") return `${p.jurisdiction.pref}の制度`;
  return `${p.jurisdiction.city}の制度`;
}

// データの最終確認日（フッター表示用）
export function latestCheckedAt(): string {
  return PROGRAMS.reduce((max, p) => (p.sourceCheckedAt > max ? p.sourceCheckedAt : max), "");
}

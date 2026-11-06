import type { Employment, Housing, IncomeBand, ParentKind, Profile } from "./types";

// 診断結果ページのURLに載せるための短い符号化（例: ?a=fukuoka-shi&k=m&c=3,7,10&i=lt200&h=rent&e=parttime&f=q）

export const AREAS = [
  { slug: "fukuoka-shi", pref: "福岡県", city: "福岡市", label: "福岡市" },
  { slug: "kitakyushu-shi", pref: "福岡県", city: "北九州市", label: "北九州市" },
  { slug: "fukuoka-ken", pref: "福岡県", city: "その他", label: "福岡県内のその他の市町村" },
  { slug: "other", pref: "その他", city: "その他", label: "福岡県以外" },
] as const;

export type AreaSlug = (typeof AREAS)[number]["slug"];

export function areaBySlug(slug: string) {
  return AREAS.find((a) => a.slug === slug);
}

const KIND: Record<string, ParentKind> = { m: "mother", f: "father", b: "bereaved" };
const KIND_REV: Record<ParentKind, string> = { mother: "m", father: "f", bereaved: "b" };
const INCOME = new Set<IncomeBand>(["lt130", "lt200", "lt300", "lt400", "ge400", "unknown"]);
const HOUSING = new Set<Housing>(["rent", "own", "public", "family"]);
const EMPLOYMENT = new Set<Employment>(["fulltime", "parttime", "self", "none", "student"]);
const FLAG: Record<string, string> = { q: "wantsQualification", d: "childDisability" };
const FLAG_REV: Record<string, string> = { wantsQualification: "q", childDisability: "d" };

export function encodeProfile(p: Profile): string {
  const area = AREAS.find((a) => a.pref === p.residence.pref && a.city === p.residence.city);
  const sp = new URLSearchParams();
  sp.set("a", area?.slug ?? "other");
  sp.set("k", KIND_REV[p.parentKind]);
  sp.set("c", p.children.map((c) => c.age).join(","));
  sp.set("i", p.incomeBand);
  sp.set("h", p.housing);
  sp.set("e", p.employment);
  const f = p.flags.map((x) => FLAG_REV[x]).filter(Boolean).join("");
  if (f) sp.set("f", f);
  return sp.toString();
}

export function decodeProfile(sp: URLSearchParams): Profile | null {
  const area = areaBySlug(sp.get("a") ?? "");
  const kind = KIND[sp.get("k") ?? ""];
  const ages = (sp.get("c") ?? "")
    .split(",")
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 25);
  const income = sp.get("i") as IncomeBand;
  const housing = sp.get("h") as Housing;
  const employment = sp.get("e") as Employment;
  if (!area || !kind || ages.length === 0) return null;
  const flags = (sp.get("f") ?? "")
    .split("")
    .map((ch) => FLAG[ch])
    .filter(Boolean);
  return {
    residence: { pref: area.pref, city: area.city },
    parentKind: kind,
    children: ages.map((age) => ({ age })),
    incomeBand: INCOME.has(income) ? income : "unknown",
    housing: HOUSING.has(housing) ? housing : "rent",
    employment: EMPLOYMENT.has(employment) ? employment : "parttime",
    flags,
  };
}

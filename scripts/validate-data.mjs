// 制度データ（src/data/*.json）の整合性チェック
// 使い方: npm run validate
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "src/data");
const LEVELS = new Set(["national", "prefecture", "municipality"]);
const CATEGORIES = new Set(["cash", "medical", "housing", "education", "work", "loan", "tax", "childcare", "daily", "other"]);
const PARENT_KINDS = new Set(["mother", "father", "bereaved"]);
const INCOME = new Set(["lt130", "lt200", "lt300", "lt400", "ge400", "unknown"]);
const HOUSING = new Set(["rent", "own", "public", "family"]);
const EMPLOYMENT = new Set(["fulltime", "parttime", "self", "none", "student"]);
const STAGES = new Set(["preschool", "elementary", "junior", "high", "adult"]);
const REQUIRED = ["id", "name", "level", "jurisdiction", "category", "summary", "amount", "eligibility", "applyTo", "howToApply", "sourceUrl", "sourceName", "sourceCheckedAt"];

const errors = [];
const warnings = [];
const ids = new Map();

function checkRule(r, where) {
  const w = `${where} rule[${JSON.stringify(r)}]`;
  switch (r.type) {
    case "residence":
      if (r.cities && !Array.isArray(r.cities)) errors.push(`${w}: cities must be array`);
      break;
    case "parentKind":
      if (!Array.isArray(r.in) || !r.in.every((k) => PARENT_KINDS.has(k))) errors.push(`${w}: bad parentKind`);
      break;
    case "childAge":
      if (typeof r.max !== "number") errors.push(`${w}: max must be number`);
      break;
    case "childCount":
      if (typeof r.min !== "number") errors.push(`${w}: min must be number`);
      break;
    case "childStage":
      if (!Array.isArray(r.in) || !r.in.every((s) => STAGES.has(s))) errors.push(`${w}: bad stage`);
      break;
    case "incomeBand":
      if (!INCOME.has(r.max) || r.max === "unknown") errors.push(`${w}: bad incomeBand`);
      break;
    case "housing":
      if (!Array.isArray(r.in) || !r.in.every((h) => HOUSING.has(h))) errors.push(`${w}: bad housing`);
      break;
    case "employment":
      if (!Array.isArray(r.in) || !r.in.every((e) => EMPLOYMENT.has(e))) errors.push(`${w}: bad employment`);
      break;
    case "flag":
      if (typeof r.key !== "string") errors.push(`${w}: key must be string`);
      break;
    default:
      errors.push(`${w}: unknown rule type`);
  }
}

for (const file of readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"))) {
  const list = JSON.parse(readFileSync(path.join(DATA_DIR, file), "utf8"));
  if (!Array.isArray(list)) {
    errors.push(`${file}: must be an array`);
    continue;
  }
  for (const p of list) {
    const where = `${file}#${p.id ?? "?"}`;
    for (const k of REQUIRED) if (p[k] === undefined || p[k] === "") errors.push(`${where}: missing ${k}`);
    if (ids.has(p.id)) errors.push(`${where}: duplicate id (also in ${ids.get(p.id)})`);
    ids.set(p.id, file);
    if (!LEVELS.has(p.level)) errors.push(`${where}: bad level ${p.level}`);
    if (!CATEGORIES.has(p.category)) errors.push(`${where}: bad category ${p.category}`);
    if (p.level === "national" && Object.keys(p.jurisdiction ?? {}).length) warnings.push(`${where}: national should have empty jurisdiction`);
    if (p.level !== "national" && !p.jurisdiction?.pref) errors.push(`${where}: jurisdiction.pref required`);
    if (p.level === "municipality" && !p.jurisdiction?.city) errors.push(`${where}: jurisdiction.city required`);
    if (p.level !== "national") {
      const hasRes = (p.eligibility?.rules ?? []).some((r) => r.type === "residence");
      if (!hasRes) errors.push(`${where}: non-national program needs a residence rule`);
    }
    if (!Array.isArray(p.eligibility?.rules)) errors.push(`${where}: eligibility.rules must be array`);
    else p.eligibility.rules.forEach((r) => checkRule(r, where));
    if (!Array.isArray(p.eligibility?.notes)) errors.push(`${where}: eligibility.notes must be array`);
    if (!/^https?:\/\//.test(p.sourceUrl ?? "")) errors.push(`${where}: sourceUrl must be http(s)`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.sourceCheckedAt ?? "")) errors.push(`${where}: sourceCheckedAt must be YYYY-MM-DD`);
    if (/要確認/.test(p.amount ?? "")) warnings.push(`${where}: amount is 要確認`);
    if (p.fiscalYear && p.fiscalYear < "2026") warnings.push(`${where}: fiscalYear ${p.fiscalYear} (may be outdated)`);
  }
}

for (const w of warnings) console.warn("warn:", w);
if (errors.length) {
  for (const e of errors) console.error("error:", e);
  console.error(`\n${errors.length} error(s)`);
  process.exit(1);
}
console.log(`OK: ${ids.size} programs, ${warnings.length} warning(s)`);

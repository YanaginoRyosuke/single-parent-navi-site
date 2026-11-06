// 制度データのスキーマ（MVP）
// - 1制度 = 1 Program
// - 判定は eligibility.rules を全て評価し、すべて pass → "eligible"、
//   soft ルールのみ fail / 判定不能 → "check"（要確認）、hard ルール fail → "no"

export type Level = "national" | "prefecture" | "municipality";

export type Category =
  | "cash" // 手当・給付（現金）
  | "medical" // 医療費助成
  | "housing" // 住まい
  | "education" // 教育・就学
  | "work" // 就労・資格
  | "loan" // 貸付
  | "tax" // 税・保険料の減免
  | "childcare" // 保育・預かり・日常生活支援
  | "daily" // 生活支援（割引・減免など）
  | "other";

export type ParentKind = "mother" | "father" | "bereaved"; // 母子 / 父子 / 死別（遺族）
export type IncomeBand = "lt130" | "lt200" | "lt300" | "lt400" | "ge400" | "unknown";
export type Housing = "rent" | "own" | "public" | "family"; // 民間賃貸 / 持ち家 / 公営住宅 / 実家等
export type Employment = "fulltime" | "parttime" | "self" | "none" | "student";
export type SchoolStage = "preschool" | "elementary" | "junior" | "high" | "adult";

// 診断フォームの入力
export interface Profile {
  residence: { pref: string; city: string }; // 例: {pref:"福岡県", city:"福岡市"} / city:"その他"
  parentKind: ParentKind;
  children: { age: number }[]; // 年齢（歳）
  incomeBand: IncomeBand; // 本人の年収帯（目安）
  housing: Housing;
  employment: Employment;
  flags: string[]; // 追加フラグ: "wantsQualification" | "childDisability" | "hasDebtForChildEdu" など
}

export type Rule =
  | { type: "residence"; pref?: string; cities?: string[] } // 居住地。national は付けない
  | { type: "parentKind"; in: ParentKind[] }
  | { type: "childAge"; max: number; note?: string } // 子のうち1人でも max 歳以下（年度末まで等の細則は note）
  | { type: "childCount"; min: number }
  | { type: "childStage"; in: SchoolStage[] } // 子のうち1人でも該当学齢
  | { type: "incomeBand"; max: IncomeBand; soft?: boolean } // 所得制限（目安）。unknown は常に check
  | { type: "housing"; in: Housing[] }
  | { type: "employment"; in: Employment[]; soft?: boolean }
  | { type: "flag"; key: string; soft?: boolean };

export interface Program {
  id: string; // kebab-case, 一意。例: "jp-jido-fuyo-teate", "fukuoka-city-hitorioya-iryo"
  name: string;
  level: Level;
  jurisdiction: { pref?: string; city?: string }; // national は {}
  category: Category;
  summary: string; // 1〜2文。誰に何がもらえる/減るか
  amount: string; // 金額・内容の要点（人が読む文字列）
  eligibility: {
    rules: Rule[];
    notes: string[]; // ルール化できない条件（所得制限の詳細、年度末の扱いなど）
  };
  applyTo: string; // 申請窓口
  howToApply: string; // 申請の流れ
  documents?: string[]; // 主な必要書類
  sourceUrl: string; // 一次情報（公式ページ）
  sourceName: string; // 例: "こども家庭庁", "福岡市"
  sourceCheckedAt: string; // YYYY-MM-DD（確認日）
  fiscalYear?: string; // 例: "2026"（令和8年度）
  tags?: string[];
  group?: string; // 同じ制度の国/県/市版をまとめるキー。同じ地域に複数あれば最も身近な実施主体のものだけ表示する
}

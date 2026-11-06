# 制度データの書き方

`src/data/*.json` は `Program` オブジェクトの配列。型は `src/lib/types.ts` が正。

## 1件の例

```json
{
  "id": "fukuoka-city-hitorioya-iryo",
  "name": "ひとり親家庭等医療費助成",
  "level": "municipality",
  "jurisdiction": { "pref": "福岡県", "city": "福岡市" },
  "category": "medical",
  "summary": "ひとり親家庭の親と子どもの医療費の自己負担を軽くする制度。",
  "amount": "通院：月上限◯円、入院：月上限◯円（公式サイトの数字のみ）",
  "eligibility": {
    "rules": [
      { "type": "residence", "pref": "福岡県", "cities": ["福岡市"] },
      { "type": "childAge", "max": 18, "note": "18歳到達後最初の3月31日まで" },
      { "type": "incomeBand", "max": "lt400", "soft": true }
    ],
    "notes": ["所得制限は扶養人数によって変わります", "生活保護を受けている場合は対象外"]
  },
  "applyTo": "区役所 保険年金課",
  "howToApply": "区役所の窓口で申請。認定後に医療証が届く。",
  "documents": ["健康保険証", "戸籍謄本", "所得証明書"],
  "sourceUrl": "https://www.city.fukuoka.lg.jp/...",
  "sourceName": "福岡市",
  "sourceCheckedAt": "2026-11-06",
  "fiscalYear": "2026",
  "tags": ["multi-child"]
}
```

## ルール（`eligibility.rules`）

すべてのルールを通過 → **該当しそう**。`soft: true` のルールだけ落ちた → **要確認**。`soft` でないルールが落ちた → **対象外**。

| type | 意味 | 例 |
|---|---|---|
| `residence` | 居住地。国の制度には付けない。県制度は `pref` のみ、市制度は `cities` も | `{ "type":"residence", "pref":"福岡県", "cities":["福岡市"] }` |
| `parentKind` | 母子 / 父子 / 死別 のどれが対象か。問わないなら付けない | `{ "type":"parentKind", "in":["bereaved"] }` |
| `childAge` | 子のうち1人でも `max` 歳以下 | `{ "type":"childAge", "max":18, "note":"年度末まで" }` |
| `childCount` | 子の人数が `min` 以上 | `{ "type":"childCount", "min":2 }` |
| `childStage` | 子のうち1人でも該当する学齢（年齢から自動判定: 〜5歳=未就学、6〜11=小、12〜14=中、15〜17=高） | `{ "type":"childStage", "in":["elementary","junior"] }` |
| `incomeBand` | 年収の目安が `max` 以下。所得制限はほぼ扶養人数で変わるので原則 `soft: true` | `{ "type":"incomeBand", "max":"lt300", "soft":true }` |
| `housing` | 今の住まい。公営住宅の入居なら `["rent","family"]` など | `{ "type":"housing", "in":["rent","family"] }` |
| `employment` | 働き方 | `{ "type":"employment", "in":["none","parttime"], "soft":true }` |
| `flag` | 追加の条件。フォームで聞いているのは `wantsQualification`（資格を取りたい）と `childDisability`（障がいのある子） | `{ "type":"flag", "key":"wantsQualification", "soft":true }` |

年収帯: `lt130` (130万未満) / `lt200` / `lt300` / `lt400` / `ge400`。所得制限を「所得額」で書いている制度は、年収に直した目安で1段階ゆるめに置く（取りこぼし防止のため、迷ったら「要確認」に寄せる）。

## 守ること

- 数字は公式サイトに書いてあるものだけ。自信がなければ `amount` に「要確認」と書き、`notes` にその旨を残す
- `sourceUrl` は実際に開いて読んだページ。`sourceCheckedAt` は確認した日
- `fiscalYear` は確認できた年度。古い年度しか取れなければ正直にその年度を書く（`npm run validate` が警告を出す）
- `summary` は当事者が3秒で理解できる平易な文。制度名の言い換えで終わらせない
- 変更したら `npm run validate` と `npm test` を通す

## 新しい自治体を足すとき

1. `src/data/<slug>.json` を作り、`src/lib/programs.ts` の `PROGRAMS` に追加
2. `src/lib/profile-codec.ts` の `AREAS` に `{ slug, pref, city, label }` を追加（診断フォームの選択肢と `/area/<slug>` ページが自動で増える）

# ひとり親ナビ（MVP）

ひとり親家庭（特に子どもが複数いる世帯）が、国・県・市にまたがる支援制度の「取りこぼし」を見つけるための診断サイト。

- 住んでいる市・ご家庭の種類・子どもの年齢・年収の目安などを入れると、関係のある制度を「該当しそう / 要確認 / 対象外」に分けて一覧にする
- 制度ごとに「金額の目安・窓口・申請の流れ・必要書類・出典」を表示
- 自治体ごとの制度一覧ページ（`/area/fukuoka-shi` など）を静的生成（SEO/AIO 用。将来は全国に展開）
- 入力内容は URL のハッシュ（`#` 以降）にだけ載せ、サーバーには送らない

## 動かす

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 本番ビルド
npm test           # 判定ロジックのテスト
npm run validate   # 制度データの整合性チェック
```

### Docker で動かす

```bash
docker compose up --build        # http://localhost:3000
# LINE の URL を埋め込む場合
NEXT_PUBLIC_LINE_URL=https://lin.ee/xxxx docker compose up --build
```

`Dockerfile` は multi-stage（deps → builder → runner）で、Next.js の `output: "standalone"` を使って実行イメージには `node_modules` を含めません。`NEXT_PUBLIC_*` はビルド時に埋め込まれるため、変更時はイメージを作り直してください。

LINE 公式アカウントができたら `.env.local` に `NEXT_PUBLIC_LINE_URL=https://lin.ee/xxxx` を入れると、各ページの LINE 導線が有効になる。

## 構成

```
src/
  app/
    page.tsx                 診断フォーム（トップ）
    result/page.tsx          診断結果（クライアントで判定）
    programs/[id]/page.tsx   制度の詳細（静的生成）
    area/[slug]/page.tsx     自治体ごとの一覧（静的生成）
  components/
    DiagnosisForm.tsx        入力フォーム
    ResultView.tsx           結果表示
    ProgramCard.tsx          制度カード
    LineCta.tsx              LINE 登録導線（NEXT_PUBLIC_LINE_URL が無いと準備中表示）
  lib/
    types.ts                 制度データの型（Program / Rule / Profile）
    match.ts                 判定ロジック（rules を評価して eligible / check / no）
    programs.ts              データの読み込み・自治体別の絞り込み
    profile-codec.ts         入力内容 ⇄ URL ハッシュの変換、対応自治体の定義
  data/
    national.json            国の制度
    fukuoka-pref.json        福岡県の制度
    fukuoka-city.json        福岡市の制度
    kitakyushu-city.json     北九州市の制度
docs/
  data-guide.md              制度データの書き方・追加の仕方
scripts/
  validate-data.mjs          データの整合性チェック
tests/                       判定ロジック・コーデックのテスト
```

## 制度データの考え方

- 1制度 = 1オブジェクト。`eligibility.rules` に判定ルールを並べ、すべて通れば「該当しそう」
- `soft: true` のルール（所得制限の目安など）だけ外れた場合は「要確認」、`soft` でないルールが外れたら「対象外」
- 金額・条件は**公式サイトに書いてある数字だけ**を使い、`sourceUrl` と `sourceCheckedAt` を必ず付ける
- 詳細は [docs/data-guide.md](docs/data-guide.md)

## これからやること（候補）

- [ ] 制度データの精査（「要確認」になっている金額を公式サイトで確定）
- [ ] 福岡県内の他の市町村、九州、全国へ自治体ページを展開（データ収集の自動化が前提）
- [ ] LINE 公式アカウント連携（登録時に市・子どもの年齢を取り、年度改定時に通知）
- [ ] 制度の文脈に沿ったアフィリエイト枠（固定費の見直し、資格講座、養育費保証など）
- [ ] 自治体サイトからの制度情報の自動抽出・更新検知

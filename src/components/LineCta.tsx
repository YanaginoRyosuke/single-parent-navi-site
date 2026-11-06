// LINE登録の導線（プレースホルダー）。
// 公式アカウントができたら NEXT_PUBLIC_LINE_URL にURLを入れるだけで有効になる。
const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL;

export default function LineCta() {
  return (
    <aside className="rounded-[var(--radius)] border border-moss bg-moss-tint p-5">
      <p className="display text-base text-moss-deep">制度は毎年変わります</p>
      <p className="mt-1 text-sm text-ink-soft">
        金額の改定や、お子さんの年齢で新しく使える制度が出たときに、LINEでお知らせします。
        お住まいの市とお子さんの年齢だけ登録すれば、関係のあるものだけ届きます。
      </p>
      {LINE_URL ? (
        <a
          href={LINE_URL}
          className="btn-primary mt-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          LINEで更新を受け取る
        </a>
      ) : (
        <p className="mt-4 text-sm text-ink-mute">（LINE公式アカウントは準備中です）</p>
      )}
    </aside>
  );
}

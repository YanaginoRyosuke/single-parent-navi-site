import DiagnosisForm from "@/components/DiagnosisForm";
import { PROGRAMS } from "@/lib/programs";

export default function Home() {
  const count = PROGRAMS.length;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-10 sm:pt-14">
      <section>
        <h1 className="h-hero">
          もらえるはずのお金、
          <br />
          取りこぼしていませんか
        </h1>
        <p className="mt-5 text-ink-soft">
          ひとり親家庭が使える手当・助成・減免は、国・県・市にまたがって
          {count > 0 ? `${count}件` : "たくさん"}
          あります。でも、申請しないともらえません。
          住んでいる市と子どもの年齢を入れるだけで、あなたの家庭に関係のある制度を一覧にします。
        </p>
        <p className="mt-3 text-sm text-ink-mute">無料、登録なし、入力は2分</p>
      </section>

      <section className="mt-8" aria-label="診断">
        <DiagnosisForm />
      </section>

      <section className="mt-14 text-sm text-ink-soft">
        <h2 className="h-card text-ink">このサイトでできること</h2>
        <p className="mt-2">
          診断結果では、制度ごとに「もらえる金額の目安」「申請する窓口」「必要な書類」をまとめています。
          結果のページを保存しておけば、窓口に行くときにそのまま見せられます。
        </p>
        <p className="mt-2">
          今は福岡県（福岡市・北九州市）の制度を中心に掲載しています。ほかの地域の方も、国の制度は確認できます。
        </p>
      </section>
    </div>
  );
}

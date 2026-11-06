import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LineCta from "@/components/LineCta";
import { CATEGORY_LABEL, PROGRAMS, getProgram, levelLabel } from "@/lib/programs";
import { INCOME_MAX_LABEL, STAGE_LABEL } from "@/lib/match";
import type { Rule } from "@/lib/types";

export function generateStaticParams() {
  return PROGRAMS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/programs/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = getProgram(id);
  if (!p) return {};
  return {
    title: `${p.name}（${levelLabel(p)}）の内容と申請方法`,
    description: p.summary,
  };
}

function ruleToText(r: Rule): string | null {
  switch (r.type) {
    case "residence":
      return r.cities?.length ? `${r.cities.join("・")}にお住まいの方` : r.pref ? `${r.pref}にお住まいの方` : null;
    case "parentKind":
      return `対象：${r.in.map((k) => ({ mother: "母子家庭", father: "父子家庭", bereaved: "死別" })[k]).join("・")}`;
    case "childAge":
      return `${r.max}歳以下のお子さんがいる${r.note ? `（${r.note}）` : ""}`;
    case "childCount":
      return `お子さんが${r.min}人以上`;
    case "childStage":
      return `${r.in.map((s) => STAGE_LABEL[s]).join("・")}のお子さんがいる`;
    case "incomeBand":
      return `所得制限あり（${INCOME_MAX_LABEL[r.max]}が目安）`;
    case "housing":
      return null;
    case "employment":
      return null;
    case "flag":
      return r.key === "wantsQualification" ? "資格取得・職業訓練を考えている" : r.key === "childDisability" ? "障がいのあるお子さんがいる" : null;
  }
}

export default async function ProgramPage({ params }: PageProps<"/programs/[id]">) {
  const { id } = await params;
  const p = getProgram(id);
  if (!p) notFound();

  const conditions = p.eligibility.rules.map(ruleToText).filter((x): x is string => !!x);

  return (
    <article className="mx-auto max-w-2xl px-4 pb-12 pt-8">
      <p className="text-sm text-ink-soft">
        <Link href="/" className="underline">
          トップ
        </Link>
        {" / "}
        {levelLabel(p)} / {CATEGORY_LABEL[p.category]}
      </p>
      <h1 className="h-page mt-3">{p.name}</h1>
      <dl className="mt-4 border-t border-line pt-3">
        <dt className="text-xs text-ink-mute">金額・内容の目安</dt>
        <dd className="figure mt-0.5 text-[17px] leading-relaxed text-moss-deep">{p.amount}</dd>
      </dl>
      <p className="mt-3 text-ink-soft">{p.summary}</p>

      <section className="card mt-8 p-5">
        <h2 className="h-card">対象になる人</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {conditions.map((c) => (
            <li key={c}>{c}</li>
          ))}
          {p.eligibility.notes.map((n) => (
            <li key={n} className="text-ink-soft">
              {n}
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-4 p-5">
        <h2 className="h-card">申請の仕方</h2>
        <dl className="mt-2 space-y-3">
          <div>
            <dt className="text-sm text-ink-soft">窓口</dt>
            <dd className="font-medium">{p.applyTo}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-soft">流れ</dt>
            <dd>{p.howToApply}</dd>
          </div>
          {p.documents && p.documents.length > 0 && (
            <div>
              <dt className="text-sm text-ink-soft">主な必要書類</dt>
              <dd>
                <ul className="list-disc pl-5">
                  {p.documents.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mt-4 text-sm text-ink-soft">
        <p>
          出典：
          <a href={p.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">
            {p.sourceName}
          </a>
          （{p.sourceCheckedAt} 確認{p.fiscalYear ? `・${p.fiscalYear}年度の情報` : ""}）
        </p>
        <p className="mt-1">金額や条件は変わることがあります。申請前に窓口で最新の内容をご確認ください。</p>
      </section>

      <div className="mt-10">
        <LineCta />
      </div>

      <p className="mt-8">
        <Link href="/" className="font-medium text-moss underline">
          自分の家庭で使える制度をまとめて診断する
        </Link>
      </p>
    </article>
  );
}

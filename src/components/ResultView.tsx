"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DiagnosisForm from "./DiagnosisForm";
import LineCta from "./LineCta";
import ProgramCard from "./ProgramCard";
import { INCOME_LABEL, matchAll, type MatchResult } from "@/lib/match";
import { CATEGORY_LABEL, programsForArea } from "@/lib/programs";
import { decodeProfile } from "@/lib/profile-codec";
import type { Category, Profile } from "@/lib/types";

const KIND_LABEL = { mother: "母子家庭", father: "父子家庭", bereaved: "死別" } as const;

export default function ResultView() {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const read = () => {
      const hash = window.location.hash.replace(/^#/, "");
      setProfile(decodeProfile(new URLSearchParams(hash)));
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  if (profile === undefined) {
    return <p className="text-ink-soft">結果を準備しています…</p>;
  }
  if (profile === null) {
    return (
      <div className="card p-6">
        <p className="h-card">診断の内容が見つかりませんでした</p>
        <p className="mt-2 text-sm text-ink-soft">トップページから、もう一度入力してください</p>
        <Link href="/" className="btn-primary mt-4">
          診断をはじめる
        </Link>
      </div>
    );
  }

  const results = matchAll(programsForArea(profile.residence.pref, profile.residence.city), profile);
  const eligible = results.filter((r) => r.status === "eligible");
  const check = results.filter((r) => r.status === "check");
  const no = results.filter((r) => r.status === "no");

  const childrenLabel = profile.children.map((c) => `${c.age}歳`).join("・");

  if (editing) {
    return (
      <div>
        <h1 className="h-page">条件を変える</h1>
        <div className="mt-6">
          <DiagnosisForm initial={profile} />
        </div>
        <button type="button" className="mt-4 text-sm text-ink-soft underline" onClick={() => setEditing(false)}>
          変更せずに結果に戻る
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-ink-soft">
        {profile.residence.city === "その他" ? profile.residence.pref : profile.residence.city}・
        {KIND_LABEL[profile.parentKind]}・お子さん{profile.children.length}人（{childrenLabel}）・年収
        {INCOME_LABEL[profile.incomeBand]}
        <button
          type="button"
          className="ml-2 underline"
          onClick={() => {
            setEditing(true);
            window.scrollTo({ top: 0 });
          }}
        >
          条件を変える
        </button>
      </p>

      <h1 className="h-page mt-3">
        関係のある制度は
        <br />
        <span className="figure text-moss-deep">{eligible.length + check.length}件</span>
        ありました
      </h1>
      <p className="mt-3 text-ink-soft">
        「該当」はこの条件で使える可能性が高いもの、「要確認」は所得など細かい条件で変わるものです。どちらも窓口で聞いてみる価値があります。
      </p>

      <Section
        title="該当"
        count={eligible.length}
        empty="この条件で確実に当てはまりそうな制度は見つかりませんでした。「要確認」の制度を見てください。"
        items={eligible}
      />
      <Section title="要確認" count={check.length} empty="" items={check} />

      <div className="mt-10">
        <LineCta />
      </div>

      {no.length > 0 && (
        <details className="mt-10">
          <summary className="cursor-pointer text-ink-soft">
            今回は対象外の可能性が高い制度（{no.length}件）
          </summary>
          <div className="mt-4 space-y-3">
            {no.map((r) => (
              <ProgramCard key={r.program.id} program={r.program} status={r.status} reasons={r.reasons} />
            ))}
          </div>
        </details>
      )}

      <div className="mt-10 card p-5 text-sm text-ink-soft">
        <p className="h-card text-ink">この結果を残しておく</p>
        <p className="mt-1">
          このページのURLをブックマークするか、自分宛てに送っておくと、窓口に行くときにそのまま使えます。
          入力内容はURLの「#」以降に入っているだけで、サーバーには保存されていません。
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  count,
  empty,
  items,
}: {
  title: string;
  count: number;
  empty: string;
  items: MatchResult[];
}) {
  if (count === 0 && !empty) return null;
  return (
    <section className="mt-10">
      <h2 className="h-section">
        {title}
        <span className="figure ml-2 text-base text-ink-soft">{count}件</span>
      </h2>
      {count === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">{empty}</p>
      ) : (
        groupByCategory(items).map((g) => (
          <div key={g.category} className="mt-5">
            <h3 className="text-sm font-medium text-ink-soft">{CATEGORY_LABEL[g.category]}</h3>
            <div className="mt-2 space-y-3">
              {g.items.map((r) => (
                <ProgramCard key={r.program.id} program={r.program} status={r.status} reasons={r.reasons} />
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function groupByCategory(items: MatchResult[]): { category: Category; items: MatchResult[] }[] {
  const out: { category: Category; items: MatchResult[] }[] = [];
  for (const r of items) {
    const g = out.find((x) => x.category === r.program.category);
    if (g) g.items.push(r);
    else out.push({ category: r.program.category, items: [r] });
  }
  return out;
}

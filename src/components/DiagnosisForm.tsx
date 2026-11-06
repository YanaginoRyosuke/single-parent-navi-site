"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AREAS, encodeProfile } from "@/lib/profile-codec";
import { INCOME_LABEL } from "@/lib/match";
import type { Employment, Housing, IncomeBand, ParentKind, Profile } from "@/lib/types";

const KINDS: { v: ParentKind; label: string }[] = [
  { v: "mother", label: "母子家庭" },
  { v: "father", label: "父子家庭" },
  { v: "bereaved", label: "配偶者と死別" },
];
const INCOMES: IncomeBand[] = ["lt130", "lt200", "lt300", "lt400", "ge400", "unknown"];
const HOUSINGS: { v: Housing; label: string }[] = [
  { v: "rent", label: "民間の賃貸" },
  { v: "public", label: "公営住宅" },
  { v: "own", label: "持ち家" },
  { v: "family", label: "実家・親族の家" },
];
const EMPLOYMENTS: { v: Employment; label: string }[] = [
  { v: "fulltime", label: "正社員・フルタイム" },
  { v: "parttime", label: "パート・契約" },
  { v: "self", label: "自営・フリーランス" },
  { v: "none", label: "休職中・求職中" },
  { v: "student", label: "学生・訓練中" },
];
const FLAGS: { v: string; label: string }[] = [
  { v: "wantsQualification", label: "資格を取って仕事を変えたい" },
  { v: "childDisability", label: "障がいのある子どもがいる" },
];

const AGE_OPTIONS = Array.from({ length: 23 }, (_, i) => i); // 0〜22歳

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" className="chip" data-on={on} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-8 first:mt-0">
      <legend className="display text-lg">{label}</legend>
      {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

export default function DiagnosisForm({ initial }: { initial?: Profile }) {
  const router = useRouter();
  const [area, setArea] = useState<string>(() => {
    if (!initial) return "";
    return AREAS.find((a) => a.pref === initial.residence.pref && a.city === initial.residence.city)?.slug ?? "";
  });
  const [kind, setKind] = useState<ParentKind | "">(initial?.parentKind ?? "");
  const [ages, setAges] = useState<(number | "")[]>(initial?.children.map((c) => c.age) ?? ["", ""]);
  const [income, setIncome] = useState<IncomeBand | "">(initial?.incomeBand ?? "");
  const [housing, setHousing] = useState<Housing | "">(initial?.housing ?? "");
  const [employment, setEmployment] = useState<Employment | "">(initial?.employment ?? "");
  const [flags, setFlags] = useState<string[]>(initial?.flags ?? []);

  const filledAges = ages.filter((a): a is number => a !== "");
  const ready = area && kind && filledAges.length > 0 && income && housing && employment;

  const missing = useMemo(() => {
    const m: string[] = [];
    if (!area) m.push("お住まい");
    if (!kind) m.push("ご家庭の種類");
    if (filledAges.length === 0) m.push("お子さんの年齢");
    if (!income) m.push("年収の目安");
    if (!housing) m.push("住まい");
    if (!employment) m.push("働き方");
    return m;
  }, [area, kind, filledAges.length, income, housing, employment]);

  function submit() {
    if (!ready) return;
    const a = AREAS.find((x) => x.slug === area)!;
    const profile: Profile = {
      residence: { pref: a.pref, city: a.city },
      parentKind: kind as ParentKind,
      children: filledAges.map((age) => ({ age })),
      incomeBand: income as IncomeBand,
      housing: housing as Housing,
      employment: employment as Employment,
      flags,
    };
    // 入力内容はURLのハッシュ（#以降）に載せる。ハッシュはサーバーに送信されない。
    router.push(`/result#${encodeProfile(profile)}`);
  }

  return (
    <form
      className="card p-5 sm:p-7"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <Field label="お住まいはどちらですか">
        {AREAS.map((a) => (
          <Chip key={a.slug} on={area === a.slug} onClick={() => setArea(a.slug)}>
            {a.label}
          </Chip>
        ))}
      </Field>

      <Field label="ご家庭の種類">
        {KINDS.map((k) => (
          <Chip key={k.v} on={kind === k.v} onClick={() => setKind(k.v)}>
            {k.label}
          </Chip>
        ))}
      </Field>

      <fieldset className="mt-8">
        <legend className="display text-lg">お子さんの年齢</legend>
        <p className="mt-1 text-sm text-ink-soft">人数分入れてください。年齢で使える制度が変わります。</p>
        <div className="mt-3 space-y-2">
          {ages.map((age, i) => (
            <div key={i} className="flex items-center gap-2">
              <label className="w-16 shrink-0 text-sm text-ink-soft" htmlFor={`age-${i}`}>
                {i + 1}人目
              </label>
              <select
                id={`age-${i}`}
                className="min-h-12 flex-1 rounded-lg border border-line bg-white px-3"
                value={age}
                onChange={(e) => {
                  const next = [...ages];
                  next[i] = e.target.value === "" ? "" : Number(e.target.value);
                  setAges(next);
                }}
              >
                <option value="">選んでください</option>
                {AGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}歳
                  </option>
                ))}
              </select>
              {ages.length > 1 && (
                <button
                  type="button"
                  className="min-h-12 px-2 text-sm text-ink-soft underline"
                  onClick={() => setAges(ages.filter((_, j) => j !== i))}
                  aria-label={`${i + 1}人目を削除`}
                >
                  削除
                </button>
              )}
            </div>
          ))}
        </div>
        {ages.length < 8 && (
          <button
            type="button"
            className="chip mt-3"
            onClick={() => setAges([...ages, ""])}
          >
            ＋ もう1人追加
          </button>
        )}
      </fieldset>

      <Field label="あなたの年収の目安" hint="だいたいで大丈夫です。手当の所得制限の判定に使います。">
        {INCOMES.map((v) => (
          <Chip key={v} on={income === v} onClick={() => setIncome(v)}>
            {INCOME_LABEL[v]}
          </Chip>
        ))}
      </Field>

      <Field label="今の住まい">
        {HOUSINGS.map((h) => (
          <Chip key={h.v} on={housing === h.v} onClick={() => setHousing(h.v)}>
            {h.label}
          </Chip>
        ))}
      </Field>

      <Field label="働き方">
        {EMPLOYMENTS.map((e) => (
          <Chip key={e.v} on={employment === e.v} onClick={() => setEmployment(e.v)}>
            {e.label}
          </Chip>
        ))}
      </Field>

      <Field label="当てはまるものがあれば" hint="なければそのまま進んでください。">
        {FLAGS.map((f) => (
          <Chip
            key={f.v}
            on={flags.includes(f.v)}
            onClick={() =>
              setFlags(flags.includes(f.v) ? flags.filter((x) => x !== f.v) : [...flags, f.v])
            }
          >
            {f.label}
          </Chip>
        ))}
      </Field>

      <div className="mt-10">
        <button type="submit" className="btn-primary" disabled={!ready}>
          使える制度を見る
        </button>
        {!ready && missing.length > 0 && (
          <p className="mt-2 text-center text-sm text-ink-soft">あと「{missing.join("」「")}」を選ぶと結果が見られます</p>
        )}
        <p className="mt-3 text-center text-xs text-ink-mute">入力内容はこの端末の中だけで使われ、サーバーには送られません。</p>
      </div>
    </form>
  );
}

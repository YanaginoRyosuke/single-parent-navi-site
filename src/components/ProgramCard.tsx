import Link from "next/link";
import type { Program } from "@/lib/types";
import { CATEGORY_LABEL, levelLabel } from "@/lib/programs";
import type { MatchStatus } from "@/lib/match";

const STAMP_LABEL: Record<MatchStatus, string> = {
  eligible: "該当",
  check: "要確認",
  no: "対象外",
};

// 署名：書類に押す検印のような丸いマークで判定を示す
export function Stamp({ status }: { status: MatchStatus }) {
  const label = STAMP_LABEL[status];
  return (
    <span className="stamp" data-status={status} role="img" aria-label={`判定：${label}`}>
      {label}
    </span>
  );
}

export default function ProgramCard({
  program,
  status,
  reasons,
}: {
  program: Program;
  status?: MatchStatus;
  reasons?: string[];
}) {
  const dimmed = status === "no";
  const needsCheck = program.tags?.includes("needs-verification") || /要確認/.test(program.amount);
  return (
    <article className={`card p-5 ${dimmed ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink-mute">
            {levelLabel(program)}
            <span className="mx-2">/</span>
            {CATEGORY_LABEL[program.category]}
            {program.tags?.includes("multi-child") && (
              <>
                <span className="mx-2">/</span>子どもが多いほど手厚い
              </>
            )}
          </p>
          <h3 className="h-card mt-1">
            <Link href={`/programs/${program.id}`} className="hover:underline">
              {program.name}
            </Link>
          </h3>
        </div>
        {status && <Stamp status={status} />}
      </div>

      <dl className="mt-3 border-t border-line pt-3">
        <dt className="text-xs text-ink-mute">金額・内容の目安</dt>
        <dd className="figure mt-0.5 line-clamp-2 leading-snug text-moss-deep">{program.amount}</dd>
      </dl>

      <p className="mt-3 text-sm text-ink-soft">{program.summary}</p>
      {needsCheck && (
        <p className="mt-1 text-xs text-ink-mute">一部の金額や条件は公式サイトで確認できなかったため、窓口での確認が必要です</p>
      )}
      {reasons && reasons.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-sm text-amber">
          {reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-col gap-1 text-sm sm:flex-row sm:items-baseline sm:justify-between">
        <span className="text-ink-soft">窓口：{program.applyTo}</span>
        <Link href={`/programs/${program.id}`} className="shrink-0 text-moss underline">
          申請の方法を見る
        </Link>
      </div>
    </article>
  );
}

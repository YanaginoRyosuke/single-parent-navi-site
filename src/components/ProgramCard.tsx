import Link from "next/link";
import type { Program } from "@/lib/types";
import { CATEGORY_LABEL, levelLabel } from "@/lib/programs";
import type { MatchStatus } from "@/lib/match";

const STATUS: Record<MatchStatus, { label: string; cls: string }> = {
  eligible: { label: "該当しそう", cls: "bg-moss-tint text-moss-deep" },
  check: { label: "要確認", cls: "bg-amber-tint text-amber" },
  no: { label: "対象外の可能性", cls: "bg-paper-deep text-ink-soft" },
};

export function StatusBadge({ status }: { status: MatchStatus }) {
  const s = STATUS[status];
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
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
  return (
    <article className={`card p-4 sm:p-5 ${dimmed ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
        <span className="badge border border-line bg-white">{levelLabel(program)}</span>
        <span>{CATEGORY_LABEL[program.category]}</span>
        {program.tags?.includes("multi-child") && <span>子どもが多いほど手厚い</span>}
        {status && (
          <span className="ml-auto">
            <StatusBadge status={status} />
          </span>
        )}
      </div>
      <h3 className="display mt-2 text-lg">
        <Link href={`/programs/${program.id}`} className="hover:underline">
          {program.name}
        </Link>
      </h3>
      <p className="mt-1 text-[1.05rem] font-bold text-moss-deep">{program.amount}</p>
      <p className="mt-2 text-sm text-ink-soft">{program.summary}</p>
      {reasons && reasons.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-sm text-amber">
          {reasons.map((r) => (
            <li key={r}>・{r}</li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="text-ink-soft">窓口：{program.applyTo}</span>
        <Link href={`/programs/${program.id}`} className="font-medium text-moss underline">
          申請の方法を見る
        </Link>
      </div>
    </article>
  );
}

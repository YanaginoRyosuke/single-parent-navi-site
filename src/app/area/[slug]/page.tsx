import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProgramCard from "@/components/ProgramCard";
import LineCta from "@/components/LineCta";
import { CATEGORY_LABEL, programsForArea } from "@/lib/programs";
import { AREAS, areaBySlug } from "@/lib/profile-codec";
import type { Category } from "@/lib/types";

// 自治体ごとの一覧ページ（SEO用の静的ページ。将来は全国の市区町村分に広げる）
export function generateStaticParams() {
  return AREAS.filter((a) => a.slug !== "other").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/area/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const area = areaBySlug(slug);
  if (!area) return {};
  return {
    title: `${area.label}のひとり親家庭が使える支援制度一覧`,
    description: `${area.label}に住むひとり親家庭（母子家庭・父子家庭）が使える手当・医療費助成・住まい・就学・就労の制度を、国・県・市にまたがって一覧にしました。`,
  };
}

const CATEGORY_ORDER: Category[] = [
  "cash",
  "medical",
  "childcare",
  "education",
  "housing",
  "work",
  "tax",
  "loan",
  "daily",
  "other",
];

export default async function AreaPage({ params }: PageProps<"/area/[slug]">) {
  const { slug } = await params;
  const area = areaBySlug(slug);
  if (!area || area.slug === "other") notFound();

  const programs = programsForArea(area.pref, area.city);
  const grouped = CATEGORY_ORDER.map((c) => ({
    category: c,
    items: programs.filter((p) => p.category === c),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-8">
      <h1 className="display text-[1.7rem] sm:text-[2.1rem]">
        {area.label}のひとり親家庭が
        <br />
        使える支援制度
      </h1>
      <p className="mt-3 text-ink-soft">
        国・福岡県・{area.city === "その他" ? "お住まいの市町村" : area.city}の制度を合わせて{programs.length}件。
        ご家庭の状況を入れると、あなたに関係のあるものだけに絞れます。
      </p>
      <Link href="/" className="btn-primary mt-5">
        2分で自分の家庭に絞る
      </Link>

      {grouped.map((g) => (
        <section key={g.category} className="mt-10">
          <h2 className="display text-xl">{CATEGORY_LABEL[g.category]}</h2>
          <div className="mt-4 space-y-3">
            {g.items.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </section>
      ))}

      <div className="mt-10">
        <LineCta />
      </div>
    </div>
  );
}

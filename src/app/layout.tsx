import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { latestCheckedAt } from "@/lib/programs";

export const metadata: Metadata = {
  title: {
    default: "ひとり親ナビ | もらえるはずの支援を、住んでいる市から探す",
    template: "%s | ひとり親ナビ",
  },
  description:
    "住んでいる市と子どもの年齢を入れるだけで、ひとり親家庭が使える国・県・市の支援制度を一覧にします。無料、登録不要。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const checked = latestCheckedAt();
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line bg-paper">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="display text-[17px] text-ink">
              ひとり親ナビ
            </Link>
            <nav className="flex gap-4 text-sm text-ink-soft">
              <Link href="/area/fukuoka-shi">福岡市</Link>
              <Link href="/area/kitakyushu-shi">北九州市</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-line bg-paper-deep">
          <div className="mx-auto max-w-2xl px-4 py-8 text-sm text-ink-soft">
            <p>
              掲載している制度情報は、各省庁・自治体の公式サイトをもとに
              {checked ? ` ${checked} 時点で` : ""}確認したものです。金額や条件は年度や世帯状況で変わります。
              申請の前に、必ずお住まいの市区町村の窓口で最新の内容をご確認ください。
            </p>
            <p className="mt-3">
              このサイトは申請の代行は行いません。制度の案内と、ご自身で申請するための情報をまとめています。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

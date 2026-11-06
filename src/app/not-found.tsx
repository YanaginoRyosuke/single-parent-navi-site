import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-12">
      <h1 className="display text-2xl">このページは見つかりませんでした</h1>
      <p className="mt-2 text-ink-soft">制度の掲載が終わったか、URLが変わった可能性があります。</p>
      <Link href="/" className="btn-primary mt-6">
        トップに戻る
      </Link>
    </div>
  );
}

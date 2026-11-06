import type { Metadata } from "next";
import ResultView from "@/components/ResultView";

export const metadata: Metadata = {
  title: "診断結果",
  robots: { index: false },
};

export default function ResultPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-12 pt-8">
      <ResultView />
    </div>
  );
}

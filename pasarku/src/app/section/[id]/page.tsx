import { sections } from "@/lib/data";
import { SectionView } from "./SectionView";

// Semua section sudah diketahui saat build → halaman dibuat statis per section.
export function generateStaticParams() {
  return sections.map((s) => ({ id: s.id }));
}

// Halaman boleh "blocking" saat navigasi (params dibaca langsung, tanpa <Suspense>).
export const instant = false;

export default async function SectionPage({ params }: PageProps<"/section/[id]">) {
  const { id } = await params;
  return <SectionView id={id} />;
}

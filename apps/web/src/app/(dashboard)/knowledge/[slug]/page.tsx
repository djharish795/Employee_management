import { KnowledgeDetailClient } from "./KnowledgeDetailClient";

export const metadata = {
  title: "Document | Naprocs EMS",
};

export default function KnowledgeDetailPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-full bg-slate-50">
      <KnowledgeDetailClient slug={params.slug} />
    </div>
  );
}

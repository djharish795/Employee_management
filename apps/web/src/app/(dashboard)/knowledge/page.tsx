import { KnowledgeListClient } from "./KnowledgeListClient";

export const metadata = {
  title: "Knowledge Base | Naprocs EMS",
};

export default function KnowledgePage() {
  return (
    <div className="min-h-full bg-slate-50">
      <KnowledgeListClient />
    </div>
  );
}

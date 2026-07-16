"use client";

import { useEffect, useState } from "react";
import { KnowledgeDoc, knowledgeApi } from "@/lib/api/knowledge";
import { Loader2, FileText, Search, BookOpen, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export function KnowledgeListClient() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    knowledgeApi.list()
      .then(setDocs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            Knowledge Base
          </h1>
          <p className="text-slate-500 font-medium">Company policies, handbooks, and standard operating procedures.</p>
        </div>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search policies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map(doc => {
              const isUnsigned = doc.requiresSignature && (!doc.acknowledgements || doc.acknowledgements.length === 0);
              
              return (
                <Link key={doc.id} href={`/knowledge/${doc.slug}`}>
                  <div className={`h-full p-6 bg-white rounded-2xl border transition-all hover:shadow-md ${isUnsigned ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 hover:border-blue-300'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wide">
                        {doc.category.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{doc.title}</h3>
                    
                    {isUnsigned && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-md mb-4 max-w-max">
                        <AlertTriangle className="w-3.5 h-3.5" /> Signature Required
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span>v{doc.version}</span>
                      <span>{doc.publishedAt ? format(new Date(doc.publishedAt), 'MMM d, yyyy') : 'Draft'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

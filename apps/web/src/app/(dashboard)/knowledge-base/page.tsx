"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, MoreHorizontal, Edit, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { knowledgeApi, KnowledgeDoc } from '@/lib/api/knowledge';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

// Interface for KB Data.
interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'HR Policy' | 'SOP' | 'Compliance' | 'Training';
  status: 'Published' | 'Draft';
  author: string;
  lastUpdated: string;
}

const CATEGORIES = ['All', 'HR Policies', 'SOPs', 'Compliance', 'Training'];

export default function KnowledgeBasePage() {
  const role = useAuthStore((state) => state.role);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState("");
  
  // Loaded documents state
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]); 
  const [rawDocs, setRawDocs] = useState<KnowledgeDoc[]>([]); 
  const [isLoading, setIsLoading] = useState(true);

  // Modal form states
  const [isOpen, setIsOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"POLICY" | "SOP" | "COMPLIANCE" | "TRAINING_MATERIAL" | "HR_GUIDELINES" | "ARCHITECTURE" | "TECHNICAL_DOC">("POLICY");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setEditingDocId(null);
    setTitle("");
    setCategory("POLICY");
    setContent("");
    setIsPublished(false);
    setErrorMsg("");
  };

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const docs = await knowledgeApi.list();
      setRawDocs(docs);
      const mapped = docs.map(doc => {
        let displayCategory: 'HR Policy' | 'SOP' | 'Compliance' | 'Training' = 'HR Policy';
        if (doc.category === 'SOP') displayCategory = 'SOP';
        else if (doc.category === 'COMPLIANCE') displayCategory = 'Compliance';
        else if (doc.category === 'TRAINING_MATERIAL' || doc.category === 'HR_GUIDELINES') displayCategory = 'Training';

        return {
          id: doc.id,
          title: doc.title,
          category: displayCategory,
          status: (doc.isPublished ? 'Published' : 'Draft') as 'Published' | 'Draft',
          author: doc.author ? `${doc.author.firstName} ${doc.author.lastName}` : 'System',
          lastUpdated: doc.publishedAt ? format(new Date(doc.publishedAt), 'MMM d, yyyy') : 'Draft'
        };
      });
      setDocuments(mapped);
    } catch (e) {
      console.error("Failed to load documents", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSaving(true);
    try {
      if (editingDocId) {
        await knowledgeApi.update(editingDocId, {
          title,
          content,
          category,
          isPublished
        });
      } else {
        await knowledgeApi.create({
          title,
          content,
          category,
          isPublished
        });
      }
      setIsOpen(false);
      resetForm();
      fetchDocs(); // Refresh the list
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || "Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }
    try {
      await knowledgeApi.delete(id);
      fetchDocs(); // Refresh the list
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message || "Failed to delete document");
    }
  };

  // Protect route: Only HR can access (Knowledge base management is HR-only per rules)
  if (role !== "HR" && role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only authorized personnel can manage the Knowledge Base.</p>
      </div>
    );
  }

  // Derived state (exactly matching the original layout logic + case-insensitive search check)
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(search.toLowerCase()) || 
      doc.author.toLowerCase().includes(search.toLowerCase()) ||
      doc.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'All') return true;
    if (activeCategory === 'HR Policies' && doc.category === 'HR Policy') return true;
    if (activeCategory === 'SOPs' && doc.category === 'SOP') return true;
    if (activeCategory === 'Compliance' && doc.category === 'Compliance') return true;
    if (activeCategory === 'Training' && doc.category === 'Training') return true;
    return false;
  });

  return (
    <div className="flex flex-col h-full font-sans bg-white overflow-y-auto">
      
      {/* Header section matching screenshot exactly */}
      <div className="border-b border-slate-200 px-8 py-6">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Knowledge Base</h1>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 bg-slate-100 text-slate-600 text-sm font-medium rounded-full border border-slate-200 shadow-sm">
              {documents.length} documents
            </span>
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setIsOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> New document
          </button>
        </div>

        {/* Categories / Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition-colors whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest w-[35%]">Title</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Author</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Last Updated</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px]">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      Loading documents...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">
                      <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{doc.title}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-md">
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {doc.status === 'Published' ? (
                          <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-md">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-md">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{doc.author}</td>
                      <td className="px-6 py-4 text-slate-500">{doc.lastUpdated}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              const rawDoc = rawDocs.find(d => d.id === doc.id);
                              if (rawDoc) {
                                setEditingDocId(rawDoc.id);
                                setTitle(rawDoc.title);
                                setCategory(rawDoc.category as any);
                                setContent(rawDoc.content);
                                setIsPublished(rawDoc.isPublished);
                                setIsOpen(true);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            className="text-rose-600 hover:text-rose-800 font-semibold text-xs"
                          >
                            Delete
                          </button>
                          <button className="text-slate-400 hover:text-slate-700"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500 bg-slate-50/50">
            <span>Showing 1-{filteredDocs.length} of {documents.length}</span>
          </div>
        </div>

      </div>

      <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
        <DialogContent className="sm:max-w-[550px] p-0 border-slate-200 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-lg font-bold text-slate-900">
              {editingDocId ? "Edit Document" : "New Document"}
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500">
              {editingDocId 
                ? "Update this policy, SOP, training material, or compliance doc."
                : "Create a new policy, SOP, training material, or compliance doc."}
            </DialogDescription>
          </DialogHeader>
          <form 
            onSubmit={handleSubmit}
            className="p-6 space-y-4"
          >
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Leave Policy 2026"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors h-9"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors h-9"
              >
                <option value="POLICY">HR Policy</option>
                <option value="SOP">SOP</option>
                <option value="COMPLIANCE">Compliance</option>
                <option value="TRAINING_MATERIAL">Training</option>
                <option value="HR_GUIDELINES">HR Guidelines</option>
                <option value="ARCHITECTURE">Architecture</option>
                <option value="TECHNICAL_DOC">Technical Doc</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Content</label>
              <textarea 
                rows={5}
                required
                placeholder="Write the document content here..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input 
                id="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
                className="w-4 h-4 border-slate-300 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
              <label htmlFor="isPublished" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Publish immediately (make visible to all employees)
              </label>
            </div>

            <DialogFooter className="pt-4 flex gap-2 sm:justify-end border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => {
                  setIsOpen(false);
                  setErrorMsg("");
                }} 
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-colors disabled:bg-slate-400"
              >
                {isSaving ? "Saving..." : editingDocId ? "Save Changes" : "Create Document"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

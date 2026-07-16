"use client";

import { useEffect, useState } from "react";
import { KnowledgeDoc, knowledgeApi } from "@/lib/api/knowledge";
import { apiClient } from "@/lib/api/client";
import { Loader2, ArrowLeft, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function KnowledgeDetailClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [doc, setDoc] = useState<KnowledgeDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [signature, setSignature] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    knowledgeApi.getBySlug(slug)
      .then(setDoc)
      .catch((err) => {
        console.error(err);
        toast.error("Document not found");
        router.push("/knowledge");
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  const [viewUrl, setViewUrl] = useState("");
  const [viewUrlLoading, setViewUrlLoading] = useState(false);

  useEffect(() => {
    if (!doc) {
      setViewUrl("");
      return;
    }

    const getUrl = async () => {
      setViewUrlLoading(true);
      try {
        const res = await apiClient.get("/documents/view-url", {
          params: { objectKey: doc.content }
        });
        setViewUrl(res.data.data.url);
      } catch (err) {
        console.error("Failed to generate download URL", err);
      } finally {
        setViewUrlLoading(false);
      }
    };

    getUrl();
  }, [doc]);

  const handleSign = async () => {
    if (!doc) return;
    if (signature.trim().length < 2) {
      toast.error("Please enter your full legal name");
      return;
    }
    
    setIsSigning(true);
    try {
      await knowledgeApi.acknowledge(doc.id, signature);
      toast.success("Document signed successfully");
      // Refresh doc
      const updated = await knowledgeApi.getBySlug(slug);
      setDoc(updated);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to sign document");
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!doc) return null;

  const hasSigned = doc.acknowledgements && doc.acknowledgements.length > 0;
  const needsSignature = doc.requiresSignature && !hasSigned;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/knowledge" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
              {doc.category.replace(/_/g, ' ')}
            </span>
            <span className="text-xs font-bold text-slate-400">v{doc.version}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{doc.title}</h1>
          <p className="text-sm font-medium text-slate-500">
            Published on {new Date(doc.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 border-b border-slate-100">
          {viewUrlLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <span>Loading document...</span>
            </div>
          ) : viewUrl ? (
            <div className="w-full h-[600px] border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {doc.content.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={viewUrl}
                  className="w-full h-full border-0"
                  title={doc.title}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50">
                  <FileText className="w-16 h-16 text-slate-400" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800">Word Document (DOCX)</p>
                    <p className="text-xs text-slate-500 mt-1">This format cannot be previewed directly in the browser.</p>
                  </div>
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm shadow transition-colors flex items-center gap-2"
                  >
                    Download & View Document
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-rose-500">
              Failed to load document view URL.
            </div>
          )}
        </div>

        {/* E-Signature Box */}
        {doc.requiresSignature && (
          <div className="m-8 p-6 rounded-2xl border-2 bg-slate-50">
            {hasSigned ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-900">Document Acknowledged</h3>
                  <p className="text-sm text-emerald-700 font-medium mt-1">
                    Digitally signed by <span className="font-bold">{doc.acknowledgements?.[0].signatureName}</span> on {new Date(doc.acknowledgements?.[0].acknowledgedAt || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">E-Signature Required</h3>
                    <p className="text-sm text-slate-600 font-medium mt-1">
                      By signing below, you acknowledge that you have read and understood the {doc.title}, and agree to comply with its terms.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 max-w-sm">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type your full legal name</label>
                  <input 
                    type="text" 
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button
                    onClick={handleSign}
                    disabled={isSigning || signature.trim().length < 2}
                    className="mt-2 w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSigning ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Sign Document
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { useQuery } from "@tanstack/react-query";
import { KnowledgeDoc, knowledgeApi } from "@/lib/api/knowledge";
import { fetchMyProfile } from "@/lib/api/profile";
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
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Use the same query key as the Topbar so this hits React Query cache instantly
  const { data: profileData } = useQuery({
    queryKey: ["myProfile"],
    queryFn: fetchMyProfile,
    staleTime: 60 * 1000,
  });

  const profile = profileData?.data || profileData;
  const userName = profile?.firstName
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    : "";

  useEffect(() => {
    knowledgeApi.getBySlug(slug)
      .then(setDoc)
      .catch((err) => {
        console.error(err);
        toast.error("Document not found");
        router.push("/knowledge");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const [viewUrl, setViewUrl] = useState("");
  const [viewUrlLoading, setViewUrlLoading] = useState(false);

  useEffect(() => {
    if (!doc?.content) {
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
  }, [doc?.content]);

  const handleSignClick = () => {
    if (!doc) return;
    if (signature.trim().length < 2) {
      toast.error("Please enter your full legal name");
      return;
    }
    if (signature.trim().toLowerCase() !== userName.toLowerCase()) {
      toast.error(`Please enter your exact account name: ${userName}`);
      return;
    }
    setShowConfirm(true);
  };

  const handleSign = async () => {
    if (!doc) return;
    
    setIsSigning(true);
    try {
      const newAck = await knowledgeApi.acknowledge(doc.id, signature);
      toast.success("Document signed successfully");
      setShowConfirm(false);
      
      // Instantly update local state to remove the blocker
      setDoc(prev => prev ? {
        ...prev,
        acknowledgements: [newAck]
      } : prev);

      // Refresh doc from server just in case, but preserve our new acknowledgement if the server doesn't return it yet
      const updated = await knowledgeApi.getBySlug(slug);
      if (updated) {
        setDoc({
          ...updated,
          acknowledgements: updated.acknowledgements?.length ? updated.acknowledgements : [newAck]
        });
      }
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
        <div className="p-8 border-b border-slate-100 relative">
          {needsSignature && (
            <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 text-center max-w-md m-4">
                <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Signature Required</h3>
                <p className="text-sm text-slate-600">Please provide your e-signature below to unlock and view this document.</p>
              </div>
            </div>
          )}
          {(() => {
            const isHtml = doc.content.trim().startsWith("<") || doc.content.includes("<h1>") || doc.content.includes("<p>");
            if (isHtml) {
              return (
                <div className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-8 shadow-sm text-slate-800 space-y-4">
                  <div 
                    className="prose max-w-none text-slate-700 leading-relaxed [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-slate-900 [&>h1]:mb-4 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(doc.content) }}
                  />
                  <div className="pt-6 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        const win = window.open('', '_blank');
                        if (win) {
                          win.document.write(`<html><head><title>${doc.title}</title><style>body{font-family:sans-serif;padding:40px;line-height:1.6;}</style></head><body>${doc.content}</body></html>`);
                          win.document.close();
                          win.print();
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Print / Export Document
                    </button>
                  </div>
                </div>
              );
            }

            if (viewUrlLoading) {
              return (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                  <span>Loading document...</span>
                </div>
              );
            }

            if (viewUrl) {
              return (
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
                        <p className="text-sm font-bold text-slate-800">Attachment File</p>
                        <p className="text-xs text-slate-500 mt-1">Click below to open or download the attached document.</p>
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
              );
            }

            return (
              <div className="text-center py-10 text-rose-500 font-medium">
                Failed to load document view URL.
              </div>
            );
          })()}
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Your Identity</label>
                  
                  {/* Prominent hint showing exactly what to type */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="text-xs text-amber-700 font-medium flex-shrink-0">Type exactly:</span>
                    <span className="text-sm font-bold text-amber-900 tracking-wide select-all">{userName || "(loading…)"}</span>
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      placeholder={userName || "Your Account Name"}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-300 font-medium text-slate-900"
                    />
                  </div>
                  <button
                    onClick={handleSignClick}
                    disabled={isSigning || signature !== userName || userName === ""}
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
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Signature</h3>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to sign this document? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                disabled={isSigning}
              >
                Cancel
              </button>
              <button 
                onClick={handleSign}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 flex items-center gap-2 transition-colors shadow-sm"
                disabled={isSigning}
              >
                {isSigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm & Sign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Video, Send, User, MessageSquare } from "lucide-react";
import { connectApi } from "@/lib/api/connect";
import { useAuthStore } from "@/store/auth";

interface MeetDetailsModalProps {
  meeting: any;
  isOpen: boolean;
  onClose: () => void;
}

export function MeetDetailsModal({ meeting, isOpen, onClose }: MeetDetailsModalProps) {
  const { employeeId } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"details" | "notes">("details");
  const [notes, setNotes] = useState<any[]>([]);
  const [myNoteContent, setMyNoteContent] = useState("");
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (isOpen && meeting) {
      if (activeTab === "notes") {
        fetchNotes();
      }
    }
  }, [isOpen, meeting, activeTab]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await connectApi.getMeetNotes(meeting.id);
      setNotes(res.data);
      const myExistingNote = res.data.find((n: any) => n.authorId === employeeId);
      if (myExistingNote) {
        setMyNoteContent(myExistingNote.content);
      }
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await connectApi.saveMeetNote(meeting.id, myNoteContent);
      await fetchNotes();
    } catch (err) {
      console.error("Failed to save note", err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddComment = async (noteId: string) => {
    const text = commentText[noteId];
    if (!text?.trim()) return;
    
    try {
      await connectApi.addNoteComment(noteId, text);
      setCommentText({ ...commentText, [noteId]: "" });
      await fetchNotes();
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  if (!isOpen || !meeting) return null;

  const isExpired = () => {
    const endTime = new Date(meeting.endTime);
    const expireTime = new Date(endTime.getTime() + 3 * 60000); // 3 minutes grace period
    return new Date() > expireTime;
  };

  const myNote = notes.find(n => n.authorId === employeeId);
  const otherNotes = notes.filter(n => n.authorId !== employeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{meeting.title}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isExpired() && meeting.meetLink ? (
              <button 
                onClick={() => window.open(meeting.meetLink, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <Video className="w-4 h-4" /> Join Meet
              </button>
            ) : (
              <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                Meeting Ended
              </span>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 pt-2">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "details" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
          >
            Details & Agenda
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "notes" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}`}
          >
            Meeting Notes
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {activeTab === "details" ? (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{meeting.description || "No description provided."}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* My Notes Column */}
              <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" /> My Notes
                  </h3>
                  <button 
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {savingNote ? "Saving..." : "Save Notes"}
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <textarea
                    value={myNoteContent}
                    onChange={(e) => setMyNoteContent(e.target.value)}
                    placeholder="Take your personal meeting notes here..."
                    className="w-full flex-1 min-h-[200px] resize-none border-0 p-0 focus:ring-0 text-sm text-slate-700 placeholder-slate-400"
                  />
                </div>
                {/* My Comments */}
                {myNote && myNote.comments?.length > 0 && (
                  <div className="bg-slate-50 border-t border-slate-100 p-4 max-h-[250px] overflow-y-auto">
                    <h4 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Comments</h4>
                    <div className="space-y-3">
                      {myNote.comments.map((comment: any) => (
                        <div key={comment.id} className="bg-white p-3 rounded-lg border border-slate-200 text-sm">
                          <div className="font-bold text-xs text-slate-900 mb-1">{comment.author?.firstName} {comment.author?.lastName}</div>
                          <div className="text-slate-600">{comment.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Other Participants' Notes Column */}
              <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                {loading ? (
                  <div className="text-sm text-slate-500 text-center py-10 font-medium">Loading notes...</div>
                ) : otherNotes.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-10 font-medium bg-white rounded-xl border border-slate-200 border-dashed">
                    No notes shared by other participants yet.
                  </div>
                ) : (
                  otherNotes.map(note => (
                    <div key={note.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-900">
                          {note.author?.firstName} {note.author?.lastName}'s Notes
                        </h3>
                      </div>
                      <div className="p-4 text-sm text-slate-700 whitespace-pre-wrap">
                        {note.content || <span className="text-slate-400 italic">No content</span>}
                      </div>
                      
                      {/* Comments Section */}
                      <div className="bg-slate-50 border-t border-slate-100 p-4">
                        <h4 className="text-xs font-bold text-slate-500 mb-3">Comments</h4>
                        <div className="space-y-3 mb-3">
                          {note.comments?.map((comment: any) => (
                            <div key={comment.id} className="bg-white p-2.5 rounded-lg border border-slate-200 text-sm shadow-sm">
                              <div className="font-bold text-xs text-slate-900 mb-0.5">{comment.author?.firstName} {comment.author?.lastName}</div>
                              <div className="text-slate-600 text-xs">{comment.content}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={commentText[note.id] || ""}
                            onChange={(e) => setCommentText({...commentText, [note.id]: e.target.value})}
                            placeholder="Add a comment..."
                            className="flex-1 rounded-lg border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(note.id)}
                          />
                          <button 
                            onClick={() => handleAddComment(note.id)}
                            disabled={!commentText[note.id]?.trim()}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import { Task, tasksApi } from "@/lib/api/tasks";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth";

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onTaskUpdated: (task: Task) => void;
}

export function TaskDetailsModal({ isOpen, onClose, task, onTaskUpdated }: TaskDetailsModalProps) {
  const userRole = useAuthStore(state => state.role);
  const [commentContent, setCommentContent] = useState("");
  const [commentCategory, setCommentCategory] = useState("COMMENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localTask, setLocalTask] = useState<Task | null>(task);
  const [actionType, setActionType] = useState("");
  const [actionNotes, setActionNotes] = useState("");

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  if (!localTask) return null;

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;
    setIsSubmitting(true);
    try {
      const newComment = await tasksApi.addComment(localTask.id, commentContent, commentCategory);
      setLocalTask((prev) => prev ? {
        ...prev,
        comments: [...(prev.comments || []), newComment]
      } : null);
      setCommentContent("");
      toast.success("Comment added");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAction = async () => {
    if (!actionType) return;
    setIsSubmitting(true);
    try {
      const newAction = await tasksApi.addAction(localTask.id, actionType, actionNotes);
      setLocalTask((prev) => prev ? {
        ...prev,
        actions: [...(prev.actions || []), newAction]
      } : null);
      setActionType("");
      setActionNotes("");
      toast.success("Action recorded");
    } catch (error: any) {
      toast.error("Failed to add action");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isManagement = ["CEO", "CTO", "HR", "MANAGER"].includes(userRole || "");

  // Combine comments and actions for activity feed
  const activities = [
    ...(localTask.comments || []).map(c => ({ ...c, kind: 'comment', time: new Date(c.createdAt).getTime() })),
    ...(localTask.actions || []).map(a => ({ ...a, kind: 'action', time: new Date(a.createdAt).getTime() }))
  ].sort((a, b) => a.time - b.time);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                    {localTask.title}
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex gap-4 mb-6">
                  <span className="text-sm px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200">
                    Status: {localTask.status}
                  </span>
                  <span className="text-sm px-2.5 py-1 rounded-full bg-gray-50 text-gray-700 font-medium border border-gray-200">
                    Priority: {localTask.priority}
                  </span>
                </div>

                {localTask.description && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {localTask.description}
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Activity Feed</h4>
                  
                  <div className="space-y-4 max-h-64 overflow-y-auto mb-6 pr-2">
                    {activities.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No activity yet.</p>
                    ) : (
                      activities.map((activity, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                            {activity.kind === 'comment' ? (activity as any).author?.firstName?.[0] : (activity as any).actor?.firstName?.[0]}
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-gray-900">
                                {activity.kind === 'comment' 
                                  ? `${(activity as any).author?.firstName} ${(activity as any).author?.lastName}`
                                  : `${(activity as any).actor?.firstName} ${(activity as any).actor?.lastName}`}
                              </span>
                              <div className="flex gap-2 items-center">
                                {activity.kind === 'comment' && (activity as any).category && (activity as any).category !== "COMMENT" && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    (activity as any).category === 'BUG' ? 'bg-red-100 text-red-700' :
                                    (activity as any).category === 'IMPROVEMENT' ? 'bg-green-100 text-green-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>{(activity as any).category}</span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {format(new Date(activity.createdAt), "MMM d, HH:mm")}
                                </span>
                              </div>
                            </div>
                            {activity.kind === 'action' && (
                              <div className="mb-1">
                                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded uppercase">
                                  {(activity as any).type}
                                </span>
                              </div>
                            )}
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {activity.kind === 'comment' ? (activity as any).content : (activity as any).notes}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="space-y-4">
                    {isManagement && (
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h5 className="text-xs font-bold text-orange-800 uppercase mb-2">Management Action</h5>
                        <div className="flex gap-2 mb-2">
                          <select 
                            className="text-sm border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 flex-1"
                            value={actionType}
                            onChange={(e) => setActionType(e.target.value)}
                          >
                            <option value="">Select Action...</option>
                            <option value="REMARK">Leave Remark</option>
                            <option value="ESCALATED">Escalate Task</option>
                            <option value="BLOCKED_BY_MANAGEMENT">Block Task</option>
                            <option value="PRIORITY_BUMP">Bump Priority</option>
                          </select>
                        </div>
                        {actionType && (
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Action notes..."
                              className="text-sm border-gray-300 rounded-md flex-1"
                              value={actionNotes}
                              onChange={(e) => setActionNotes(e.target.value)}
                            />
                            <button
                              onClick={handleAddAction}
                              disabled={isSubmitting}
                              className="px-3 py-1.5 bg-orange-600 text-white text-sm font-medium rounded-md hover:bg-orange-700 disabled:opacity-50"
                            >
                              Take Action
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-semibold text-gray-900">Share your thoughts</label>
                        <select 
                          className="text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1"
                          value={commentCategory}
                          onChange={(e) => setCommentCategory(e.target.value)}
                        >
                          <option value="COMMENT">Leave a comment</option>
                          <option value="QUESTION">Ask a question</option>
                          <option value="BUG">Report a bug</option>
                          <option value="IMPROVEMENT">Suggest an improvement</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Type @email to mention someone..."
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={handleAddComment}
                          disabled={!commentContent.trim() || isSubmitting}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

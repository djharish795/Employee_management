import toast from "react-hot-toast";
import React, { useState } from "react";
import { X, Video, Clock, Users, Calendar as CalendarIcon, AlignLeft } from "lucide-react";
import { MeetingWorkspace } from "../workspace/MeetingWorkspace";

interface MeetingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
}

export function MeetingDetailsModal({ isOpen, onClose, meeting }: MeetingDetailsModalProps) {
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  if (!isOpen || !meeting) return null;

  const startTime = new Date(meeting.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(meeting.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const dateStr = new Date(meeting.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const getPlatformName = (link: string | null | undefined) => {
    if (!link) return "Meeting";
    if (link.includes("zoom.us")) return "Zoom";
    if (link.includes("meet.google.com")) return "Google Meet";
    if (link.includes("teams.microsoft.com")) return "Microsoft Teams";
    return "Video Meet";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Event Details</h3>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                meeting.status === 'ACCEPTED' ? 'bg-blue-50 text-blue-600' :
                meeting.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {meeting.status}
              </span>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {getPlatformName(meeting.meetLink)}</span>
            </div>
            <h4 className="text-xl font-bold text-slate-900 leading-tight">{meeting.title}</h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">{dateStr}</p>
                <p className="text-sm text-slate-500">{startTime} - {endTime}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {meeting.requester?.firstName} {meeting.requester?.lastName}
                </p>
                <p className="text-sm text-slate-500">Requester</p>
              </div>
            </div>

            {meeting.description && (
              <div className="flex items-start gap-3">
                <AlignLeft className="w-5 h-5 text-slate-400 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{meeting.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 mt-2 space-y-3">
          {meeting.meetLink ? (
            <button 
              onClick={() => window.open(meeting.meetLink, '_blank')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              Join Zoom Meet <Video className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-full py-3.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold flex items-center justify-center">
              No meeting link available yet
            </div>
          )}

          {meeting.status === 'ACCEPTED' && (
            <button 
              onClick={() => setWorkspaceOpen(true)}
              className="w-full py-3.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all mt-2"
            >
              <AlignLeft className="w-4 h-4" /> Open Collaborative Workspace
            </button>
          )}
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                toast.error("Reschedule logic will open booking wizard for " + meeting.title);
                onClose();
              }}
              className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all"
            >
              Reschedule
            </button>
            <button 
              onClick={() => {
                toast.error("Cancel logic will trigger /api/v1/connect/" + meeting.id + "/reject");
                onClose();
              }}
              className="flex-1 py-3 bg-white border border-red-100 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold transition-all"
            >
              Cancel Meet
            </button>
          </div>
        </div>

      </div>

      <MeetingWorkspace 
        isOpen={workspaceOpen} 
        onClose={() => setWorkspaceOpen(false)} 
        meeting={meeting} 
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Smile, Lock, FileText, User, Users } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import EmojiPicker from "emoji-picker-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api/client";

const ALLOWED_ROLES = ["CEM", "OE", "OM", "CRM"];

export interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  text: string;
  timestamp: Date;
  isFile?: boolean;
  fileUrl?: string;
}

interface CamSchedulerChatProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function CamSchedulerChat({ messages, setMessages }: CamSchedulerChatProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);


  const [inputValue, setInputValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [chatMembers, setChatMembers] = useState<{name: string, email: string, role: string}[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map()); // email -> name
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Decode JWT to get user info
  useEffect(() => {
    if (accessToken) {
      try {
        const payloadStr = Buffer.from(accessToken.split(".")[1], "base64").toString();
        const payload = JSON.parse(payloadStr);
        if (payload.email) {
          const emailPrefix = payload.email.split("@")[0].toLowerCase();
          setUserEmail(payload.email);
          setUserName(emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));

          const role = Array.isArray(payload.role) ? payload.role[0] : payload.role;
          setIsAllowed(ALLOWED_ROLES.includes(role));
        }
      } catch (e) {
        console.error("Failed to decode token", e);
      }
    }
  }, [accessToken]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAllowed) {
      scrollToBottom();
    }
  }, [messages, isAllowed]);

  // Fetch members only when requested to improve performance
  const handleFetchAndShowMembers = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showMembers) {
      setShowMembers(false);
      return;
    }
    
    setShowMembers(true);
    if (chatMembers.length > 0) return; // already fetched
    
    setIsLoadingMembers(true);
    try {
      const { data } = await apiClient.get('/employees?limit=100');
      const allEmployees = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
      
      const filtered = allEmployees
        .filter((emp: any) => {
          const role = emp.user?.role || emp.role;
          return ALLOWED_ROLES.includes(role);
        })
        .map((emp: any) => ({
          name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.workEmail?.split('@')[0] || 'Unknown',
          email: emp.workEmail || emp.email || emp.officialEmail,
          role: emp.user?.role || emp.role
        }));
        
      setChatMembers(filtered);
    } catch (error) {
      console.error("Failed to fetch authorized chat members", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // BroadcastChannel for cross-tab realtime sync
  useEffect(() => {
    const channel = new BroadcastChannel("cam_scheduler_chat");
    channel.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === "MESSAGE") {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === data.id)) return prev;
          return [...prev, data];
        });
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(data.senderEmail);
          return newMap;
        });
      } else if (type === "TYPING") {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          if (data.isTyping) {
            newMap.set(data.senderEmail, data.senderName);
          } else {
            newMap.delete(data.senderEmail);
          }
          return newMap;
        });
      }
    };
    return () => channel.close();
  }, [setMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (userName && userEmail) {
      const channel = new BroadcastChannel("cam_scheduler_chat");
      channel.postMessage({
        type: "TYPING",
        data: { senderEmail: userEmail, senderName: userName, isTyping: true }
      });
      channel.close();

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        const chan = new BroadcastChannel("cam_scheduler_chat");
        chan.postMessage({
          type: "TYPING",
          data: { senderEmail: userEmail, senderName: userName, isTyping: false }
        });
        chan.close();
      }, 2000);
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !userName || !userEmail) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderName: userName,
      senderEmail: userEmail,
      text: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    const channel = new BroadcastChannel("cam_scheduler_chat");
    channel.postMessage({ type: "MESSAGE", data: newMessage });

    // Clear our own typing indicator
    channel.postMessage({ type: "TYPING", data: { senderEmail: userEmail, senderName: userName, isTyping: false } });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    channel.close();

    setInputValue("");
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setInputValue((prev) => prev + emojiObject.emoji);
    handleInputChange({ target: { value: inputValue + emojiObject.emoji } } as any);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && userName && userEmail) {
      const fileUrl = URL.createObjectURL(file);
      const newMessage: Message = {
        id: Date.now().toString(),
        senderName: userName,
        senderEmail: userEmail,
        text: `Shared a file: ${file.name}`,
        timestamp: new Date(),
        isFile: true,
        fileUrl: fileUrl,
      };
      setMessages((prev) => [...prev, newMessage]);

      const channel = new BroadcastChannel("cam_scheduler_chat");
      channel.postMessage({ type: "MESSAGE", data: newMessage });
      channel.close();

      toast.success("File uploaded successfully");
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isAllowed) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-8 border border-slate-200 dark:border-slate-800 h-full min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-slate-500 dark:text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-[250px]">
          This chat is restricted to authorized roles only (CEM, OE, OM).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px] xl:h-full overflow-hidden relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 relative z-20">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Team Chat</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            Internal Sync
          </p>
        </div>
        
        <button 
          onClick={handleFetchAndShowMembers} 
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors flex-shrink-0"
          title="View Authorized Members"
        >
           <Users className="w-5 h-5" />
        </button>
        
        {/* Members Popover */}
        {showMembers && (
          <div className="absolute top-full left-0 right-0 mt-1 mx-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2 animate-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 uppercase">Authorized Members</span>
              <button onClick={() => setShowMembers(false)} className="text-slate-400 hover:text-slate-600">
                <User className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1">
              {isLoadingMembers ? (
                <div className="text-center p-4 text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  Loading members...
                </div>
              ) : chatMembers.length === 0 ? (
                <div className="text-center p-2 text-xs text-slate-500">No members found.</div>
              ) : (
                chatMembers.map(member => (
                  <div key={member.email} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 uppercase">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{member.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{member.email}</p>
                    </div>
                    <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {member.role}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/20">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
            <p>No messages yet.</p>
            <p>Start the conversation!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderEmail === userEmail;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm border border-blue-200 dark:border-blue-800">
                  {msg.senderName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isMe ? "You" : msg.senderName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {format(msg.timestamp, "hh:mm a")}
                  </span>
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                    }`}
                >
                  {msg.isFile ? (
                    <div className="flex items-center gap-2 font-medium">
                      <FileText className="w-4 h-4" />
                      {msg.text}
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/40 text-xs text-slate-500 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex -space-x-1">
            {Array.from(typingUsers.entries()).map(([email, name]) => (
              <div key={email} className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[9px] border border-white dark:border-slate-800 z-10" title={name}>
                {name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="italic flex items-center gap-1">
            {Array.from(typingUsers.values()).join(", ")} {typingUsers.size === 1 ? "is" : "are"} typing
            <span className="flex space-x-0.5 ml-1">
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          </span>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 relative">

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute bottom-14 left-0 z-50 shadow-2xl rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
            </div>
          )}

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
          >
            <Smile className="w-5 h-5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm px-4 py-2.5 rounded-full outline-none transition-all"
          />

          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-2.5 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-900/50 rounded-full transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

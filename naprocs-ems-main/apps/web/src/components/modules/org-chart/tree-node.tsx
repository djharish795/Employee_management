import React from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, UserCircle, LayoutGrid } from "lucide-react";
import { OrgTreeNode } from "@/types/org-chart";

interface TreeNodeProps {
  node: OrgTreeNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onSelect: (node: OrgTreeNode) => void;
}

export function TreeNode({ node, isExpanded, onToggle, onSelect }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div 
        className="w-64 bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col items-center relative group hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
        onClick={() => onSelect(node)}
      >
        {/* Top actions */}
        <button 
          className="absolute top-3 right-3 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 overflow-hidden shadow-sm border border-slate-100 ${node.avatarBg}`}>
          <img 
            src={node.photoUrl} 
            alt={node.name} 
            className="w-full h-full object-cover" 
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
          <span className="absolute">{node.initials}</span>
        </div>

        {/* Info */}
        <div className="text-center w-full">
          <h3 className="text-sm font-bold text-slate-900 truncate px-2">{node.name}</h3>
          <p className="text-[11px] font-semibold text-slate-500 mt-0.5 truncate">{node.designation}</p>
        </div>

        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 w-full justify-center">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
            <LayoutGrid className="w-3 h-3" />
            {node.department}
          </div>
          {node.totalReportsCount > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
              <UserCircle className="w-3 h-3" />
              {node.totalReportsCount}
            </div>
          )}
        </div>
      </div>

      {/* Connection Line Down & Toggle Button */}
      {hasChildren && (
        <div className="relative flex flex-col items-center">
          <div className="w-px h-6 bg-slate-300" />
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
            className="w-5 h-5 bg-white border border-slate-300 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors z-10 absolute top-3"
          >
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <div className={`w-px h-6 bg-slate-300 ${!isExpanded && 'opacity-0'}`} />
        </div>
      )}

      {/* Children branches */}
      {hasChildren && isExpanded && (
        <div className="flex items-start relative pt-4">
          {/* Top connecting horizontal line */}
          {node.children.length > 1 && (
            <div className="absolute top-0 left-[50%] right-[50%] h-px bg-slate-300" 
                 style={{ width: `calc(100% - ${100 / node.children.length}%)`, left: `calc(${50 / node.children.length}%)` }} 
            />
          )}

          {node.children.map((child, index) => (
            <div key={child.id} className="flex flex-col items-center relative px-4">
              {/* Vertical line connecting horizontal to child */}
              <div className="absolute top-0 w-px h-4 bg-slate-300" />
              <TreeNode 
                node={child} 
                isExpanded={isExpanded} 
                onToggle={onToggle} 
                onSelect={onSelect}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

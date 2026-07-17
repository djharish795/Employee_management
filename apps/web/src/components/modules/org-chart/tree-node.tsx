import Image from "next/image";
import React from "react";
import { ChevronDown, ChevronUp, MoreHorizontal, UserCircle, LayoutGrid } from "lucide-react";
import { OrgTreeNode } from "@/types/org-chart";

interface TreeNodeProps {
  node: OrgTreeNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onSelect: (node: OrgTreeNode) => void;
  canManageHierarchy?: boolean;
  onDropEmployee?: (draggedId: string, targetManagerId: string) => void;
}

export function EmployeeCard({ 
  node, 
  onSelect,
  canManageHierarchy,
  onDragStart,
  onDragOver,
  onDrop
}: { 
  node: OrgTreeNode; 
  onSelect?: (node: OrgTreeNode) => void;
  canManageHierarchy?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
}) {
  return (
    <div 
      className={`w-64 bg-white border shadow-sm rounded-xl p-4 flex flex-col items-center relative group transition-all cursor-pointer 
        ${node.isVacant ? 'border-dashed border-slate-300 opacity-80 hover:border-slate-400' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'} 
        ${canManageHierarchy ? 'cursor-grab active:cursor-grabbing' : ''}`}
      onClick={() => onSelect?.(node)}
      draggable={canManageHierarchy}
      onDragStart={(e) => onDragStart?.(e, node.id)}
      onDragOver={(e) => onDragOver?.(e)}
      onDrop={(e) => onDrop?.(e, node.id)}
    >
      <button 
        className="absolute top-3 right-3 text-slate-300 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      <div className={`relative w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold mb-3 overflow-hidden shadow-sm border border-slate-100 ${node.avatarBg}`}>
        {node.photoUrl ? (
          <Image 
            src={node.photoUrl} 
            alt={node.name} 
            className="w-full h-full object-cover z-10" 
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} fill style={{ objectFit: "cover" }}
          />
        ) : (
          <span className="z-0">{node.initials}</span>
        )}
      </div>

      <div className="text-center w-full">
        <h3 className={`text-sm font-bold truncate px-2 ${node.isVacant ? 'text-slate-400' : 'text-slate-900'}`}>{node.name}</h3>
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
  );
}

export function TreeNode({ node, isExpanded, onToggle, onSelect, canManageHierarchy, onDropEmployee }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("employeeId", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("employeeId");
    if (draggedId && draggedId !== targetId && onDropEmployee) {
      onDropEmployee(draggedId, targetId);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <EmployeeCard 
        node={node} 
        onSelect={onSelect} 
        canManageHierarchy={canManageHierarchy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />

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
                canManageHierarchy={canManageHierarchy}
                onDropEmployee={onDropEmployee}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

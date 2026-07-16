"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Search, ZoomIn, ZoomOut, Maximize, Navigation, X, Mail, Phone, Calendar, LayoutGrid
} from "lucide-react";
import { OrgRole, OrgEmployee, OrgTreeNode } from "@/types/org-chart";
import { TreeNode } from "./tree-node";

interface HierarchyPanelProps {
  activeRole: OrgRole;
}

// Flat list of employees for building the tree
const MOCK_FLAT_EMPLOYEES: OrgEmployee[] = [
  {
    id: "EMP-100",
    name: "Pradeep Chandra",
    designation: "Chief Executive Officer",
    department: "Leadership",
    location: "Hyderabad HQ",
    email: "pradeep@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Pradeep",
    initials: "PC",
    avatarBg: "bg-indigo-100 text-indigo-600",
    managerId: null,
  },
  {
    id: "EMP-101",
    name: "Lokesh Kumar",
    designation: "Chief Technology Officer",
    department: "Engineering",
    location: "Hyderabad HQ",
    email: "lokesh@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Lokesh",
    initials: "LK",
    avatarBg: "bg-slate-200 text-slate-900",
    managerId: "EMP-100",
  },
  {
    id: "EMP-102",
    name: "Tejesh Kumar",
    designation: "HR Management Director",
    department: "HR",
    location: "Hyderabad HQ",
    email: "tejesh@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Tejesh",
    initials: "TK",
    avatarBg: "bg-rose-100 text-rose-600",
    managerId: "EMP-100",
  },
  {
    id: "EMP-103",
    name: "Alex Thompson",
    designation: "VP of Engineering",
    department: "Engineering",
    location: "London, UK",
    email: "alex.t@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
    initials: "AT",
    avatarBg: "bg-emerald-100 text-emerald-600",
    managerId: "EMP-101",
  },
  {
    id: "EMP-104",
    name: "Sarah Q.",
    designation: "VP of Sales",
    department: "Sales",
    location: "San Francisco, US",
    email: "sarah.q@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
    initials: "SQ",
    avatarBg: "bg-amber-100 text-amber-600",
    managerId: "EMP-100",
  },
  {
    id: "EMP-105",
    name: "Arjun Mehta",
    designation: "Staff Software Engineer",
    department: "Engineering",
    location: "Bangalore, IN",
    email: "arjun.m@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Arjun",
    initials: "AM",
    avatarBg: "bg-slate-200 text-slate-900",
    managerId: "EMP-103",
  },
  {
    id: "EMP-106",
    name: "Anita M.",
    designation: "Frontend Developer",
    department: "Engineering",
    location: "Mumbai, IN",
    email: "anita.m@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Anita",
    initials: "AM",
    avatarBg: "bg-pink-100 text-pink-600",
    managerId: "EMP-105",
  },
  {
    id: "EMP-107",
    name: "Ravi Kumar",
    designation: "DevOps Engineer",
    department: "Engineering",
    location: "Bangalore, IN",
    email: "ravi.k@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Ravi",
    initials: "RK",
    avatarBg: "bg-teal-100 text-teal-600",
    managerId: "EMP-105",
  },
  {
    id: "EMP-108",
    name: "Priya Menon",
    designation: "HR Business Partner",
    department: "HR",
    location: "Hyderabad HQ",
    email: "priya.m@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Priya",
    initials: "PM",
    avatarBg: "bg-fuchsia-100 text-fuchsia-600",
    managerId: "EMP-102",
  },
];

// Helper to build recursive tree from flat list
function buildTree(employees: OrgEmployee[], rootId: string | null = null): OrgTreeNode[] {
  return employees
    .filter((emp) => emp.managerId === rootId)
    .map((emp) => {
      const children = buildTree(employees, emp.id);
      
      // Calculate total nested reports
      const calculateTotalReports = (nodes: OrgTreeNode[]): number => {
        let count = nodes.length;
        nodes.forEach(n => count += calculateTotalReports(n.children));
        return count;
      };

      return {
        ...emp,
        children,
        directReportsCount: children.length,
        totalReportsCount: calculateTotalReports(children)
      };
    });
}

export default function HierarchyPanel({ activeRole }: HierarchyPanelProps) {
  const [zoom, setZoom] = useState(1);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "EMP-100": true,
    "EMP-101": true,
    "EMP-103": true,
    "EMP-105": true,
  });
  const [selectedNode, setSelectedNode] = useState<OrgTreeNode | null>(null);

  const { data: treeData } = useQuery({
    queryKey: ["orgTree"],
    queryFn: async () => buildTree(MOCK_FLAT_EMPLOYEES),
  });

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const rootNode = treeData?.[0];

  return (
    <div className="flex flex-col h-[700px] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
      
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between bg-white z-10 relative shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-slate-900">Interactive Directory</h2>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employee..." 
              className="w-48 h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-lg">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors" title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-bold text-slate-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors" title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button onClick={() => setZoom(1)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors" title="Fit to Screen">
            <Maximize className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors" title="Mini Map">
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Canvas Area ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-slate-50/50 cursor-grab active:cursor-grabbing relative">
        <div 
          className="min-w-max min-h-max p-16 flex justify-center transition-transform duration-200 origin-top"
          style={{ transform: `scale(${zoom})` }}
        >
          {rootNode ? (
            <TreeNode 
              node={rootNode} 
              isExpanded={expandedNodes[rootNode.id]} 
              onToggle={toggleNode} 
              onSelect={setSelectedNode}
            />
          ) : (
            <div className="text-sm font-bold text-slate-400">Loading organization tree...</div>
          )}
        </div>
      </div>

      {/* ── Sliding Employee Preview Panel ───────────────────────────────── */}
      <div className={`absolute top-14 bottom-0 right-0 w-80 bg-white shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.1)] border-l border-slate-200 transition-transform duration-300 z-20 ${selectedNode ? "translate-x-0" : "translate-x-full"}`}>
        {selectedNode && (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Preview</h3>
              <button onClick={() => setSelectedNode(null)} className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center border-b border-slate-100">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-sm border-2 border-white ring-1 ring-slate-200 ${selectedNode.avatarBg}`}>
                <img src={selectedNode.photoUrl} alt={selectedNode.name} className="w-full h-full rounded-full object-cover" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{selectedNode.name}</h2>
              <p className="text-sm font-semibold text-slate-500 text-center mt-1">{selectedNode.designation}</p>
              
              <div className="flex gap-2 mt-5 w-full">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-100">
                  <Mail className="w-3.5 h-3.5" /> Message
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200">
                  <Calendar className="w-3.5 h-3.5" /> Meeting
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 flex-1 overflow-y-auto">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Work Information</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-500"><LayoutGrid className="w-3 h-3" /></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400">Department</div>
                      <div className="text-xs font-semibold text-slate-900">{selectedNode.department}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-500"><Navigation className="w-3 h-3" /></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400">Location</div>
                      <div className="text-xs font-semibold text-slate-900">{selectedNode.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-500"><Phone className="w-3 h-3" /></div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400">Contact</div>
                      <div className="text-xs font-semibold text-slate-900">{selectedNode.email}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Reporting</div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs font-bold text-slate-900">{selectedNode.directReportsCount} Direct Reports</div>
                  <div className="text-[10px] font-semibold text-slate-500">{selectedNode.totalReportsCount} Total in Hierarchy</div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200">
              <button className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors shadow-sm">
                View Full Profile
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search, ZoomIn, ZoomOut, Maximize, Navigation, X, Mail, Phone, Calendar, LayoutGrid, Download
} from "lucide-react";
import { OrgRole, OrgEmployee, OrgTreeNode } from "@/types/org-chart";
import { TreeNode, EmployeeCard } from "./tree-node";
import { apiClient } from "@/lib/api/client";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";

interface HierarchyPanelProps {
  activeRole: OrgRole;
}



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
    queryFn: async () => {
      const { data } = await apiClient.get("/employees/org-chart");

      const colors = ["bg-indigo-100 text-indigo-600", "bg-slate-200 text-slate-900", "bg-rose-100 text-rose-600", "bg-emerald-100 text-emerald-600", "bg-amber-100 text-amber-600", "bg-pink-100 text-pink-600", "bg-teal-100 text-teal-600", "bg-fuchsia-100 text-fuchsia-600"];

      const mappedEmployees: OrgEmployee[] = data.map((emp: any, index: number) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName || ''}`.trim(),
        designation: emp.designation?.title || 'Employee',
        department: emp.department?.name || 'Organization',
        location: emp.workLocation || 'Hyderabad HQ',
        email: emp.officialEmail,
        photoUrl: emp.photoUrl || '',
        initials: (emp.firstName?.[0] || '') + (emp.lastName?.[0] || ''),
        avatarBg: colors[index % colors.length],
        managerId: emp.reportingManagerId
      }));

      return mappedEmployees;
    },
  });

  const handleExport = async () => {
    const canvasEl = document.getElementById("org-chart-canvas");
    if (!canvasEl) return;

    try {
      toast.loading("Exporting chart...", { id: "export" });
      const canvas = await html2canvas(canvasEl, {
        scale: 2, // high res
        backgroundColor: "#f8fafc"
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `Org-Chart-${new Date().toISOString().split('T')[0]}.png`;
      a.click();
      toast.success("Exported successfully!", { id: "export" });
    } catch (e) {
      toast.error("Failed to export chart", { id: "export" });
    }
  };

  const handleDropEmployee = async (draggedId: string, targetManagerId: string) => {
    try {
      toast.loading("Reassigning manager...", { id: "reassign" });
      await apiClient.patch(`/employees/${draggedId}`, {
        reportingManagerId: targetManagerId
      });
      // trigger refetch
      refetch();
      toast.success("Manager reassigned successfully!", { id: "reassign" });
    } catch (e) {
      toast.error("Failed to reassign manager", { id: "reassign" });
    }
  };

  const { refetch } = useQuery({ queryKey: ["orgTree"] });

  const canManageHierarchy = activeRole === "HR" || activeRole === "CEO" || activeRole === "ADMIN";

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const flatEmployees = treeData || [];

  const toOrgTreeNode = (emp: OrgEmployee | undefined): OrgTreeNode | null => {
    if (!emp) return null;
    return { ...emp, children: [], directReportsCount: 0, totalReportsCount: 0 };
  };

  // Find root node (The CEO - explicitly filters out any old/legacy disconnected charts)
  const rootNodes = flatEmployees.filter((e: OrgEmployee) =>
    !e.managerId &&
    (e.designation?.toUpperCase().includes('CEO') || e.designation?.toUpperCase().includes('CHIEF EXECUTIVE'))
  );
  const rootTreeNodes = rootNodes.map((root: OrgEmployee) => {
    const node = toOrgTreeNode(root);
    if (node) node.children = buildTree(flatEmployees, node.id);
    return node;
  }).filter(Boolean) as OrgTreeNode[];

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
          <div className="w-px h-4 bg-slate-300 mx-1" />
          <button onClick={handleExport} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Export to PNG">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Canvas Area ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-slate-50/50 relative">
        <div
          id="org-chart-canvas"
          className="min-w-max min-h-max p-16 flex justify-center transition-transform duration-200 origin-top"
          style={{ transform: `scale(${zoom})` }}
        >
          {flatEmployees.length > 0 ? (
            <div className="flex flex-col items-center gap-12">
              {rootTreeNodes.map(rootNode => (
                <TreeNode
                  key={rootNode.id}
                  node={rootNode}
                  isExpanded={expandedNodes[rootNode.id] ?? true}
                  onToggle={toggleNode}
                  onSelect={setSelectedNode}
                  canManageHierarchy={canManageHierarchy}
                  onDropEmployee={handleDropEmployee}
                />
              ))}
            </div>
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

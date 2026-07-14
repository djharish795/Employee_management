"use client";

import { usePermissions } from "@/hooks/use-permissions";

import React, { useState, useMemo } from "react";
import {
  useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel,
  ColumnDef, flexRender, getSortedRowModel
} from "@tanstack/react-table";
import {
  Search, Filter, Download, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown
} from "lucide-react";
import { AuditRole, AuditEvent } from "@/types/audit";

interface EventsExplorerPanelProps {

}

const ALL_MOCK_EVENTS: AuditEvent[] = [
  {
    id: "LOG-9921",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    actor: { id: "EMP-101", name: "Lokesh Kumar", email: "lokesh@naprocs.com", role: "CTO" },
    action: "PERMISSION_GRANTED",
    module: "AUTH",
    target: { id: "EMP-105", name: "Arjun Mehta", type: "USER" },
    status: "SUCCESS",
    ipAddress: "10.0.0.42",
    userAgent: "Mozilla/5.0 (Macintosh)",
    location: "Hyderabad, IN"
  },
  {
    id: "LOG-9920",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    actor: { id: "SYS", name: "System", email: "system@naprocs.com", role: "SYSTEM" },
    action: "LOGIN_FAILED",
    module: "AUTH",
    status: "FAILED",
    ipAddress: "192.168.1.45",
    userAgent: "Unknown/Script",
    location: "Unknown"
  },
  {
    id: "LOG-9919",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: { id: "EMP-102", name: "Tejesh Kumar", email: "tejesh@naprocs.com", role: "HR_DIRECTOR" },
    action: "DEPARTMENT_CREATED",
    module: "ORG",
    target: { id: "DEPT-AI", name: "AI Innovations", type: "DEPARTMENT" },
    status: "SUCCESS",
    ipAddress: "10.0.0.12",
    userAgent: "Mozilla/5.0 (Windows NT 10.0)",
    location: "Hyderabad, IN"
  },
  {
    id: "LOG-9918",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actor: { id: "EMP-104", name: "Sarah Q.", email: "sarah.q@naprocs.com", role: "VP_SALES" },
    action: "DATA_EXPORTED",
    module: "EMPLOYEES",
    target: { id: "REP-44", name: "Q3 Headcount Report", type: "REPORT" },
    status: "WARNING",
    ipAddress: "76.104.22.1",
    userAgent: "Mozilla/5.0 (Macintosh)",
    location: "San Francisco, US"
  },
  {
    id: "LOG-9917",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    actor: { id: "EMP-105", name: "Arjun Mehta", email: "arjun.m@naprocs.com", role: "EMPLOYEE" },
    action: "LEAVE_APPROVED",
    module: "LEAVES",
    target: { id: "LV-1002", name: "Arjun Mehta (Sick Leave)", type: "SYSTEM" },
    status: "SUCCESS",
    ipAddress: "10.0.0.88",
    userAgent: "Mozilla/5.0 (Macintosh)",
    location: "Bangalore, IN"
  },
  {
    id: "LOG-9916",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    actor: { id: "EMP-108", name: "Priya Menon", email: "priya.m@naprocs.com", role: "HR_BP" },
    action: "PROFILE_UPDATED",
    module: "EMPLOYEES",
    target: { id: "EMP-106", name: "Anita M.", type: "USER" },
    details: "Updated Designation to Sr. Frontend Developer",
    status: "SUCCESS",
    ipAddress: "10.0.0.15",
    userAgent: "Mozilla/5.0 (Windows NT 10.0)",
    location: "Hyderabad, IN"
  }
];

export default function EventsExplorerPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const [globalFilter, setGlobalFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = useMemo(() => {
    let data = [...ALL_MOCK_EVENTS];

    // Role-based visibility
    if (activeRole === "HR") {
      data = data.filter(d => ["EMPLOYEES", "ORG", "LEAVES", "ATTENDANCE"].includes(d.module));
    }

    // UI Filters
    if (moduleFilter) data = data.filter(d => d.module === moduleFilter);
    if (statusFilter) data = data.filter(d => d.status === statusFilter);

    return data;
  }, [activeRole, moduleFilter, statusFilter]);

  const columns = useMemo<ColumnDef<AuditEvent>[]>(() => [
    {
      accessorKey: "timestamp",
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          TIMESTAMP <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => {
        const d = new Date(row.original.timestamp);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">{d.toLocaleDateString()}</span>
            <span className="text-[10px] font-mono text-slate-500">{d.toLocaleTimeString()}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "actor",
      header: "ACTOR",
      cell: ({ row }) => {
        const actor = row.original.actor;
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">{actor.name}</span>
            <span className="text-[10px] font-semibold text-slate-500">{actor.email}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "action",
      header: "ACTION & TARGET",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded w-max">
              {e.action}
            </span>
            {e.target && (
              <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                Target: {e.target.name}
              </span>
            )}
            {e.details && (
              <span className="text-[10px] font-medium text-slate-500 italic truncate max-w-[200px]">
                {e.details}
              </span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "module",
      header: "MODULE",
      cell: ({ row }) => (
        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
          {row.original.module}
        </span>
      )
    },
    {
      accessorKey: "context",
      header: "CONTEXT",
      cell: ({ row }) => {
        const e = row.original;
        return (
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-700">{e.ipAddress}</span>
            <span className="text-[9px] font-medium text-slate-400 truncate max-w-[150px]" title={e.userAgent}>{e.userAgent}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md w-max border ${s === "SUCCESS" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
              s === "FAILED" ? "bg-rose-50 text-rose-700 border-rose-200" :
                "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${s === "SUCCESS" ? "bg-emerald-500" : s === "FAILED" ? "bg-rose-500" : "bg-amber-500"
              }`} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{s}</span>
          </div>
        );
      }
    }
  ], []);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[700px]">

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between z-10">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative min-w-[250px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              type="text"
              placeholder="Search actor, target, IP..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="h-9 flex items-center bg-white border border-slate-200 rounded-lg px-1 shadow-sm">
            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 cursor-pointer border-r border-slate-100"
            >
              <option value="">All Modules</option>
              <option value="AUTH">Auth</option>
              <option value="EMPLOYEES">Employees</option>
              <option value="ORG">Organization</option>
              <option value="LEAVES">Leaves</option>
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>

          <button className="flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-colors shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5" /> More Filters
          </button>
        </div>

        <button className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
          <Download className="w-3.5 h-3.5" /> Export Logs
        </button>
      </div>

      {/* ── Table Area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm shadow-slate-200/50">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-4 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm font-medium text-slate-500">
                  No audit logs found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{table.getRowModel().rows.length}</span> of <span className="text-slate-900 font-bold">{filteredData.length}</span> events
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}

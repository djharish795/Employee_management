"use client";

import React, { useState, useMemo } from "react";
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, 
  ColumnDef, flexRender, getSortedRowModel
} from "@tanstack/react-table";
import { 
  Search, Download, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, FileCheck, Eye, EyeOff
} from "lucide-react";
import { ComplianceRole, ConsentRecord } from "@/types/compliance";

interface ConsentsPanelProps {
  activeRole: ComplianceRole;
}

const MOCK_CONSENTS: ConsentRecord[] = [
  {
    id: "CON-1001",
    employeeId: "EMP-105",
    employeeName: "Arjun Mehta",
    type: "DATA_PROCESSING",
    status: "ACTIVE",
    dateAccepted: "2023-01-15T09:00:00Z",
    lastUpdated: "2023-01-15T09:00:00Z"
  },
  {
    id: "CON-1002",
    employeeId: "EMP-106",
    employeeName: "Anita M.",
    type: "BIOMETRIC",
    status: "EXPIRED",
    dateAccepted: "2022-06-10T10:30:00Z",
    expiryDate: "2023-06-10T10:30:00Z",
    lastUpdated: "2023-06-11T08:00:00Z"
  },
  {
    id: "CON-1003",
    employeeId: "EMP-104",
    employeeName: "Sarah Q.",
    type: "BACKGROUND_CHECK",
    status: "ACTIVE",
    dateAccepted: "2023-02-20T14:15:00Z",
    lastUpdated: "2023-02-20T14:15:00Z"
  },
  {
    id: "CON-1004",
    employeeId: "EMP-108",
    employeeName: "Priya Menon",
    type: "MARKETING",
    status: "REVOKED",
    dateAccepted: "2023-03-01T11:00:00Z",
    lastUpdated: "2023-08-15T16:45:00Z"
  },
  {
    id: "CON-1005",
    employeeId: "EMP-107",
    employeeName: "Ravi Kumar",
    type: "BIOMETRIC",
    status: "PENDING",
    dateAccepted: "2023-11-01T09:00:00Z",
    lastUpdated: "2023-11-01T09:00:00Z"
  }
];

export default function ConsentsPanel({ activeRole }: ConsentsPanelProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [maskPII, setMaskPII] = useState(true);

  // If role is CEO, they really shouldn't be managing granular consent records.
  // We allow viewing, but maybe with a persistent PII mask they cannot toggle.
  const isPrivileged = ["COMPLIANCE_OFFICER", "ADMIN", "HR", "LEGAL"].includes(activeRole);
  const canToggleMask = isPrivileged;

  const filteredData = useMemo(() => {
    let data = [...MOCK_CONSENTS];
    if (typeFilter) data = data.filter(d => d.type === typeFilter);
    if (statusFilter) data = data.filter(d => d.status === statusFilter);
    return data;
  }, [typeFilter, statusFilter]);

  const columns = useMemo<ColumnDef<ConsentRecord>[]>(() => [
    {
      accessorKey: "employeeName",
      header: "EMPLOYEE",
      cell: ({ row }) => {
        const emp = row.original;
        const displayName = maskPII ? emp.employeeName.replace(/^(.)(.*)(.)$/, "$1***$3") : emp.employeeName;
        return (
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-900">{displayName}</span>
            <span className="text-[10px] font-mono text-slate-500">{emp.employeeId}</span>
          </div>
        );
      }
    },
    {
      accessorKey: "type",
      header: "CONSENT TYPE",
      cell: ({ row }) => {
        const typeStr = row.original.type.replace("_", " ");
        return (
          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
            {typeStr}
          </span>
        );
      }
    },
    {
      accessorKey: "status",
      header: "STATUS",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
            s === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            s === "EXPIRED" ? "bg-amber-50 text-amber-700 border-amber-200" :
            s === "REVOKED" ? "bg-rose-50 text-rose-700 border-rose-200" :
            "bg-slate-50 text-slate-700 border-slate-200"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              s === "ACTIVE" ? "bg-emerald-500" : s === "EXPIRED" ? "bg-amber-500" : s === "REVOKED" ? "bg-rose-500" : "bg-slate-400"
            }`} />
            {s}
          </div>
        );
      }
    },
    {
      accessorKey: "dateAccepted",
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ACCEPTED ON <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-600">
          {new Date(row.original.dateAccepted).toLocaleDateString()}
        </span>
      )
    },
    {
      accessorKey: "expiryDate",
      header: "EXPIRY",
      cell: ({ row }) => {
        if (!row.original.expiryDate) return <span className="text-[10px] font-bold text-slate-400">NEVER</span>;
        const d = new Date(row.original.expiryDate);
        const isPast = d.getTime() < Date.now();
        return (
          <span className={`text-xs font-medium ${isPast ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
            {d.toLocaleDateString()}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: "ACTIONS",
      cell: () => (
        <button className="text-[10px] font-bold text-teal-600 hover:text-teal-700 hover:underline uppercase tracking-wider">
          View Details
        </button>
      )
    }
  ], [maskPII]);

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
              placeholder="Search employee..." 
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all font-medium"
            />
          </div>
          
          <div className="h-9 flex items-center bg-white border border-slate-200 rounded-lg px-1 shadow-sm">
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 cursor-pointer border-r border-slate-100"
            >
              <option value="">All Types</option>
              <option value="DATA_PROCESSING">Data Processing</option>
              <option value="BIOMETRIC">Biometric</option>
              <option value="BACKGROUND_CHECK">Background Check</option>
              <option value="MARKETING">Marketing</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="REVOKED">Revoked</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <button className="flex items-center gap-2 h-9 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-bold transition-colors shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5" /> More Filters
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { if (canToggleMask) setMaskPII(!maskPII) }}
            disabled={!canToggleMask}
            className={`flex items-center gap-2 h-9 px-3 border rounded-lg text-xs font-bold transition-colors shadow-sm ${
              maskPII 
                ? "bg-slate-800 border-slate-900 text-white hover:bg-slate-700" 
                : "bg-white border-rose-200 text-rose-600 hover:bg-rose-50"
            } ${!canToggleMask && "opacity-50 cursor-not-allowed"}`}
            title={!canToggleMask ? "You do not have permission to unmask PII." : ""}
          >
            {maskPII ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {maskPII ? "PII Masked" : "PII Exposed"}
          </button>

          <button className="flex items-center gap-2 h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export Register
          </button>
        </div>
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
                    <td key={cell.id} className="p-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm font-medium text-slate-500">
                  No consent records found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{table.getRowModel().rows.length}</span> of <span className="text-slate-900 font-bold">{filteredData.length}</span> records
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

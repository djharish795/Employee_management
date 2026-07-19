"use client";

import { usePermissions } from "@/hooks/use-permissions";
import React, { useState, useMemo } from "react";
import { 
  useReactTable, getCoreRowModel, getPaginationRowModel, getFilteredRowModel, 
  ColumnDef, flexRender, getSortedRowModel
} from "@tanstack/react-table";
import { 
  Search, Download, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, UserPlus, Shield, Lock, Unlock, Mail, ShieldAlert
} from "lucide-react";
import { SettingsRole, AdminUserRecord } from "@/types/settings";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

interface UsersPanelProps {
  
}



export default function UsersPanel() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const { canManageSettings: canManageUsers } = usePermissions();

  const { data: apiUsers = [], isLoading } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const res = await apiClient.get('/employees?limit=1000');
      if (!res.data || !res.data.data) return [];
      
      return res.data.data.map((emp: any) => ({
        id: emp.id,
        name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Unknown",
        email: emp.officialEmail || "",
        role: emp.user?.role || emp.designation?.title || "Vacant / No Role",
        department: emp.department?.name || emp.department?.code || "Unassigned",
        status: emp.status === "ACTIVE" ? "ACTIVE" : (emp.status === "ONBOARDING" ? "INACTIVE" : "LOCKED"),
        lastLogin: emp.user?.lastLogin || new Date().toISOString(),
        mfaEnabled: emp.user?.mfaEnabled || false,
      })) as AdminUserRecord[];
    }
  });

  const filteredData = useMemo(() => {
    let data = [...apiUsers];
    if (roleFilter) data = data.filter(d => d.role === roleFilter);
    if (statusFilter) data = data.filter(d => d.status === statusFilter);
    return data;
  }, [apiUsers, roleFilter, statusFilter]);

  const columns = useMemo<ColumnDef<AdminUserRecord>[]>(() => [
    {
      accessorKey: "name",
      header: "USER",
      cell: ({ row }) => {
        const usr = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
              {usr.name.substring(0, 2)}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-900">{usr.name}</span>
              <span className="text-[10px] font-medium text-slate-500">{usr.email}</span>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "role",
      header: "ROLE & DEPT",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-max border border-slate-200">
              {row.original.role}
            </span>
            <span className="text-[10px] font-medium text-slate-500">{row.original.department}</span>
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
          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
            s === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            s === "INACTIVE" ? "bg-slate-50 text-slate-600 border-slate-200" :
            "bg-rose-50 text-rose-700 border-rose-200"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              s === "ACTIVE" ? "bg-emerald-500" : s === "INACTIVE" ? "bg-slate-400" : "bg-rose-500"
            }`} />
            {s}
          </div>
        );
      }
    },
    {
      accessorKey: "mfaEnabled",
      header: "SECURITY",
      cell: ({ row }) => {
        const mfa = row.original.mfaEnabled;
        return mfa ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-teal-700">
            <Shield className="w-3.5 h-3.5" /> MFA ON
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
            <ShieldAlert className="w-3.5 h-3.5" /> MFA OFF
          </span>
        );
      }
    },
    {
      accessorKey: "lastLogin",
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          LAST LOGIN <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-[10px] font-medium text-slate-600">
          {new Date(row.original.lastLogin).toLocaleString()}
        </span>
      )
    },
  ], []);

  const handleExport = () => {
    if (filteredData.length === 0) return;
    const headers = ["ID", "Name", "Email", "Role", "Department", "Status", "Last Login", "MFA Enabled"];
    const csvRows = filteredData.map(usr => [
      usr.id,
      `"${usr.name}"`,
      usr.email,
      usr.role,
      usr.department,
      usr.status,
      `"${new Date(usr.lastLogin).toLocaleString()}"`,
      usr.mfaEnabled ? "Yes" : "No"
    ].join(','));
    const csvString = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const uniqueRoles = useMemo(() => {
    const roles = apiUsers.map(u => u.role).filter(Boolean);
    return Array.from(new Set(roles)).sort();
  }, [apiUsers]);

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
              placeholder="Search users..." 
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          
          <div className="h-9 flex items-center bg-white border border-slate-200 rounded-lg px-1 shadow-sm">
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 cursor-pointer border-r border-slate-100"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="h-full bg-transparent text-xs font-semibold text-slate-700 focus:outline-none px-2 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="LOCKED">Locked</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 h-9 px-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          {canManageUsers && (
            <button onClick={() => router.push('/employees/add')} className="flex items-center gap-2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
              <UserPlus className="w-3.5 h-3.5" /> Invite User
            </button>
          )}
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
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm font-medium text-slate-500">
                  Loading users...
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
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
                  No users found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900 font-bold">{table.getRowModel().rows.length}</span> of <span className="text-slate-900 font-bold">{filteredData.length}</span> users
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

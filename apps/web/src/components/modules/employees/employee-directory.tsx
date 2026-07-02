"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Employee, DirectoryFilters } from "@/types/employees";
import { useAuthStore } from "@/store/auth";

import { EmployeeActionModals } from "./employee-action-modals";
import { EmployeeRowActions, EmployeeActionType } from "./employee-row-actions";

export default function EmployeeDirectory() {
  const queryClient = useQueryClient();

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    type: EmployeeActionType | null;
    employee: Employee | null;
  }>({ isOpen: false, type: null, employee: null });

  const searchParams = useSearchParams();
  const initialDept = searchParams.get("department") || "";

  // Filters State
  const [filters, setFilters] = useState<DirectoryFilters>({
    search: "",
    department: initialDept,
    designation: "",
    location: "",
    status: "",
  });

  // Automatically update filter if the URL changes while component is mounted
  useEffect(() => {
    const dept = searchParams.get("department");
    if (dept) {
      setFilters(prev => ({ ...prev, department: dept }));
    }
  }, [searchParams]);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Fetch from API
  const fetchEmployees = async (): Promise<Employee[]> => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    const res = await fetch(`${url}/employees?page=1&limit=100`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (!res.ok) throw new Error("Failed to fetch employees");
    const responseData = await res.json();

    return responseData.data.map((emp: any) => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Unknown Employee",
      email: emp.officialEmail || "",
      photoUrl: emp.photoUrl || null,
      initials: `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase() || "UN",
      avatarBg: "bg-slate-100 text-slate-600",
      department: emp.department?.name || emp.departmentId || "Unassigned",
      designation: emp.designation?.title || emp.designationId || "Unassigned",
      status: emp.status || "Active",
      joinedDate: emp.createdAt ? new Date(emp.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "Unknown",
      location: emp.workLocation || "India",
      manager: emp.reportingManagerId ? {
        id: emp.reportingManagerId,
        name: "Assigned Manager",
        photoUrl: null,
      } : undefined
    }));
  };

  const { data: rawEmployees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const filteredEmployees = useMemo(() => {
    let result = [...rawEmployees];

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          (emp.employeeId || emp.id).toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q)
      );
    }
    if (filters.department) {
      result = result.filter((emp) => emp.department === filters.department);
    }
    if (filters.status) {
      result = result.filter((emp) => emp.status.toLowerCase() === filters.status.toLowerCase());
    }

    return result;
  }, [rawEmployees, filters]);

  const updateEmployeesMutation = useMutation({
    mutationFn: async (updatedList: Employee[]) => updatedList,
    onSuccess: (data) => {
      queryClient.setQueryData(["employees"], data);
    },
  });

  const handleAction = (action: EmployeeActionType, employeeId: string) => {
    const employee = rawEmployees.find(e => e.id === employeeId);
    if (!employee) return;
    setActionModalState({ isOpen: true, type: action, employee });
  };

  const handleActionSuccess = (action: EmployeeActionType, employeeId: string, payload?: any) => {
    let updatedList = [...rawEmployees];
    if (action === "delete") {
      updatedList = updatedList.filter(e => e.id !== employeeId);
    } else {
      updatedList = updatedList.map(emp => {
        if (emp.id !== employeeId) return emp;
        switch (action) {
          case "edit":
          case "transfer-dept":
          case "change-designation":
          case "assign-manager":
            return { ...emp, ...payload };
          case "toggle-status":
            return { ...emp, status: emp.status === "DEACTIVATED" ? "ACTIVE" : "DEACTIVATED" };
          default:
            return emp;
        }
      });
    }
    updateEmployeesMutation.mutate(updatedList);
  };

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1 font-bold">
            EMPLOYEE <ArrowUpDown className="w-3 h-3 ml-1" />
          </button>
        ),
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 relative border border-slate-200 shadow-sm overflow-hidden ${emp.avatarBg}`}>
                {emp.photoUrl ? (
                  <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{emp.initials}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-snug">{emp.name}</div>
                <div className="text-[10px] font-semibold text-slate-400 mt-0.5">{emp.employeeId || emp.id}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "department",
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1 font-bold">
            DEPARTMENT <ArrowUpDown className="w-3 h-3 ml-1" />
          </button>
        ),
        cell: ({ row }) => <span className="text-sm text-slate-700 font-medium">{row.original.department}</span>,
      },
      {
        accessorKey: "designation",
        header: "DESIGNATION",
        cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.designation}</span>,
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();
          let bg = "bg-slate-100", text = "text-slate-600";
          if (status === "active") {
            bg = "bg-green-100"; text = "text-green-700";
          } else if (status === "probation") {
            bg = "bg-yellow-100"; text = "text-yellow-700";
          } else if (status === "notice period") {
            bg = "bg-red-100"; text = "text-red-700";
          }
          return (
            <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full capitalize ${bg} ${text}`}>
              {row.original.status}
            </span>
          );
        },
      },
      {
        accessorKey: "joinedDate",
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="flex items-center gap-1 font-bold">
            JOINED <ArrowUpDown className="w-3 h-3 ml-1" />
          </button>
        ),
        cell: ({ row }) => <span className="text-sm text-slate-600">{row.original.joinedDate}</span>,
      },
      {
        id: "actions",
        header: "ACTIONS",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Link href={`/employees/${row.original.id}`} className="text-sm font-bold text-blue-600 hover:underline">
              View
            </Link>
            <EmployeeRowActions
              employeeId={row.original.id}
              employeeName={row.original.name}
              status={row.original.status}
              onAction={handleAction}
            />
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredEmployees,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
  });

  const handleClearFilters = () => setFilters({ search: "", department: "", designation: "", location: "", status: "" });
  const hasActiveFilters = filters.department || filters.status;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-transparent pt-2">
          {/* Badge */}
          <div className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-full">
            {filteredEmployees.length} employees
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, employee ID, or department"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>
            {/* Filter Button */}
            <button className="flex items-center justify-center h-10 px-4 gap-2 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            {/* Add Employee */}
            <Link href="/employees/add" className="flex items-center justify-center h-10 px-4 gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow-sm transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Add employee
            </Link>
          </div>
        </div>

        {/* Active Filters Row (Hardcoded mock values as per screenshot for demonstration, or dynamic) */}
        <div className="flex items-center gap-3 mt-[-10px]">
          <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
            Department: Engineering
            <button className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
          </div>
          <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
            Status: Active
            <button className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
          </div>
          <button onClick={handleClearFilters} className="text-blue-600 text-xs font-bold hover:underline ml-2">
            Clear all
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-slate-200 bg-slate-50/50">
                    {hg.headers.map((h) => (
                      <th key={h.id} className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="w-8 h-8 border-4 border-slate-900/35 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                      <span className="text-sm font-semibold text-slate-500">Loading directory...</span>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400">
                      <h3 className="text-base font-bold text-slate-700">No employees found</h3>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      {row.getVisibleCells().map((c) => (
                        <td key={c.id} className="px-6 py-4 whitespace-nowrap">
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredEmployees.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="text-sm font-medium text-slate-500">
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredEmployees.length)} of {filteredEmployees.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {table.getPageOptions().filter(pageIndex => {
                  const current = table.getState().pagination.pageIndex;
                  return Math.abs(current - pageIndex) <= 2;
                }).map((pageIndex) => (
                  <button
                    key={pageIndex}
                    onClick={() => table.setPageIndex(pageIndex)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md font-bold text-sm ${
                      table.getState().pagination.pageIndex === pageIndex
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {pageIndex + 1}
                  </button>
                ))}
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EmployeeActionModals
        actionType={actionModalState.type}
        employee={actionModalState.employee}
        isOpen={actionModalState.isOpen}
        onClose={() => setActionModalState({ isOpen: false, type: null, employee: null })}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}

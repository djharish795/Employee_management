"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import Image from "next/image";

export default function EmployeeDirectory() {
  const queryClient = useQueryClient();

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    type: EmployeeActionType | null;
    employee: Employee | null;
  }>({ isOpen: false, type: null, employee: null });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
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
    const url = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${url}/employees?page=1&limit=100`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Failed to fetch employees:", res.status, errText);
      throw new Error("Failed to fetch employees");
    }
    
    const responseData = await res.json();
    if (!responseData || !responseData.data || !Array.isArray(responseData.data)) {
      console.error("Invalid response format:", responseData);
      return [];
    }

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

  const { data: rawEmployees = [], isLoading, isError, error } = useQuery<Employee[]>({
    queryKey: ["employees", accessToken],
    queryFn: fetchEmployees,
    enabled: !!accessToken,
  });

  const fetchDepartments = async () => {
    const url = process.env.NEXT_PUBLIC_API_URL!;
    const res = await fetch(`${url}/departments`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    });
    if (!res.ok) return { data: [] };
    return res.json();
  };

  const { data: departmentsData } = useQuery({
    queryKey: ["departments", accessToken],
    queryFn: fetchDepartments,
    enabled: !!accessToken,
  });

  if (isError) {
    console.error("Employee fetch error:", error);
  }

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

  const uniqueDepartments = useMemo<string[]>(() => {
    if (departmentsData?.data && Array.isArray(departmentsData.data)) {
      return departmentsData.data.map((d: any) => d.name as string).sort();
    }
    return [];
  }, [departmentsData]);

  const updateEmployeesMutation = useMutation({
    mutationFn: async (updatedList: Employee[]) => updatedList,
    onSuccess: (data) => {
      queryClient.setQueryData(["employees", accessToken], data);
    },
  });

  const handleAction = (action: EmployeeActionType, employeeId: string) => {
    const employee = rawEmployees.find(e => e.id === employeeId);
    if (!employee) return;
    
    if (action === "view-documents" || action === "download-pdf") {
      handleActionSuccess(action, employeeId);
      return;
    }
    
    setActionModalState({ isOpen: true, type: action, employee });
  };

  const handleActionSuccess = async (action: EmployeeActionType, employeeId: string, payload?: any) => {
    const url = process.env.NEXT_PUBLIC_API_URL!;
    const headers = { 
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    };

    try {
      if (action === "view-documents") {
        router.push(`/employees/${employeeId}?tab=documents`);
        return;
      }
      
      if (action === "download-pdf") {
        const emp = rawEmployees.find(e => e.id === employeeId);
        if (emp) {
          const doc = new jsPDF();
          doc.setFontSize(20);
          doc.text(`Employee Profile: ${emp.name}`, 14, 22);
          
          doc.setFontSize(10);
          doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
          
          autoTable(doc, {
            startY: 40,
            head: [["Field", "Value"]],
            body: [
              ["Employee ID", emp.employeeId || emp.id],
              ["Name", emp.name],
              ["Email", emp.email],
              ["Department", emp.department],
              ["Designation", emp.designation],
              ["Status", emp.status],
              ["Manager ID", emp.manager?.id || "N/A"],
              ["Manager Name", emp.manager?.name || "N/A"]
            ],
            theme: 'grid',
            headStyles: { fillColor: [63, 131, 248] },
          });
          
          doc.save(`Employee_Profile_${emp.employeeId || emp.id}.pdf`);
        }
        return;
      }

      let res;
      switch (action) {
        case "edit":
          const [firstName, ...lastNameParts] = (payload.name || "").split(" ");
          const lastName = lastNameParts.join(" ") || "";
          res = await fetch(`${url}/employees/${employeeId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ 
              firstName, 
              lastName, 
              officialEmail: payload.email, 
              departmentId: payload.department, 
              designationId: payload.designation 
            }),
          });
          break;
        case "assign-manager":
          res = await fetch(`${url}/employees/org-chart/reassign`, {
            method: "POST",
            headers,
            body: JSON.stringify({ employeeId, newManagerId: payload.manager }),
          });
          break;
        case "transfer-dept":
          res = await fetch(`${url}/employees/${employeeId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ departmentId: payload.department }),
          });
          break;
        case "change-designation":
          res = await fetch(`${url}/employees/${employeeId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ designationId: payload.designation }),
          });
          break;
        case "toggle-status":
          const currentEmp = rawEmployees.find((e) => e.id === employeeId);
          const newStatus = currentEmp?.status === "DEACTIVATED" ? "ACTIVE" : "DEACTIVATED";
          res = await fetch(`${url}/employees/${employeeId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status: newStatus }),
          });
          break;
        case "reset-password":
          res = await fetch(`${url}/employees/${employeeId}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ password: payload.password, oldPassword: payload.oldPassword }),
          });
          break;
        case "delete":
          res = await fetch(`${url}/employees/${employeeId}`, {
            method: "DELETE",
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          });
          break;
      }

      if (res && !res.ok) {
        let errText = await res.text();
        try {
          const errObj = JSON.parse(errText);
          if (errObj.message) errText = Array.isArray(errObj.message) ? errObj.message.join(", ") : errObj.message;
        } catch (e) {}
        alert(`Failed to complete action: \n${errText}`);
        return;
      }

      // Refresh list
      queryClient.invalidateQueries({ queryKey: ["employees", accessToken] });
    } catch (err) {
      console.error("Action error:", err);
      alert("A network error occurred while performing this action.");
    }
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
                  <Image src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
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
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center h-10 px-4 gap-2 bg-white border border-slate-300 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-4 z-50 flex flex-col gap-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-sm">Filters</span>
                    <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Department</label>
                    <select 
                      value={filters.department}
                      onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full h-9 rounded-md border border-slate-300 text-sm px-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    >
                      <option value="">All Departments</option>
                      {uniqueDepartments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select 
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full h-9 rounded-md border border-slate-300 text-sm px-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    >
                      <option value="">All Statuses</option>
                      <option value="ACTIVE">Active</option>
                      <option value="PROBATION">Probation</option>
                      <option value="NOTICE_PERIOD">Notice Period</option>
                      <option value="EXITED">Exited</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            {/* Add Employee */}
            <Link href="/employees/add" className="flex items-center justify-center h-10 px-4 gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow-sm transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4" />
              Add employee
            </Link>
          </div>
        </div>

        {/* Active Filters Row */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 mt-[-10px]">
            {filters.department && (
              <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                Department: {filters.department}
                <button onClick={() => setFilters(prev => ({ ...prev, department: "" }))} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
              </div>
            )}
            {filters.status && (
              <div className="flex items-center bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
                Status: {filters.status.charAt(0).toUpperCase() + filters.status.slice(1).toLowerCase().replace('_', ' ')}
                <button onClick={() => setFilters(prev => ({ ...prev, status: "" }))} className="ml-2 text-slate-400 hover:text-slate-600"><X className="w-3 h-3" /></button>
              </div>
            )}
            <button onClick={handleClearFilters} className="text-blue-600 text-xs font-bold hover:underline ml-2">
              Clear all
            </button>
          </div>
        )}

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

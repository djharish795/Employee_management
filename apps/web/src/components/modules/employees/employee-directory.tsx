"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  Filter,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  UserPlus,
  Trash2,
  Users,
  CheckCircle2,
  MapPin,
  SlidersHorizontal,
  Grid,
  List,
  Building2,
  Check,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { Employee, DirectoryRole, DirectoryRoleConfig, DirectoryFilters } from "@/types/employees";
import { useAuthStore } from "@/store/auth";

import { EmployeeActionModals } from "./employee-action-modals";
import { EmployeeRowActions, EmployeeActionType } from "./employee-row-actions";

// Removed ROLE_CONFIGS generic module abstraction;
// Now using explicit static configuration modeled after CEO role.

export default function EmployeeDirectory() {
  const queryClient = useQueryClient();

  // Removed role dropdown simulation state
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Restore view mode preference from localStorage
  React.useEffect(() => {
    const savedMode = localStorage.getItem("employeeViewMode") as "table" | "grid" | null;
    if (savedMode) setViewMode(savedMode);
  }, []);

  const handleViewModeChange = (mode: "table" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("employeeViewMode", mode);
  };

  const [actionModalState, setActionModalState] = useState<{
    isOpen: boolean;
    type: EmployeeActionType | null;
    employee: Employee | null;
  }>({ isOpen: false, type: null, employee: null });

  // Filters State
  const [filters, setFilters] = useState<DirectoryFilters>({
    search: "",
    department: "",
    designation: "",
    location: "",
    status: "",
  });

  // Role explicitly bound to reference architecture (CEO)

  const accessToken = useAuthStore((state) => state.accessToken);

  // Fetch from API
  const fetchEmployees = async (): Promise<Employee[]> => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    const res = await fetch(`${url}/employees?page=1&limit=100`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    if (!res.ok) throw new Error("Failed to fetch employees");
    const responseData = await res.json();

    // Map backend data to frontend Employee interface
    return responseData.data.map((emp: any) => ({
      id: emp.id,
      employeeId: emp.employeeId,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "Unknown Employee",
      email: emp.officialEmail || "",
      photoUrl: emp.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.firstName || "U"}`,
      initials: `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase() || "UN",
      avatarBg: "bg-blue-100 text-blue-600",
      department: emp.department?.name || emp.departmentId || "Unassigned",
      designation: emp.designation?.title || emp.designationId || "Unassigned",
      status: emp.status || "ACTIVE",
      joinedDate: emp.createdAt ? new Date(emp.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "Unknown",
      location: emp.workLocation || "India",
      manager: emp.reportingManagerId ? {
        id: emp.reportingManagerId,
        name: "Assigned Manager",
        photoUrl: `https://api.dicebear.com/7.x/initials/svg?seed=Manager`,
      } : undefined
    }));
  };

  // React Query query to fetch data
  const { data: rawEmployees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  // Filter employees according to roles scope and filter parameters
  const filteredEmployees = useMemo(() => {
    let result = [...rawEmployees];

    // Explicitly using ALL scope for reference architecture
    // Data filtering by team/manager will be handled solely via Backend API queries.

    // 2. Text search (Name, ID, Email)
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          (emp.employeeId || emp.id).toLowerCase().includes(q) ||
          emp.email.toLowerCase().includes(q)
      );
    }

    // 3. Category filters
    if (filters.department) {
      result = result.filter((emp) => emp.department === filters.department);
    }
    if (filters.designation) {
      result = result.filter((emp) => emp.designation === filters.designation);
    }
    if (filters.location) {
      result = result.filter((emp) => emp.location === filters.location);
    }
    if (filters.status) {
      result = result.filter((emp) => emp.status === filters.status);
    }

    return result;
  }, [rawEmployees, filters]);

  // Bulk mutations
  const updateEmployeesMutation = useMutation({
    mutationFn: async (updatedList: Employee[]) => {
      // Pure logic: In the future, loop through and make PUT requests.
      // For now, we rely on the React Query optimistic update without storing in local temporary states.
      return updatedList;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["employees"], data);
      setRowSelection({});
    },
  });

  // Derived bulk properties
  const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
  const selectedEmployeesList = rawEmployees.filter(emp => selectedIds.includes(emp.id));
  const isAllDeactivated = selectedEmployeesList.length > 0 && selectedEmployeesList.every(emp => emp.status === "DEACTIVATED");

  const handleBulkDeactivate = () => {
    const updated = rawEmployees.map((emp) => {
      if (selectedIds.includes(emp.id)) {
        const newStatus: Employee["status"] = isAllDeactivated ? "ACTIVE" : "DEACTIVATED";
        return { ...emp, status: newStatus };
      }
      return emp;
    });
    updateEmployeesMutation.mutate(updated);
  };

  const handleBulkAssignManager = () => {
    // Instead of randomly assigning, open the Assign Manager modal for the first selected employee
    // In a real app, you'd have a specific Bulk Assign Manager modal.
    if (selectedEmployeesList.length > 0) {
      setActionModalState({ isOpen: true, type: "assign-manager", employee: selectedEmployeesList[0] });
    }
  };

  // Row Action Handlers
  const handleAction = (action: EmployeeActionType, employeeId: string) => {
    const employee = rawEmployees.find(e => e.id === employeeId);
    if (!employee) return;

    if (action === "view-documents" || action === "download-pdf") {
      alert(`Simulating ${action} for ${employee.name}`);
      return;
    }

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



  // Define unique lists for dropdown filters
  const departments = useMemo(
    () => Array.from(new Set(rawEmployees.map((e) => e.department))),
    [rawEmployees]
  );
  const designations = useMemo(
    () => Array.from(new Set(rawEmployees.map((e) => e.designation))),
    [rawEmployees]
  );
  const locations = useMemo(
    () => Array.from(new Set(rawEmployees.map((e) => e.location))),
    [rawEmployees]
  );
  const statuses = ["ACTIVE", "PROBATION", "NOTICE PERIOD", "ONBOARDING", "DEACTIVATED"];

  // Table Column Definitions
  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
      {
        accessorKey: "name",
        header: "PHOTO & NAME",
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 relative border border-slate-200 shadow-sm overflow-hidden ${emp.avatarBg}`}>
                {emp.photoUrl ? (
                  <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{emp.initials}</span>
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 leading-snug">{emp.name}</div>
                <div className="text-xs font-semibold text-slate-400 mt-0.5">{emp.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "employeeId",
        header: "EMP ID",
        cell: ({ row }) => (
          <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100/60 px-2 py-1 rounded">
            {row.original.employeeId || row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "department",
        header: "DEPARTMENT",
        cell: ({ row }) => <span className="text-sm font-medium text-slate-700">{row.original.department}</span>,
      },
      {
        accessorKey: "designation",
        header: "DESIGNATION",
        cell: ({ row }) => <span className="text-sm font-medium text-slate-500">{row.original.designation}</span>,
      },
      {
        accessorKey: "manager",
        header: "MANAGER",
        cell: ({ row }) => {
          const mgr = row.original.manager;
          if (!mgr) return <span className="text-xs text-slate-400 font-medium">—</span>;
          return (
            <div className="flex items-center gap-2 group/mgr" title={mgr.name}>
              <div className="w-6 h-6 rounded-full bg-slate-200 border border-slate-300 shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-700">
                {mgr.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-600 hidden group-hover/mgr:inline-block md:inline-block truncate max-w-[80px]">
                {mgr.name}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ row }) => {
          const status = row.original.status;
          let badgeStyles = "text-slate-700 bg-slate-100";
          if (status === "ACTIVE") badgeStyles = "text-emerald-700 bg-emerald-50 border border-emerald-200/50";
          else if (status === "PROBATION") badgeStyles = "text-amber-700 bg-amber-50 border border-amber-200/50";
          else if (status === "NOTICE PERIOD") badgeStyles = "text-rose-700 bg-rose-50 border border-rose-200/50";
          else if (status === "ONBOARDING") badgeStyles = "text-slate-900 bg-slate-100 border border-slate-300/50";
          else if (status === "DEACTIVATED") badgeStyles = "text-slate-500 bg-slate-100 border border-slate-200/50";

          return (
            <span className={`px-2.5 py-1 text-[10px] font-bold tracking-wider rounded-md uppercase ${badgeStyles}`}>
              {status}
            </span>
          );
        },
      },
    ],
    []
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: filteredEmployees,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.id,
  });

  const selectedCount = Object.keys(rowSelection).filter((k) => rowSelection[k]).length;

  // Analytical Metrics for Sidebar and Header Widgets
  const summaryMetrics = useMemo(() => {
    const total = filteredEmployees.length;
    const active = filteredEmployees.filter((e) => e.status === "ACTIVE").length;
    const probation = filteredEmployees.filter((e) => e.status === "PROBATION").length;
    const notice = filteredEmployees.filter((e) => e.status === "NOTICE PERIOD").length;
    const onboarding = filteredEmployees.filter((e) => e.status === "ONBOARDING").length;

    // Department counts
    const deptMap: Record<string, number> = {};
    filteredEmployees.forEach((e) => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });

    // Locations counts
    const locMap: Record<string, number> = {};
    filteredEmployees.forEach((e) => {
      const loc = e.location || "Unknown";
      locMap[loc] = (locMap[loc] || 0) + 1;
    });

    return {
      total,
      activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
      onboarding,
      newHires: probation + onboarding,
      depts: Object.entries(deptMap)
        .map(([name, count]) => ({ name: name || "Unassigned", count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count),
      locs: Object.entries(locMap)
        .map(([name, count]) => ({ name: name || "Unknown", count }))
        .sort((a, b) => b.count - a.count),
    };
  }, [filteredEmployees]);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      department: "",
      designation: "",
      location: "",
      status: "",
    });
  };

  const hasActiveFilters =
    filters.search || filters.department || filters.designation || filters.location || filters.status;

  return (
    <div className="flex flex-col min-h-full bg-slate-50 font-sans">
      <div className="p-8 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
        {/* Header with Switcher and Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>

            </div>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {summaryMetrics.total} Employees across {summaryMetrics.locs.length} locations
            </p>
          </div>

          {/* Stat Mini-Cards */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-sm min-w-[100px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {summaryMetrics.activePercent}% <span className="text-emerald-600 text-xs font-bold">Active</span>
              </div>
            </div>
            <div className="flex-1 md:flex-initial bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-sm min-w-[100px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Growth</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {summaryMetrics.newHires} <span className="text-slate-900 text-xs font-semibold">New hires</span>
              </div>
            </div>
            <div className="flex-1 md:flex-initial bg-white border border-slate-200/80 px-4 py-2.5 rounded-xl shadow-sm min-w-[100px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queued</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {summaryMetrics.onboarding} <span className="text-amber-500 text-xs font-semibold">Onboarding</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Text Search */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, email..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="w-full h-10 pl-9 pr-3.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all font-medium"
                />
              </div>

              {/* Department Select */}
              <div className="relative">
                <select
                  value={filters.department}
                  onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
                  className="h-10 pl-3.5 pr-8 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all appearance-none cursor-pointer min-w-[130px]"
                >
                  <option value="">Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Designation Select */}
              <div className="relative">
                <select
                  value={filters.designation}
                  onChange={(e) => setFilters((prev) => ({ ...prev, designation: e.target.value }))}
                  className="h-10 pl-3.5 pr-8 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all appearance-none cursor-pointer min-w-[130px]"
                >
                  <option value="">Designation</option>
                  {designations.map((desg) => (
                    <option key={desg} value={desg}>
                      {desg}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Location Select */}
              <div className="relative">
                <select
                  value={filters.location}
                  onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                  className="h-10 pl-3.5 pr-8 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all appearance-none cursor-pointer min-w-[120px]"
                >
                  <option value="">Location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Status Select */}
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="h-10 pl-3.5 pr-8 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all appearance-none cursor-pointer min-w-[110px]"
                >
                  <option value="">Status</option>
                  {statuses.map((stat) => (
                    <option key={stat} value={stat}>
                      {stat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center h-10 px-4 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm transition-all"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                More Filters
              </button>
            </div>

            {/* List / Grid Switcher */}
            <div className="flex items-center gap-1.5 border border-slate-200 p-1.5 rounded-lg self-end lg:self-center">
              <button
                onClick={() => handleViewModeChange("table")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "table" ? "bg-slate-100 text-slate-800 font-bold" : "text-slate-400 hover:text-slate-700"
                  }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleViewModeChange("grid")}
                className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-slate-100 text-slate-800 font-bold" : "text-slate-400 hover:text-slate-700"
                  }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
              {Object.entries(filters).map(([key, val]) => {
                if (!val) return null;
                return (
                  <span
                    key={key}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold rounded-md uppercase tracking-wider"
                  >
                    {key}: {val}
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, [key]: "" }))}
                      className="hover:text-slate-950 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}
              <button
                onClick={handleClearFilters}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar & Create Button Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* CEO can export */}
            {true && (
              <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            )}

            {/* Contextual Bulk Options - Hides if non-privileged */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg">
                <span className="text-xs font-bold text-slate-900 mr-2">{selectedCount} Selected</span>

                {false && (
                  <button
                    onClick={handleBulkDeactivate}
                    className={`flex items-center gap-1.5 h-8 px-3 rounded-md border font-semibold text-xs shadow-sm transition-colors ${isAllDeactivated
                        ? "bg-white border-emerald-200 hover:bg-emerald-50 text-emerald-600"
                        : "bg-white border-rose-200 hover:bg-rose-50 text-rose-600"
                      }`}
                  >
                    {isAllDeactivated ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    {isAllDeactivated ? "Activate" : "Deactivate"}
                  </button>
                )}

                {false && (
                  <button
                    onClick={handleBulkAssignManager}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs shadow-sm transition-colors"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Assign Manager
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Add Employee CTA */}
          {/* CEO cannot add employee directly */}
          {false && (
            <Link
              href="/employees/add"
              className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-colors w-full md:w-auto"
            >
              <UserPlus className="w-4 h-4" />
              Add Employee
            </Link>
          )}
        </div>

        {/* Main Section layout: Grid/Table on left, Analytics sidebar on right */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
          {/* Table / Grid Container */}
          <div className="xl:col-span-3 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-slate-900/35 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-sm font-semibold text-slate-500">Loading directory...</span>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Users className="w-12 h-12 mb-3 text-slate-300" />
                <h3 className="text-base font-bold text-slate-700">No employees found</h3>
                <p className="text-sm font-medium mt-1">Try clearing filters or query search</p>
              </div>
            ) : viewMode === "table" ? (
              // Table View Mode
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {table.getHeaderGroups().map((hg) => (
                      <tr key={hg.id} className="border-b border-slate-200 bg-slate-50/50">
                        {hg.headers.map((h) => (
                          <th key={h.id} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                          </th>
                        ))}
                        <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                          Actions
                        </th>
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                        {row.getVisibleCells().map((c) => (
                          <td key={c.id} className="px-6 py-4">
                            {flexRender(c.column.columnDef.cell, c.getContext())}
                          </td>
                        ))}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/employees/${row.original.id}`} className="text-xs font-bold text-slate-900 hover:underline transition-colors">
                              View
                            </Link>
                            <span className="text-slate-300 select-none">•</span>
                            <EmployeeRowActions
                              employeeId={row.original.id}
                              employeeName={row.original.name}
                              status={row.original.status}
                              onAction={handleAction}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // Grid View Mode
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEmployees.map((emp) => {
                  const isSelected = rowSelection[emp.id] || false;
                  return (
                    <div
                      key={emp.id}
                      className={`border p-4 rounded-xl shadow-sm transition-all hover:shadow-md relative flex flex-col justify-between h-48 group ${isSelected ? "border-slate-700 bg-slate-100/10" : "border-slate-200 bg-white"
                        }`}
                    >
                      {/* Grid Checkbox & Actions */}
                      <div className="flex justify-between items-start mb-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setRowSelection((prev) => ({ ...prev, [emp.id]: e.target.checked }));
                          }}
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 w-4 h-4 cursor-pointer"
                        />
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <EmployeeRowActions
                            employeeId={emp.id}
                            employeeName={emp.name}
                            status={emp.status}
                            onAction={handleAction}
                          />
                        </div>
                      </div>

                      {/* Info body */}
                      <Link href={`/employees/${emp.id}`} className="flex items-center gap-3 hover:bg-slate-50 p-1 -m-1 rounded-lg transition-colors">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 relative border border-slate-200 shadow-sm overflow-hidden ${emp.avatarBg}`}>
                          {emp.photoUrl ? (
                            <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{emp.initials}</span>
                          )}
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{emp.name}</h4>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">{emp.email}</p>
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {emp.employeeId || emp.id}
                          </span>
                        </div>
                      </Link>

                      {/* Footer tags */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {emp.department}
                          </span>
                          <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]">
                            {emp.designation}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase ${emp.status === "ACTIVE"
                              ? "text-emerald-700 bg-emerald-50 border border-emerald-200/50"
                              : "text-amber-700 bg-amber-50 border border-amber-200/50"
                            }`}
                        >
                          {emp.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && filteredEmployees.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div className="text-sm font-medium text-slate-500">
                  Showing <span className="font-bold text-slate-900">
                    {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                    –
                    {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, filteredEmployees.length)}
                  </span> of{" "}
                  <span className="font-bold text-slate-900">{filteredEmployees.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg bg-white shadow-sm transition-all text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <button className="flex items-center justify-center w-8 h-8 text-xs font-bold bg-slate-900 text-white rounded-lg shadow-sm">
                    {table.getState().pagination.pageIndex + 1}
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* CEO shows summary widgets */}
          {true && (
            <div className="flex flex-col gap-6 xl:col-span-1">
              {/* Department Summary Widget */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Department Summary</h3>
                    <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                  <div className="space-y-4">
                    {summaryMetrics.depts.map((d, index) => {
                      // Harmonious color styling
                      let color = "bg-slate-900";
                      if (index === 1) color = "bg-emerald-500";
                      else if (index === 2) color = "bg-amber-500";
                      else if (index === 3) color = "bg-purple-500";
                      else if (index > 3) color = "bg-slate-400";

                      return (
                        <div key={d.name}>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1.5">
                            <span className="truncate max-w-[150px]">{d.name}</span>
                            <span>{d.count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`${color} h-full rounded-full`} style={{ width: `${d.percent}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Link href="/org-chart/departments" className="w-full flex items-center justify-center py-2.5 mt-5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg transition-colors shadow-sm">
                  View Full Report
                </Link>
              </div>

              {/* Top Locations Widget */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-700" />
                  Top Locations
                </h3>
                <div className="space-y-3">
                  {summaryMetrics.locs.map((l) => {
                    const initials = l.name.split(",")[0].substring(0, 2).toUpperCase();
                    return (
                      <div
                        key={l.name}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 text-xs font-bold flex items-center justify-center uppercase border border-slate-200/50">
                            {initials}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                              {l.name}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">
                              {l.count} {l.count === 1 ? "Employee" : "Employees"}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    );
                  })}
                </div>
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

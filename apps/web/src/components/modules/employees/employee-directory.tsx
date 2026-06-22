"use client";

import React, { useState, useMemo } from "react";
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

// Role Configurations for visibility & action controls
const ROLE_CONFIGS: Record<DirectoryRole, DirectoryRoleConfig> = {
  ADMIN: {
    canAddEmployee: true,
    canBulkDeactivate: true,
    canBulkAssignManager: true,
    canExport: true,
    dataScope: "ALL",
    showSummaryWidgets: true,
  },
  HR: {
    canAddEmployee: true,
    canBulkDeactivate: true,
    canBulkAssignManager: true,
    canExport: true,
    dataScope: "ALL",
    showSummaryWidgets: true,
  },
  CEO: {
    canAddEmployee: false,
    canBulkDeactivate: false,
    canBulkAssignManager: false,
    canExport: true,
    dataScope: "ALL",
    showSummaryWidgets: true,
  },
  MANAGER: {
    canAddEmployee: false,
    canBulkDeactivate: false,
    canBulkAssignManager: false,
    canExport: false,
    dataScope: "TEAM",
    showSummaryWidgets: true,
  },
  EMPLOYEE: {
    canAddEmployee: false,
    canBulkDeactivate: false,
    canBulkAssignManager: false,
    canExport: false,
    dataScope: "ALL", // Just visibility restriction will be handled via UI
    showSummaryWidgets: false,
  },
  FINANCE: {
    canAddEmployee: false,
    canBulkDeactivate: false,
    canBulkAssignManager: false,
    canExport: true,
    dataScope: "ALL",
    showSummaryWidgets: true,
  },
  CTO: {
    canAddEmployee: false,
    canBulkDeactivate: false,
    canBulkAssignManager: false,
    canExport: true,
    dataScope: "ALL",
    showSummaryWidgets: true,
  },
};

// Seed Mock Data matching Figma screenshot elements
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: "NAP-9821",
    name: "Arjun Mehta",
    email: "arjun.m@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Arjun&backgroundColor=dbeafe",
    initials: "AM",
    avatarBg: "bg-slate-200 text-slate-900",
    department: "Engineering",
    designation: "Staff Software Engineer",
    status: "ACTIVE",
    joinedDate: "12 May 2021",
    location: "Bangalore, IN",
    manager: {
      id: "NAP-0001",
      name: "Alex Thompson",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
    },
  },
  {
    id: "NAP-9742",
    name: "Linda Chen",
    email: "linda.c@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Linda&backgroundColor=fce7f3",
    initials: "LC",
    avatarBg: "bg-pink-100 text-pink-600",
    department: "Product Design",
    designation: "Sr. Product Designer",
    status: "ACTIVE",
    joinedDate: "03 Jan 2023",
    location: "San Francisco, US",
    manager: {
      id: "NAP-0001",
      name: "Alex Thompson",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
    },
  },
  {
    id: "NAP-9105",
    name: "Marcus Thorne",
    email: "marcus.t@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Marcus&backgroundColor=fef3c7",
    initials: "MT",
    avatarBg: "bg-orange-100 text-orange-600",
    department: "Legal & Compliance",
    designation: "VP of Compliance",
    status: "ACTIVE",
    joinedDate: "15 Nov 2020",
    location: "Bangalore, IN",
    manager: {
      id: "NAP-0001",
      name: "Alex Thompson",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
    },
  },
  {
    id: "NAP-9440",
    name: "Sophia Rossi",
    email: "sophia.r@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Sophia&backgroundColor=e0f2fe",
    initials: "SR",
    avatarBg: "bg-sky-100 text-sky-600",
    department: "Sales & Marketing",
    designation: "Regional Sales Lead",
    status: "ACTIVE",
    joinedDate: "22 Mar 2022",
    location: "San Francisco, US",
    manager: {
      id: "NAP-0003",
      name: "Sarah Q.",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
    },
  },
  {
    id: "NAP-9311",
    name: "Becca Williams",
    email: "becca.w@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Becca&backgroundColor=f3e8ff",
    initials: "BW",
    avatarBg: "bg-purple-100 text-purple-600",
    department: "Customer Success",
    designation: "CS Manager",
    status: "ACTIVE",
    joinedDate: "09 Aug 2023",
    location: "Bangalore, IN",
    manager: {
      id: "NAP-0003",
      name: "Sarah Q.",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
    },
  },
  {
    id: "NAP-9082",
    name: "Ravi Kumar",
    email: "ravi.k@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Ravi&backgroundColor=d1fae5",
    initials: "RK",
    avatarBg: "bg-emerald-100 text-emerald-600",
    department: "Engineering",
    designation: "DevOps Engineer",
    status: "PROBATION",
    joinedDate: "15 Nov 2024",
    location: "Bangalore, IN",
    manager: {
      id: "NAP-9821",
      name: "Arjun Mehta",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Arjun",
    },
  },
  {
    id: "NAP-9204",
    name: "Anita M.",
    email: "anita.m@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Anita&backgroundColor=fee2e2",
    initials: "AM",
    avatarBg: "bg-rose-100 text-rose-600",
    department: "Engineering",
    designation: "Frontend Developer",
    status: "NOTICE PERIOD",
    joinedDate: "14 Feb 2022",
    location: "Mumbai, IN",
    manager: {
      id: "NAP-9821",
      name: "Arjun Mehta",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Arjun",
    },
  },
  {
    id: "NAP-8401",
    name: "Thomas Wright",
    email: "thomas.w@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Thomas&backgroundColor=e0f2fe",
    initials: "TW",
    avatarBg: "bg-teal-100 text-teal-600",
    department: "Operations",
    designation: "Operations Director",
    status: "ACTIVE",
    joinedDate: "10 Oct 2019",
    location: "London, UK",
    manager: {
      id: "NAP-0001",
      name: "Alex Thompson",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
    },
  },
  {
    id: "NAP-8201",
    name: "Carla Gomez",
    email: "carla.g@naprocs.com",
    photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Carla&backgroundColor=fce7f3",
    initials: "CG",
    avatarBg: "bg-fuchsia-100 text-fuchsia-600",
    department: "Customer Success",
    designation: "CS Representative",
    status: "ONBOARDING",
    joinedDate: "01 Jun 2026",
    location: "Mumbai, IN",
    manager: {
      id: "NAP-9311",
      name: "Becca Williams",
      photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Becca",
    },
  },
];

// Seed storage key
const CACHE_KEY = "naprocs_directory_employees";

export default function EmployeeDirectory() {
  const queryClient = useQueryClient();

  // Local state to simulate active role testing
  const [activeRole, setActiveRole] = useState<DirectoryRole>("ADMIN");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<DirectoryFilters>({
    search: "",
    department: "",
    designation: "",
    location: "",
    status: "",
  });

  const roleConfig = useMemo(() => ROLE_CONFIGS[activeRole], [activeRole]);

  const accessToken = useAuthStore((state) => state.accessToken);

  // Fetch from API instead of localStorage
  const fetchEmployees = async (): Promise<Employee[]> => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    const res = await fetch(`${url}/employees?page=1&limit=100`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    
    if (!res.ok) throw new Error("Failed to fetch employees");
    const responseData = await res.json();
    
    // Map backend data to frontend Employee interface
    return responseData.data.map((emp: any) => ({
      id: emp.employeeId || emp.id,
      name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
      email: emp.officialEmail,
      photoUrl: emp.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.firstName}`,
      initials: `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase(),
      avatarBg: "bg-blue-100 text-blue-600",
      department: emp.departmentId || "Unassigned", 
      designation: emp.designationId || "Unassigned",
      status: emp.status || "ACTIVE",
      joinedDate: new Date(emp.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
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

    // 1. Scope based on role configuration
    if (roleConfig.dataScope === "TEAM") {
      // In a real database this would be: managerId === currentUser.id
      // For demonstration, let's filter to employees who report to "Arjun Mehta" (NAP-9821)
      result = result.filter((emp) => emp.manager?.id === "NAP-9821" || emp.id === "NAP-9821");
    }

    // 2. Text search (Name, ID, Email)
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q) ||
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
  }, [rawEmployees, filters, roleConfig]);

  // Bulk mutations
  const updateEmployeesMutation = useMutation({
    mutationFn: async (updatedList: Employee[]) => {
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
      }
      return updatedList;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["employees"], data);
      setRowSelection({});
    },
  });

  const handleBulkDeactivate = () => {
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    const updated = rawEmployees.map((emp) => {
      if (selectedIds.includes(emp.id)) {
        return { ...emp, status: "DEACTIVATED" as const };
      }
      return emp;
    });
    updateEmployeesMutation.mutate(updated);
  };

  const handleBulkAssignManager = () => {
    const selectedIds = Object.keys(rowSelection).filter((key) => rowSelection[key]);
    const updated = rawEmployees.map((emp) => {
      if (selectedIds.includes(emp.id)) {
        return {
          ...emp,
          manager: {
            id: "NAP-0001",
            name: "Alex Thompson",
            photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
          },
        };
      }
      return emp;
    });
    updateEmployeesMutation.mutate(updated);
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 relative border border-slate-100 shadow-sm overflow-hidden ${emp.avatarBg}`}>
                <img
                  src={emp.photoUrl}
                  alt={emp.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <span className="absolute">{emp.initials}</span>
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
        accessorKey: "id",
        header: "EMP ID",
        cell: ({ row }) => (
          <span className="text-xs font-bold font-mono text-slate-500 bg-slate-100/60 px-2 py-1 rounded">
            {row.original.id}
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
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                <img src={mgr.photoUrl} alt={mgr.name} className="w-full h-full object-cover" />
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
      locMap[e.location] = (locMap[e.location] || 0) + 1;
    });

    return {
      total,
      activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
      onboarding,
      newHires: probation + onboarding,
      depts: Object.entries(deptMap)
        .map(([name, count]) => ({ name, count, percent: total > 0 ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count),
      locs: Object.entries(locMap)
        .map(([name, count]) => ({ name, count }))
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
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="p-8 max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Header with Switcher and Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
              {/* Premium Interactive Role Config Switcher */}
              <div className="relative inline-block text-left group">
                <button className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-full transition-all shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" />
                  View Config: <span className="text-slate-900 font-bold">{activeRole}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                <div className="absolute left-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
                  {(["ADMIN", "HR", "CEO", "MANAGER"] as DirectoryRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setActiveRole(role);
                        setRowSelection({});
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${
                        activeRole === role ? "text-slate-900 bg-slate-100/50 font-bold" : "text-slate-600"
                      }`}
                    >
                      {role}
                      {activeRole === role && <Check className="w-3.5 h-3.5 text-slate-900" />}
                    </button>
                  ))}
                </div>
              </div>
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
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "table" ? "bg-slate-100 text-slate-800 font-bold" : "text-slate-400 hover:text-slate-700"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "grid" ? "bg-slate-100 text-slate-800 font-bold" : "text-slate-400 hover:text-slate-700"
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
            {roleConfig.canExport && (
              <button className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-sm transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
            )}

            {/* Contextual Bulk Options - Hides if non-privileged */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-300 px-3 py-1 rounded-lg">
                <span className="text-xs font-bold text-slate-900 mr-2">{selectedCount} Selected</span>

                {roleConfig.canBulkDeactivate && (
                  <button
                    onClick={handleBulkDeactivate}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs shadow-sm transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Deactivate
                  </button>
                )}

                {roleConfig.canBulkAssignManager && (
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
          {roleConfig.canAddEmployee && (
            <button className="flex items-center justify-center gap-2 h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-colors w-full md:w-auto">
              <UserPlus className="w-4 h-4" />
              Add Employee
            </button>
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
                            <button className="text-xs font-bold text-slate-900 hover:text-slate-900 transition-colors">
                              View
                            </button>
                            <span className="text-slate-300 select-none">•</span>
                            <button className="hover:text-slate-600 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
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
                      className={`border p-4 rounded-xl shadow-sm transition-all hover:shadow-md relative flex flex-col justify-between h-48 group ${
                        isSelected ? "border-slate-700 bg-slate-100/10" : "border-slate-200 bg-white"
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
                        <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Info body */}
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 relative border border-slate-100 shadow-sm overflow-hidden ${emp.avatarBg}`}>
                          <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                          <span className="absolute">{emp.initials}</span>
                        </div>
                        <div className="truncate">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{emp.name}</h4>
                          <p className="text-xs font-semibold text-slate-400 mt-0.5">{emp.email}</p>
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                            {emp.id}
                          </span>
                        </div>
                      </div>

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
                          className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase ${
                            emp.status === "ACTIVE"
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
                  Showing <span className="font-bold text-slate-900">1–{filteredEmployees.length}</span> of{" "}
                  <span className="font-bold text-slate-900">{filteredEmployees.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-400 border border-slate-200 rounded-lg cursor-not-allowed bg-white shadow-sm">
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Prev
                  </button>
                  <button className="flex items-center justify-center w-8 h-8 text-xs font-bold bg-slate-900 text-white rounded-lg shadow-sm">
                    1
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 bg-white shadow-sm transition-all">
                    Next
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Analytics Sidebar widgets */}
          {roleConfig.showSummaryWidgets && (
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

                <button className="w-full py-2.5 mt-5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 rounded-lg transition-colors shadow-sm">
                  View Full Report
                </button>
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
    </div>
  );
}

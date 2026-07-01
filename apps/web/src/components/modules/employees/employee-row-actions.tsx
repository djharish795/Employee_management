import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Pencil, 
  UserCheck, 
  ArrowRightLeft, 
  Briefcase, 
  PowerOff, 
  Power,
  KeyRound, 
  FileText, 
  Download, 
  Trash2 
} from "lucide-react";

export type EmployeeActionType = 
  | "edit" 
  | "assign-manager" 
  | "transfer-dept" 
  | "change-designation" 
  | "reset-password" 
  | "toggle-status" 
  | "view-documents" 
  | "download-pdf" 
  | "delete";

interface EmployeeRowActionsProps {
  employeeId: string;
  employeeName: string;
  status: string;
  onAction: (action: EmployeeActionType, employeeId: string) => void;
}

export function EmployeeRowActions({ employeeId, employeeName, status, onAction }: EmployeeRowActionsProps) {
  const isActive = status === "ACTIVE" || status === "PROBATION" || status === "NOTICE PERIOD" || status === "ONBOARDING";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors outline-none focus:ring-2 focus:ring-slate-900/20">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] bg-white border border-slate-200 shadow-xl z-[9999] rounded-lg p-1.5">
        
        <DropdownMenuItem onClick={() => onAction("edit", employeeId)} className="cursor-pointer text-xs font-semibold text-slate-700">
          <Pencil className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Edit Employee
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction("assign-manager", employeeId)} className="cursor-pointer text-xs font-semibold text-slate-700">
          <UserCheck className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Assign Manager
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction("transfer-dept", employeeId)} className="cursor-pointer text-xs font-semibold text-slate-700">
          <ArrowRightLeft className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Transfer Department
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction("change-designation", employeeId)} className="cursor-pointer text-xs font-semibold text-slate-700">
          <Briefcase className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Change Designation
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-100" />
        
        <DropdownMenuItem onClick={() => onAction("toggle-status", employeeId)} className="cursor-pointer text-xs font-semibold text-slate-700">
          {isActive ? (
            <>
              <PowerOff className="mr-2 h-3.5 w-3.5 text-rose-500" />
              <span className="text-rose-600">Deactivate Employee</span>
            </>
          ) : (
            <>
              <Power className="mr-2 h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600">Activate Employee</span>
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction("reset-password", employeeId)} className="cursor-pointer text-xs font-semibold text-slate-700">
          <KeyRound className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Reset Password
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-100" />
        
        <DropdownMenuItem onClick={() => onAction("view-documents", employeeId)} className="cursor-pointer text-xs font-semibold text-slate-700">
          <FileText className="mr-2 h-3.5 w-3.5 text-slate-400" />
          View Documents
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => onAction("download-pdf", employeeId)} className="cursor-pointer text-xs font-semibold text-slate-700">
          <Download className="mr-2 h-3.5 w-3.5 text-slate-400" />
          Download Profile PDF
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-slate-100" />
        
        <DropdownMenuItem onClick={() => onAction("delete", employeeId)} className="cursor-pointer text-xs font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700">
          <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-500" />
          Delete Employee
        </DropdownMenuItem>
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

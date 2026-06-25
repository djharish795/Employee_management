import React, { useState } from "react";
import { Employee } from "@/types/employees";
import { EmployeeActionType } from "./employee-row-actions";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, UserCheck, AlertTriangle } from "lucide-react";

interface EmployeeActionModalsProps {
  actionType: EmployeeActionType | null;
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (action: EmployeeActionType, employeeId: string, payload?: any) => void;
}

export function EmployeeActionModals({ actionType, employee, isOpen, onClose, onSuccess }: EmployeeActionModalsProps) {
  // Temporary local state for form fields
  const [manager, setManager] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");

  if (!employee || !actionType) return null;

  const handleClose = () => {
    // Reset state on close
    setManager("");
    setDepartment("");
    setDesignation("");
    setReason("");
    setConfirmText("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(actionType, employee.id, { manager, department, designation, reason });
    handleClose();
  };

  // 1. EDIT EMPLOYEE MODAL (Simplified mock form)
  if (actionType === "edit") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[600px] p-0 border-slate-200 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <DialogTitle className="text-lg font-bold text-slate-900">Edit Employee: {employee.name}</DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500">
              Update {employee.name}'s details. Changes will reflect across the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <Input defaultValue={employee.name} className="h-9 text-sm font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <Input defaultValue={employee.email} className="h-9 text-sm font-medium" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Organization Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                  <Input defaultValue={employee.department} className="h-9 text-sm font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Designation</label>
                  <Input defaultValue={employee.designation} className="h-9 text-sm font-medium" />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2 sm:justify-end">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition-colors">
                Save Changes
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // 2. ASSIGN MANAGER MODAL
  if (actionType === "assign-manager") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              Assign Manager
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500">
              Select a new reporting manager for {employee.name}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Manager</label>
              <select 
                value={manager} 
                onChange={(e) => setManager(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-slate-900/20"
              >
                <option value="">Select a manager...</option>
                <option value="NAP-0001">Alex Thompson (CEO)</option>
                <option value="NAP-0003">Sarah Q. (VP)</option>
                <option value="NAP-9821">Arjun Mehta (Lead)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Effective Date</label>
              <Input type="date" required className="h-10 text-sm font-medium" />
            </div>
            <DialogFooter className="pt-4">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700">Assign Manager</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // 3. TRANSFER DEPARTMENT MODAL
  if (actionType === "transfer-dept") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Transfer Department</DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500">
              Current Department: <span className="font-bold text-slate-700">{employee.department}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Department</label>
              <select required value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium bg-white">
                <option value="">Select...</option>
                <option value="Engineering">Engineering</option>
                <option value="Product Design">Product Design</option>
                <option value="Sales">Sales</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason for Transfer</label>
              <Input required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Internal Mobility" className="h-10 text-sm font-medium" />
            </div>
            <DialogFooter className="pt-4">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-sm font-bold text-white hover:bg-slate-800">Transfer</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // 4. CHANGE DESIGNATION MODAL
  if (actionType === "change-designation") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Change Designation</DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500">
              Current Designation: <span className="font-bold text-slate-700">{employee.designation}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">New Designation</label>
              <Input required value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. Senior Software Engineer" className="h-10 text-sm font-medium" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Reason</label>
              <Input required value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Promotion" className="h-10 text-sm font-medium" />
            </div>
            <DialogFooter className="pt-4">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-sm font-bold text-white hover:bg-slate-800">Update</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // 5. RESET PASSWORD MODAL
  if (actionType === "reset-password") {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-600 pt-2">
              Are you sure you want to reset the password for <strong>{employee.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-xs font-semibold text-amber-800 my-2">
            A temporary password will be generated and sent to {employee.email}.
          </div>
          <DialogFooter className="pt-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-lg bg-amber-500 text-sm font-bold text-white hover:bg-amber-600">Reset Password</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // 6. TOGGLE STATUS (Activate/Deactivate) MODAL
  if (actionType === "toggle-status") {
    const isDeactivating = employee.status !== "DEACTIVATED";
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {isDeactivating ? (
                <><AlertCircle className="w-5 h-5 text-rose-500" /> Deactivate Employee</>
              ) : (
                <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Activate Employee</>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-600 pt-2">
              {isDeactivating ? (
                <>Employee <strong>{employee.name}</strong> will lose access to the system immediately.</>
              ) : (
                <>Employee <strong>{employee.name}</strong> will regain access to the system.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} className={`px-4 py-2 rounded-lg text-sm font-bold text-white ${isDeactivating ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>
              {isDeactivating ? "Deactivate" : "Activate"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // 7. DELETE MODAL
  if (actionType === "delete") {
    const isConfirmValid = confirmText === "DELETE";
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[425px] border-rose-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete Employee Record
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-slate-600 pt-2">
              This action cannot be undone. This will permanently delete <strong>{employee.name}</strong>'s data from the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="py-4 space-y-3">
            <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
              <label className="text-xs font-bold text-rose-800 block mb-2">
                Type <span className="font-black select-none">DELETE</span> to confirm.
              </label>
              <Input 
                value={confirmText} 
                onChange={(e) => setConfirmText(e.target.value)} 
                className="h-10 text-sm font-mono border-rose-200 focus-visible:ring-rose-500" 
                placeholder="DELETE"
              />
            </div>
            <DialogFooter className="pt-4">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button 
                type="submit" 
                disabled={!isConfirmValid} 
                className="px-4 py-2 rounded-lg bg-rose-600 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Delete Employee
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}

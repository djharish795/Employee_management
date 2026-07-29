"use client";

import { useState, useEffect } from "react";
import { User, Shield, UserPlus, X, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ProjectTeamTabProps {
  projectId: string;
}

export function ProjectTeamTab({ projectId }: ProjectTeamTabProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const handleRelease = async (employeeId: string) => {
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/release`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          /* credentials: 'include' handled */
        },
        body: JSON.stringify({ employeeId })
      });

      if (res.ok) {
        toast.success("Member removed from project");
        fetchMembers();
      } else {
        const err = await res.json();
        toast.error(err.message || "Failed to remove member");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Team</h2>
          <p className="text-sm text-gray-500">Manage who has access to this space and their roles.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors font-medium text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.filter(m => !m.releasedAt).length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                  No active members in this project.
                </td>
              </tr>
            ) : (
              members.filter(m => !m.releasedAt).map((assignment) => (
                <tr key={assignment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                        {assignment.employee.firstName[0]}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.employee.firstName} {assignment.employee.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{assignment.employee.officialEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      {assignment.projectRole === "TL" || assignment.projectRole === "PM" ? (
                        <Shield className="w-4 h-4 text-blue-500" />
                      ) : (
                        <User className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700 font-medium">
                        {assignment.projectRole.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRelease(assignment.employeeId)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddProjectMemberModal 
          projectId={projectId} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            fetchMembers();
          }} 
        />
      )}
    </div>
  );
}

function AddProjectMemberModal({ projectId, onClose, onSuccess }: { projectId: string, onClose: () => void, onSuccess: () => void }) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all employees to allow selection
    const fetchEmps = async () => {
      try {
        const res = await fetch("/api/v1/employees", {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setEmployees(data.data || []); // Assuming paginated response
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmps();
  }, []);

  const filteredEmployees = employees.filter(e => 
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    e.officialEmail.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          /* credentials: 'include' handled */
        },
        body: JSON.stringify({ employeeId: selectedEmployeeId, projectRole: role }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to assign member");
      }

      toast.success("Member added successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute text-gray-400 top-4 right-4 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Add Team Member</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Search Employee</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or email..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
              {filteredEmployees.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">No employees found</div>
              ) : (
                filteredEmployees.map(emp => (
                  <label key={emp.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <input 
                      type="radio" 
                      name="employee" 
                      value={emp.id} 
                      checked={selectedEmployeeId === emp.id}
                      onChange={() => setSelectedEmployeeId(emp.id)}
                      className="mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{emp.firstName} {emp.lastName}</div>
                      <div className="text-xs text-gray-500">{emp.officialEmail}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Project Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MEMBER">Member (Standard Employee)</option>
              <option value="TL">Team Lead (Can assign members/tasks)</option>
              <option value="PM">Project Manager</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedEmployeeId}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 flex items-center disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

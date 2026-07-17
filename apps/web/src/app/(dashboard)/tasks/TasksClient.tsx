"use client";

import { useEffect, useState } from "react";
import { Task, tasksApi } from "@/lib/api/tasks";
import { apiClient } from "@/lib/api/client";
import { Loader2, KanbanSquare, LayoutList, PieChart, Briefcase, Plus, Search, Filter, Box, CheckCircle2, CircleDashed, AlertCircle } from "lucide-react";
import { TaskKanbanBoard } from "@/components/modules/tasks/TaskKanbanBoard";
import { ProjectTeamTab } from "@/components/modules/tasks/ProjectTeamTab";
import { TaskSummaryView } from "./views/TaskSummaryView";
import { TaskListView } from "./views/TaskListView";
import { TaskDetailsModal } from "@/components/modules/tasks/TaskDetailsModal";
import { NewTaskModal } from "@/components/modules/tasks/NewTaskModal";
import { useAuthStore } from "@/store/auth";
import { useSearchStore } from "@/store/search";

interface TasksClientProps {
  mode?: "INDIVIDUAL" | "TEAM";
}

export function TasksClient({ mode = "INDIVIDUAL" }: TasksClientProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("MY_TASKS");
  const [activeTab, setActiveTab] = useState<"SUMMARY" | "LIST" | "BOARD" | "TEAM">("BOARD");
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  
  // For Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  
  // Project Details
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  
  // User Permissions
  const role = useAuthStore((state) => state.role);
  const isTeamLead = useAuthStore((state) => state.isTeamLead);
  const employeeId = useAuthStore((state) => state.employeeId);
  const [isQa, setIsQa] = useState(false);

  // Filter States
  const [globalFilter, setGlobalFilter] = useState<"ALL" | "OPEN" | "DONE">("ALL");
  const searchQuery = useSearchStore(state => state.globalSearchQuery);
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Initial Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch projects
        try {
          const res = await apiClient.get("/projects");
          if (res.data) {
            setProjects(res.data);
          }
        } catch (e) {
          console.warn("Could not fetch projects", e);
        }

        if (selectedProject === "MY_TASKS") {
          const t = await tasksApi.getMyTasks();
          setTasks(t);
        } else {
          const t = await tasksApi.getProjectTasks(selectedProject);
          setTasks(t);
        }

        // Fetch project details for assignments, or all employees if in MY_TASKS
        if (selectedProject !== "MY_TASKS") {
          try {
            const pRes = await apiClient.get(`/projects/${selectedProject}`);
            if (pRes.data && pRes.data.assignments) {
              setProjectMembers(pRes.data.assignments.map((a: any) => a.employee).filter(Boolean));
            } else {
              setProjectMembers([]);
            }
          } catch (e) {
            setProjectMembers([]);
          }
        } else if (['MANAGER', 'TEAM_LEAD', 'CTO', 'CEO', 'SUPER_ADMIN', 'HR'].includes(role || '')) {
          try {
            const empRes = await apiClient.get('/employees?limit=1000');
            setProjectMembers(empRes.data?.data || empRes.data || []);
          } catch (e) {
            setProjectMembers([]);
          }
        } else {
          setProjectMembers([]);
        }

        // Check if user is QA
        if (employeeId) {
          try {
            const eRes = await apiClient.get(`/employees/${employeeId}`);
            if (eRes.data && (eRes.data.department?.name === 'QA' || eRes.data.designation?.title?.includes('QA'))) {
              setIsQa(true);
            }
          } catch(e) {
            console.error("Could not fetch employee details", e);
          }
        }
      } catch (err: any) {
        console.error(err);
        if (err?.response?.status === 403) {
          setAccessDenied(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [selectedProject, employeeId]);

  // Refetch members when modal opens to ensure we have the latest (e.g. if added via Team Tab)
  useEffect(() => {
    if (isNewTaskOpen) {
      if (selectedProject !== "MY_TASKS") {
        apiClient.get(`/projects/${selectedProject}`).then(pRes => {
          if (pRes.data && pRes.data.assignments) {
            setProjectMembers(pRes.data.assignments.map((a: any) => a.employee).filter(Boolean));
          }
        }).catch(() => setProjectMembers([]));
      } else if (['MANAGER', 'TEAM_LEAD', 'CTO', 'CEO', 'SUPER_ADMIN', 'HR'].includes(role || '')) {
        apiClient.get('/employees?limit=1000').then(empRes => {
          setProjectMembers(empRes.data?.data || empRes.data || []);
        }).catch(() => setProjectMembers([]));
      }
    }
  }, [isNewTaskOpen, selectedProject, role]);

  // Derived Filtered Tasks
  const filteredTasks = tasks.filter(t => {
    if (globalFilter === "OPEN" && t.status === "DONE") return false;
    if (globalFilter === "DONE" && t.status !== "DONE") return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(t.issueKey && t.issueKey.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    if (assigneeFilter && t.assigneeId !== assigneeFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const activeProjectName = selectedProject === "MY_TASKS" 
    ? (globalFilter === "OPEN" ? "My open work items" : globalFilter === "DONE" ? "Done work items" : "All work items")
    : projects.find(p => p.id === selectedProject)?.name || "Workspace";

  if (accessDenied) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500 space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <h2 className="text-xl font-bold text-slate-700">Access Restricted</h2>
        <p className="text-sm max-w-md text-center">
          The Tasks module is strictly reserved for the QA and Technical Departments. 
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white overflow-hidden text-gray-900 font-sans">
      {/* Jira-style Left Sidebar */}
      <div className="w-[260px] flex-shrink-0 border-r border-[#DFE1E6] bg-[#FAFBFC] flex flex-col h-full overflow-y-auto">
        <div className="p-4 px-5">
          <h2 className="text-xs font-bold text-[#6B778C] uppercase tracking-wider mb-3">Filters</h2>
          <div className="space-y-0.5">
            <button
              onClick={() => { setSelectedProject("MY_TASKS"); setGlobalFilter("ALL"); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedProject === "MY_TASKS" && globalFilter === "ALL" ? "bg-[#E9F2FF] text-[#0052CC]" : "text-[#42526E] hover:bg-[#EBECF0]"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>All work items</span>
            </button>
            <button 
              onClick={() => { setSelectedProject("MY_TASKS"); setGlobalFilter("OPEN"); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedProject === "MY_TASKS" && globalFilter === "OPEN" ? "bg-[#E9F2FF] text-[#0052CC]" : "text-[#42526E] hover:bg-[#EBECF0]"
              }`}
            >
              <CircleDashed className="w-4 h-4" />
              <span>My open work items</span>
            </button>
            <button 
              onClick={() => { setSelectedProject("MY_TASKS"); setGlobalFilter("DONE"); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedProject === "MY_TASKS" && globalFilter === "DONE" ? "bg-[#E9F2FF] text-[#0052CC]" : "text-[#42526E] hover:bg-[#EBECF0]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Done work items</span>
            </button>
          </div>
          
          <div className="pt-6 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#6B778C] uppercase tracking-wider">Spaces</h3>
          </div>
          <div className="space-y-0.5">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => { setSelectedProject(project.id); setGlobalFilter("ALL"); }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedProject === project.id ? "bg-[#E9F2FF] text-[#0052CC]" : "text-[#42526E] hover:bg-[#EBECF0]"
                }`}
              >
                <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold bg-[#EAE6FF] text-[#403294]">
                  <Box className="w-3.5 h-3.5" />
                </div>
                <span className="truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Header & Tabs */}
        <div className="relative border-b border-[#DFE1E6] pt-6 px-8 flex flex-col bg-white z-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-[#172B4D]">{activeProjectName}</h1>
            </div>
            <div className="flex items-center space-x-3">
              
              {/* Only show Create button if Team Lead, Manager+, or QA */}
              {(isTeamLead || isQa || ['CTO', 'CEO', 'MANAGER', 'SUPER_ADMIN'].includes(role || '')) && (
                <button 
                  onClick={() => setIsNewTaskOpen(true)}
                  className="flex items-center space-x-1 bg-[#0052CC] hover:bg-[#0047B3] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-6 pb-0 relative z-50">
            {selectedProject !== "MY_TASKS" && (
              <>
                <button 
                  onClick={() => setActiveTab("SUMMARY")}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === "SUMMARY" ? "border-[#0052CC] text-[#0052CC]" : "border-transparent text-[#42526E] hover:text-[#172B4D]"
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                  <span>Summary</span>
                </button>
                <button 
                  onClick={() => setActiveTab("LIST")}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === "LIST" ? "border-[#0052CC] text-[#0052CC]" : "border-transparent text-[#42526E] hover:text-[#172B4D]"
                  }`}
                >
                  <LayoutList className="w-4 h-4" />
                  <span>List</span>
                </button>
                <button 
                  onClick={() => setActiveTab("BOARD")}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === "BOARD" ? "border-[#0052CC] text-[#0052CC]" : "border-transparent text-[#42526E] hover:text-[#172B4D]"
                  }`}
                >
                  <KanbanSquare className="w-4 h-4" />
                  <span>Board</span>
                </button>
                {mode === "TEAM" && (
                  <button 
                    onClick={() => setActiveTab("TEAM")}
                    className={`flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                      activeTab === "TEAM" ? "border-[#0052CC] text-[#0052CC]" : "border-transparent text-[#42526E] hover:text-[#172B4D]"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Team</span>
                  </button>
                )}
              </>
            )}

            {/* Quick Filters */}
            <div className="flex items-center space-x-2 ml-auto mb-2 relative z-[100]">
              <div className="relative">
                <button 
                  onClick={() => { setShowAssigneeDropdown(!showAssigneeDropdown); setShowStatusDropdown(false); }}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${assigneeFilter ? 'bg-[#E9F2FF] text-[#0052CC]' : 'bg-gray-100 hover:bg-gray-200 text-[#42526E]'}`}
                >
                  <span>Assignee</span>
                  <Filter className="w-3 h-3" />
                </button>
                {showAssigneeDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-[#DFE1E6] rounded-md shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
                    <button onClick={() => { setAssigneeFilter(null); setShowAssigneeDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All Assignees</button>
                    {Array.from(new Map([...projectMembers, ...tasks.map(t => t.assignee).filter(Boolean)].filter(m => m && m.firstName).map(m => [m.id || m.firstName, m])).values()).map((m: any, i) => (
                      <button key={m.id || i} onClick={() => { setAssigneeFilter(m.id); setShowAssigneeDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 truncate">
                        {m.firstName} {m.lastName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowAssigneeDropdown(false); }}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${statusFilter ? 'bg-[#E9F2FF] text-[#0052CC]' : 'bg-gray-100 hover:bg-gray-200 text-[#42526E]'}`}
                >
                  <span>Status</span>
                  <Filter className="w-3 h-3" />
                </button>
                {showStatusDropdown && (
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-[#DFE1E6] rounded-md shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
                    <button onClick={() => { setStatusFilter(null); setShowStatusDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">All Statuses</button>
                    {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'QA', 'DONE', 'BLOCKED'].map(s => (
                      <button key={s} onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-auto bg-white relative z-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[#0052CC]" />
            </div>
          ) : (
            <>
              {activeTab === "SUMMARY" && selectedProject !== "MY_TASKS" && (
                <TaskSummaryView tasks={filteredTasks} />
              )}
              {activeTab === "LIST" && selectedProject !== "MY_TASKS" && (
                <TaskListView tasks={filteredTasks} onTaskClick={setSelectedTask} />
              )}
              {activeTab === "BOARD" && selectedProject !== "MY_TASKS" && (
                <div className="h-full p-6 bg-[#F4F5F7]">
                  <TaskKanbanBoard 
                    initialTasks={filteredTasks} 
                    projectId={selectedProject} 
                    onTaskUpdated={(updated) => {
                      setTasks(tasks.map(t => t.id === updated.id ? updated : t));
                    }}
                  />
                </div>
              )}
              {selectedProject === "MY_TASKS" && (
                <div className="h-full bg-[#F4F5F7]">
                  <TaskListView tasks={filteredTasks} onTaskClick={setSelectedTask} isGlobal={true} />
                </div>
              )}
            </>
          )}
          {activeTab === "TEAM" && selectedProject !== "MY_TASKS" && (
            <ProjectTeamTab projectId={selectedProject} />
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          isOpen={true}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={(updated) => {
            setTasks(tasks.map(t => t.id === updated.id ? updated : t));
            setSelectedTask(updated);
          }}
        />
      )}

      {isNewTaskOpen && (
        <NewTaskModal
          isOpen={isNewTaskOpen}
          onClose={() => setIsNewTaskOpen(false)}
          projectId={selectedProject}
          projectMembers={projectMembers}
          projects={projects}
          userRole={role}
          isQa={isQa}
          onTaskCreated={(newTask) => {
            setTasks((prev) => {
              if (prev.some(t => t.id === newTask.id)) return prev;
              return [newTask, ...prev];
            });
          }}
        />
      )}
    </div>
  );
}

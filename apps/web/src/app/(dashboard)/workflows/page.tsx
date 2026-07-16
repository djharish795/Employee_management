"use client";

import React, { useState, useEffect } from 'react';
import { ChevronRight, Settings2, Play, AlertCircle, Clock, Save, MoreHorizontal, History, Plus } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/auth';

interface WorkflowCondition {
  field: string;
  operator: "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "LESS_THAN";
  value: any;
}

interface WorkflowStep {
  id: string;
  title: string;
  assigneeRole: "MANAGER" | "HR" | "DEPARTMENT_HEAD" | "SPECIFIC_USER";
  assigneeId?: string;
  timeoutHours: number;
  onTimeout: "ESCALATE_HR" | "AUTO_APPROVE" | "REJECT";
  conditions?: WorkflowCondition[];
}

export default function WorkflowsPage() {
  const role = useAuthStore((state) => state.role);
  const [selectedType, setSelectedType] = useState("LEAVE");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const workflowTypes = ["LEAVE", "ASSET_REQUEST", "RECRUITMENT", "PROMOTION", "OFFBOARDING"];

  useEffect(() => {
    fetchConfig();
  }, [selectedType]);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get('/hr/workflows/config');
      const configs = response.data.data || response.data;
      const current = configs.find((c: any) => c.type === selectedType);
      
      if (current && current.steps) {
        setSteps(current.steps);
        if (current.steps.length > 0) setActiveStepId(current.steps[0].id);
        else setActiveStepId(null);
      } else {
        setSteps([]);
        setActiveStepId(null);
      }
    } catch (err) {
      console.error("Failed to fetch workflow config", err);
      alert("Failed to load workflow configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeploy = async () => {
    setIsSaving(true);
    try {
      await apiClient.put(`/hr/workflows/config/${selectedType}`, {
        name: `${selectedType} Workflow`,
        type: selectedType,
        steps: steps
      });
      alert('Workflow configuration deployed successfully!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to deploy workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      title: "New Approval Step",
      assigneeRole: "MANAGER",
      timeoutHours: 48,
      onTimeout: "ESCALATE_HR"
    };
    setSteps([...steps, newStep]);
    setActiveStepId(newStep.id);
  };

  const updateActiveStep = (field: keyof WorkflowStep, value: any) => {
    setSteps(steps.map(step => 
      step.id === activeStepId ? { ...step, [field]: value } : step
    ));
  };

  const activeStep = steps.find(s => s.id === activeStepId);

  if (role !== "HR" && role !== "SUPER_ADMIN" && role !== "CTO" && role !== "CEO" && role !== "CHRO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">You do not have permission to configure workflows.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50">
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white flex items-center justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Naprocs</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900">Workflows</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Workflows Configurator</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Design multi-stage approvals for core operations.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
          >
            {workflowTypes.map(type => (
              <option key={type} value={type}>{type.replace("_", " ")} WORKFLOW</option>
            ))}
          </select>
          <button onClick={fetchConfig} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            Discard Changes
          </button>
          <button onClick={handleDeploy} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50">
            {isSaving ? 'Deploying...' : 'Deploy Workflow'}
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Visual Flow Designer */}
        <div className="flex-1 p-8 overflow-auto bg-slate-50/50 flex flex-col items-center pt-16 relative">
          
          <div className="absolute top-4 left-4 text-sm font-bold text-slate-700 flex items-center gap-2">
            Visual Flow Designer
          </div>

          {isLoading ? (
            <div className="text-slate-500 text-sm font-semibold mt-20 flex items-center gap-2">
              <Clock className="w-4 h-4 animate-spin" /> Loading configuration...
            </div>
          ) : (
            <>
              {/* Trigger Node */}
              <div className="w-[320px] bg-white border border-slate-300 shadow-sm rounded-xl p-5 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedType.replace("_", " ")} Trigger</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Workflow automatically starts when requested.</p>
                </div>
              </div>

              {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  {/* Arrow */}
                  <div className="h-10 w-px bg-slate-300 relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-r-2 border-b-2 border-slate-300 rotate-45 transform translate-y-1/2"></div>
                  </div>

                  {/* Step Node */}
                  <div 
                    onClick={() => setActiveStepId(step.id)}
                    className={`w-[320px] bg-white shadow-sm rounded-xl p-5 relative cursor-pointer transition-all ${
                      activeStepId === step.id ? 'border-2 border-rose-600 shadow-md ring-4 ring-rose-50' : 'border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm border ${
                        activeStepId === step.id ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-bold tracking-wider uppercase mb-1 flex items-center justify-between ${
                          activeStepId === step.id ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Approval Stage</div>
                          <button onClick={(e) => { e.stopPropagation(); setSteps(steps.filter(s => s.id !== step.id)); }} className="hover:text-rose-600 text-slate-300">
                            ×
                          </button>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Assignee: {step.assigneeRole.replace("_", " ")}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 border border-slate-200">Timeout: {step.timeoutHours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}

              <button 
                onClick={handleAddStep}
                className="mt-10 flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 border-dashed rounded-lg text-sm font-bold text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Approval Step
              </button>
            </>
          )}

        </div>

        {/* Right Panel: Node Inspector */}
        <div className="w-[380px] bg-white border-l border-slate-200 flex flex-col flex-shrink-0 shadow-[-4px_0_24px_-16px_rgba(0,0,0,0.1)] z-10">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
              <Settings2 className="w-4 h-4 text-slate-900" />
              Node Inspector
            </div>
            {activeStep && <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider bg-slate-100 px-2 py-1 rounded">ID: {activeStep.id.split('_')[1]}</span>}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeStep ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Step Title</label>
                  <input 
                    type="text" 
                    value={activeStep.title} 
                    onChange={(e) => updateActiveStep('title', e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Role Assignment</label>
                  <select 
                    value={activeStep.assigneeRole}
                    onChange={(e) => updateActiveStep('assigneeRole', e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all bg-white"
                  >
                    <option value="MANAGER">Reporting Manager</option>
                    <option value="DEPARTMENT_HEAD">Department Head</option>
                    <option value="HR">HR Partner</option>
                    <option value="SPECIFIC_USER">Specific User</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeout Window (Hours)</label>
                  <input 
                    type="number" 
                    value={activeStep.timeoutHours} 
                    onChange={(e) => updateActiveStep('timeoutHours', parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all" 
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">On Expiry (Timeout)</label>
                  <select 
                    value={activeStep.onTimeout}
                    onChange={(e) => updateActiveStep('onTimeout', e.target.value)}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 transition-all bg-white"
                  >
                    <option value="ESCALATE_HR">Escalate to HR</option>
                    <option value="AUTO_APPROVE">Auto-approve</option>
                    <option value="REJECT">Reject</option>
                  </select>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                <Settings2 className="w-12 h-12 text-slate-300" />
                <div>
                  <p className="text-sm font-bold text-slate-900">No Step Selected</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Select a node in the visual designer to edit its properties.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-12 border-t border-slate-200 bg-white flex items-center justify-between px-8 flex-shrink-0 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-700" />
            <span>Active Steps: <span className="text-slate-900 ml-1">{steps.length < 10 ? '0'+steps.length : steps.length}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Unsaved Changes: <span className="text-slate-900 ml-1">...</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}

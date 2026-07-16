import { HrWorkflowKanbanBoard } from "./HrWorkflowKanbanBoard";

export const metadata = {
  title: "HR Workflows Kanban | Naprocs EMS",
};

export default function HrWorkflowsPage() {
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <HrWorkflowKanbanBoard />
    </div>
  );
}

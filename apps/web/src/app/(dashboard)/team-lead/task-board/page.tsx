import { Suspense } from "react";
import { TasksClient } from "@/app/(dashboard)/tasks/TasksClient";

export const metadata = {
  title: "Projects Workspace | Naprocs EMS",
};

export default function ProjectsWorkspacePage() {
  return (
    <div className="h-full bg-white">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading tasks...</div>}>
        <TasksClient mode="TEAM" />
      </Suspense>
    </div>
  );
}

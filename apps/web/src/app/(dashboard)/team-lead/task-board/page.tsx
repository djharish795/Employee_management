import { TasksClient } from "@/app/(dashboard)/tasks/TasksClient";

export const metadata = {
  title: "Projects Workspace | Naprocs EMS",
};

export default function ProjectsWorkspacePage() {
  return (
    <div className="h-full bg-white">
      <TasksClient mode="TEAM" />
    </div>
  );
}

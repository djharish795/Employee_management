import { TasksClient } from "./TasksClient";

export const metadata = {
  title: "My Tasks | Naprocs EMS",
};

export default function TasksPage() {
  return (
    <div className="h-full bg-white">
      <TasksClient />
    </div>
  );
}

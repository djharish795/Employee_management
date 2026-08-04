import { Suspense } from "react";
import { TasksClient } from "./TasksClient";

export const metadata = {
  title: "My Tasks | Naprocs EMS",
};

export default function TasksPage() {
  return (
    <div className="h-full bg-white">
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading tasks...</div>}>
        <TasksClient mode="INDIVIDUAL" />
      </Suspense>
    </div>
  );
}

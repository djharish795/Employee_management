# Future Implementations: Enterprise Task Features

This document captures advanced, enterprise-grade features for the Tasks and Workflow modules. These features represent the next level of maturity for the platform (competing with Jira, Linear, Asana) and are saved here for future development phases.

## 1. Parent-Child Hierarchies (Subtasks & Progress Tracking)
* **Concept:** Implement a strict nested structure where Epics contain Stories, Stories contain Tasks, and Tasks contain Subtasks.
* **Feature:** 
  * Add a `parentId` field to the `Task` model.
  * Parent tasks display a dynamic progress bar (e.g., `75% Complete`) based on the status of their children.
  * Logic guardrail: A parent task cannot be moved to "DONE" until all sub-tasks are marked "DONE".

## 2. Task Dependencies (The "Blocker" Graph)
* **Concept:** Explicit relationship mapping between distinct tasks across the system.
* **Feature:**
  * Add a `TaskDependency` model connecting `blockerId` and `blockedId`.
  * Define relationship types: "blocks", "is blocked by", "relates to", "duplicates".
  * Logic guardrail: If an employee tries to drag Task B to "In Progress", the system blocks the action if Task A (the blocker) is not completed.
  * Provide visual Dependency Graphs for management to identify bottlenecks.

## 3. Story Points, Estimations & Time Tracking
* **Concept:** Tracking velocity and time spent for precise sprint planning.
* **Feature:**
  * Add fields for `storyPoints` (Fibonacci 1, 2, 3, 5, 8), `estimatedHours`, and `loggedHours` to the `Task` model.
  * Provide a UI for employees to log active hours against a task.
  * Generate automated **Burndown Charts** and calculate "Team Velocity" for CTOs/Managers to predict sprint success.

## 4. Code & Git Integration (CI/CD sync)
* **Concept:** Deep integration with version control (GitHub/GitLab) to automate developer workflows.
* **Feature:**
  * Connect repository webhooks to the platform.
  * When a developer creates a branch containing the Issue Key (e.g., `feature/TASK-42`), auto-transition the task to "In Progress".
  * When a Pull Request is merged, automatically move the task to "QA" or "Done".
  * Render Git commits and PR links directly inside the task's Activity Feed.

## 5. SLA Timers (Service Level Agreements)
* **Concept:** Automated timers enforcing response times, especially for `BUG` and support tickets.
* **Feature:**
  * Define SLAs based on task priority (e.g., HIGH priority must be acknowledged in 4 hours).
  * Run background cron jobs to monitor timers.
  * If a task breaches SLA, automatically highlight it in red and dispatch a high-priority escalation notification to the CTO or department head.

## 6. Rich Media & Attachments
* **Concept:** Move beyond plain-text comments.
* **Feature:**
  * Add an `Attachment` model linking files to Tasks and Comments.
  * Implement drag-and-drop file support and clipboard pasting (Ctrl+V) for screenshots.
  * Upload directly to AWS S3 and render images/documents inline within the task details modal.

## 7. Custom Workflows & Transition Rules
* **Concept:** Guardrails and automations on column/status transitions.
* **Feature:**
  * Allow defining conditional rules (e.g., *"A task cannot be moved from QA to DONE unless it has a sign-off comment from a Manager"*).
  * Allow automations (e.g., *"When a task moves to QA, automatically re-assign it to the QA Lead"*).
  * Prevent unauthorized dragging across the Kanban board.

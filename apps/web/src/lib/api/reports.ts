import { apiClient as api } from "./client";

export const reportsApi = {
  /**
   * Generates a report in the specified format and returns the generated report details.
   */
  generateReport: (type: string, format: 'PDF' | 'XLSX') =>
    api.post("/reports/generate", { type, format }),

  /**
   * Fetches recently generated reports for the current user.
   */
  getRecentReports: () =>
    api.get("/reports"),

  /**
   * Fetches operations executive metrics.
   */
  getOeMetrics: () =>
    api.get("/reports/oe-metrics"),

  /**
   * Fetches the presigned download URL for a specific report ID.
   */
  getDownloadUrl: (id: string) =>
    api.get(`/reports/${id}/download`),
};

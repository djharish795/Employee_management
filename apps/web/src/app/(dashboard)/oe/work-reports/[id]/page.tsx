import WorkReportDetailPage from "../../../cem/work-reports/[id]/page";

export default function OeWorkReportDetailPage({ params }: { params: { id: string } }) {
  return <WorkReportDetailPage params={params} />;
}

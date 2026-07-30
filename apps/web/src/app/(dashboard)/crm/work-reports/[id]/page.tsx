import WorkReportDetailPage from "../../../cem/work-reports/[id]/page";

export default function OmWorkReportDetailPage({ params }: { params: { id: string } }) {
  return <WorkReportDetailPage params={params} />;
}

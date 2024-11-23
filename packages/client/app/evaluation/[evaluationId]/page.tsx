import Page from "./page-client";

export default async function ReviewerDashboard({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;

  return <Page evaluationId={evaluationId} />;
}

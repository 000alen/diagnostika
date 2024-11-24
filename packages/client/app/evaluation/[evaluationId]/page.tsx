import { db, eq, graphs } from "@bananus/db";
import Page from "./page-client";

export default async function ReviewerDashboard({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;

  const graph = await db
    .select()
    .from(graphs)
    .where(eq(graphs.id, evaluationId))
    .then((res) => res[0]);

  return (
    <Page
      evaluationId={evaluationId}
      graph={graph.graph}
      symptoms={graph.symptoms}
    />
  );
}

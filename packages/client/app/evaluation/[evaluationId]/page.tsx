import { db, eq, graphs, patients, snapshots } from "@bananus/db";
import Page from "./page-client";

export default async function ReviewerDashboard({
  params,
}: {
  params: Promise<{ evaluationId: string }>;
}) {
  const { evaluationId } = await params;

  const graph = await db
    .select({
      graph: graphs.graph,
      symptoms: graphs.symptoms,
      patientId: patients.id,
      patientName: patients.name,
    })
    .from(graphs)
    .where(eq(graphs.id, evaluationId))
    .leftJoin(snapshots, eq(snapshots.id, graphs.snapshotId))
    .leftJoin(patients, eq(patients.id, snapshots.patientId))
    .then((res) => res[0]);

  return (
    <Page
      evaluationId={evaluationId}
      graph={graph.graph}
      symptoms={graph.symptoms}
      patientId={graph.patientId!}
      patientName={graph.patientName!}
    />
  );
}

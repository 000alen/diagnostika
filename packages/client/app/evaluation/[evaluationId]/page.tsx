/* eslint-disable @typescript-eslint/no-explicit-any */
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
      diagnosis: graphs.diagnosis,
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
      graph={graph.graph as any}
      symptoms={graph.symptoms}
      diagnosis={graph.diagnosis as any}
      patientId={graph.patientId!}
      patientName={graph.patientName!}
    />
  );
}

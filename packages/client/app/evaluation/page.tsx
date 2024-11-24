import { db, graphs, patients, snapshots, eq } from "@bananus/db";
import Page from "./page-client";

export default async function ReviewerDashboard() {
  const _graphs = await db
    .select({
      id: graphs.id,
      graph: graphs.graph,
      symptoms: graphs.symptoms,
      diagnosis: graphs.diagnosis,
      patientId: patients.id,
      patientName: patients.name,
    })
    .from(graphs)
    .leftJoin(snapshots, eq(snapshots.id, graphs.snapshotId))
    .leftJoin(patients, eq(patients.id, snapshots.patientId));

  return <Page graphs={_graphs} />;
}

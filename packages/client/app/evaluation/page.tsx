import { db, graphs } from "@bananus/db";
import Page from "./page-client";

export default async function ReviewerDashboard() {
  const _graphs = await db.select().from(graphs);

  return <Page graphs={_graphs} />;
}

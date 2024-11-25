import { cosineSimilarity } from "ai";
import { BaseEdge, BaseNode } from "./types";

const IDENTITY_THRESHOLD = 0.8;

export class Graph<Node extends BaseNode, Edge extends BaseEdge> {
  nodes: Array<Node>;
  edges: Array<Edge>;

  constructor() {
    this.nodes = [];
    this.edges = [];
  }

  hasNode(node: Node): boolean {
    const similarities = this.nodes
      .filter((n) => n.type === node.type)
      .map((n) => cosineSimilarity(node.embedding, n.embedding));

    if (similarities.some((similarity) => similarity > IDENTITY_THRESHOLD))
      return true;

    return false;
  }

  getClosestNode(node: Node): Node | null {
    const similarities = this.nodes
      .filter((n) => n.type === node.type)
      .map((n) => cosineSimilarity(node.embedding, n.embedding));

    const maxSimilarity = Math.max(...similarities);
    if (maxSimilarity > IDENTITY_THRESHOLD) {
      const index = similarities.indexOf(maxSimilarity);
      return this.nodes[index];
    }

    return null;
  }

  addNode(node: Node) {
    if (this.hasNode(node)) return;
    this.nodes.push(node);
  }

  removeNode(node: Node) {
    const closestNode = this.getClosestNode(node);

    if (closestNode) {
      const index = this.nodes.indexOf(closestNode);
      this.nodes.splice(index, 1);
    }
  }

  hasEdge(edge: Edge): boolean {
    const similarities = this.edges
      .filter((e) => e.type === edge.type)
      .map((e) => cosineSimilarity(edge.embedding, e.embedding));

    const candidateEdges = this.edges.filter(
      (_, i) => similarities[i] > IDENTITY_THRESHOLD
    );

    if (candidateEdges.length === 0) return false;

    if (
      candidateEdges.some(
        (candidateEdge) =>
          cosineSimilarity(
            candidateEdge.sourceEmbedding,
            edge.sourceEmbedding
          ) > IDENTITY_THRESHOLD &&
          cosineSimilarity(
            candidateEdge.targetEmbedding,
            edge.targetEmbedding
          ) > IDENTITY_THRESHOLD
      )
    )
      return true;

    return false;
  }

  getClosestEdge(edge: Edge): Edge | null {
    const similarities = this.edges
      .filter((e) => e.type === edge.type)
      .map((e) => cosineSimilarity(edge.embedding, e.embedding));

    let candidateEdges = this.edges.filter(
      (_, i) => similarities[i] > IDENTITY_THRESHOLD
    );

    if (candidateEdges.length === 0) return null;

    const sourceSimilarities = candidateEdges.map((candidateEdge) =>
      cosineSimilarity(candidateEdge.sourceEmbedding, edge.sourceEmbedding)
    );
    const targetSimilarities = candidateEdges.map((candidateEdge) =>
      cosineSimilarity(candidateEdge.targetEmbedding, edge.targetEmbedding)
    );

    candidateEdges = candidateEdges.filter(
      (_, i) =>
        sourceSimilarities[i] > IDENTITY_THRESHOLD &&
        targetSimilarities[i] > IDENTITY_THRESHOLD
    );

    const combinedSimilarities = candidateEdges.map(
      (_, i) => sourceSimilarities[i] * targetSimilarities[i]
    );

    const maxSimilarity = Math.max(...combinedSimilarities);
    if (maxSimilarity > IDENTITY_THRESHOLD) {
      const index = combinedSimilarities.indexOf(maxSimilarity);
      return candidateEdges[index];
    }

    return null;
  }

  addEdge(edge: Edge) {
    if (this.hasEdge(edge)) return;
    this.edges.push(edge);
  }

  removeEdge(edge: Edge) {
    const closestEdge = this.getClosestEdge(edge);

    if (closestEdge) {
      const index = this.edges.indexOf(closestEdge);
      this.edges.splice(index, 1);
    }
  }
}

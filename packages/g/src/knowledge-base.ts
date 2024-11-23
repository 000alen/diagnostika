import { Entity, Relation } from './types';

type EmbeddingsFunction = (text: string) => number[];
type SimilarityFunction = (text1: string, text2: string) => number;

interface ExternalKnowledgeBase {
  getEntity(name: string): Entity | null;
}

export class KB {
  private embeddingsFunction: EmbeddingsFunction;
  private similarityThreshold: number;
  private similarityFunction: SimilarityFunction;
  private externalKnowledgeBases: ExternalKnowledgeBase[];
  private entities: Map<string, Entity>;
  private relations: Relation[];

  constructor(
    externalKnowledgeBases: ExternalKnowledgeBase[] = [],
    embeddingsFunction: EmbeddingsFunction,
    similarityFunction: SimilarityFunction,
    similarityThreshold: number = 0.75
  ) {
    this.embeddingsFunction = embeddingsFunction;
    this.similarityThreshold = similarityThreshold;
    this.similarityFunction = similarityFunction;
    this.externalKnowledgeBases = externalKnowledgeBases;
    this.entities = new Map();
    this.relations = [];
  }

  static fromRelations(
    relations: Relation[],
    externalKnowledgeBases: ExternalKnowledgeBase[] = [],
    embeddingsFunction: EmbeddingsFunction,
    similarityFunction: SimilarityFunction,
    similarityThreshold: number = 0.75
  ): KB {
    const kb = new KB(
      externalKnowledgeBases,
      embeddingsFunction,
      similarityFunction,
      similarityThreshold
    );
    for (const r of relations) {
      kb.addRelation(r, "", "");
    }
    return kb;
  }

  copy(): KB {
    return structuredClone(this);
  }

  private areRelationsEqual(r1: Relation, r2: Relation): boolean {
    if (r1.implicit !== r2.implicit) {
      return false;
    }

    const match = ['head', 'type', 'tail'].every(
      attr => r1[attr as keyof Relation] === r2[attr as keyof Relation]
    );

    if (r1.implicit) {
      return (
        r1.embedding &&
        r2.embedding &&
        r1.embedding.every((val, idx) => val === r2.embedding![idx]) &&
        match
      );
    }

    return match;
  }

  hasSimilarRelation(relation: Relation, threshold: number = 0.8): boolean {
    return this.relations.some(candidateRelation => {
      if (
        this.similarityFunction(relation.head, candidateRelation.head) < threshold ||
        this.similarityFunction(relation.tail, candidateRelation.tail) < threshold
      ) {
        return false;
      }

      if (candidateRelation.implicit) {
        if (!relation.type || !candidateRelation.embedding) return false;
        const similarity = this.similarityFunction(
          relation.type,
          candidateRelation.embedding.toString()
        );
        return similarity >= threshold;
      }

      if (!relation.type || !candidateRelation.type) return false;
      return (
        this.similarityFunction(relation.type, candidateRelation.type) >= threshold
      );
    });
  }

  private existsRelation(r1: Relation): boolean {
    return this.relations.some(r2 => this.areRelationsEqual(r1, r2));
  }

  private getEntityFromKb(candidateEntity: string): Entity | null {
    if (this.entities.size === 0) {
      return null;
    }

    let maxSimilarity = -1;
    let mostSimilarEntity: Entity | null = null;

    for (const entity of this.entities.values()) {
      const similarity = this.similarityFunction(candidateEntity, entity.title);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        mostSimilarEntity = entity;
      }
    }

    if (maxSimilarity < this.similarityThreshold || !mostSimilarEntity) {
      return null;
    }

    return mostSimilarEntity;
  }

  private getEmptyEntity(candidateEntity: string): Entity {
    return {
      title: candidateEntity,
      url: "",
      summary: ""
    };
  }

  private addEntity(e: Entity): void {
    this.entities.set(e.title, e);
  }

  addRelation(r: Relation, articleTitle: string, articlePublishDate: string): void {
    const candidateEntities = [r.head, r.tail];
    let entities = candidateEntities.map(ent => this.getEntityFromKb(ent));

    for (const ekb of this.externalKnowledgeBases) {
      entities = entities.map((e, idx) =>
        e === null ? ekb.getEntity(candidateEntities[idx]) : e
      );
    }

    entities = entities.map((e, idx) =>
      e === null ? this.getEmptyEntity(candidateEntities[idx]) : e
    );

    // If any entity is null, stop
    if (entities.some(e => e === null)) {
      return;
    }

    // Add new entities
    entities.forEach(e => e && this.addEntity(e));

    // Rename relation entities with their titles
    r.head = entities[0]!.title;
    r.tail = entities[1]!.title;

    // Add new relation if it doesn't exist
    if (!this.existsRelation(r)) {
      this.relations.push(r);
    }
  }

  // ... Additional methods will follow in subsequent messages
}

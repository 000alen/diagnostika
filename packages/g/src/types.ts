export interface Entity {
  title: string;
  url: string;
  summary: string;
}

export interface Relation {
  head: string;
  tail: string;
  implicit: boolean;
  type?: string;

  // TODO: properly type this
  embedding?: Array<number>;
  meta: Record<string, any>;
}


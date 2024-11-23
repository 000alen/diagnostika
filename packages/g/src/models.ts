import { bedrock } from "@ai-sdk/amazon-bedrock";
import { EmbeddingModel, LanguageModel } from "ai";

export interface Models {
  language: LanguageModel;
  embedding: EmbeddingModel<string>;
}

// export const gpt4o = openai("gpt-4o");

// export const openaiEmbeddings = openai.embedding("text-embedding-3-large");

export const sonnet = bedrock("anthropic.claude-3-sonnet-20240229-v1:0");

export const titanEmbeddings: EmbeddingModel<string> = bedrock.embedding(
  "amazon.titan-embed-text-v2:0",
  {
    dimensions: 1024,
  }
);

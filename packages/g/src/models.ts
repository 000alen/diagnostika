import { bedrock } from "@ai-sdk/amazon-bedrock";
import { EmbeddingModel } from "ai";

// export const gpt4o = openai("gpt-4o");

// export const openaiEmbeddings = openai.embedding("text-embedding-3-large");

export const sonnet = bedrock("anthropic.claude-3-sonnet-20240229-v1:0");

export const cohereEmbeddings: EmbeddingModel<string> = bedrock.embedding(
  "cohere.embed-english-v3"
);

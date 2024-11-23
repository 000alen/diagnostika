import { openai } from "@ai-sdk/openai";
import { bedrock } from "@ai-sdk/amazon-bedrock";

export const gpt4o = openai("gpt-4o");

export const sonnet = bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0");

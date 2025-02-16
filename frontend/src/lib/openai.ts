import { openai } from "@ai-sdk/openai"

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

export const openaiModel = openai("gpt-4", {})


import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
console.log("Gemini API Key:", apiKey);


const genAI = new GoogleGenerativeAI(apiKey!);
console.log("Gemini API Key:", apiKey);


export const generateInsights = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
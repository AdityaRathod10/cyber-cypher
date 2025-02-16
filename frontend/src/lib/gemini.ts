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

export async function generateTimeline(product: string, investmentAreas: string[]) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `
    You are a startup advisor. Generate a 6-month timeline for a startup that is building ${product}. 
    The startup is focusing on the following investment areas: ${investmentAreas.join(', ')}.
    Provide a detailed month-by-month plan with actionable steps. Format the response as a JSON array of objects with the following structure:
    [
      {
        "month": "Month 1",
        "tasks": [
          "Task 1 description",
          "Task 2 description",
          ...
        ]
      },
      ...
    ]
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    return [];
  }
}
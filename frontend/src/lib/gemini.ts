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
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      
      // Attempt to extract JSON from the response if it contains other text
      const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          console.error('Failed to extract JSON from response:', extractError);
        }
      }
      
      // Return a fallback structure if parsing fails
      return [
        {
          month: "Month 1",
          tasks: ["Plan your product development", "Research target market", "Build initial prototype"]
        },
        {
          month: "Month 2",
          tasks: ["Gather user feedback", "Refine prototype", "Develop marketing strategy"]
        },
        {
          month: "Month 3",
          tasks: ["Begin product development", "Start building brand presence", "Prepare for beta launch"]
        },
        {
          month: "Month 4",
          tasks: ["Launch beta version", "Collect and analyze user data", "Iterate based on feedback"]
        },
        {
          month: "Month 5",
          tasks: ["Finalize product features", "Prepare go-to-market strategy", "Build sales pipeline"]
        },
        {
          month: "Month 6",
          tasks: ["Official product launch", "Execute marketing campaigns", "Begin scaling operations"]
        }
      ];
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Return a fallback timeline in case of API failure
    return [
      {
        month: "Month 1",
        tasks: ["Plan your product development", "Research target market", "Build initial prototype"]
      },
      {
        month: "Month 2",
        tasks: ["Gather user feedback", "Refine prototype", "Develop marketing strategy"]
      },
      {
        month: "Month 3",
        tasks: ["Begin product development", "Start building brand presence", "Prepare for beta launch"]
      },
      {
        month: "Month 4",
        tasks: ["Launch beta version", "Collect and analyze user data", "Iterate based on feedback"]
      },
      {
        month: "Month 5",
        tasks: ["Finalize product features", "Prepare go-to-market strategy", "Build sales pipeline"]
      },
      {
        month: "Month 6",
        tasks: ["Official product launch", "Execute marketing campaigns", "Begin scaling operations"]
      }
    ];
  }
}
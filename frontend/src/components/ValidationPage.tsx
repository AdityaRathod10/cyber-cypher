'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { generateInsights } from '@/lib/gemini';


Chart.register(...registerables);

export default function ValidationChat() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<{ question: string; answer: string }[]>([]);
  const [input, setInput] = useState('');
  interface ValidationResult {
    uniqueness: number;
    marketDemand: number;
    competition: number;
    riskFactor: number;
    insights: string;
  }

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const questions = [
    "What's your startup idea?",
    "Where are you based? (City, Country)",
    "Do you have any existing resources or funding? (Yes/No)"
  ];

  const handleNextStep = async () => {
    if (!input) return;
    setResponses([...responses, { question: questions[step], answer: input }]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      if (step === questions.length - 1) {
        generateAnalysis();
      } else {
        setStep(step + 1);
      }
      setLoading(false);
    }, 1500);
  };

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const prompt = `
        Analyze the following startup idea and provide insights:
        - Idea: ${responses[0]?.answer}
        - Location: ${responses[1]?.answer}
        - Resources/Funding: ${responses[2]?.answer}
  
        Provide a detailed analysis including:
        1. Uniqueness score (0-100)
        2. Market demand score (0-100)
        3. Competition score (0-100)
        4. Risk factor score (0-100)
        5. Insights and recommendations
      `;
  
      // Call Gemini
      const insights = await generateInsights(prompt);
      console.log("Gemini Response:", insights); // Debug log
  
      // Parse and set insights
      const parsedInsights = parseInsights(insights);
      setValidationResult(parsedInsights);
    } catch (error) {
      console.error("Error generating analysis:", error);
    } finally {
      setLoading(false);
    }
  };
  
  
  const parseInsights = (text: string): ValidationResult => {
    console.log("Parsing insights:", text);
    
    return {
      uniqueness: parseInt(text.match(/Uniqueness score:\s*(\d+)/)?.[1] || "50"),
      marketDemand: parseInt(text.match(/Market demand score:\s*(\d+)/)?.[1] || "50"),
      competition: parseInt(text.match(/Competition score:\s*(\d+)/)?.[1] || "50"),
      riskFactor: parseInt(text.match(/Risk factor score:\s*(\d+)/)?.[1] || "50"),
      insights: text.split("Insights and recommendations:")[1]?.trim() || "No insights available.",
    };
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-900 via-indigo-900 to-black text-white p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl w-full bg-opacity-30 bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-6">AI Startup Validator 🚀</h1>
        <div className="space-y-4">
          {responses.map((res, idx) => (
            <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-black/40 rounded-lg">
              <p className="text-gray-300">{res.question}</p>
              <p className="font-semibold text-lg">{res.answer}</p>
            </motion.div>
          ))}
          {step < questions.length && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-black/40 rounded-lg">
              <p className="text-gray-300">{questions[step]}</p>
              <Input value={input} onChange={(e) => setInput(e.target.value)} className="mt-2 bg-black/20 border border-gray-500" />
              <Button onClick={handleNextStep} className="mt-3 w-full bg-purple-600 hover:bg-purple-700" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Next"}
              </Button>
            </motion.div>
          )}
        </div>
        {validationResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-6 bg-black/40 rounded-lg text-center">
            <h2 className="text-2xl font-semibold">Market Analysis</h2>
            <p className="mt-2 text-gray-300">{validationResult.insights}</p>
            <div className="mt-4">
              <Bar
                data={{
                  labels: ['Uniqueness', 'Market Demand', 'Competition', 'Risk Factor'],
                  datasets: [{
                    label: 'Score',
                    data: [validationResult.uniqueness, validationResult.marketDemand, validationResult.competition, validationResult.riskFactor],
                    backgroundColor: ['#8B5CF6', '#22D3EE', '#F87171', '#FACC15'],
                  }],
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}



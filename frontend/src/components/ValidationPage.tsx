'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, registerables } from 'chart.js';
import { generateInsights } from '@/lib/gemini';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ...registerables);

export default function ValidationChat() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<{ question: string; answer: string }[]>([]);
  const [input, setInput] = useState('');

  interface ValidationResult {
    scores: {
      uniqueness: number;
      marketDemand: number;
      competition: number;
      riskFactor: number;
    };
    keySellingPoints: string;
    businessModel: string;
    recommendations: string;
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
        Analyze the following startup idea with a detailed, multi-dimensional approach:
        
        - **Idea**: ${responses[0]?.answer}  
        - **Location**: ${responses[1]?.answer}  
        - **Resources & Funding**: ${responses[2]?.answer}  
        
        **Provide a structured, data-driven analysis including:**  

        1. **Scores (0-100)**:
           - Innovation & Differentiation Score
           - Market Demand Score
           - Competitive Landscape Score
           - Risk & Scalability Factor

        2. **Key Selling Points**:
           - What makes this idea unique?
           - What is the USP (Unique Selling Proposition)?

        3. **Business Model Viability**:
           - Revenue streams
           - Monetization potential
           - Sustainability

        4. **Recommendations**:
           - Key actionable strategies for success
           - Investment potential & funding suggestions

        **Output Format**:
        - Scores: [Innovation & Differentiation Score, Market Demand Score, Competitive Landscape Score, Risk & Scalability Factor]
        - Key Selling Points: [Paragraph]
        - Business Model Viability: [Paragraph]
        - Recommendations: [Paragraph]
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

    // Extract scores
    const scores = {
      uniqueness: parseInt(text.match(/Innovation & Differentiation Score:\s*(\d+)/)?.[1] || '0'),
      marketDemand: parseInt(text.match(/Market Demand Score:\s*(\d+)/)?.[1] || '0'),
      competition: parseInt(text.match(/Competitive Landscape Score:\s*(\d+)/)?.[1] || '0'),
      riskFactor: parseInt(text.match(/Risk & Scalability Factor:\s*(\d+)/)?.[1] || '0'),
    };

    // Extract key selling points
    const keySellingPoints = text.match(/Key Selling Points:\s*([\s\S]*?)(?=\n\*\*|$)/)?.[1]?.trim() || "No key selling points available.";

    // Extract business model viability
    const businessModel = text.match(/Business Model Viability:\s*([\s\S]*?)(?=\n\*\*|$)/)?.[1]?.trim() || "No business model viability available.";

    // Extract recommendations
    const recommendations = text.match(/Recommendations:\s*([\s\S]*?)(?=\n\*\*|$)/)?.[1]?.trim() || "No recommendations available.";

    return {
      scores,
      keySellingPoints,
      businessModel,
      recommendations,
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
            <div className="mt-4 space-y-6">
              {/* Scores Chart */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-xl font-semibold">Scores</h3>
                <Bar
                  data={{
                    labels: ['Uniqueness', 'Market Demand', 'Competition', 'Risk Factor'],
                    datasets: [{
                      label: 'Score',
                      data: [
                        validationResult.scores.uniqueness,
                        validationResult.scores.marketDemand,
                        validationResult.scores.competition,
                        validationResult.scores.riskFactor,
                      ],
                      backgroundColor: ['#8B5CF6', '#22D3EE', '#F87171', '#FACC15'],
                    }],
                  }}
                />
              </div>

              {/* Key Selling Points */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-xl font-semibold">Key Selling Points</h3>
                <p className="text-gray-300">{validationResult.keySellingPoints}</p>
              </div>

              {/* Business Model Viability */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-xl font-semibold">Business Model Viability</h3>
                <p className="text-gray-300">{validationResult.businessModel}</p>
              </div>

              {/* Recommendations */}
              <div className="p-4 bg-black/20 rounded-lg">
                <h3 className="text-xl font-semibold">Recommendations</h3>
                <p className="text-gray-300">{validationResult.recommendations}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
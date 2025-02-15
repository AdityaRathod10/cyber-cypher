'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, ThumbsUp, ThumbsDown, Copy, Trash, MessageSquare } from 'lucide-react';
import { Bar,Line,Pie,Radar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend, registerables } from 'chart.js';
import { generateInsights } from '@/lib/gemini';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ...registerables);

// Define message type
type Message = {
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  isQuestion?: boolean;
};

export default function ValidationChat() {
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState('current');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'agent',
      content: "Welcome to the AI Startup Validator! Let's analyze your startup idea. What's your startup idea?",
      timestamp: formatTime(new Date()),
      isQuestion: true
    }
  ]);
  const [input, setInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 'current', name: 'Current Chat', active: true }
  ]);

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
  interface Competitor {
    name: string;
    marketShare: number;
    strengths: string[];
    weaknesses: string[];
    differentiator: string;
  }
  
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
    competitors: Competitor[]; // New field
  }

  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const questions = [
    "What's your startup idea?",
    "Where are you based? (City, Country)",
    "Do you have any existing resources or funding? (Yes/No)"
  ];

  function formatTime(date: Date): string {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    
    return `${hours}:${formattedMinutes} ${ampm}`;
  }

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const newMessages: Message[] = [
      ...messages,
      {
        role: 'user',
        content: input,
        timestamp: formatTime(new Date())
      }
    ];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    // If we haven't asked all questions yet
    if (currentQuestion < questions.length - 1) {
      // Add next question from agent
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            role: 'agent',
            content: questions[currentQuestion + 1],
            timestamp: formatTime(new Date()),
            isQuestion: true
          }
        ]);
        setCurrentQuestion(currentQuestion + 1);
        setLoading(false);
      }, 1000);
    } else if (currentQuestion === questions.length - 1 && !analysisComplete) {
      // Time to generate analysis
      try {
        await generateAnalysis(newMessages);
        setAnalysisComplete(true);
      } catch (error) {
        console.error("Error generating analysis:", error);
        setMessages([
          ...newMessages,
          {
            role: 'agent',
            content: "Sorry, I encountered an error while analyzing your startup. Please try again.",
            timestamp: formatTime(new Date())
          }
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const generateAnalysis = async (currentMessages: Message[]) => {
    // Extract answers
    const answers = currentMessages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);
    
    const prompt = `
      Analyze the following startup idea with a detailed, multi-dimensional approach:
  
  - **Idea**: ${answers[0]}  
  - **Location**: ${answers[1]}  
  - **Resources & Funding**: ${answers[2]}  
  
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

  4. **Competitor Analysis**:
     - List 3-5 key competitors.
     - For each competitor, provide:
       - Name
       - Market Share (if available)
       - Strengths
       - Weaknesses
       - Key Differentiator

  5. **Recommendations**:
     - Key actionable strategies for success
     - Investment potential & funding suggestions

  **Output Format**:
  - Scores: [Innovation & Differentiation Score, Market Demand Score, Competitive Landscape Score, Risk & Scalability Factor]
  - Key Selling Points: [Paragraph]
  - Business Model Viability: [Paragraph]
  - Competitor Analysis:
    - Competitor: [Name]
      - Market Share: [Value]
      - Strengths: [List]
      - Weaknesses: [List]
      - Differentiator: [Paragraph]
  - Recommendations: [Paragraph]
    `;

    // Call Gemini
    const insights = await generateInsights(prompt);
    
    // Parse insights
    const parsedInsights = parseInsights(insights);
    setValidationResult(parsedInsights);
    
    // Add analysis message
    setMessages([
      ...currentMessages,
      {
        role: 'agent',
        content: "I've analyzed your startup idea. Here are the results:",
        timestamp: formatTime(new Date())
      }
    ]);
  };

  const parseInsights = (text: string): ValidationResult => {
    // Extract scores
    const scores = {
      uniqueness: parseInt(text.match(/Innovation & Differentiation Score:\s*(\d+)/i)?.[1] || '0'),
      marketDemand: parseInt(text.match(/Market Demand Score:\s*(\d+)/i)?.[1] || '0'),
      competition: parseInt(text.match(/Competitive Landscape Score:\s*(\d+)/i)?.[1] || '0'),
      riskFactor: parseInt(text.match(/Risk & Scalability Factor:\s*(\d+)/i)?.[1] || '0'),
    };

    // Extract key sections with more robust patterns
    const keySellingPointsMatch = text.match(/Key Selling Points:?\s*([\s\S]*?)(?=\s*Business Model Viability:|$)/i);
    const keySellingPoints = keySellingPointsMatch?.[1]?.trim() || "No key selling points available.";
    
    const businessModelMatch = text.match(/Business Model Viability:?\s*([\s\S]*?)(?=\s*Recommendations:|$)/i);
    const businessModel = businessModelMatch?.[1]?.trim() || "No business model viability available.";
    
    const recommendationsMatch = text.match(/Recommendations:?\s*([\s\S]*?)$/i);
    const recommendations = recommendationsMatch?.[1]?.trim() || "No recommendations available.";

    const competitors: Competitor[] = [];
  const competitorBlocks = text.match(/Competitor:\s*([\s\S]*?)(?=\nCompetitor:|$)/gi) || [];
  competitorBlocks.forEach((block) => {
    const name = block.match(/Name:\s*([^\n]+)/i)?.[1]?.trim() || "Unknown";
    const marketShare = parseInt(block.match(/Market Share:\s*(\d+)/i)?.[1] || '0');
    const strengths = block.match(/Strengths:\s*([\s\S]*?)(?=\nWeaknesses:|$)/i)?.[1]?.trim().split('\n').map(s => s.replace(/^\*\s*/, '')) || [];
    const weaknesses = block.match(/Weaknesses:\s*([\s\S]*?)(?=\nDifferentiator:|$)/i)?.[1]?.trim().split('\n').map(s => s.replace(/^\*\s*/, '')) || [];
    const differentiator = block.match(/Differentiator:\s*([^\n]+)/i)?.[1]?.trim() || "No differentiator available.";

    competitors.push({ name, marketShare, strengths, weaknesses, differentiator });
  });

    return {
      scores,
      keySellingPoints,
      businessModel,
      recommendations,
      competitors,
    };
  };

  const startNewChat = () => {
    const newChatId = `chat-${Date.now()}`;
    setChatHistory([
      ...chatHistory.map(chat => ({...chat, active: false})),
      { id: newChatId, name: `Chat ${chatHistory.length}`, active: true }
    ]);
    
    setActiveChat(newChatId);
    setMessages([{
      role: 'agent',
      content: "Welcome to the AI Startup Validator! Let's analyze your startup idea. What's your startup idea?",
      timestamp: formatTime(new Date()),
      isQuestion: true
    }]);
    setCurrentQuestion(0);
    setAnalysisComplete(false);
    setValidationResult(null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#1E1433]">
      {/* Sidebar for chat history */}
      <div className="w-64 flex-shrink-0 border-r border-purple-900 border-opacity-50 shadow-[1px_0_5px_rgba(168,85,247,0.3)] bg-[#191129] text-white">
        <div className="p-4 border-b border-purple-900 border-opacity-50">
          <h2 className="text-xl font-semibold">SoloFounder.AI</h2>
        </div>
        <div className="p-4">
          <Button 
            onClick={startNewChat}
            className="w-full bg-[#A855F7] hover:bg-purple-600 text-white flex items-center gap-2 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          >
            <MessageSquare size={16} />
            New Chat
          </Button>
        </div>
        <div className="px-2 pb-4 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="mb-2 px-2 text-xs uppercase text-gray-400 font-semibold">Recent Chats</div>
          <div className="rounded-md overflow-hidden border border-purple-900 border-opacity-30">
            <div 
              className="p-2 bg-[#2D1D50] cursor-pointer flex items-center gap-2"
            >
              <MessageSquare size={16} className="text-gray-400" />
              <span className="text-sm truncate">Current Chat</span>
            </div>
          </div>
          {chatHistory.filter(chat => chat.id !== 'current').map((chat) => (
            <div 
              key={chat.id}
              className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${
                chat.active ? 'bg-[#2D1D50]' : 'hover:bg-[#2D1D50]/50'
              }`}
              onClick={() => setActiveChat(chat.id)}
            >
              <MessageSquare size={16} className="text-gray-400" />
              <span className="text-sm truncate">{chat.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 max-h-screen">
        {/* Header */}
        <div className="p-4 border-b border-purple-900 border-opacity-50 shadow-[0_1px_5px_rgba(168,85,247,0.3)] bg-[#1E1433] text-white flex justify-between items-center">
          <h1 className="text-xl font-semibold">AI Startup Validator</h1>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-purple-800"
            onClick={startNewChat}
          >
            New Chat
          </Button>
        </div>
        
        {/* Chat area - make sure this has a fixed height and scrolls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)] ${
                message.role === 'agent' ? 'bg-[#A855F7]' : 'bg-gray-600'
              }`}>
                {message.role === 'agent' ? 'AI' : 'You'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{message.role === 'agent' ? 'AI Agent' : 'You'}</span>
                  <span className="text-sm text-gray-400">{message.timestamp}</span>
                </div>
                <div className={`mt-1 p-3 rounded-lg ${
                  message.role === 'agent' 
                    ? 'bg-[#2D1D50] text-white shadow-[0_0_5px_rgba(168,85,247,0.3)]' 
                    : 'bg-[#433b5c] text-white'
                }`}>
                  {message.content}
                </div>
                {message.role === 'agent' && (
                  <div className="mt-1 flex gap-2">
                    <button className="p-1 text-gray-400 hover:text-white"><Copy size={16} /></button>
                    <button className="p-1 text-gray-400 hover:text-white"><ThumbsUp size={16} /></button>
                    <button className="p-1 text-gray-400 hover:text-white"><ThumbsDown size={16} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Analysis results */}
          {validationResult && analysisComplete && (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-full bg-[#A855F7] flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
      AI
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2">
        <span className="font-medium text-white">AI Agent</span>
        <span className="text-sm text-gray-400">{formatTime(new Date())}</span>
      </div>
      <div className="mt-1 p-4 rounded-lg bg-[#2D1D50] text-white space-y-4 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
        <h3 className="text-lg font-semibold">Analysis Results</h3>
        
        {/* Scores Chart */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Scores</h4>
          <div className="h-64">
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
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true, max: 100 },
                  x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Market Demand Trends */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Market Demand Trends</h4>
          <div className="h-64">
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                  label: 'Market Demand',
                  data: [65, 59, 80, 81, 56, 55, 40, 70, 75, 85, 90, 95],
                  borderColor: '#8B5CF6',
                  fill: false,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true },
                  x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Competitor Market Share */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Competitor Market Share</h4>
          <div className="h-64">
            <Pie
              data={{
                labels: validationResult.competitors.map(competitor => competitor.name),
                datasets: [{
                  label: 'Market Share',
                  data: validationResult.competitors.map(competitor => competitor.marketShare),
                  backgroundColor: ['#8B5CF6', '#22D3EE', '#F87171', '#FACC15', '#4ADE80'],
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Risk Analysis</h4>
          <div className="h-64">
            <Radar
              data={{
                labels: ['Financial Risk', 'Market Risk', 'Operational Risk', 'Regulatory Risk', 'Technological Risk'],
                datasets: [{
                  label: 'Risk Level',
                  data: [65, 59, 80, 81, 56],
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  borderColor: '#8B5CF6',
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: { beginAtZero: true },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Revenue Projections */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Revenue Projections</h4>
          <div className="h-64">
            <Line
              data={{
                labels: ['2023', '2024', '2025', '2026', '2027'],
                datasets: [{
                  label: 'Revenue',
                  data: [100000, 150000, 200000, 250000, 300000],
                  borderColor: '#8B5CF6',
                  fill: false,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: { beginAtZero: true },
                  x: { grid: { color: 'rgba(255, 255, 255, 0.1)' } },
                },
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Customer Segmentation */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Customer Segmentation</h4>
          <div className="h-64">
            <Pie
              data={{
                labels: ['Segment A', 'Segment B', 'Segment C', 'Segment D'],
                datasets: [{
                  label: 'Customer Segmentation',
                  data: [40, 30, 20, 10],
                  backgroundColor: ['#8B5CF6', '#22D3EE', '#F87171', '#FACC15'],
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* Key Selling Points */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Key Selling Points</h4>
          <p className="text-gray-300 text-sm">{validationResult.keySellingPoints}</p>
        </div>

        {/* Business Model Viability */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Business Model Viability</h4>
          <p className="text-gray-300 text-sm">{validationResult.businessModel}</p>
        </div>

        {/* Competitor Analysis */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Competitor Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validationResult.competitors.map((competitor, idx) => (
              <div key={idx} className="p-4 bg-[#1E1433]/70 rounded-lg shadow-[0_0_5px_rgba(168,85,247,0.3)]">
                <h5 className="font-semibold text-purple-400 mb-3">{competitor.name}</h5>
                
                {/* Market Share Pie Chart */}
                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-300 mb-2">Market Share</h6>
                  <div className="h-32">
                    <Bar
                      data={{
                        labels: ['Competitor', 'Remaining Market'],
                        datasets: [{
                          label: 'Market Share',
                          data: [competitor.marketShare, 100 - competitor.marketShare],
                          backgroundColor: ['#8B5CF6', '#433b5c'],
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </div>
                </div>

                {/* Strengths and Weaknesses */}
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-300">Strengths</h6>
                  <ul className="space-y-1">
                    {competitor.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-green-400">✅</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2 mt-3">
                  <h6 className="text-sm font-medium text-gray-300">Weaknesses</h6>
                  <ul className="space-y-1">
                    {competitor.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                        <span className="text-red-400">❌</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Differentiator */}
                <div className="mt-4">
                  <h6 className="text-sm font-medium text-gray-300">Differentiator</h6>
                  <p className="text-sm text-gray-300">{competitor.differentiator}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-4 bg-[#1E1433]/50 rounded-lg border border-purple-900 border-opacity-30">
          <h4 className="text-base font-semibold mb-2">Recommendations</h4>
          <p className="text-gray-300 text-sm">{validationResult.recommendations}</p>
        </div>
      </div>
    </div>
  </div>
)}
          
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#A855F7] flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                AI
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">AI Agent</span>
                  <span className="text-sm text-gray-400">{formatTime(new Date())}</span>
                </div>
                <div className="mt-1 p-3 rounded-lg bg-[#2D1D50] text-white flex items-center gap-2 shadow-[0_0_5px_rgba(168,85,247,0.3)]">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Input area - fixed at bottom */}
        <div className="p-4 border-t border-purple-900 border-opacity-50 shadow-[0_-1px_5px_rgba(168,85,247,0.3)] bg-[#1E1433]">
          <div className="flex gap-2 max-w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              placeholder="Type your message..."
              className="bg-[#2E1F47] border-gray-700 text-white flex-1 min-w-0"
            />
            <Button 
              onClick={handleSubmit} 
              disabled={loading || !input.trim()}
              className="bg-[#A855F7] hover:bg-purple-600 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)] flex-shrink-0"
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
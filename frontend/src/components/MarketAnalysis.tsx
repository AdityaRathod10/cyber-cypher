import { useState, ChangeEvent } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { generateTimeline } from '@/lib/gemini';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Trend {
  date: string;
  value: number;
}

interface Predictions {
  predictedRevenue: number;
  riskAnalysis: string;
  investmentAreas: string[];
  timeline: Array<{ month: string; tasks: string[] }>; // Add timeline to results
}

interface Results {
  product: string;
  trends: Trend[];
  predictions: Predictions;
}

export default function MarketAnalysis() {
  const [product, setProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProductChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProduct(e.target.value);
  };

  const handleSubmit = async () => {
    if (!product) {
      setError('Please enter a product name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the Next.js API route for predictions
      const predictionResponse = await fetch('/api/trends', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ product }),
      });

      if (!predictionResponse.ok) {
        throw new Error('Failed to fetch predictions.');
      }

      const predictionData = await predictionResponse.json();

      // Mock predictions data since we removed the file upload
      const mockPredictions = {
        predictedRevenue: (Math.floor(Math.random() * 10000) + 500) * 83, // Convert to rupees
        riskAnalysis: "Medium risk. Market shows positive growth but competition is increasing.",
        investmentAreas: ["Marketing", "Product Development", "Customer Support"]
      };
      const timeline = await generateTimeline(product, mockPredictions.investmentAreas);
      setResults({
        product,
        trends: predictionData.trends,
        predictions: mockPredictions,
        timeline, // Add timeline to result
      });
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (trends: Trend[]) => {
    return {
      labels: trends.map((trend) => trend.date),
      datasets: [
        {
          label: 'Interest Over Time',
          data: trends.map((trend) => trend.value),
          borderColor: 'rgba(139, 92, 246, 1)',
          backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            return gradient;
          },
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#8B5CF6',
          pointHoverBackgroundColor: '#C4B5FD',
          pointBorderColor: '#fff',
          pointHoverBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 2,
          tension: 0.3,
          fill: true,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeInOutCubic' as const, // Use a valid easing function
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#fff',
          font: {
            size: 14,
            weight: 'bold' as const,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: 'Market Interest Trends',
        color: '#fff',
        font: {
          size: 20,
          weight: 'bold' as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#8B5CF6',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return `Interest: ${context.parsed.y}`;
          },
          title: function(context: { label: string }[]) {
            return context[0].label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#CBD5E1',
          font: {
            size: 12,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#CBD5E1',
          font: {
            size: 12,
          },
          padding: 10,
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Startup Prediction Tool</h1>
        <p className="text-lg text-gray-300 mb-8">Analyze market trends and get insights for your business</p>

        <div className="max-w-md mx-auto space-y-4 mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your product name"
              value={product}
              onChange={handleProductChange}
              className="w-full p-4 pl-4 pr-12 rounded-lg bg-gray-800/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700 transition-all duration-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Analyze Trends</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-400 text-center bg-red-900/30 p-4 rounded-lg border border-red-500/50">
            <p className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error}
            </p>
          </div>
        )}

        {results && !error && (
          <div className="mt-8 space-y-12 animate-fade-in">
            <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                  </svg>
                  Market Trends for {results.product}
                </h2>
                <p className="text-gray-400 mb-4">Analysis of consumer interest over the past year</p>
              </div>
              <div className="h-[400px] px-4 pb-6">
                <Line
                  data={prepareChartData(results.trends)}
                  options={chartOptions}
                />
              </div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-purple-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"></path>
                  </svg>
                  Business Predictions
                </h2>
                <p className="text-gray-400 mb-4">AI-generated insights based on market analysis</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Predicted Revenue</h3>
                    <p className="text-3xl font-bold">₹{results.predictions.predictedRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Risk Analysis</h3>
                    <p className="text-lg">{results.predictions.riskAnalysis}</p>
                  </div>
                  <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">Recommended Investment Areas</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {results.predictions.investmentAreas.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Add this to your global CSS to enable the fade-in animation
// .animate-fade-in {
//   animation: fadeIn 1s ease-out;
// }
// @keyframes fadeIn {
//   from { opacity: 0; transform: translateY(20px); }
//   to   { opacity: 1; transform: translateY(0); }
// }
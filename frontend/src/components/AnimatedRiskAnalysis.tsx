import { useState, useEffect } from 'react';
import { Pause, TrendingUp, AlertCircle, ArrowBigDown } from 'lucide-react';
import { Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadarChart } from 'recharts';

interface RiskData {
  name: string;
  value: number;
  trend: 'up' | 'down';
  critical: boolean;
}

const AnimatedRiskAnalysis = () => {
  const [hoveredRisk, setHoveredRisk] = useState<string | null>(null);
  const [pulse, setPulse] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const riskData: RiskData[] = [
    { name: 'Financial Risk', value: 65, trend: 'up', critical: false },
    { name: 'Market Risk', value: 59, trend: 'down', critical: false },
    { name: 'Operational Risk', value: 80, trend: 'up', critical: true },
    { name: 'Regulatory Risk', value: 81, trend: 'up', critical: true },
    { name: 'Technological Risk', value: 56, trend: 'down', critical: false },
  ];

  useEffect(() => {
    setAnimateIn(true);
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (value: number): string => {
    if (value < 50) return '#10B981';
    if (value < 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className={`p-6 bg-slate-800 rounded-lg shadow-lg transition-all duration-700 ease-in-out ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">Risk Analysis</h4>
        <div className="flex items-center space-x-2">
          <Pause className={`w-4 h-4 text-purple-500 transition-opacity duration-1000 ${pulse ? 'opacity-100' : 'opacity-50'}`} />
          <span className="text-xs text-purple-300">Live monitoring</span>
        </div>
      </div>

      <div className="relative h-64">
        <RadarChart
          width={500}
          height={250}
          data={riskData}
          margin={{ top: 0, right: 30, bottom: 0, left: 30 }}
        >
          <Radar
            name="Risk Level"
            dataKey="value"
            stroke="#8B5CF6"
            fill="#8B5CF6"
            fillOpacity={0.3}
          />
          <PolarGrid stroke="#6b21a8" strokeOpacity={0.2} />
          <PolarAngleAxis dataKey="name" tick={{ fill: '#d8b4fe', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#a78bfa' }} />
        </RadarChart>

        <div className={`absolute inset-0 rounded-full bg-purple-500/5 transform scale-90 transition-transform duration-3000 ease-in-out ${pulse ? 'scale-105' : 'scale-95'}`}></div>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {riskData.map((risk) => (
          <div
            key={risk.name}
            className={`p-3 rounded-md transition-all duration-300 cursor-pointer ${
              hoveredRisk === risk.name
                ? 'bg-purple-900/30 shadow-lg transform -translate-y-1'
                : 'bg-purple-900/10 hover:bg-purple-900/20'
            }`}
            onMouseEnter={() => setHoveredRisk(risk.name)}
            onMouseLeave={() => setHoveredRisk(null)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{risk.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold" style={{ color: getColor(risk.value) }}>
                  {risk.value}%
                </span>
                {risk.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                {risk.trend === 'down' && <ArrowBigDown className="w-4 h-4 text-green-400" />}
                {risk.critical && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />}
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-700/30 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-1000 ease-in-out"
                style={{
                  width: `${risk.value}%`,
                  backgroundColor: getColor(risk.value),
                  boxShadow: hoveredRisk === risk.name ? `0 0 8px ${getColor(risk.value)}` : 'none',
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedRiskAnalysis;
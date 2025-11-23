"use client";

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';
import { Activity, Wind, AlertTriangle, CheckCircle, RefreshCw, Settings, Zap, Info, BarChart2 } from 'lucide-react';
import { Card } from './components/ui/Card';
import { InsightsModal } from './components/InsightsModal';

// --- Simulation Logic ---
// Simulates sensor response (DeltaR) based on Gas Type and Concentration
const simulateSensorResponse = (gasType: string, concentration: number, driftLevel: number) => {
  // Base signatures for 16 sensors (simplified for demo)
  const signatures: Record<string, number[]> = {
    'Ammonia': [0.8, 0.7, 0.2, 0.1, 0.9, 0.8, 0.3, 0.2, 0.1, 0.1, 0.5, 0.4, 0.1, 0.1, 0.6, 0.5],
    'Acetaldehyde': [0.2, 0.3, 0.8, 0.9, 0.1, 0.2, 0.7, 0.8, 0.1, 0.1, 0.2, 0.3, 0.9, 0.8, 0.2, 0.1],
    'Acetone': [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    'Ethylene': [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.9, 0.9, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
    'Ethanol': [0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4, 0.3, 0.4],
    'Toluene': [0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2],
  };

  const base = signatures[gasType] || signatures['Ammonia'];

  // Apply Concentration (Magnitude)
  // Higher concentration = higher response
  const response = base.map(val => val * concentration * 100);

  // Apply Drift (Noise + Shift)
  // Drift tends to dampen sensitivity or add baseline offset
  const driftedResponse = response.map((val, idx) => {
    const noise = (Math.random() - 0.5) * driftLevel * 10;
    const aging = -1 * driftLevel * 5; // Sensitivity loss
    return Math.max(0, val + noise + aging);
  });

  return driftedResponse;
};

export default function Dashboard() {
  const [gasType, setGasType] = useState('Ammonia');
  const [concentration, setConcentration] = useState(1.0); // 0.1 to 5.0
  const [driftLevel, setDriftLevel] = useState(0.0); // 0.0 to 1.0 (Months)
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  // Update Simulation
  useEffect(() => {
    const response = simulateSensorResponse(gasType, concentration, driftLevel);

    // Format for Recharts
    const data = response.map((val, idx) => ({
      sensor: `S${idx + 1}`,
      value: val,
      fullMark: 150,
    }));
    setSensorData(data);

    // Simulate Prediction Logic
    // If drift is high (> 0.5), prediction accuracy drops
    // If concentration is very low (< 0.5), prediction accuracy drops
    let correctChance = 0.95;
    if (driftLevel > 0.3) correctChance -= 0.2;
    if (driftLevel > 0.7) correctChance -= 0.3;
    if (concentration < 0.5) correctChance -= 0.2;

    if (Math.random() < correctChance) {
      setPrediction(gasType);
      setConfidence(Math.round(correctChance * 100));
    } else {
      // Pick random wrong gas
      const gases = ['Ammonia', 'Acetaldehyde', 'Acetone', 'Ethylene', 'Ethanol', 'Toluene'];
      const wrong = gases.filter(g => g !== gasType)[Math.floor(Math.random() * 5)];
      setPrediction(wrong);
      setConfidence(Math.round(Math.random() * 60));
    }

  }, [gasType, concentration, driftLevel]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans selection:bg-blue-500/30">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-4 mb-2">
              <Wind className="w-10 h-10 text-blue-400" />
              Gas Sensor Analysis
            </h1>
            <p className="text-slate-400 text-lg">Advanced Visualization of Temporal & Concentration Dynamics</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsInsightsOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 group"
            >
              <Zap className="w-5 h-5 group-hover:text-yellow-300 transition-colors" />
              Research Insights
            </button>
            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 px-4 py-3 rounded-xl flex items-center gap-3">
              <div className="relative">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-sm font-medium text-slate-300">System Online</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-8">
            <Card title="Simulation Controls" icon={<Settings className="w-5 h-5" />}>
              <div className="space-y-8">
                {/* Gas Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3">Target Gas</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Ammonia', 'Acetaldehyde', 'Acetone', 'Ethylene', 'Ethanol', 'Toluene'].map(g => (
                      <button
                        key={g}
                        onClick={() => setGasType(g)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${gasType === g
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                            : 'bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-800'
                          }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Concentration Slider */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-4 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      Concentration (Dose)
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Simulates varying gas concentrations. Low concentrations are harder to detect.
                        </div>
                      </div>
                    </span>
                    <span className="text-blue-400 font-mono bg-blue-500/10 px-2 py-1 rounded">{concentration.toFixed(1)} ppm</span>
                  </label>
                  <input
                    type="range" min="0.1" max="5.0" step="0.1"
                    value={concentration}
                    onChange={(e) => setConcentration(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                  />
                </div>

                {/* Drift Slider */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-4 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      Sensor Drift (Aging)
                      <div className="group relative">
                        <Info className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-xs text-slate-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Simulates sensor aging over time. High drift causes sensitivity loss and noise.
                        </div>
                      </div>
                    </span>
                    <span className="text-red-400 font-mono bg-red-500/10 px-2 py-1 rounded">{(driftLevel * 36).toFixed(0)} Months</span>
                  </label>
                  <input
                    type="range" min="0.0" max="1.0" step="0.1"
                    value={driftLevel}
                    onChange={(e) => setDriftLevel(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
                  />
                </div>
              </div>
            </Card>

            {/* Prediction Box */}
            <Card className="border-t-4 border-t-blue-500">
              <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Real-time Analysis</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Predicted Gas</div>
                  <div className={`text-3xl font-bold ${prediction === gasType ? 'text-green-400' : 'text-red-400'}`}>
                    {prediction}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-1">Confidence</div>
                  <div className="text-2xl font-bold text-slate-200">{confidence}%</div>
                </div>
              </div>

              <div className={`p-3 rounded-lg flex items-start gap-3 text-sm ${prediction === gasType ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {prediction === gasType ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                <div>
                  {prediction === gasType
                    ? "Model successfully identified the gas signature despite current noise levels."
                    : "Drift or low concentration has distorted the sensor signature, causing misclassification."
                  }
                </div>
              </div>
            </Card>
          </div>

          {/* Visualization Panel */}
          <div className="lg:col-span-8 space-y-8">

            {/* Radar Chart (Sensor Fingerprint) */}
            <Card title="Sensor Array Fingerprint" icon={<Activity className="w-5 h-5" />}>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={sensorData}>
                    <PolarGrid stroke="#334155" strokeOpacity={0.5} />
                    <PolarAngleAxis dataKey="sensor" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar
                      name="Response"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#radarGradient)"
                      fillOpacity={0.6}
                    />
                    <defs>
                      <radialGradient id="radarGradient" cx="50%" cy="50%" r="100%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                      </radialGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                      itemStyle={{ color: '#60a5fa' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-center text-sm text-slate-500 mt-4">
                Radial plot of 16 sensor responses. The shape represents the unique "fingerprint" of the gas.
              </p>
            </Card>

            {/* Bar Chart (Response Magnitude) */}
            <Card title="Sensor Response Magnitude" icon={<BarChart2 className="w-5 h-5" />}>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} strokeOpacity={0.5} />
                    <XAxis dataKey="sensor" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: '#334155', opacity: 0.2 }}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                      {sensorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${260 + index * 2}, 80%, 60%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>
        </div>
      </div>

      <InsightsModal isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} />
    </div>
  );
}

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { SimulationData } from '../types';
import { Activity, Thermometer, Zap } from 'lucide-react';

interface AnalysisPanelProps {
  data: SimulationData[];
  isRunning: boolean;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ data, isRunning }) => {
  if (data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 border border-slate-800 rounded-xl bg-slate-900">
        <Activity className="mb-2 opacity-50" size={32} />
        <p className="text-sm">No simulation data available.</p>
        <p className="text-xs text-slate-600 mt-1 text-center">Try saying "Run a simulation for 5ns"</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-2">
      
      {/* RMSD Chart */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">RMSD (Å)</h3>
          </div>
          {isRunning && <span className="text-[10px] text-emerald-500 animate-pulse">RECORDING</span>}
        </div>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 10}} />
              <YAxis stroke="#475569" tick={{fontSize: 10}} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} 
                itemStyle={{ color: '#34d399' }}
              />
              <Line 
                type="monotone" 
                dataKey="rmsd" 
                stroke="#34d399" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Chart */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Potential Energy (kcal/mol)</h3>
          </div>
        </div>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 10}} />
              <YAxis stroke="#475569" tick={{fontSize: 10}} domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                itemStyle={{ color: '#facc15' }}
              />
              <Area 
                type="monotone" 
                dataKey="energy" 
                stroke="#facc15" 
                fillOpacity={1} 
                fill="url(#colorEnergy)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Temperature Chart */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Thermometer size={16} className="text-rose-400" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Temperature (K)</h3>
          </div>
        </div>
        <div className="h-[150px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 10}} />
              <YAxis stroke="#475569" tick={{fontSize: 10}} domain={[290, 310]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                itemStyle={{ color: '#fb7185' }}
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#fb7185" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
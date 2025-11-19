
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { EvaluationMetrics } from '../types';
import { ShieldCheck, Scale, Zap, BrainCircuit, AlertCircle, Play, Download, FileText } from 'lucide-react';

interface EvaluationPanelProps {
  metrics: EvaluationMetrics | undefined;
  explanation: string;
  onRunEvaluation: () => void;
  isProcessing?: boolean;
}

const EvaluationPanel: React.FC<EvaluationPanelProps> = ({ metrics, explanation, onRunEvaluation, isProcessing }) => {
  
  const handleExportPDF = () => {
    if (!metrics) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Helper to process SVG for Print (Convert Dark Mode colors to Print Friendly)
    const getProcessedChartSVG = (index: number) => {
        const charts = document.querySelectorAll('.recharts-wrapper svg');
        if (charts[index]) {
            const clonedSvg = charts[index].cloneNode(true) as SVGElement;
            
            // Reset dimensions for print
            clonedSvg.setAttribute('width', '100%');
            clonedSvg.setAttribute('height', '300');
            clonedSvg.style.width = '100%';
            clonedSvg.style.height = 'auto';
            clonedSvg.style.overflow = 'visible';

            let svgHtml = clonedSvg.outerHTML;

            // COLOR REPLACEMENT STRATEGY FOR PRINT
            // 1. Text Colors (Axis labels, legends) -> Dark Grey
            svgHtml = svgHtml.replace(/fill="#[a-zA-Z0-9]{6}"/g, (match) => {
                // Don't replace the bar/line fills yet, just generic text fills often used by Recharts
                if (match.includes('#64748b') || match.includes('#94a3b8')) return 'fill="#334155"'; 
                return match;
            });
            
            // 2. Grid Lines (Light on dark -> Light grey on white)
            svgHtml = svgHtml.replace(/stroke="#1e293b"/g, 'stroke="#e2e8f0"');

            // 3. Data Lines (Brighten for white background context or darken if too light)
            // Emerald (Accuracy)
            svgHtml = svgHtml.replace(/stroke="#34d399"/g, 'stroke="#059669"'); 
            // Rose (Loss)
            svgHtml = svgHtml.replace(/stroke="#f43f5e"/g, 'stroke="#be123c"'); 
            // Yellow (Robustness)
            svgHtml = svgHtml.replace(/stroke="#facc15"/g, 'stroke="#d97706"');
            // Blue (Fairness)
            svgHtml = svgHtml.replace(/fill="#60a5fa"/g, 'fill="#2563eb"');
            // Purple (Interpretability)
            svgHtml = svgHtml.replace(/fill="#c084fc"/g, 'fill="#7c3aed"');

            return svgHtml;
        }
        return '<div style="padding:20px; text-align:center; color:#94a3b8; border:1px dashed #cbd5e1;">Chart Visualization Unavailable</div>';
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>MolSim AI - Validation Report ${new Date().toISOString().split('T')[0]}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
          <style>
            @page { size: A4; margin: 15mm; }
            body { 
                font-family: 'Inter', sans-serif; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                color: #1e293b;
                background: white;
            }
            .page-break { page-break-before: always; }
            .no-break { page-break-inside: avoid; }
            
            /* Custom Print Styles */
            h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #0f172a; }
            h2 { font-size: 18px; font-weight: 700; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 16px; margin-top: 32px; }
            h3 { font-size: 14px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
            p { font-size: 12px; line-height: 1.6; color: #475569; }
            
            .score-container {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
            }
            .score-val { font-size: 48px; font-weight: 900; color: #2563eb; line-height: 1; }
            
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 12px; }
            th { text-align: left; background: #f1f5f9; padding: 8px; font-weight: 600; color: #334155; border-bottom: 2px solid #cbd5e1; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; color: #475569; }
            tr:last-child td { border-bottom: none; }
            
            .chart-container {
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 16px;
                background: #fff;
                margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="flex justify-between items-end mb-12 border-b border-blue-500 pb-6">
            <div>
                <div class="flex items-center gap-2 mb-2 text-blue-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>
                    </svg>
                    <span class="font-bold text-lg tracking-tight">MolSim AI Platform</span>
                </div>
                <h1>Algorithmic Validation Report</h1>
                <p class="mt-2"><strong>Protocol ID:</strong> MS-VAL-${Date.now().toString().slice(-6)}</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="text-right">
                <div class="score-container w-40">
                    <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trust Score</div>
                    <div class="score-val">${metrics.overallScore}</div>
                    <div class="text-xs font-medium text-green-600 mt-1 flex items-center justify-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                        VERIFIED
                    </div>
                </div>
            </div>
          </div>

          <!-- Executive Summary -->
          <div class="section mb-8">
             <h3>Executive Summary</h3>
             <div class="p-4 bg-slate-50 border-l-4 border-blue-500 rounded-r-lg">
                <p class="text-slate-700 text-justify">
                    This report details the evaluation metrics for the currently loaded protein structure prediction model. 
                    The model has achieved an overall trust score of <strong>${metrics.overallScore}/100</strong> based on four key pillars: 
                    Accuracy against experimental data, Fairness across protein families, Robustness to perturbation, and Interpretability of folding pathways.
                </p>
             </div>
          </div>

          <!-- Methodology -->
          <div class="section mb-8 no-break">
             <h3>Validation Methodology</h3>
             <p class="whitespace-pre-wrap text-justify">${explanation.replace(/\*\*/g, '')}</p>
          </div>

          <div class="page-break"></div>

          <!-- Accuracy Section -->
          <div class="section no-break">
            <h2>1. Accuracy & Convergence</h2>
            <div class="grid grid-cols-3 gap-8">
                <div class="col-span-2 chart-container">
                    ${getProcessedChartSVG(0)}
                </div>
                <div class="col-span-1">
                    <h3>Performance Stats</h3>
                    <table>
                        <thead><tr><th>Epoch</th><th>Val Acc</th><th>Loss</th></tr></thead>
                        <tbody>
                            ${metrics.accuracy.slice(-5).map(a => `
                                <tr>
                                    <td>${a.epoch}</td>
                                    <td><b>${(a.val_acc * 100).toFixed(1)}%</b></td>
                                    <td>${a.loss.toFixed(3)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <p class="mt-4 text-xs text-slate-500 italic">Showing last 5 epochs.</p>
                </div>
            </div>
          </div>

          <!-- Fairness Section -->
          <div class="section no-break mt-8">
            <h2>2. Fairness Assessment</h2>
            <div class="grid grid-cols-2 gap-8">
                 <div class="chart-container">
                    ${getProcessedChartSVG(1)}
                 </div>
                 <div>
                    <h3>Error Rate by Family</h3>
                    <p class="mb-3">Analysis of model performance bias across different structural classifications.</p>
                    <table>
                        <thead><tr><th>Protein Class</th><th>Error Rate</th><th>Status</th></tr></thead>
                        <tbody>
                            ${metrics.fairness.map(f => `
                                <tr>
                                    <td>${f.group}</td>
                                    <td>${f.errorRate}%</td>
                                    <td><span class="${f.errorRate < 3 ? 'text-green-600 font-bold' : 'text-orange-500 font-bold'}">${f.errorRate < 3 ? 'PASS' : 'CHECK'}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                 </div>
            </div>
          </div>
          
          <!-- Robustness -->
           <div class="section no-break mt-8">
            <h2>3. Robustness Testing</h2>
            <div class="grid grid-cols-3 gap-8">
                <div class="col-span-1">
                    <h3>Noise Sensitivity</h3>
                    <p class="mb-3">Structural stability when Gaussian noise is injected into atomic coordinates.</p>
                    <table>
                        <thead><tr><th>Noise (Å)</th><th>Stability</th></tr></thead>
                        <tbody>
                            ${metrics.robustness.map(r => `
                                <tr>
                                    <td>${r.noiseLevel} Å</td>
                                    <td>${(r.stabilityScore * 100).toFixed(0)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="col-span-2 chart-container">
                    ${getProcessedChartSVG(2)}
                </div>
            </div>
          </div>

           <!-- Interpretability -->
           <div class="section no-break mt-8">
            <h2>4. Feature Importance</h2>
             <div class="chart-container h-64">
                ${getProcessedChartSVG(3)}
             </div>
             <div class="mt-4">
                <h3>Critical Residues</h3>
                <p>The following residues contributed most significantly to the folding pathway determination.</p>
                <div class="flex gap-2 mt-2">
                    ${metrics.interpretability.map(i => `
                        <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold border border-purple-200">
                            ${i.residue}: ${(i.importance * 100).toFixed(0)}%
                        </span>
                    `).join('')}
                </div>
             </div>
          </div>

          <div class="mt-12 pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-400">
            <span>MolSim AI v2.3.0</span>
            <span>Confidential Analysis Report</span>
            <span>Page 1 of 2</span>
          </div>

          <script>
            window.onload = () => { 
                // Slight delay to ensure SVGs render
                setTimeout(() => {
                    window.print();
                    // Optional: window.close(); 
                }, 800); 
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!metrics) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-6 border border-slate-800 rounded-xl bg-slate-900">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-inner shadow-black/50">
            <ShieldCheck className="text-slate-600" size={32} />
        </div>
        <h3 className="text-lg font-medium text-slate-200 mb-2">AI Model Evaluation</h3>
        <p className="text-sm text-slate-400 text-center max-w-md mb-6">
            Run a comprehensive validation protocol to assess the model's Accuracy, Fairness, Robustness, and Interpretability.
        </p>
        <button 
            onClick={onRunEvaluation}
            disabled={isProcessing}
            className="group relative flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95"
        >
            {isProcessing ? (
                <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Running Protocol...</span>
                </span>
            ) : (
                <>
                    <Play size={18} className="fill-current" /> 
                    <span>Start Evaluation</span>
                </>
            )}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2 space-y-6 pr-2 pb-20">
      
      {/* Header Score */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="z-10">
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-3">
                Model Trust Score
                <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1">
                    <ShieldCheck size={10} /> Verified
                </span>
            </h2>
            <p className="text-slate-400 text-sm">Aggregate evaluation based on 4 pillars of AI Trust</p>
        </div>
        
        <div className="flex items-center gap-8 z-10">
            <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md active:translate-y-0.5"
            >
                <FileText size={14} />
                Export PDF Report
            </button>
            <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="text-blue-500 drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]" strokeDasharray={`${metrics.overallScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="absolute text-2xl font-bold text-white">{metrics.overallScore}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Accuracy */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg hover:border-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800/50 pb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                     <ShieldCheck size={18} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-200 text-sm">Accuracy & Convergence</h3>
                    <p className="text-[10px] text-slate-500">Training loss vs. Validation accuracy</p>
                </div>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.accuracy}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="epoch" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px', borderRadius: '8px' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                        <Line type="monotone" dataKey="val_acc" name="Accuracy" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{r: 4}} />
                        <Line type="monotone" dataKey="loss" name="Loss" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Fairness */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg hover:border-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800/50 pb-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                    <Scale size={18} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-200 text-sm">Fairness (Error Rate)</h3>
                    <p className="text-[10px] text-slate-500">Bias check across protein families</p>
                </div>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.fairness} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                        <YAxis dataKey="group" type="category" stroke="#94a3b8" fontSize={11} width={70} tick={{fill: '#cbd5e1'}} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px', borderRadius: '8px' }} />
                        <Bar dataKey="errorRate" name="Error Rate" fill="#60a5fa" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Robustness */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg hover:border-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800/50 pb-3">
                <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20 transition-colors">
                     <Zap size={18} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-200 text-sm">Robustness</h3>
                    <p className="text-[10px] text-slate-500">Stability vs. Gaussian Noise Injection</p>
                </div>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.robustness}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="noiseLevel" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} label={{ value: 'Noise (Å)', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 10 }} />
                        <YAxis stroke="#64748b" fontSize={10} domain={[0, 1]} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px', borderRadius: '8px' }} />
                        <Line type="step" dataKey="stabilityScore" name="Stability" stroke="#facc15" strokeWidth={2} dot={{r: 4, fill: '#facc15'}} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Interpretability */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg hover:border-slate-700 transition-colors group">
            <div className="flex items-center gap-3 mb-5 border-b border-slate-800/50 pb-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                    <BrainCircuit size={18} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-200 text-sm">Interpretability</h3>
                    <p className="text-[10px] text-slate-500">Key Residue Importance (SHAP)</p>
                </div>
            </div>
            <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.interpretability}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="residue" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px', borderRadius: '8px' }} />
                        <Bar dataKey="importance" name="Importance" fill="#c084fc" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Methodology Explanation */}
      <div className="bg-slate-800/30 border border-slate-700/50 p-6 rounded-xl">
        <div className="flex items-center gap-2 mb-3 text-blue-400">
            <AlertCircle size={18} />
            <h3 className="font-bold text-xs uppercase tracking-wide">Validation Methodology Details</h3>
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-slate-400 leading-relaxed font-light text-sm">
                {explanation || "Run evaluation to generate methodology report..."}
            </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationPanel;


import React, { useState, useCallback, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import MolecularViewer from './components/MolecularViewer';
import AnalysisPanel from './components/AnalysisPanel';
import EvaluationPanel from './components/EvaluationPanel';
import LandingPage from './components/LandingPage';
import { Message, Sender, MolecularState, CommandType, SimulationData, Project, SimulationStage, EvaluationMetrics } from './types';
import { parseUserIntent, generateAnalysisSummary, getValidationMethodology } from './services/geminiService';
import { FlaskConical, LayoutDashboard, Info, Github, ChevronUp, ChevronDown, Home, Timer, Thermometer, Activity, Terminal, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  // Navigation State
  const [hasStarted, setHasStarted] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);

  // Project State
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Ubiquitin Stability', pdbId: '1UBQ', lastModified: Date.now(), status: 'active' },
    { id: 'p2', name: 'DNA Helix Study', pdbId: '1BNA', lastModified: Date.now() - 86400000, status: 'completed' }
  ]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>('p1');

  // App State
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I'm your Molecular Simulation Assistant. I can run AlphaFold predictions on sequences or simulate PDB structures. Try 'Load PDB 1CRN' or paste a sequence.", sender: Sender.AI, timestamp: Date.now() }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'viewer' | 'analysis' | 'evaluation'>('viewer');
  const [evalExplanation, setEvalExplanation] = useState('');
  const [isPushingToGithub, setIsPushingToGithub] = useState(false);
  
  // Molecular State
  const [molecularState, setMolecularState] = useState<MolecularState>({
    pdbId: '1UBQ', // Default start
    representation: 'cartoon',
    colorScheme: 'chainid',
    isSpinning: false,
    simulationRunning: false,
    simulationProgress: 0,
    simulationStage: 'minimization',
    simulationData: [],
    simulationLogs: [],
    activeMetadata: undefined
  });

  const addMessage = (text: string, sender: Sender) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: Date.now()
    }]);
  };

  // Project Management Handlers
  const handleCreateProject = () => {
      const newProject: Project = {
          id: Date.now().toString(),
          name: `New Simulation ${projects.length + 1}`,
          pdbId: '',
          lastModified: Date.now(),
          status: 'active'
      };
      setProjects(prev => [newProject, ...prev]);
      setActiveProjectId(newProject.id);
      
      // Reset State
      setMolecularState({
        pdbId: '',
        representation: 'cartoon',
        colorScheme: 'chainid',
        isSpinning: false,
        simulationRunning: false,
        simulationProgress: 0,
        simulationStage: 'minimization',
        simulationData: [],
        simulationLogs: [],
        customData: undefined,
        evaluationData: undefined,
        activeMetadata: undefined
      });
      setMessages([{ id: Date.now().toString(), text: "New project created. What would you like to simulate?", sender: Sender.AI, timestamp: Date.now() }]);
      setViewMode('viewer');
  };

  const handleSelectProject = (id: string) => {
      if (id === activeProjectId) return;
      
      const project = projects.find(p => p.id === id);
      if (!project) return;

      setActiveProjectId(id);
      setMolecularState(prev => ({
          ...prev,
          pdbId: project.pdbId,
          simulationRunning: false,
          simulationData: [],
          simulationLogs: [],
          customData: undefined,
          evaluationData: undefined
      }));
      
      setMessages([{ 
          id: Date.now().toString(), 
          text: `Loaded project: ${project.name}. Structure ${project.pdbId} is ready.`, 
          sender: Sender.System, 
          timestamp: Date.now() 
      }]);
  };

  const handleDeleteProject = (id: string) => {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) {
          setActiveProjectId(null);
          setMolecularState(prev => ({ ...prev, pdbId: '' }));
          addMessage("Project deleted.", Sender.System);
      }
  };

  const handlePushToGithub = async () => {
      if (!molecularState.pdbId && !molecularState.customData) {
          addMessage("Nothing to push. Please load a structure or create a project first.", Sender.System);
          return;
      }

      setIsPushingToGithub(true);
      // Simulate Git Push
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsPushingToGithub(false);
      const commitHash = Math.random().toString(16).substring(2, 9);
      addMessage(`[GIT] Successfully pushed changes to origin/main.\nCommit: ${commitHash}\nFiles updated: trajectory.dcd, topology.prmtop, analysis.log`, Sender.System);
  };

  // Update active project when molecular state changes
  useEffect(() => {
      if (activeProjectId && molecularState.pdbId) {
          setProjects(prev => prev.map(p => {
              if (p.id === activeProjectId && p.pdbId !== molecularState.pdbId) {
                  return { ...p, pdbId: molecularState.pdbId, lastModified: Date.now() };
              }
              return p;
          }));
      }
  }, [molecularState.pdbId, activeProjectId]);


  // Multi-Stage Simulation Logic Loop
  useEffect(() => {
    let interval: any;
    if (molecularState.simulationRunning) {
        interval = setInterval(() => {
            setMolecularState(prev => {
                const stage = prev.simulationStage;
                let nextStage = stage;
                let progress = prev.simulationProgress + 0.5; // Increment progress
                let simRunning = true;

                // Stage Transitions
                if (progress >= 100) {
                    if (stage === 'minimization') {
                        nextStage = 'equilibration';
                        progress = 0;
                    } else if (stage === 'equilibration') {
                        nextStage = 'production';
                        progress = 0;
                    } else {
                        simRunning = false; // Finish after production
                    }
                }

                if (!simRunning) {
                    clearInterval(interval);
                    addMessage("Simulation complete. Full trajectory analysis available.", Sender.System);
                    return { ...prev, simulationRunning: false, simulationProgress: 100 };
                }

                // Generate Data based on Stage
                const lastData = prev.simulationData.length > 0 
                    ? prev.simulationData[prev.simulationData.length - 1] 
                    : { time: 0, rmsd: 0, energy: -1000, temperature: 0 };

                const newTime = lastData.time + 2; // 2ps steps
                let newRmsd = lastData.rmsd;
                let newEnergy = lastData.energy;
                let newTemp = lastData.temperature;

                if (stage === 'minimization') {
                    // Energy drops rapidly, Temp stays low, RMSD low
                    newEnergy = lastData.energy - (Math.random() * 50 + 10);
                    newTemp = Math.max(0, lastData.temperature + (Math.random() - 0.5));
                    newRmsd = Math.min(0.5, lastData.rmsd + 0.001);
                } else if (stage === 'equilibration') {
                    // Temp ramps up to 300K, Energy stabilizes, RMSD increases slightly
                    const targetTemp = 300;
                    newTemp = lastData.temperature + (targetTemp - lastData.temperature) * 0.05 + (Math.random() - 0.5) * 2;
                    newEnergy = lastData.energy + (Math.random() - 0.5) * 20; 
                    newRmsd = lastData.rmsd + 0.005;
                } else if (stage === 'production') {
                    // Stable Temp ~300K, Energy fluctuates, RMSD drifts/stabilizes
                    newTemp = 300 + (Math.random() - 0.5) * 5;
                    newEnergy = lastData.energy + (Math.random() - 0.5) * 40;
                    newRmsd = Math.max(0.5, lastData.rmsd + (Math.random() - 0.45) * 0.02);
                }

                const newDataPoint: SimulationData = {
                    time: parseFloat(newTime.toFixed(1)),
                    rmsd: parseFloat(newRmsd.toFixed(3)),
                    energy: parseFloat(newEnergy.toFixed(1)),
                    temperature: parseFloat(newTemp.toFixed(1))
                };

                // NAMD-style log generation
                let newLog = '';
                const step = Math.floor(newTime * 500); // Fake step count
                if (Math.random() > 0.7) { // Don't log every frame
                    newLog = `[NAMD] STEP ${step} :: T=${newTemp.toFixed(1)}K :: E_POT=${newEnergy.toFixed(1)} :: RMSD=${newRmsd.toFixed(3)}`;
                }

                const updatedLogs = newLog ? [newLog, ...prev.simulationLogs].slice(0, 6) : prev.simulationLogs;

                return {
                    ...prev,
                    simulationProgress: progress,
                    simulationStage: nextStage,
                    simulationData: [...prev.simulationData, newDataPoint].slice(-100), // Keep buffer
                    simulationLogs: updatedLogs
                };
            });
        }, 50); // Speed of simulation update
    }
    return () => clearInterval(interval);
  }, [molecularState.simulationRunning]);

  // Extracted Evaluation Logic to reuse between Chat and Button click
  const handleRunEvaluation = async () => {
       setIsProcessing(true);
       // Mock Evaluation Data Generation
       const mockMetrics: EvaluationMetrics = {
           overallScore: 92,
           accuracy: Array.from({ length: 10 }, (_, i) => ({
               epoch: i + 1,
               loss: 0.8 - (i * 0.07) + Math.random() * 0.05,
               val_acc: 0.6 + (i * 0.035) + Math.random() * 0.02
           })),
           fairness: [
               { group: 'Enzymes', errorRate: 2.4 },
               { group: 'Membrane', errorRate: 3.1 },
               { group: 'Fibrous', errorRate: 2.8 },
               { group: 'Disordered', errorRate: 3.5 }
           ],
           robustness: [
               { noiseLevel: 0.1, stabilityScore: 0.98 },
               { noiseLevel: 0.3, stabilityScore: 0.95 },
               { noiseLevel: 0.5, stabilityScore: 0.88 },
               { noiseLevel: 0.8, stabilityScore: 0.75 },
               { noiseLevel: 1.0, stabilityScore: 0.62 }
           ],
           interpretability: [
               { residue: 'LYS-48', importance: 0.85 },
               { residue: 'GLU-22', importance: 0.65 },
               { residue: 'HIS-10', importance: 0.45 },
               { residue: 'ARG-5', importance: 0.30 },
           ]
       };
       
       const explanation = await getValidationMethodology();
       setEvalExplanation(explanation);
       
       setMolecularState(prev => ({
           ...prev,
           evaluationData: mockMetrics
       }));
       setViewMode('evaluation');
       setIsProcessing(false);
       addMessage("Evaluation protocol complete. Metrics updated.", Sender.System);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    addMessage(text, Sender.User);
    setIsProcessing(true);

    try {
      // Pass current context (Loaded PDB ID, Custom Data Title) to AI
      const activeMeta = molecularState.activeMetadata;
      let currentContext = `Currently loaded PDB ID: ${molecularState.pdbId || 'None'}. `;
      
      if (activeMeta) {
          currentContext += `Structure Details: Title "${activeMeta.title}". Resolution: ${activeMeta.resolution}. `;
          if (activeMeta.atomCount) {
              currentContext += `Stats: ${activeMeta.atomCount} atoms, ${activeMeta.residueCount} residues, ${activeMeta.chainCount} chains. `;
          }
      }
      
      if (molecularState.customData) {
          currentContext += `AI Predicted Model: ${molecularState.customData.title}.`;
      }

      const command = await parseUserIntent(text, currentContext);
      
      // Execute Command
      switch (command.type) {
        case CommandType.LOAD_PDB:
          if (command.params.pdbId) {
            setMolecularState(prev => ({ ...prev, pdbId: command.params.pdbId.trim(), simulationData: [], simulationLogs: [], customData: undefined, evaluationData: undefined, activeMetadata: undefined }));
            setViewMode('viewer');
          } else {
             setMolecularState(prev => ({ ...prev, pdbId: '1AXC', simulationData: [], simulationLogs: [], customData: undefined, evaluationData: undefined, activeMetadata: undefined })); 
          }
          break;
        
        case CommandType.SET_REPRESENTATION:
          setMolecularState(prev => ({ 
            ...prev, 
            representation: command.params.style || 'cartoon' 
          }));
          break;
        
        case CommandType.SET_COLOR_SCHEME:
          setMolecularState(prev => ({ 
            ...prev, 
            colorScheme: command.params.color || 'chainid' 
          }));
          break;
          
        case CommandType.TOGGLE_SPIN:
           const spinState = command.params.active !== undefined ? command.params.active : !molecularState.isSpinning;
           setMolecularState(prev => ({ ...prev, isSpinning: spinState }));
           break;

        case CommandType.RUN_SIMULATION:
           if (!molecularState.pdbId) {
             addMessage("Please load a PDB file first before running a simulation.", Sender.AI);
             setIsProcessing(false);
             return;
           }
           // Start Simulation Protocol
           setMolecularState(prev => ({ 
               ...prev, 
               simulationRunning: true, 
               simulationProgress: 0, 
               simulationStage: 'minimization',
               simulationData: [],
               simulationLogs: [],
               evaluationData: undefined // Reset evaluation on new sim
           }));
           addMessage("Initializing simulation protocol: Minimization -> Equilibration -> Production MD.", Sender.System);
           break;

        case CommandType.ANALYZE_DATA:
           setViewMode('analysis');
           if (molecularState.simulationData.length > 0) {
              const summary = await generateAnalysisSummary(molecularState.simulationData.length);
              addMessage(summary, Sender.AI);
           } else {
              addMessage("No simulation data found. Run a simulation first to generate trajectory data.", Sender.AI);
           }
           break;

        case CommandType.EVALUATE_MODEL:
           addMessage("Running comprehensive AI model evaluation protocol...", Sender.System);
           await handleRunEvaluation();
           break;
        
        case CommandType.QUERY_STRUCTURE:
           // The answer is in command.explanation, just fall through to the addMessage below
           break;

        case CommandType.PROCESS_SEQUENCE:
            // Simulate AlphaFold workflow
            addMessage("Sequence received. Querying AlphaFold database and running inference...", Sender.System);
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API latency
            
            const newProjectId = Date.now().toString();
            const newProject: Project = {
                id: newProjectId,
                name: command.params.name || 'AlphaFold Prediction',
                pdbId: '1CRN', // Proxy
                lastModified: Date.now(),
                status: 'active'
            };
            
            setProjects(prev => [newProject, ...prev]);
            setActiveProjectId(newProjectId);
            
            setMolecularState(prev => ({
                ...prev,
                pdbId: '1CRN',
                simulationData: [],
                simulationLogs: [],
                representation: 'cartoon',
                colorScheme: 'residueindex', // Rainbow for predictions
                isSpinning: true,
                customData: {
                    title: 'AlphaFold Predicted Model',
                    method: 'AlphaFold v2.3 (Simulated)',
                    resolution: 'pLDDT > 90 (High Confidence)',
                    keywords: 'Structure Prediction, De Novo, AI',
                    releaseDate: new Date().toISOString().split('T')[0]
                },
                evaluationData: undefined,
                activeMetadata: undefined
            }));
            setViewMode('viewer');
            addMessage("Structure predicted successfully. Confidence score (pLDDT) is high. You can now run MD simulations on this model.", Sender.System);
            break;

        case CommandType.UNKNOWN:
        default:
          break;
      }

      addMessage(command.explanation, Sender.AI);

    } catch (error) {
      addMessage("I'm sorry, I had trouble communicating with the simulation engine.", Sender.AI);
    } finally {
      setIsProcessing(false);
    }
  }, [molecularState.pdbId, molecularState.isSpinning, molecularState.simulationData.length, molecularState.customData, molecularState.activeMetadata]);

  const handleMetadataLoaded = (meta: any) => {
      setMolecularState(prev => ({
          ...prev,
          activeMetadata: meta
      }));
  };

  if (!hasStarted) {
    return <LandingPage onGetStarted={() => setHasStarted(true)} />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden animate-in fade-in duration-500">
      
      {/* Left Sidebar */}
      <div className="w-[400px] flex-shrink-0 h-full z-10 shadow-xl border-r border-slate-800">
        <ChatInterface 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          isProcessing={isProcessing}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {!isNavVisible && (
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="pointer-events-auto">
                    <button 
                        onClick={() => setIsNavVisible(true)}
                        className="bg-slate-900/80 backdrop-blur border border-t-0 border-slate-700 rounded-b-lg px-6 py-1 text-slate-400 hover:text-white transition-colors shadow-lg"
                        title="Show Navigation"
                    >
                        <ChevronDown size={16} />
                    </button>
                </div>
            </div>
        )}

        <div className={`border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 transition-all duration-300 ease-in-out overflow-hidden ${isNavVisible ? 'h-16 opacity-100' : 'h-0 opacity-0 border-none'}`}>
          <button onClick={() => setHasStarted(false)} className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
            <FlaskConical className="text-blue-500" size={24} />
            <h1 className="text-xl font-bold tracking-tight text-white">MolSim <span className="text-blue-500 font-mono font-normal">AI</span></h1>
          </button>

          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button 
              onClick={() => setViewMode('viewer')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'viewer' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              3D View
            </button>
            <button 
              onClick={() => setViewMode('analysis')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'analysis' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Analysis
            </button>
            <button 
              onClick={() => setViewMode('evaluation')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'evaluation' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Model Eval
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
             <button 
                onClick={handlePushToGithub}
                disabled={isPushingToGithub}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all text-xs font-bold ${
                    isPushingToGithub 
                    ? 'bg-slate-800 border-slate-600 text-slate-400 cursor-wait' 
                    : 'bg-[#24292F] hover:bg-[#24292F]/90 border-transparent text-white shadow-sm'
                }`}
             >
                {isPushingToGithub ? (
                     <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                     <Github size={14} />
                )}
                <span>{isPushingToGithub ? 'Pushing...' : 'Push'}</span>
             </button>
             
             <div className="w-px h-6 bg-slate-700 mx-1"></div>

             <button onClick={() => setHasStarted(false)} className="hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800"><Home size={20} /></button>
             <button onClick={() => setIsNavVisible(false)} className="hover:text-white transition-colors p-1.5 rounded-md hover:bg-slate-800"><ChevronUp size={20} /></button>
             <div className="w-px h-6 bg-slate-700 mx-1"></div>
             <button className="hover:text-white transition-colors"><Info size={20} /></button>
          </div>
        </div>

        <div className="flex-1 p-4 bg-slate-950 overflow-hidden relative">
          
          {/* 3D Viewer */}
          <div className={`w-full h-full transition-opacity duration-500 ${viewMode === 'viewer' ? 'opacity-100 z-10' : 'opacity-0 absolute inset-0 -z-10'}`}>
             {molecularState.pdbId ? (
                <MolecularViewer 
                    molecularState={molecularState} 
                    onLoadComplete={() => console.log('Loaded')}
                    onError={(msg) => addMessage(`Error: ${msg}`, Sender.System)}
                    onMetadataLoaded={handleMetadataLoaded}
                />
             ) : (
                <div className="w-full h-full border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center bg-slate-900/50">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
                        <FlaskConical size={40} className="text-slate-600" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-300">Ready to Simulate</h3>
                    <p className="text-slate-500 mt-2 max-w-md text-center">
                        Enter a PDB ID (e.g., "1AXC") or paste a sequence to run AlphaFold predictions.
                    </p>
                </div>
             )}
          </div>

          {/* Analysis */}
          {viewMode === 'analysis' && (
             <div className="w-full h-full animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <LayoutDashboard size={20} />
                            Simulation Data Analysis
                        </h2>
                    </div>
                    <AnalysisPanel 
                        data={molecularState.simulationData} 
                        isRunning={molecularState.simulationRunning}
                    />
                </div>
             </div>
          )}

          {/* Evaluation Panel */}
          {viewMode === 'evaluation' && (
             <div className="w-full h-full animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <ShieldCheck size={20} />
                            AI Model Evaluation
                        </h2>
                    </div>
                    <EvaluationPanel 
                        metrics={molecularState.evaluationData} 
                        explanation={evalExplanation}
                        onRunEvaluation={handleRunEvaluation}
                        isProcessing={isProcessing}
                    />
                </div>
             </div>
          )}
          
          {/* Simulation Progress Card */}
          {molecularState.simulationRunning && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-[440px] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                  <div className="h-1 w-full bg-slate-800">
                      <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out" 
                          style={{width: `${molecularState.simulationProgress}%`}}
                      />
                  </div>
                  <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${
                                  molecularState.simulationStage === 'minimization' ? 'bg-blue-500 shadow-blue-500/50' :
                                  molecularState.simulationStage === 'equilibration' ? 'bg-purple-500 shadow-purple-500/50' :
                                  'bg-emerald-500 shadow-emerald-500/50'
                              }`}></div>
                              <div>
                                  <span className="font-bold text-white tracking-wide block text-sm">Running Simulation</span>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                      {molecularState.simulationStage === 'minimization' && 'Phase 1: Minimization'}
                                      {molecularState.simulationStage === 'equilibration' && 'Phase 2: Equilibration'}
                                      {molecularState.simulationStage === 'production' && 'Phase 3: Production MD'}
                                  </span>
                              </div>
                          </div>
                          <span className="font-mono text-slate-400 text-xs">{Math.round(molecularState.simulationProgress)}%</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50">
                              <div className="flex items-center gap-1 text-slate-500 text-[9px] uppercase font-bold mb-1">
                                  <Timer size={10} /> Time (ps)
                              </div>
                              <span className="font-mono text-sm font-medium text-white">
                                  {molecularState.simulationData.length > 0 
                                    ? molecularState.simulationData[molecularState.simulationData.length - 1].time.toFixed(0) 
                                    : '0'}
                              </span>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50">
                              <div className="flex items-center gap-1 text-slate-500 text-[9px] uppercase font-bold mb-1">
                                  <Thermometer size={10} /> Temp (K)
                              </div>
                              <span className={`font-mono text-sm font-medium ${molecularState.simulationStage === 'equilibration' ? 'text-purple-300' : 'text-white'}`}>
                                  {molecularState.simulationData.length > 0 
                                    ? molecularState.simulationData[molecularState.simulationData.length - 1].temperature.toFixed(0) 
                                    : '0'}
                              </span>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-2 flex flex-col items-center border border-slate-700/50">
                              <div className="flex items-center gap-1 text-slate-500 text-[9px] uppercase font-bold mb-1">
                                  <Activity size={10} /> RMSD (Å)
                              </div>
                              <span className="font-mono text-sm font-medium text-white">
                                   {molecularState.simulationData.length > 0 
                                    ? molecularState.simulationData[molecularState.simulationData.length - 1].rmsd.toFixed(2) 
                                    : '0.00'}
                              </span>
                          </div>
                      </div>

                      {/* NAMD Style Terminal Output */}
                      <div className="bg-black/80 rounded-lg p-2 border border-slate-700/50 font-mono text-[10px] text-green-400/90 overflow-hidden h-[80px] relative shadow-inner">
                        <div className="absolute top-1 right-2 opacity-30"><Terminal size={10} /></div>
                        <div className="flex flex-col-reverse h-full">
                            {molecularState.simulationLogs.map((log, i) => (
                                <div key={i} className="truncate opacity-80 hover:opacity-100 transition-opacity">
                                    <span className="text-slate-500 mr-2">{`>`}</span>{log}
                                </div>
                            ))}
                            {molecularState.simulationLogs.length === 0 && <span className="text-slate-600 italic">Initializing NAMD engine...</span>}
                        </div>
                      </div>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;

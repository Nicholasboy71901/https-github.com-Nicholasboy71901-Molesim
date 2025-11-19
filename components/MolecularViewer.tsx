
import React, { useEffect, useRef, useState } from 'react';
import { MolecularState, StructureMetadata } from '../types';
import { Info, Microscope, Tag, Calendar, FileText, Sparkles } from 'lucide-react';

interface MolecularViewerProps {
  molecularState: MolecularState;
  onLoadComplete?: () => void;
  onError?: (msg: string) => void;
}

const MolecularViewer: React.FC<MolecularViewerProps> = ({ molecularState, onLoadComplete, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null); // NGL Stage
  const componentRef = useRef<any>(null); // Current loaded structure component
  const [isLoading, setIsLoading] = useState(false);
  const [structureInfo, setStructureInfo] = useState<StructureMetadata | null>(null);
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  // Initialize NGL Stage
  useEffect(() => {
    if (!containerRef.current || !window.NGL) return;

    try {
        const stage = new window.NGL.Stage(containerRef.current, {
          backgroundColor: "#0f172a" // Match slate-900
        });
        stageRef.current = stage;
    
        // Handle window resize
        const handleResize = () => stage.handleResize();
        window.addEventListener("resize", handleResize);
    
        return () => {
          window.removeEventListener("resize", handleResize);
        };
    } catch(e) {
        console.error("Failed to init NGL", e);
        if(onError) onError("Failed to initialize 3D viewer.");
    }
  }, []);

  // React to PDB ID changes (Load Structure & Fetch Data)
  useEffect(() => {
    const loadStructureData = async () => {
      if (!stageRef.current || !molecularState.pdbId) return;
      
      const pdbId = molecularState.pdbId.trim().toUpperCase();
      if (!pdbId) return;

      // Prevent reloading if only simulation is running and PDB hasn't changed
      // We check if we already have a component loaded for this PDB
      // However, simplicity is key here; we only reload if pdbId changes or customData changes significantly
      
      setIsLoading(true);
      setStructureInfo(null); 
      stageRef.current.removeAllComponents();

      try {
        // 1. Determine Metadata Source (Custom AI Data vs RCSB)
        if (molecularState.customData) {
            setStructureInfo(molecularState.customData);
        } else {
            // Fetch Metadata from RCSB Data API
            try {
                const metadataResponse = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`);
                if (metadataResponse.ok) {
                    const data = await metadataResponse.json();
                    setStructureInfo({
                        title: data.struct?.title || 'Unknown Title',
                        method: data.exptl?.[0]?.method || 'Unknown Method',
                        resolution: data.rcsb_entry_info?.resolution_combined?.[0] 
                            ? `${data.rcsb_entry_info.resolution_combined[0]} Å` 
                            : 'N/A',
                        keywords: data.struct_keywords?.pdbx_keywords || 'N/A',
                        releaseDate: data.rcsb_accession_info?.initial_release_date 
                            ? new Date(data.rcsb_accession_info.initial_release_date).getFullYear().toString()
                            : ''
                    });
                }
            } catch (metaError) {
                console.warn("Failed to fetch RCSB metadata", metaError);
            }
        }

        // 2. Load 3D Structure
        const url = `https://files.rcsb.org/download/${pdbId}.pdb`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDB ${pdbId} (${response.status})`);
        }
        const blob = await response.blob();
        
        const component = await stageRef.current.loadFile(blob, { ext: 'pdb' });
        componentRef.current = component;
        
        component.addRepresentation(molecularState.representation, {
          colorScheme: molecularState.colorScheme
        });
        
        stageRef.current.autoView();
        
        if (onLoadComplete) onLoadComplete();
      } catch (error) {
        console.error("NGL Load Error:", error);
        if (onError) onError(`Failed to load structure ${pdbId}.`);
      } finally {
        setIsLoading(false);
      }
    };

    loadStructureData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [molecularState.pdbId, molecularState.customData]); 

  // React to Representation/Color changes
  useEffect(() => {
    if (!componentRef.current) return;
    
    const component = componentRef.current;
    component.removeAllRepresentations();
    component.addRepresentation(molecularState.representation, {
      colorScheme: molecularState.colorScheme,
      opacity: molecularState.representation === 'surface' ? 0.8 : 1.0
    });

  }, [molecularState.representation, molecularState.colorScheme]);

  // React to Spin changes
  useEffect(() => {
    if (!stageRef.current) return;
    if (molecularState.isSpinning) {
      stageRef.current.setSpin(true);
    } else {
      stageRef.current.setSpin(false);
    }
  }, [molecularState.isSpinning]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 group">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            <span className="text-blue-400 font-mono text-sm">Loading structure {molecularState.pdbId}...</span>
          </div>
        </div>
      )}

      {/* Info Overlay Card */}
      {molecularState.pdbId && (
        <div className="absolute top-4 left-4 z-10 max-w-[300px] transition-all duration-300">
            <div 
                className={`bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg overflow-hidden shadow-xl transition-all duration-300 ${isInfoExpanded ? 'p-0' : 'p-0 w-auto'}`}
            >
                {/* Header */}
                <div 
                    className="flex items-center justify-between p-3 bg-slate-800/50 cursor-pointer hover:bg-slate-800/80 transition-colors"
                    onClick={() => setIsInfoExpanded(!isInfoExpanded)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded font-bold font-mono text-sm border ${molecularState.customData ? 'bg-purple-600/20 text-purple-400 border-purple-500/30' : 'bg-blue-600/20 text-blue-400 border-blue-500/30'}`}>
                            {molecularState.customData ? 'AI-MODEL' : molecularState.pdbId}
                        </div>
                        {!isInfoExpanded && structureInfo && (
                             <span className="text-xs text-slate-300 truncate max-w-[150px] font-medium">
                                 {structureInfo.title}
                             </span>
                        )}
                    </div>
                    <button className="text-slate-400 hover:text-white">
                        <Info size={16} />
                    </button>
                </div>

                {/* Expanded Details */}
                {isInfoExpanded && (
                    <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                        {structureInfo ? (
                            <>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                         <h3 className="text-xs font-bold text-slate-500 uppercase">Title</h3>
                                         {molecularState.customData && <Sparkles size={12} className="text-purple-400" />}
                                    </div>
                                    <p className="text-sm text-slate-200 font-medium leading-snug line-clamp-3" title={structureInfo.title}>
                                        {structureInfo.title}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                            <Microscope size={10} /> Method
                                        </h4>
                                        <p className="text-xs text-slate-300">{structureInfo.method}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                            <FileText size={10} /> Resolution
                                        </h4>
                                        <p className={`text-xs ${molecularState.customData ? 'text-green-400 font-medium' : 'text-slate-300'}`}>
                                            {structureInfo.resolution}
                                        </p>
                                    </div>
                                </div>

                                {structureInfo.keywords && (
                                    <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
                                        <div>
                                            <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                                <Tag size={10} /> Class
                                            </h4>
                                            <p className="text-xs text-blue-300/90 truncate" title={structureInfo.keywords}>
                                                {structureInfo.keywords.split(',')[0]}
                                            </p>
                                        </div>
                                        {structureInfo.releaseDate && (
                                            <div>
                                                <h4 className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-1">
                                                    <Calendar size={10} /> Released
                                                </h4>
                                                <p className="text-xs text-slate-400">
                                                    {structureInfo.releaseDate}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-2 text-center">
                                <span className="text-xs text-slate-500">Loading metadata...</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Controls Overlay Hint */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400">
            Left Click: Rotate • Right Click: Pan • Scroll: Zoom
        </div>
      </div>
    </div>
  );
};

export default MolecularViewer;


export enum Sender {
    User = 'user',
    AI = 'ai',
    System = 'system'
}

export interface Message {
    id: string;
    text: string;
    sender: Sender;
    timestamp: number;
    isStreaming?: boolean;
}

export enum CommandType {
    LOAD_PDB = 'LOAD_PDB',
    SET_REPRESENTATION = 'SET_REPRESENTATION',
    SET_COLOR_SCHEME = 'SET_COLOR_SCHEME',
    TOGGLE_SPIN = 'TOGGLE_SPIN',
    RUN_SIMULATION = 'RUN_SIMULATION',
    ANALYZE_DATA = 'ANALYZE_DATA',
    PROCESS_SEQUENCE = 'PROCESS_SEQUENCE',
    EVALUATE_MODEL = 'EVALUATE_MODEL',
    QUERY_STRUCTURE = 'QUERY_STRUCTURE', // New Command
    UNKNOWN = 'UNKNOWN'
}

export interface SimulationData {
    time: number;
    rmsd: number;
    energy: number;
    temperature: number;
}

export interface EvaluationMetrics {
    accuracy: { epoch: number; loss: number; val_acc: number }[];
    fairness: { group: string; errorRate: number }[];
    robustness: { noiseLevel: number; stabilityScore: number }[];
    interpretability: { residue: string; importance: number }[];
    overallScore: number;
}

export interface Command {
    type: CommandType;
    params: Record<string, any>;
    explanation: string;
}

export interface StructureMetadata {
    title: string;
    method: string;
    resolution: string;
    keywords?: string;
    releaseDate?: string;
}

export type SimulationStage = 'minimization' | 'equilibration' | 'production';

export interface MolecularState {
    pdbId: string;
    representation: 'cartoon' | 'licorice' | 'spacefill' | 'surface' | 'ribbon';
    colorScheme: 'residueindex' | 'chainid' | 'element' | 'hydrophobicity';
    isSpinning: boolean;
    simulationRunning: boolean;
    simulationProgress: number;
    simulationStage: SimulationStage; 
    simulationData: SimulationData[];
    simulationLogs: string[];
    customData?: StructureMetadata;
    evaluationData?: EvaluationMetrics;
}

export interface Project {
    id: string;
    name: string;
    pdbId: string;
    lastModified: number;
    status: 'active' | 'completed' | 'archived';
}

// Extend Window to include NGL
declare global {
    interface Window {
        NGL: any;
    }
}

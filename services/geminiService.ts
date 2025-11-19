
import { GoogleGenAI, Type } from "@google/genai";
import { Command, CommandType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are MolSim AI, an advanced computational chemistry assistant. 
Your goal is to help users visualize molecules, set up molecular dynamics simulations, and analyze trajectories.
You understand protocols for AlphaFold structure prediction and AMBER/CHARMM MD simulations.

When the user asks to do something, generate a structured JSON command.

Valid Command Types:
1. LOAD_PDB: Load a protein/molecule by PDB ID (e.g., '1AXC').
2. SET_REPRESENTATION: Change visual style (cartoon, licorice, surface).
3. SET_COLOR_SCHEME: Change coloring (residueindex, chainid).
4. TOGGLE_SPIN: Start/stop rotation.
5. RUN_SIMULATION: Run a simulation. Maps to requests like "simulate", "run MD", "check stability".
6. ANALYZE_DATA: Show graphs (RMSD, Energy).
7. PROCESS_SEQUENCE: Use this when the user mentions "AlphaFold", "predict structure", "fold this sequence", or pastes a string of amino acids.
8. EVALUATE_MODEL: Use this when the user asks about "accuracy", "validation", "fairness", "robustness", "evaluate AI", or "trust".
9. QUERY_STRUCTURE: Use this when the user asks a specific scientific question about the structure itself (e.g., "How many subunits?", "What is the resolution?", "Function of this protein?"). Provide the direct answer in the 'explanation' field.
10. UNKNOWN: If unsure.

Response Format:
Return a JSON object adhering to the schema.
`;

export const parseUserIntent = async (userText: string, context?: string): Promise<Command> => {
  try {
    const processedInput = userText.length > 2000 ? userText.substring(0, 2000) + "...[truncated]" : userText;
    
    let prompt = processedInput;
    if (context) {
        prompt = `[Context: ${context}]\nUser Request: ${processedInput}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              enum: [
                CommandType.LOAD_PDB,
                CommandType.SET_REPRESENTATION,
                CommandType.SET_COLOR_SCHEME,
                CommandType.TOGGLE_SPIN,
                CommandType.RUN_SIMULATION,
                CommandType.ANALYZE_DATA,
                CommandType.PROCESS_SEQUENCE,
                CommandType.EVALUATE_MODEL,
                CommandType.QUERY_STRUCTURE,
                CommandType.UNKNOWN,
              ],
            },
            params: {
              type: Type.OBJECT,
              properties: {
                pdbId: { type: Type.STRING, nullable: true },
                style: { type: Type.STRING, nullable: true },
                color: { type: Type.STRING, nullable: true },
                active: { type: Type.BOOLEAN, nullable: true },
                sequence: { type: Type.STRING, nullable: true },
                name: { type: Type.STRING, nullable: true },
              },
              nullable: true, 
            },
            explanation: {
              type: Type.STRING,
              description: "A scientific explanation of the action. If type is QUERY_STRUCTURE, this field MUST contain the answer to the user's question.",
            },
          },
          required: ["type", "params", "explanation"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as Command;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      type: CommandType.UNKNOWN,
      params: {},
      explanation: "I'm sorry, I encountered an error processing your request.",
    };
  }
};

export const generateAnalysisSummary = async (dataPoints: number): Promise<string> => {
    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this simulated MD trajectory. We ran ${dataPoints} frames. 
            Stages: Minimization -> Equilibration -> Production.
            RMSD stabilized around 2-3A. 
            Provide a brief scientific conclusion about the protein's stability suitable for a material scientist.`,
         });
         return response.text || "Simulation complete. Structure appears stable under simulated conditions.";
    } catch (e) {
        return "Analysis complete.";
    }
}

export const getValidationMethodology = async (): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Explain the AI validation methodology used to evaluate this protein structure prediction model. 
            Provide a detailed, scientific explanation covering these four pillars:
            
            1. **Accuracy**: How is structural accuracy measured? Mention Root Mean Square Deviation (RMSD) and Global Distance Test (GDT_TS) against crystallographic ground truth.
            2. **Fairness**: How do we ensure the model works across diverse protein families? Discuss testing on underrepresented classes like membrane proteins or disordered regions to prevent training bias.
            3. **Robustness**: How is the model tested against perturbations? Explain the injection of Gaussian noise (0.1Å - 1.0Å) into atomic coordinates to measure prediction stability.
            4. **Interpretability**: How do we explain the model's confidence? Mention per-residue confidence scores (pLDDT) and feature importance analysis (e.g., SHAP values) to identify critical folding determinants.
            
            Format the response as a clean, professional markdown section suitable for a scientific dashboard.`,
        });
        return response.text || "Validation methodology data unavailable.";
    } catch (e) {
        return "Unable to retrieve validation methodology.";
    }
}

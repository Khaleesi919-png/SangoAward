
import { GoogleGenAI } from "@google/genai";
import { Member } from "../types";

/**
 * Analyzes the alliance roster using Gemini AI to provide strategic recommendations.
 */
export const analyzeSquadDistribution = async (members: Member[]): Promise<string> => {
  try {
    // Correct initialization as per @google/genai guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Constructing a prompt for the model
    const dataSummary = members.map(m => ({
      name: m.name,
      group: m.group,
      dominionCount: m.seasonalHistory.filter(h => h.status === '當季霸業').length
    }));

    const prompt = `
      You are a high-level strategic advisor for an alliance in a tactical strategy game. 
      Analyze the following roster data and provide a concise (max 120 characters) tactical recommendation 
      in Traditional Chinese. Focus on which groups are performing best and how to distribute new rewards.
      
      Roster Data: ${JSON.stringify(dataSummary)}
    `;

    // Using gemini-3-pro-preview for complex reasoning task
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });

    // Extracting text using the .text property (not a method)
    return response.text || "目前無法產生戰略建議。";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI 連結中斷，請稍後再試。";
  }
};

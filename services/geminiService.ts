import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to standardize address
export const suggestAddress = async (rawInput: string) => {
  if (!apiKey) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Normalize and correct this Brazilian address into a JSON structure. If details are missing, try to infer or leave blank. Address: "${rawInput}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            street: { type: Type.STRING },
            number: { type: Type.STRING },
            neighborhood: { type: Type.STRING },
            city: { type: Type.STRING },
            formatted: { type: Type.STRING, description: "Full formatted address string" }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Address Error:", error);
    return null;
  }
};

// Helper to generate product descriptions
export const generateProductDescription = async (name: string, category: string, ingredients: string) => {
  if (!apiKey) return "Description unavailable (API Key missing).";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, mouth-watering, appetizing description (max 30 words) for a ${category} named "${name}". Ingredients: ${ingredients}. In Portuguese.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return "Error generating description.";
  }
};

// Helper to analyze sales
export const generateDailyReport = async (ordersJson: string) => {
  if (!apiKey) return "AI Insights unavailable.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this JSON sales data and provide 3 key concise insights/trends in Portuguese (bullet points). Data: ${ordersJson}`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Report Error:", error);
    return "Could not generate report.";
  }
};

// Helper to estimate market price
export const getMarketPriceEstimate = async (productName: string) => {
  if (!apiKey) return "Estimativa indisponível.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Forneça uma estimativa de faixa de preço de venda (em Reais R$) para o produto culinário "${productName}" no Brasil (delivery). Responda apenas com a faixa de preço e uma frase curta de contexto. Exemplo: "R$ 20,00 - R$ 30,00. Depende dos ingredientes."`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Price Error:", error);
    return "Erro ao consultar mercado.";
  }
};
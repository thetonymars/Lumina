
import { GoogleGenAI, Type } from "@google/genai";
import { DesignStyle, ProductRecommendation } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateReimaginedRoom = async (
  base64Image: string,
  style: DesignStyle
): Promise<{ imageUrl: string; description: string }> => {
  const ai = getGeminiClient();
  const prompt = `Reimagine this room in ${style} interior design style. Keep the basic architecture but change furniture, colors, and decor to match the aesthetic. Provide a high-quality, realistic visual update. Return the image as part of the response.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    ]
  });

  const imageUrl = response.data ? `data:image/png;base64,${response.data}` : '';
  const description = response.text || '';

  return { imageUrl, description };
};

export const editRoomByChat = async (
  base64Image: string,
  userMessage: string,
  style: DesignStyle
): Promise<{ imageUrl: string; text: string }> => {
  const ai = getGeminiClient();
  const prompt = `User wants to refine the design: "${userMessage}". Based on this request, update the interior design of the attached room. Maintain the ${style} theme but apply the specific requested changes. Provide both an updated image and a brief explanation of what was changed.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    ]
  });

  const imageUrl = response.data ? `data:image/png;base64,${response.data}` : '';
  const text = response.text || '';

  return { imageUrl, text };
};

export const getShoppingLinks = async (
  base64Image: string
): Promise<ProductRecommendation[]> => {
  const ai = getGeminiClient();
  const prompt = "Identify 3 key furniture or decor items in this design. For each item, find real-world products and their shopping URLs using Google Search. Focus on stores like IKEA, West Elm, Wayfair, or similar.";

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        parts: [
          { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            price: { type: Type.STRING },
            url: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "url", "description"]
        }
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse shopping links", e);
    return [];
  }
};


import { DesignStyle, ProductRecommendation } from "../types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const SITE_URL = window.location.origin;
const SITE_NAME = "Lumina Interior Designer";

const callOpenRouter = async (model: string, messages: any[]) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      // Requesting image output if possible (multimodal)
      // Some models might return base64 images in their response
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenRouter API call failed");
  }

  return await response.json();
};

export const generateReimaginedRoom = async (
  base64Image: string,
  style: DesignStyle
): Promise<{ imageUrl: string; description: string }> => {
  const prompt = `Reimagine this room in ${style} interior design style. Keep the basic architecture but change furniture, colors, and decor to match the aesthetic. Provide a high-quality, realistic visual update. Return the image as part of the response.`;

  const response = await callOpenRouter("google/gemini-2.0-flash-001", [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        {
          type: "image_url",
          image_url: {
            url: base64Image // base64 string
          }
        }
      ]
    }
  ]);

  const output = response.choices?.[0]?.message;
  // OpenRouter might return images in a specific field or as part of the message
  // For Gemini 2.0 Flash, it often returns text + base64 image if requested

  let imageUrl = '';
  let description = output?.content || '';

  // Extract base64 image if present in OpenRouter's multimodal response
  if (response.choices?.[0]?.message?.images?.[0]) {
    imageUrl = response.choices[0].message.images[0];
  } else if (description.includes('data:image')) {
    // Fallback search in text if base64 is embedded
    const match = description.match(/data:image\/[^;]+;base64,[^"'\s)]+/);
    if (match) imageUrl = match[0];
  }

  return { imageUrl, description };
};

export const editRoomByChat = async (
  base64Image: string,
  userMessage: string,
  style: DesignStyle
): Promise<{ imageUrl: string; text: string }> => {
  const prompt = `User wants to refine the design: "${userMessage}". Based on this request, update the interior design of the attached room. Maintain the ${style} theme but apply the specific requested changes. Provide both an updated image and a brief explanation of what was changed.`;

  const response = await callOpenRouter("google/gemini-2.0-flash-001", [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        {
          type: "image_url",
          image_url: {
            url: base64Image
          }
        }
      ]
    }
  ]);

  const output = response.choices?.[0]?.message;
  let imageUrl = '';
  let text = output?.content || '';

  if (response.choices?.[0]?.message?.images?.[0]) {
    imageUrl = response.choices[0].message.images[0];
  } else if (text.includes('data:image')) {
    const match = text.match(/data:image\/[^;]+;base64,[^"'\s)]+/);
    if (match) imageUrl = match[0];
  }

  return { imageUrl, text };
};

export const getShoppingLinks = async (
  base64Image: string
): Promise<ProductRecommendation[]> => {
  const prompt = `Identify 3 key furniture or decor items in this design. For each item, find real-world products and their shopping URLs using Google Search. Focus on stores like IKEA, West Elm, Wayfair, or similar. Return the results as a strictly formatted JSON array of objects with keys: title, price, url, description.`;

  const response = await callOpenRouter("google/gemini-2.0-flash-001", [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        {
          type: "image_url",
          image_url: {
            url: base64Image
          }
        }
      ]
    }
  ]);

  try {
    const content = response.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse shopping links", e);
    return [];
  }
};

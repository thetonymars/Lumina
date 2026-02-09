
import { DesignStyle, ProductRecommendation } from "../types";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const SITE_URL = window.location.origin;
const SITE_NAME = "Lumina Interior Designer";

const callOpenRouter = async (model: string, messages: any[], modalities?: string[]) => {
  const body: any = {
    model: model,
    messages: messages,
  };

  if (modalities) {
    body.modalities = modalities;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": SITE_URL,
      "X-Title": SITE_NAME,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
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
  const prompt = `Reimagine this room in ${style} interior design style. Keep the basic architecture but change furniture, colors, and decor to match the aesthetic. Provide a high-quality, realistic visual update. Return both an updated image and a description.`;

  const response = await callOpenRouter("google/gemini-2.5-flash-image", [
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
  ], ["image", "text"]);

  const output = response.choices?.[0]?.message;
  let imageUrl = '';
  let description = output?.content || '';

  // Extract base64 image from OpenRouter's specific field
  // Format: { type: "image_url", image_url: { url: "data:..." } }
  const images = output?.images;
  if (images && images.length > 0) {
    const imgData = images[0];
    if (typeof imgData === 'string') {
      imageUrl = imgData;
    } else if (imgData.image_url?.url) {
      imageUrl = imgData.image_url.url;
    } else if (imgData.url) {
      imageUrl = imgData.url;
    }

    if (imageUrl && !imageUrl.startsWith('data:')) {
      imageUrl = `data:image/png;base64,${imageUrl}`;
    }
  }

  return { imageUrl, description };
};

export const editRoomByChat = async (
  base64Image: string,
  userMessage: string,
  style: DesignStyle
): Promise<{ imageUrl: string; text: string }> => {
  const prompt = `User wants to refine the design: "${userMessage}". Based on this request, update the interior design of the attached room. Maintain the ${style} theme but apply the specific requested changes. Provide both an updated image and a brief explanation of what was changed.`;

  const response = await callOpenRouter("google/gemini-2.5-flash-image", [
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
  ], ["image", "text"]);

  const output = response.choices?.[0]?.message;
  let imageUrl = '';
  let text = output?.content || '';

  const images = output?.images;
  if (images && images.length > 0) {
    const imgData = images[0];
    if (typeof imgData === 'string') {
      imageUrl = imgData;
    } else if (imgData.image_url?.url) {
      imageUrl = imgData.image_url.url;
    } else if (imgData.url) {
      imageUrl = imgData.url;
    }

    if (imageUrl && !imageUrl.startsWith('data:')) {
      imageUrl = `data:image/png;base64,${imageUrl}`;
    }
  }

  return { imageUrl, text };
};

export const getShoppingLinks = async (
  base64Image: string
): Promise<ProductRecommendation[]> => {
  // SAFETY: If the previous step failed to generate an image, 
  // don't send an empty URL to OpenRouter as it will return a 400.
  if (!base64Image || base64Image.length < 100) {
    console.warn("Skipping shopping links: Invalid or empty image provided.");
    return [];
  }

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
  ], ["text"]);

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

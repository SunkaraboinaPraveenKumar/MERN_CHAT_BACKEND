import { GoogleGenerativeAI } from '@google/generative-ai';

// Function to configure Google Generative AI client
export const configureGemini = () => {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("API key not found in environment variables");
  }

  // Initialize GoogleGenerativeAI with API key
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

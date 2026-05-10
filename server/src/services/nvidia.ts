import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
});

export const getAIInsights = async (facilityName: string, stats: any) => {
  try {
    const response = await openai.chat.completions.create({
      model: "meta/llama-3.1-70b-instruct", 
      messages: [
        {
          role: "system",
          content: "You are an expert facility management AI for the SAFAI platform. Analyze sensor data and provide one short, actionable recommendation (max 15 words)."
        },
        {
          role: "user",
          content: `Facility: ${facilityName}. Stats: Cleanliness ${stats.cleanliness}%, Occupancy ${stats.occupancy}%.`
        }
      ],
      temperature: 0.2,
      max_tokens: 50,
    });

    return response.choices[0].message.content || "Monitoring active.";
  } catch (error) {
    console.error('NVIDIA NIM Error:', error);
    return "Optimizing resource allocation...";
  }
};

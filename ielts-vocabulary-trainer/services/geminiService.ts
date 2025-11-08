
import { GoogleGenAI, Type } from "@google/genai";
import type { Exercise } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. Please set the environment variable.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! });

export const generateExercise = async (words: string[]): Promise<Exercise | null> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured.");
  }
  
  if (words.length === 0) {
    return null;
  }

  const prompt = `You are an expert IELTS instructor creating a vocabulary exercise.
  Generate one natural-sounding sentence suitable for an IELTS listening context (like a university lecture, a tour booking, or a daily conversation).
  The sentence must use all of the following words: ${words.join(', ')}.
  Then, replace exactly one of these target words in the sentence with "_____" (five underscores).
  
  Return a single JSON object with the following structure:
  {
    "sentence": "The complete sentence with all the words.",
    "sentenceWithBlank": "The sentence with one word replaced by '_____'.",
    "blankWord": "The word that was replaced."
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentence: {
              type: Type.STRING,
              description: 'The complete sentence with all the words.',
            },
            sentenceWithBlank: {
              type: Type.STRING,
              description: "The sentence with one word replaced by '_____'.",
            },
            blankWord: {
              type: Type.STRING,
              description: 'The word that was replaced.',
            },
          },
          required: ["sentence", "sentenceWithBlank", "blankWord"],
        },
      },
    });
    
    const jsonText = response.text.trim();
    const exercise: Exercise = JSON.parse(jsonText);
    
    // Basic validation to ensure the blank word is one of the target words
    const lowerCaseBlankWord = exercise.blankWord.toLowerCase().trim();
    const lowerCaseWords = words.map(w => w.toLowerCase().trim());

    if (!lowerCaseWords.includes(lowerCaseBlankWord)) {
        console.warn("Gemini returned a blank word not in the original list.", {exercise, words});
        // We can still try to use it, or throw an error. Let's try to use it.
    }
    
    return exercise;

  } catch (error) {
    console.error("Error generating exercise with Gemini:", error);
    throw new Error("Failed to generate an exercise. Please check your API key and try again.");
  }
};

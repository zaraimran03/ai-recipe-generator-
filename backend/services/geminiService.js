const { GoogleGenAI } = require('@google/genai');

const buildPrompt = (ingredients, cuisine, taste, cooking_time, difficulty, servings, dietary_preference, allergies, retryStrict = false) => {
  let basePrompt = `You are an expert chef. Create a recipe using these ingredients: ${ingredients}.
Cuisine: ${cuisine}
Taste Profile: ${taste}
Max Cooking Time: ${cooking_time} minutes
Difficulty: ${difficulty}
Servings: ${servings}
Dietary Preferences: ${dietary_preference}
Allergies (MUST AVOID): ${allergies}

You MUST return the recipe exactly in the following JSON format. Do not include markdown formatting like \`\`\`json or any other text before or after the JSON.
{
  "title": "String - A creative name for the dish",
  "ingredients": [
    {"name": "String", "quantity": "String (number)", "unit": "String"}
  ],
  "instructions": [
    "String - Step 1",
    "String - Step 2"
  ],
  "nutrition": {
    "calories": Number,
    "protein": Number,
    "carbs": Number,
    "fat": Number
  },
  "servings": ${servings},
  "difficulty": "${difficulty}",
  "time": ${cooking_time}
}`;

  if (retryStrict) {
    basePrompt += "\n\nCRITICAL: Respond with raw JSON only, no markdown fences, no commentary, matching exact schema.";
  }
  return basePrompt;
};

const cleanJsonResponse = (responseText) => {
  let text = responseText.trim();
  if (text.startsWith("```json")) {
    text = text.substring(7);
  } else if (text.startsWith("```")) {
    text = text.substring(3);
  }
  if (text.endsWith("```")) {
    text = text.substring(0, text.length - 3);
  }
  return text.trim();
};

const validateSchema = (data) => {
  const requiredKeys = ["title", "ingredients", "instructions", "nutrition", "servings", "difficulty", "time"];
  for (const key of requiredKeys) {
    if (!(key in data)) throw new Error(`Missing required key: ${key}`);
  }
  
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    throw new Error("Ingredients must be a non-empty list.");
  }
  
  if (!Array.isArray(data.instructions) || data.instructions.length === 0) {
    throw new Error("Instructions must be a non-empty list.");
  }
};

exports.generateRecipe = async (ingredients, cuisine, taste, cooking_time, difficulty, servings, dietary_preference, allergies) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = buildPrompt(ingredients, cuisine, taste, cooking_time, difficulty, servings, dietary_preference, allergies, false);
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const text = cleanJsonResponse(response.text);
    const data = JSON.parse(text);
    validateSchema(data);
    return data;
  } catch (error) {
    console.error("First generation failed:", error);
    try {
      const promptStrict = buildPrompt(ingredients, cuisine, taste, cooking_time, difficulty, servings, dietary_preference, allergies, true);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptStrict,
      });
      const text = cleanJsonResponse(response.text);
      const data = JSON.parse(text);
      validateSchema(data);
      return data;
    } catch (retryError) {
      console.error("Retry failed:", retryError);
      throw new Error("Couldn't generate a recipe right now, please try again.");
    }
  }
};

const OpenAI = require('openai');

// Groq is OpenAI-API compatible — just swap the baseURL
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

// Best available model on this Groq account
const MODEL = 'openai/gpt-oss-120b';

// ─── Prompt Builder ───────────────────────────────────────────────────────────
const buildPrompt = (
  ingredients, cuisine, taste, cooking_time,
  difficulty, servings, dietary_preference, allergies, calories,
  retryStrict = false
) => {
  let prompt = `Create a recipe using these parameters:
- Ingredients: ${ingredients}
- Dietary Preferences: ${dietary_preference}
- Max Cooking Time: ${cooking_time} minutes
- Target Calories: ${calories} kcal
- Servings: ${servings} people
- Cuisine: ${cuisine}
- Taste Profile: ${taste}
- Difficulty: ${difficulty}
- Allergies (MUST AVOID): ${allergies}

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
    prompt += '\n\nCRITICAL: Respond with raw JSON only, no markdown fences, no commentary, matching exact schema.';
  }
  return prompt;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const cleanJson = (text) => {
  let t = text.trim();
  if (t.startsWith('```json')) t = t.slice(7);
  else if (t.startsWith('```')) t = t.slice(3);
  if (t.endsWith('```')) t = t.slice(0, -3);
  return t.trim();
};

const validateSchema = (data) => {
  const required = ['title', 'ingredients', 'instructions', 'nutrition', 'servings', 'difficulty', 'time'];
  for (const key of required) {
    if (!(key in data)) throw new Error(`Missing required key: ${key}`);
  }
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    throw new Error('Ingredients must be a non-empty list.');
  }
  if (!Array.isArray(data.instructions) || data.instructions.length === 0) {
    throw new Error('Instructions must be a non-empty list.');
  }
};

// ─── Call Groq ────────────────────────────────────────────────────────────────
const callGroq = async (prompt) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: `You are the master chef engine behind an AI-Based Recipe Generator. Your core mission is to help users creatively cook delicious meals using *only* the ingredients they currently have in their fridge, minimizing food waste.

Behavior Guidelines:
1. Ingredient-First Approach: When a user provides ingredients (even single words or broad terms like "chicken"), do NOT just output a generic default recipe (like a standard chicken curry). Instead, build a creative, customized recipe that highlights those specific ingredients as the star components.
2. Strict Constraint Enforcement: You must strictly respect all user-defined parameters passed in the prompt:
   - Dietary Preferences: If a preference (like Vegan, Keto, Gluten-Free) is selected, you must strictly exclude any forbidden ingredients.
   - Max Cooking Time: Do not suggest steps or cooking methods that exceed the specified time limit.
   - Target Calories: Tailor the portion sizes and ingredient quantities to closely match the target calories per serving.
   - Servings: Scale all ingredient measurements correctly to feed the requested number of people.
3. Pantry Staples Assumption: You may assume the user has basic pantry staples (salt, black pepper, water, cooking oil/butter), but prioritize the specific ingredients they listed. If key ingredients are missing for a full dish, suggest smart, realistic substitutions using common household items.
4. Response Formatting: You MUST output strictly in the requested JSON format. Always respond with valid raw JSON only — no markdown, no extra text.`,
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  });
  return completion.choices[0].message.content;
};

// ─── Main Export ──────────────────────────────────────────────────────────────
exports.generateRecipe = async (
  ingredients, cuisine, taste, cooking_time,
  difficulty, servings, dietary_preference, allergies, calories
) => {
  // First attempt
  try {
    const prompt = buildPrompt(ingredients, cuisine, taste, cooking_time, difficulty, servings, dietary_preference, allergies, calories, false);
    const raw = await callGroq(prompt);
    const data = JSON.parse(cleanJson(raw));
    validateSchema(data);
    return data;
  } catch (err) {
    console.error('Groq first attempt failed:', err.message);
  }

  // Retry with stricter instructions
  try {
    const prompt = buildPrompt(ingredients, cuisine, taste, cooking_time, difficulty, servings, dietary_preference, allergies, calories, true);
    const raw = await callGroq(prompt);
    const data = JSON.parse(cleanJson(raw));
    validateSchema(data);
    return data;
  } catch (retryErr) {
    console.error('Groq retry failed:', retryErr.message);
    throw new Error("Couldn't generate a recipe right now, please try again.");
  }
};

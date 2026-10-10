'use strict';

const Groq = require('groq-sdk');
const { z } = require('zod');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'openai/gpt-oss-120b';

const SYSTEM_PROMPT = `You are an expert master chef. Generate a detailed recipe adhering to the STRICT constraints provided by the user.

RULE 1: Input Intent Handling. If the user requests a specific dish (e.g., "burger", "pizza", "biryani"), you MUST generate a standard, recognizable version of that exact dish. Do NOT deconstruct it into a bowl, salad, or unrelated fusion dish unless they explicitly asked for it. If they provide a list of ingredients (e.g., "chicken, rice, tomatoes"), create a cohesive recipe featuring those ingredients.
RULE 2: Output the result strictly in clean structured JSON.
RULE 3: If Restricted Pantry Mode is true, restrict the recipe to ONLY use the provided ingredients (and basics like salt, oil, water).
RULE 4: Strictly follow the Max Cooking Time, Target Calories, and Dietary Preferences.
RULE 5: Give the recipe a creative, appetizing, and culturally appropriate dish name for the 'title' field.
RULE 6: Dietary Labels Validation. Only include dietary labels in 'dietaryTags' that accurately reflect the recipe. If Dietary Preferences are 'None', do NOT artificially label the recipe with subjective tags like "High-Protein" or "Low-Carb". You may only include factual, strict tags like "Vegan", "Vegetarian", or "Gluten-Free" IF the recipe natively and strictly complies without special substitutions (e.g., state in tips to ensure sauces/buns are gluten-free if claiming it).

REQUIRED JSON SCHEMA:
{
  "title": "String",
  "summary": "String",
  "generationAdaptation": "String",
  "estimatedCost": "Number",
  "ingredients": [{ "name": "String", "quantity": "Number or String", "unit": "String", "isPantryStaple": Boolean }],
  "instructions": [{ "stepNumber": Number, "instruction": "String", "timerInMinutes": Number or null }],
  "substitutions": ["String"],
  "tips": ["String"],
  "nutrition": { "calories": Number, "protein": Number, "carbs": Number, "fat": Number },
  "metadata": { "servings": Number, "difficulty": "Beginner|Intermediate|Expert", "prepTimeMinutes": Number, "cookTimeMinutes": Number, "totalTimeMinutes": Number, "cuisine": "String", "dietaryTags": ["String"] }
}`;

const RecipeSchema = z.object({
  title: z.string(),
  summary: z.string(),
  generationAdaptation: z.string().default(''),
  estimatedCost: z.number().default(0),
  ingredients: z.array(z.object({
    name: z.string(),
    quantity: z.union([z.number(), z.string()]),
    unit: z.string(),
    isPantryStaple: z.boolean().default(false),
  })).nonempty(),
  instructions: z.array(z.object({
    stepNumber: z.number(),
    instruction: z.string(),
    timerInMinutes: z.number().nullable().default(null),
  })).nonempty(),
  substitutions: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
  nutrition: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
  metadata: z.object({
    servings: z.number(),
    difficulty: z.string(),
    prepTimeMinutes: z.number(),
    cookTimeMinutes: z.number(),
    totalTimeMinutes: z.number(),
    cuisine: z.string(),
    dietaryTags: z.array(z.string()),
  }),
});

const buildUserPrompt = (params) => {
  const prefs = Array.isArray(params.dietary_preference) ? params.dietary_preference : (params.dietary_preference ? [params.dietary_preference] : []);
  const dietString = prefs.length > 0 ? prefs.join(', ') : 'None (Do not artificially optimize for diet, just make it delicious. Only tag natively compliant diets like Vegetarian/Vegan if applicable).';
  const inputStr = Array.isArray(params.ingredients) ? params.ingredients.join(', ') : params.ingredients || 'None provided';
  const cuisineStr = params.cuisine === 'Any' ? 'Any cuisine (Choose the most natural cuisine for the requested dish/ingredients)' : params.cuisine;

  return `Please generate a detailed recipe adhering to these STRICT constraints:
- User Input (Dish Name OR Ingredients): "${inputStr}" (If this is a dish name like "burger", generate a real burger with buns, etc.)
- Restricted Pantry Mode: ${params.strictPantryMode ? 'true' : 'false'} (If true, use ONLY listed items)
- Selected Cuisine: ${cuisineStr}
- Dietary Preferences: ${dietString}
- Max Cooking Time: ${params.cooking_time || 30} mins
- Target Calories: ${params.calories || 500} kcal
- Servings: ${params.servings || 2}
- Allergies/Exclusions: ${Array.isArray(params.allergies) ? params.allergies.join(', ') : params.allergies || 'None'}
- Disliked Ingredients: ${Array.isArray(params.dislikedIngredients) ? params.dislikedIngredients.join(', ') : params.dislikedIngredients || 'None'}`;
};

const callGroq = async (systemPrompt, userContent, schema) => {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
    max_tokens: 2500,
  });
  const rawContent = completion.choices[0]?.message?.content;
  if (!rawContent) throw new Error('Groq returned an empty response.');
  return schema.parse(JSON.parse(rawContent));
};

exports.generateRecipe = async (params) => {
  let attempts = 0;
  const maxAttempts = 3;
  let lastErr;
  let validationErrorMsg = '';
  
  while (attempts < maxAttempts) {
    attempts++;
    try {
      const promptAddon = validationErrorMsg ? `\n\nPREVIOUS ERROR TO FIX: ${validationErrorMsg}` : '';
      const recipe = await callGroq(SYSTEM_PROMPT, buildUserPrompt(params) + promptAddon, RecipeSchema);
      
      const inputStr = Array.isArray(params.ingredients) ? params.ingredients.join(', ').toLowerCase() : (params.ingredients || '').toLowerCase();
      
      // 1. Dish Intent Validation
      if (inputStr && !inputStr.includes(',') && inputStr.split(' ').length <= 4) {
        const titleWords = recipe.title.toLowerCase();
        const words = inputStr.split(' ').filter(w => w.length > 2);
        const hasCoreWord = words.length === 0 || words.some(w => titleWords.includes(w));
        
        if (!hasCoreWord) {
          validationErrorMsg = `The user requested "${inputStr}", but you generated "${recipe.title}". You MUST generate the exact requested dish.`;
          if (attempts < maxAttempts) continue;
          throw new Error(`AI generated an unrelated dish: ${recipe.title}. Please try again.`);
        }
      }
      
      // 2. Strict Pantry Mode validation
      if (params.strictPantryMode && params.ingredients) {
        const allowedText = inputStr;
        const invalid = recipe.ingredients.find(i => {
          if (i.isPantryStaple) return false;
          const nameWords = i.name.toLowerCase().split(' ').filter(w => w.length > 3);
          const hasMatch = nameWords.some(w => allowedText.includes(w)) || allowedText.includes(i.name.toLowerCase());
          return !hasMatch;
        });
        
        if (invalid) {
          validationErrorMsg = `Pantry constraint violated: You included an unauthorized ingredient "${invalid.name}". Please restrict to only the provided items.`;
          if (attempts < maxAttempts) continue;
          throw new Error(`Pantry constraint violated: AI included unauthorized ingredient "${invalid.name}"`);
        }
      }
      
      // 3. Validate and clean up hallucinated dietary tags
      const requestedDiets = Array.isArray(params.dietary_preference) ? params.dietary_preference.map(d => d.toLowerCase()) : [];
      if (requestedDiets.length === 0) {
        const subjectiveTags = ['high-protein', 'low-carb', 'keto', 'paleo', 'healthy', 'low-fat', 'dairy-free', 'gluten-free'];
        recipe.metadata.dietaryTags = recipe.metadata.dietaryTags.filter(tag => {
          const lower = tag.toLowerCase();
          return !subjectiveTags.some(sub => lower.includes(sub));
        });
      }

      return recipe;
    } catch (err) {
      lastErr = err;
      if (err?.name === 'ZodError') {
        validationErrorMsg = 'Generated recipe did not match required schema structure. Fix the JSON format.';
        continue;
      }
      // For immediate failures (API down, network error), don't retry logic.
      if (err.message && (err.message.includes('API') || err.message.includes('decommissioned'))) throw err;
    }
  }
  
  if (lastErr?.name === 'ZodError') {
    throw new Error('Generated recipe did not match required schema structure.');
  }
  throw lastErr;
};

exports.adaptRecipe = async (existingRecipe, userRequest, params) => {
  try {
    const adaptSystemPrompt = SYSTEM_PROMPT + `\n\nADAPTATION TASK:\nYou are provided with an existing recipe and a user request (e.g. "make it cheaper", "make it vegetarian"). Modify the recipe to satisfy the request and any provided constraints, while preserving the core identity of the original recipe. Return the modified recipe matching the JSON schema.`;
    const userContent = `Existing Recipe:\n${JSON.stringify(existingRecipe)}\n\nUser Request: ${userRequest}\n\nConstraints:\n${buildUserPrompt(params)}`;
    return await callGroq(adaptSystemPrompt, userContent, RecipeSchema);
  } catch (err) {
    if (err?.name === 'ZodError') throw new Error('Adapted recipe did not match schema.');
    throw err;
  }
};

exports.preserveFamilyRecipe = async (rawText) => {
  try {
    const preservePrompt = `You are "SaaDish AI". You are given an unstructured family recipe in natural language.
Convert it into a structured recipe matching the JSON schema.
IMPORTANT RULE: Do NOT invent exact measurements if they weren't provided. Use "Quantity not specified" or "Add according to the original recipe". You may provide an optional estimated measurement separately in the tips array, clearly marked as "AI estimate — verify with the original recipe."
Return ONLY raw JSON.`;
    return await callGroq(preservePrompt + "\n\n" + SYSTEM_PROMPT, `Family Recipe Text:\n${rawText}`, RecipeSchema);
  } catch (err) {
    if (err?.name === 'ZodError') throw new Error('Structured family recipe did not match schema.');
    throw err;
  }
};

exports.modernizeFamilyRecipe = async (structuredRecipe, options) => {
  try {
    const modernizePrompt = SYSTEM_PROMPT + `\n\nMODERNIZATION TASK:\nYou are provided with a structured family recipe and modernization options. Create a modern adaptation while retaining important characteristics of the original. Return ONLY raw JSON.`;
    const userContent = `Original Recipe:\n${JSON.stringify(structuredRecipe)}\n\nModernization Options: ${options}`;
    return await callGroq(modernizePrompt, userContent, RecipeSchema);
  } catch (err) {
    if (err?.name === 'ZodError') throw new Error('Modernized recipe did not match schema.');
    throw err;
  }
};

exports.getSubstitute = async (recipeTitle, missingIngredient) => {
  const SubstituteSchema = z.object({
    original: z.string(),
    substitute: z.string(),
    adjustmentNote: z.string(),
  });
  return await callGroq(
    `You are "SaaDish AI". Suggest a household pantry substitute for a missing ingredient. Respond ONLY with valid raw JSON: { "original": "String", "substitute": "String", "adjustmentNote": "String" }`,
    `Recipe: "${recipeTitle}". Missing ingredient: "${missingIngredient}". Suggest a household substitute.`,
    SubstituteSchema
  );
};

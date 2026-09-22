'use strict';

const Groq = require('groq-sdk');
const { z } = require('zod');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'openai/gpt-oss-120b';

const SYSTEM_PROMPT = `You are an expert master chef. Generate a detailed recipe adhering to the STRICT constraints provided by the user.

RULE 1: Never ignore the user's input ingredients. If specific ingredients (like 'Aloo' and 'Gobhi') are provided, you MUST produce a relevant recipe using them (e.g., Aloo Gobhi Curry/Sabzi), matching the requested cuisine. Do NOT substitute with unrelated dishes like Italian or Pasta unless explicitly asked for.
RULE 2: Output the result strictly in clean structured JSON.
RULE 3: If Restricted Pantry Mode is true, you MUST restrict the recipe to ONLY use the provided ingredients (and basics like salt, oil, water).
RULE 4: Strictly follow the Max Cooking Time, Target Calories, and Dietary Preferences.

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
  return `Please generate a detailed recipe adhering to these STRICT constraints:
- User Ingredients: ${Array.isArray(params.ingredients) ? params.ingredients.join(', ') : params.ingredients || 'None provided'} (MUST be the core of the dish)
- Restricted Pantry Mode: ${params.strictPantryMode ? 'true' : 'false'} (If true, use ONLY listed items)
- Selected Cuisine: ${params.cuisine || 'Any'} (MUST match this regional cooking style)
- Dietary Preferences: ${Array.isArray(params.dietary_preference) ? params.dietary_preference.join(', ') : params.dietary_preference || 'None'}
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
  try {
    return await callGroq(SYSTEM_PROMPT, buildUserPrompt(params), RecipeSchema);
  } catch (err) {
    if (err?.name === 'ZodError') {
      console.error('Schema validation failed:', JSON.stringify(err.errors, null, 2));
      throw new Error('Generated recipe did not match required schema structure.');
    }
    throw err;
  }
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
    const preservePrompt = `You are "Chef AI". You are given an unstructured family recipe in natural language.
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
    `You are "Chef AI". Suggest a household pantry substitute for a missing ingredient. Respond ONLY with valid raw JSON: { "original": "String", "substitute": "String", "adjustmentNote": "String" }`,
    `Recipe: "${recipeTitle}". Missing ingredient: "${missingIngredient}". Suggest a household substitute.`,
    SubstituteSchema
  );
};

'use strict';

const Groq = require('groq-sdk');
const { z } = require('zod');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'openai/gpt-oss-120b';

const SYSTEM_PROMPT = `You are "Chef AI", a world-class executive chef, nutritionist, and culinary chemist.
Your sole objective is to transform raw user constraints into realistic, accurate, and delicious recipes.

STRICT OPERATIONAL RULES:
1. HARD CONSTRAINTS (NEVER VIOLATE):
   - Never include ingredients listed in the "allergies" or "dislikedIngredients" constraints.
   - If a specific dietary restriction is given, strictly adhere to it.
   - Do not exceed the "max_cooking_time" or "budgetPreference" (if provided).
   - If user explicitly requested *only* available ingredients, do not add extra ingredients other than salt, pepper, oil, and water.

2. USER PREFERENCES:
   - Adhere to the requested spice level, cuisine, cooking skill, serving size, and preferred ingredients.
   - Explicit user preferences MUST always override generational assumptions.

3. PERSONALIZATION SIGNAL (GENERATION):
   - Use the user's "generation" (if provided) as a soft signal to influence style and adaptation (e.g., Gen Z might prefer modern presentation, Gen X might prefer familiar family-style, Millennials might prefer meal-prep efficiency).
   - Explain how you adapted the recipe in the "generationAdaptation" field concisely, without stereotyping (e.g. "Adapted for quick meal-prep focus"). Never use phrases like "Gen Z people like this."

4. OUTPUT FORMATTING REQUIREMENTS:
   - You MUST respond ONLY with a valid, raw JSON object.
   - Do NOT wrap your output in Markdown code blocks.
   - Do NOT include any introductory or concluding text.

REQUIRED JSON SCHEMA:
{
  "title": "String",
  "summary": "String",
  "generationAdaptation": "String - how the recipe was personalized",
  "estimatedCost": "Number - estimated cost in local currency or general unit",
  "ingredients": [{ "name": "String", "quantity": "Number or String", "unit": "String", "isPantryStaple": Boolean }],
  "instructions": [{ "stepNumber": Number, "instruction": "String", "timerInMinutes": Number or null }],
  "substitutions": ["String - suggested substitutions for key ingredients"],
  "tips": ["String - cooking tips"],
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
  return `Generate a recipe with these parameters:
- Available Ingredients: ${Array.isArray(params.ingredients) ? params.ingredients.join(', ') : params.ingredients}
- Cuisine Style: ${params.cuisine || params.favoriteCuisines?.join(', ') || 'Any'}
- Flavor Profile/Spice Level: ${params.taste || params.spiceLevel || 'Balanced'}
- Max Cooking Time: ${params.cooking_time} minutes
- Target Difficulty: ${params.difficulty || params.cookingSkill || 'Intermediate'}
- Servings: ${params.servings}
- Dietary Preferences: ${Array.isArray(params.dietary_preference) ? params.dietary_preference.join(', ') : params.dietary_preference || 'None'}
- Strict Allergies (MUST EXCLUDE): ${Array.isArray(params.allergies) ? params.allergies.join(', ') : params.allergies || 'None'}
- Disliked Ingredients (MUST EXCLUDE): ${Array.isArray(params.dislikedIngredients) ? params.dislikedIngredients.join(', ') : params.dislikedIngredients || 'None'}
- Target Calories per Serving: ${params.calories} kcal
- Budget Preference: ${params.budgetPreference ? 'Max ' + params.budgetPreference : 'None'}
- Generation: ${params.generation || 'None provided'}`;
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

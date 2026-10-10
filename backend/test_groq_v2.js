require('dotenv').config();
const groqService = require('./services/groqService');

async function runTests() {
  console.log("=== Test 1: Dish Name Input ===");
  try {
    const r1 = await groqService.generateRecipe({
      ingredients: 'burger',
      cuisine: 'Any',
      dietary_preference: [],
      strictPantryMode: false
    });
    console.log("Title generated:", r1.title);
    console.log("Dietary tags:", r1.metadata.dietaryTags);
    console.log("Cuisine metadata:", r1.metadata.cuisine);
  } catch (err) { console.error("Test 1 Failed:", err.message); }

  console.log("\n=== Test 2: Ingredient List Input ===");
  try {
    const r2 = await groqService.generateRecipe({
      ingredients: 'chicken, tomatoes, garlic, basil',
      cuisine: 'Any',
      dietary_preference: [],
      strictPantryMode: false
    });
    console.log("Title generated:", r2.title);
    console.log("Dietary tags:", r2.metadata.dietaryTags);
    console.log("Cuisine metadata:", r2.metadata.cuisine);
  } catch (err) { console.error("Test 2 Failed:", err.message); }

  console.log("\n=== Test 3: Specific Dietary Request ===");
  try {
    const r3 = await groqService.generateRecipe({
      ingredients: 'pasta, tomatoes',
      cuisine: 'Italian',
      dietary_preference: ['Gluten-Free', 'Vegan'],
      strictPantryMode: false
    });
    console.log("Title generated:", r3.title);
    console.log("Dietary tags:", r3.metadata.dietaryTags);
  } catch (err) { console.error("Test 3 Failed:", err.message); }

  process.exit(0);
}

runTests();

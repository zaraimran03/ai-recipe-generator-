require('dotenv').config();
const groqService = require('./services/groqService');

async function runTests() {
  console.log("=== Test 1: Dish Name Input (Burger) ===");
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
    const hasBuns = JSON.stringify(r1).toLowerCase().includes('bun');
    console.log("Has buns:", hasBuns);
  } catch (err) { console.error("Test 1 Failed:", err.message); }

  console.log("\n=== Test 2: Dish Name Input (Pizza) ===");
  try {
    const rp = await groqService.generateRecipe({
      ingredients: 'pizza',
      cuisine: 'Any',
      dietary_preference: [],
      strictPantryMode: false
    });
    console.log("Title generated:", rp.title);
    console.log("Dietary tags:", rp.metadata.dietaryTags);
    console.log("Cuisine metadata:", rp.metadata.cuisine);
  } catch (err) { console.error("Test 2 Failed:", err.message); }

  console.log("\n=== Test 3: Ingredient List Input ===");
  try {
    const r2 = await groqService.generateRecipe({
      ingredients: 'chicken, garlic, tomatoes',
      cuisine: 'Any',
      dietary_preference: [],
      strictPantryMode: false
    });
    console.log("Title generated:", r2.title);
    console.log("Dietary tags:", r2.metadata.dietaryTags);
    console.log("Cuisine metadata:", r2.metadata.cuisine);
  } catch (err) { console.error("Test 3 Failed:", err.message); }

  process.exit(0);
}

runTests();

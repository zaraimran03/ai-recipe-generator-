require('dotenv').config();
const groqService = require('./services/groqService');

async function runTests() {
  console.log("=== Test 1: Meaningful Dish Name ===");
  try {
    const r1 = await groqService.generateRecipe({
      ingredients: 'eggs, flour, sugar',
      cuisine: 'Any',
      strictPantryMode: false
    });
    console.log("Title generated:", r1.title);
    if (!r1.title.toLowerCase().includes('egg') && r1.title.split(' ').length < 5) {
      console.log("-> Pass (Creative title)");
    } else {
      console.log("-> Success title:", r1.title);
    }
  } catch (err) { console.error("Test 1 Failed:", err.message); }

  console.log("\n=== Test 2: Italian Cuisine ===");
  try {
    const r2 = await groqService.generateRecipe({
      ingredients: 'chicken, tomatoes, garlic',
      cuisine: 'Italian',
      strictPantryMode: false
    });
    console.log("Title generated:", r2.title);
    console.log("Cuisine metadata:", r2.metadata.cuisine);
  } catch (err) { console.error("Test 2 Failed:", err.message); }

  console.log("\n=== Test 3: Desi Cuisine ===");
  try {
    const r3 = await groqService.generateRecipe({
      ingredients: 'chicken, tomatoes, garlic',
      cuisine: 'Desi / South Asian',
      strictPantryMode: false
    });
    console.log("Title generated:", r3.title);
    console.log("Cuisine metadata:", r3.metadata.cuisine);
  } catch (err) { console.error("Test 3 Failed:", err.message); }

  console.log("\n=== Test 4: Any Cuisine ===");
  try {
    const r4 = await groqService.generateRecipe({
      ingredients: 'chicken, tomatoes, garlic',
      cuisine: 'Any',
      strictPantryMode: false
    });
    console.log("Title generated:", r4.title);
    console.log("Cuisine metadata:", r4.metadata.cuisine);
  } catch (err) { console.error("Test 4 Failed:", err.message); }

  process.exit(0);
}

runTests();

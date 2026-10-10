const mongoose = require('mongoose');
const FamilyRecipe = require('./backend/models/FamilyRecipe');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/ai_recipe_db');
  
  // create dummy user ID
  const userId = new mongoose.Types.ObjectId();
  
  console.log("Saving recipe 1");
  const r1 = new FamilyRecipe({ userId, originalText: "Recipe 1", structuredRecipe: { title: "1" } });
  await r1.save();

  console.log("Saving recipe 2");
  const r2 = new FamilyRecipe({ userId, originalText: "Recipe 2", structuredRecipe: { title: "2" } });
  await r2.save();

  const found = await FamilyRecipe.find({ userId });
  console.log("Found recipes count:", found.length);
  
  process.exit(0);
}
test().catch(console.error);

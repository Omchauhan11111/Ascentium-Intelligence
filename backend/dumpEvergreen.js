const mongoose = require('mongoose');
const Article = require('./src/models/Article');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  const all = await Article.find({ type: 'evergreen' });
  console.log('Total evergreen:', all.length);
  console.log('Empty title count:', all.filter(a => !a.title).length);
  console.log('Unique categories:', [...new Set(all.map(a => a.category))]);
  console.log('First 5 items details:');
  all.slice(0, 5).forEach((item, index) => {
    console.log(`\nItem ${index + 1}:`);
    console.log(`  ID: ${item._id}`);
    console.log(`  Title: "${item.title}"`);
    console.log(`  Summary: "${item.summary}"`);
    console.log(`  Category: "${item.category}"`);
  });
  process.exit(0);
}
run().catch(console.error);

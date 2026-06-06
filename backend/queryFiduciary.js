const mongoose = require('mongoose');
const Article = require('./src/models/Article');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  const items = await Article.find({ type: 'evergreen', category: 'Fiduciary' }).lean();
  console.log('Fiduciary evergreen items count:', items.length);
  if (items.length > 0) {
    console.log('First 3 items:', JSON.stringify(items.slice(0, 3), null, 2));
  }
  process.exit(0);
}
run().catch(console.error);

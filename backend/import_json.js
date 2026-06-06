const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Article = require('./src/models/Article');
const { hashUrl } = require('./src/utils/hash');
require('dotenv').config();

// Helper to convert string to slug (kebab-case) for sourceId
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper to extract domain name as a clean source name
function cleanSourceName(urlStr, fallback) {
  try {
    const hostname = new URL(urlStr).hostname;
    // Remove www.
    let domain = hostname.replace('www.', '');
    // Get the name (e.g., asianbusinessreview.com -> Asian Business Review)
    let parts = domain.split('.')[0];
    return parts
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch (err) {
    return fallback || 'Unknown Source';
  }
}

async function run() {
  const filePath = path.join(__dirname, 'import_data.json');
  
  if (!fs.existsSync(filePath)) {
    console.error(`Error: 'import_data.json' file not found in ${__dirname}`);
    console.log(`Please convert your Excel data to JSON and save it as 'import_data.json' in the backend directory.`);
    process.exit(1);
  }

  // Connect to DB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected successfully!');

  // Read JSON
  const rawData = fs.readFileSync(filePath, 'utf8');
  let items = [];
  try {
    items = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to parse JSON file:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(items)) {
    console.error('Error: JSON data must be an array of objects.');
    process.exit(1);
  }

  console.log(`Processing ${items.length} items for import...`);

  const mappedArticles = [];
  
  for (const item of items) {
    if (!item.url || !item.title) {
      console.warn(`Skipping item because it is missing required URL or Title:`, item);
      continue;
    }

    // Parse domain for source info
    let domain = '';
    try {
      domain = new URL(item.url).hostname.replace('www.', '');
    } catch (_) {}

    // Determine clean source label
    let sourceName = item.source;
    if (!sourceName || sourceName.toLowerCase() === 'unknown') {
      sourceName = cleanSourceName(item.url, 'Unknown Source');
    }

    // Determine clean sourceId slug
    let sourceId = slugify(sourceName);

    // Compute urlHash using system normalizer (replaces excel short hash for consistency)
    const computedUrlHash = hashUrl(item.url);

    // Map to MongoDB schema fields
    const articleDoc = {
      title: item.title.trim(),
      summary: item.summary || '',
      url: item.url.trim(),
      urlHash: computedUrlHash,
      type: item.type || 'news', // 'news', 'govt', 'competitor', 'evergreen'
      category: item.category || 'General',
      subcategory: item.sub_category || item.subcategory || '',
      source: sourceName,
      sourceId: sourceId,
      sourceType: domain || item.sourceType || '',
      country: item.country || 'Singapore',
      relevanceScore: item.relevance_score ? parseInt(item.relevance_score, 10) : 0,
      aiSummary: item.relevance_reason || '',
      isPublished: true, // Mark manually imported articles as published by default
      publishedAt: item.date ? new Date(item.date) : null,
      fetchedAt: item.fetched_at ? new Date(item.fetched_at) : new Date(),
    };

    mappedArticles.push(articleDoc);
  }

  // Deduplicate against the DB to avoid primary key/unique collisions
  const hashes = mappedArticles.map(x => x.urlHash);
  const existingArticles = await Article.find({ urlHash: { $in: hashes } }).select('urlHash').lean();
  const existingHashes = new Set(existingArticles.map(x => x.urlHash));

  const toInsert = mappedArticles.filter(x => !existingHashes.has(x.urlHash));
  const duplicates = mappedArticles.length - toInsert.length;

  console.log(`Pre-check result: ${duplicates} items already exist in the database.`);

  if (toInsert.length > 0) {
    console.log(`Inserting ${toInsert.length} new articles into MongoDB...`);
    try {
      const res = await Article.insertMany(toInsert, { ordered: false });
      console.log(`Success! Inserted ${res.length} new articles.`);
    } catch (insertErr) {
      if (insertErr.insertedDocs) {
        console.log(`Successfully inserted ${insertErr.insertedDocs.length} articles before encountering an issue.`);
      } else {
        console.error('Insert error:', insertErr.message);
      }
    }
  } else {
    console.log('No new articles to insert.');
  }

  console.log('Done!');
  process.exit(0);
}

run().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});

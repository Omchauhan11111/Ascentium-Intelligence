/**
 * AI Service - OpenAI (optional)
 * -------------------------------
 * Used for two enhancements:
 *   1. AI-generated short summary of an article
 *   2. Smart category classification when keyword matching is ambiguous
 *
 * EVERYTHING is opt-in:
 *   - If OPENAI_API_KEY is not set, every function is a no-op.
 *   - If OPENAI_USE_FOR_SUMMARY=false, summary stays as the raw scrape value.
 *   - If OPENAI_USE_FOR_CATEGORY=false, only rule-based matching is used.
 *
 * This keeps the system free-tier friendly by default.
 */
let OpenAI;
try {
  OpenAI = require('openai');
} catch (_e) {
  OpenAI = null;
}

const { CATEGORIES } = require('../config/categories');

let client = null;
function getClient() {
  if (!process.env.OPENAI_API_KEY || !OpenAI) return null;
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function isEnabled() {
  return !!process.env.OPENAI_API_KEY && !!OpenAI;
}

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Generate a 1-2 sentence summary of an article.
 * Returns null on any failure (caller should keep the existing summary).
 */
async function summarizeArticle({ title, snippet }) {
  if (!isEnabled() || process.env.OPENAI_USE_FOR_SUMMARY !== 'true') return null;
  const cli = getClient();
  if (!cli) return null;
  try {
    const resp = await cli.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content:
            'You are a corporate-services intelligence analyst. Write a one-sentence summary (max 30 words) of the following article headline relevant to Singapore corporate services, accounting, tax, fund administration, HR, or fiduciary topics. Output only the summary, no preamble.'
        },
        { role: 'user', content: `Title: ${title}\nSnippet: ${snippet || '(none)'}` }
      ]
    });
    return (resp.choices?.[0]?.message?.content || '').trim() || null;
  } catch (err) {
    console.warn('[ai] summarize failed:', err.message);
    return null;
  }
}

/**
 * Pick a category/subcategory using the LLM when rule-based matching
 * is weak (score 0).  Returns null on failure.
 */
async function classifyCategory({ title, snippet }) {
  if (!isEnabled() || process.env.OPENAI_USE_FOR_CATEGORY !== 'true') return null;
  const cli = getClient();
  if (!cli) return null;
  try {
    const taxonomy = Object.entries(CATEGORIES)
      .map(([cat, val]) => `${cat}: ${Object.keys(val.subcategories).join(' / ')}`)
      .join('\n');

    const resp = await cli.chat.completions.create({
      model: MODEL,
      temperature: 0.0,
      max_tokens: 80,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            `You classify a Singapore corporate-services article into one of the categories below. ` +
            `Return strict JSON: { "category": "...", "subcategory": "..." } using EXACT names from this taxonomy:\n${taxonomy}` +
            `\nIf none fit, return { "category": "General", "subcategory": "" }.`
        },
        { role: 'user', content: `Title: ${title}\nSnippet: ${snippet || '(none)'}` }
      ]
    });
    const raw = resp.choices?.[0]?.message?.content || '{}';
    const obj = JSON.parse(raw);
    if (!obj.category) return null;
    return { category: obj.category, subcategory: obj.subcategory || '' };
  } catch (err) {
    console.warn('[ai] classify failed:', err.message);
    return null;
  }
}

module.exports = { isEnabled, summarizeArticle, classifyCategory };

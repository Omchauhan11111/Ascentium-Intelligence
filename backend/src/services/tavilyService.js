/**
 * Tavily search service.
 * Docs: https://docs.tavily.com
 *
 * If TAVILY_API_KEY is not set, `isEnabled()` returns false and callers
 * should fall back to whatever default they prefer.
 */
const axios = require('axios');

function isEnabled() {
  return !!process.env.TAVILY_API_KEY;
}

/**
 * Run a Tavily search.
 *
 * @param {string} query
 * @param {object} opts { maxResults, includeDomains, excludeDomains }
 * @returns {Promise<Array<{ title, url, snippet, score }>>}
 */
async function search(query, opts = {}) {
  if (!isEnabled()) throw new Error('Tavily not configured');

  const body = {
    api_key: process.env.TAVILY_API_KEY,
    query,
    search_depth: 'basic',
    max_results: opts.maxResults || 5,
    include_answer: false,
    include_domains: opts.includeDomains || [],
    exclude_domains: opts.excludeDomains || []
  };

  const { data } = await axios.post('https://api.tavily.com/search', body, {
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' }
  });

  return (data.results || []).map((r) => ({
    title: r.title || '',
    url: r.url || '',
    snippet: r.content || '',
    score: typeof r.score === 'number' ? Math.round(r.score * 100) : 0
  }));
}

/**
 * Score how relevant a given title/snippet is to Ascentium's service area.
 * Returns a 0-100 score.
 *
 * If Tavily is disabled, returns 0 (relevance simply unknown).
 */
async function relevanceScore(text) {
  if (!isEnabled() || !text) return 0;
  try {
    const results = await search(`Ascentium Singapore corporate services ${text.slice(0, 80)}`, {
      maxResults: 1
    });
    return results[0]?.score || 0;
  } catch (_e) {
    return 0;
  }
}

module.exports = { isEnabled, search, relevanceScore };

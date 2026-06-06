/**
 * ASCENTIUM SERVICES TAXONOMY
 * ---------------------------
 * Verified from https://www.ascentium.com (main navigation).
 *
 *  - 9 main categories (the "pillars")
 *  - 38 sub-categories
 *  - Each sub-category has search keywords used by the scraper / category matcher.
 *
 * This is the single source of truth. Backend uses it for category-matching,
 * the frontend imports the same shape (via API) for filter dropdowns.
 */

const CATEGORIES = {
  'Corporate': {
    keywords: ['corporate services', 'corporate secretarial', 'company registration', 'business entity'],
    subcategories: {
      'Incorporation & Business Formation': ['incorporation', 'company formation', 'business formation', 'company registration', 'business registration', 'set up company', 'pte ltd', 'acra registration'],
      'Company Secretarial & Compliance': ['company secretary', 'corporate secretarial', 'corporate governance', 'annual return', 'agm', 'board resolution', 'statutory compliance'],
      'Trademark, Licenses, Copyright': ['trademark', 'copyright', 'intellectual property', 'ip registration', 'ipos', 'patent', 'license registration', 'business licence'],
      'Share Registry': ['share registry', 'shareholder', 'share transfer', 'share allotment', 'cap table', 'share certificate'],
      'Entity Management': ['entity management', 'subsidiary management', 'holding company', 'group structure', 'corporate structure']
    }
  },
  'Accounting and Tax': {
    keywords: ['accounting', 'tax', 'iras', 'gst', 'income tax', 'bookkeeping'],
    subcategories: {
      'Accounting & Finance': ['accounting', 'bookkeeping', 'financial statements', 'management accounts', 'xbrl', 'finance outsourcing'],
      'Tax Filing & Compliance': ['tax filing', 'tax return', 'corporate tax', 'income tax filing', 'iras filing', 'tax compliance', 'estimated chargeable income', 'eci'],
      'Tax Advisory': ['tax advisory', 'tax planning', 'tax structuring', 'tax strategy', 'tax optimization'],
      'Indirect Tax': ['gst', 'goods and services tax', 'indirect tax', 'vat', 'sales tax', 'gst registration', 'gst return'],
      'Transfer Pricing': ['transfer pricing', 'tp documentation', 'related party transactions', 'arm length', 'beps'],
      'Government Incentive Plans': ['government incentive', 'tax incentive', 'edb incentive', 'pioneer status', 'development expansion incentive', 'productivity grant', 'enterprise singapore grant']
    }
  },
  'Risk Assurance & Audit': {
    keywords: ['audit', 'assurance', 'risk', 'internal controls'],
    subcategories: {
      'Operation Risk Management': ['operational risk', 'risk management', 'enterprise risk', 'risk assessment', 'business continuity'],
      'Internal Audit Assurance': ['internal audit', 'audit assurance', 'audit committee', 'sox compliance', 'control testing'],
      'Compliance & Governance Solutions': ['compliance', 'governance', 'aml', 'kyc', 'anti-money laundering', 'due diligence', 'regulatory compliance']
    }
  },
  'Cross Border & FDI': {
    keywords: ['cross border', 'fdi', 'foreign direct investment', 'market entry'],
    subcategories: {
      'Cross-Border Compliance': ['cross border compliance', 'cross-border', 'international compliance', 'cross border tax', 'multi-jurisdiction'],
      'China ODI & Circular 37': ['china odi', 'outbound direct investment', 'circular 37', 'safe registration', 'china outbound'],
      'UAE Free Zone and Mainland': ['uae free zone', 'uae mainland', 'dubai company', 'adgm', 'difc', 'dmcc', 'jafza']
    }
  },
  'Fiduciary': {
    keywords: ['fiduciary', 'trust', 'fund', 'offshore'],
    subcategories: {
      'Fiduciary Corporate Services': ['offshore company', 'bvi company', 'cayman company', 'offshore incorporation', 'fiduciary services'],
      'Trust Services': ['trust', 'trustee', 'trust fund', 'asset protection', 'family trust', 'trust administration'],
      'Economic Substance': ['economic substance', 'substance requirements', 'crs', 'fatca', 'es law'],
      'Fiduciary Compliance Solutions': ['fiduciary compliance', 'aeoi', 'common reporting standard', 'beneficial ownership']
    }
  },
  'Funds': {
    keywords: ['fund', 'vcc', 'fund administration', 'asset management'],
    subcategories: {
      'Fund Administration': ['fund administration', 'fund admin', 'nav calculation', 'fund accounting', 'investor services'],
      'Fund Governance': ['fund governance', 'fund director', 'fund oversight', 'investment committee'],
      'Fund Compliance': ['fund compliance', 'aifmd', 'mas regulation fund', 'fund reporting'],
      'Fund Corporate Services': ['vcc', 'variable capital company', 'fund incorporation', 'fund setup', 'fund vehicle']
    }
  },
  'HR & Payroll': {
    keywords: ['hr', 'payroll', 'employment', 'recruitment'],
    subcategories: {
      'PEO & EOR Services': ['employer of record', 'eor', 'peo', 'professional employer', 'global employment'],
      'Global Immigration Services': ['immigration', 'work pass', 'employment pass', 'ep application', 's pass', 'work permit', 'dependant pass'],
      'Outplacement': ['outplacement', 'career transition', 'redundancy support', 'separation services'],
      'Statement of Work (SOW)': ['statement of work', 'sow', 'contractor management'],
      'Recruitment': ['recruitment', 'hiring', 'talent acquisition', 'staffing', 'executive search', 'headhunting'],
      'Payroll Outsourcing': ['payroll outsourcing', 'salary processing', 'payslip', 'cpf', 'central provident fund', 'payroll services'],
      'Multi-Country Payroll': ['multi country payroll', 'global payroll', 'international payroll', 'cross border payroll'],
      'Links One': ['links one', 'hr technology', 'hr platform', 'hr software']
    }
  },
  'Private Client': {
    keywords: ['private client', 'high net worth', 'hnwi', 'family office', 'wealth'],
    subcategories: {
      'Private Client Services': ['private client', 'high net worth', 'hnwi', 'uhnwi', 'family office', 'private wealth'],
      'Private Trust Services': ['private trust', 'family trust', 'personal trust', 'discretionary trust', 'purpose trust'],
      'Private Economic Substance': ['private economic substance', 'personal substance'],
      'Private Corporate Services': ['private holding', 'spv', 'personal holding company', 'nominee director', 'nominee shareholder']
    }
  },
  'Advisory': {
    keywords: ['advisory', 'consulting', 'consultancy', 'esg', 'm&a'],
    subcategories: {
      'ESG & Compliance': ['esg', 'sustainability', 'green finance', 'climate risk', 'carbon', 'net zero', 'sustainability reporting'],
      'Business Consultancy': ['business consultancy', 'management consulting', 'business advisory', 'strategy consulting'],
      'Financial Advisory': ['financial advisory', 'financial planning', 'corporate finance', 'capital raising', 'ipo', 'fundraising'],
      'M&A Advisory': ['merger', 'acquisition', 'm&a', 'takeover', 'buyout', 'deal advisory', 'valuation'],
      'Insolvency/Liquidation': ['insolvency', 'liquidation', 'winding up', 'bankruptcy', 'judicial management', 'debt restructuring'],
      'Business Intelligence Playbook': ['business intelligence', 'market intelligence', 'competitive intelligence', 'market research']
    }
  }
};

/**
 * Returns a flat array: [{ category, subcategory, keywords }]
 * Useful for iterating during scraping.
 */
function flatten() {
  const list = [];
  for (const [cat, val] of Object.entries(CATEGORIES)) {
    for (const [sub, kws] of Object.entries(val.subcategories)) {
      list.push({ category: cat, subcategory: sub, keywords: kws });
    }
  }
  return list;
}

/**
 * Returns the API shape sent to the frontend filter dropdowns.
 */
function asTree() {
  const out = {};
  for (const [cat, val] of Object.entries(CATEGORIES)) {
    out[cat] = Object.keys(val.subcategories);
  }
  return out;
}

/**
 * Rule-based category matcher.
 * Given a piece of text, return { category, subcategory, score }.
 * Score = number of keyword matches.
 */
function matchCategory(text) {
  if (!text || typeof text !== 'string') {
    return { category: 'General', subcategory: null, score: 0 };
  }
  const t = text.toLowerCase();
  let best = { category: 'General', subcategory: null, score: 0 };

  for (const [cat, val] of Object.entries(CATEGORIES)) {
    for (const [sub, kws] of Object.entries(val.subcategories)) {
      let score = 0;
      for (const kw of kws) {
        if (t.includes(kw.toLowerCase())) score++;
      }
      // pillar-level keywords also nudge the score
      for (const kw of val.keywords) {
        if (t.includes(kw.toLowerCase())) score += 0.5;
      }
      if (score > best.score) {
        best = { category: cat, subcategory: sub, score };
      }
    }
  }
  return best;
}

module.exports = { CATEGORIES, flatten, asTree, matchCategory };

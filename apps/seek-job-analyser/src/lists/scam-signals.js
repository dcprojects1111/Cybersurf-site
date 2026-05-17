// scam-signals.js — patterns that correlate with recruitment scams.
// Hits are weighted differently in scam.js — these are the raw detectors.

export const UPFRONT_PAYMENT_PATTERNS = [
  /training fee/i,
  /registration fee/i,
  /application fee/i,
  /processing fee/i,
  /pay\s+(a|an|the)?\s*(small\s+)?fee/i,
  /you\s+will\s+need\s+to\s+pay/i,
  /equipment\s+(deposit|payment|fee)/i,
  /background\s+check\s+fee/i,
];

export const SENSITIVE_DOC_PATTERNS = [
  /\bTFN\b/,
  /tax file number/i,
  /\bdriver'?s?\s+licen[cs]e\s+(number|copy|details)/i,
  /\bpassport\s+(copy|number|scan|details)/i,
  /bank\s+(account|details|info)/i,
  /BSB\b/,
  /credit\s+card\s+(details|number|copy)/i,
  /medicare\s+(card|number)/i,
  /\bID\s+(copy|scan|photo)/i,
];

export const SUSPICIOUS_CONTACT_PATTERNS = [
  /whatsapp/i,
  /telegram/i,
  /\bwa\.me\//i,
  /t\.me\//i,
  /signal\s+app/i,
  /text\s+\+?\d{6,}/i,
  /sms\s+\+?\d{6,}/i,
];

// Generic, easily-impersonated email providers in apply links
export const GENERIC_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
];

export const TOO_GOOD_PATTERNS = [
  /no experience\s+(necessary|needed|required)/i,
  /work from home.{0,40}\$\d/i,
  /earn\s+\$?\d{3,}\s*(per|\/|a)\s*(day|week|hour)/i,
  /\$\d{2,5}\s*(per|\/|a)\s*week.{0,40}(no experience|easy|simple|part.?time)/i,
  /quick\s+cash/i,
  /immediate\s+start.{0,30}no experience/i,
  /guaranteed\s+income/i,
  /be your own boss/i,
];

export const GENERIC_TITLES = [
  /^data entry( specialist)?$/i,
  /^online assistant$/i,
  /^personal assistant$/i,
  /^admin assistant$/i,
  /^customer support agent$/i,
  /^survey taker$/i,
  /^package handler$/i,
  /^mystery shopper$/i,
];

export function matchAny(patterns, text) {
  if (!text) return [];
  const out = [];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) out.push(m[0]);
  }
  return out;
}

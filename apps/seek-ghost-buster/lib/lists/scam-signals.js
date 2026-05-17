// scam-signals.js — regex patterns that correlate with recruitment scams.
(function () {
  window.__SGB = window.__SGB || {};
  window.__SGB.lists = window.__SGB.lists || {};
  window.__SGB.lists.scamSignals = {
    upfrontPayment: [
      /training fee/i,
      /registration fee/i,
      /application fee/i,
      /processing fee/i,
      /pay\s+(?:a|an|the)?\s*(?:small\s+)?fee/i,
      /you\s+will\s+need\s+to\s+pay/i,
      /equipment\s+(?:deposit|payment|fee)/i,
      /background\s+check\s+fee/i
    ],
    sensitiveDocs: [
      /\bTFN\b/,
      /tax file number/i,
      /\bdriver'?s?\s+licen[cs]e\s+(?:number|copy|details)/i,
      /\bpassport\s+(?:copy|number|scan|details)/i,
      /bank\s+(?:account|details|info)/i,
      /\bBSB\b/,
      /credit\s+card\s+(?:details|number|copy)/i,
      /medicare\s+(?:card|number)/i,
      /\bID\s+(?:copy|scan|photo)/i
    ],
    suspiciousContact: [
      /whatsapp/i,
      /telegram/i,
      /\bwa\.me\//i,
      /t\.me\//i,
      /signal\s+app/i,
      /text\s+\+?\d{6,}/i,
      /sms\s+\+?\d{6,}/i
    ],
    tooGood: [
      /no experience\s+(?:necessary|needed|required)/i,
      /work from home.{0,40}\$\d/i,
      /earn\s+\$?\d{3,}\s*(?:per|\/|a)\s*(?:day|week|hour)/i,
      /\$\d{2,5}\s*(?:per|\/|a)\s*week.{0,40}(?:no experience|easy|simple|part.?time)/i,
      /quick\s+cash/i,
      /immediate\s+start.{0,30}no experience/i,
      /guaranteed\s+income/i,
      /be your own boss/i
    ],
    genericTitles: [
      /^data entry( specialist)?$/i,
      /^online assistant$/i,
      /^personal assistant$/i,
      /^admin(?:istrative)? assistant$/i,
      /^customer support agent$/i,
      /^survey taker$/i,
      /^package handler$/i,
      /^mystery shopper$/i,
      /^remote (?:assistant|worker|agent)$/i
    ],
    genericEmailDomains: [
      "gmail.com",
      "yahoo.com",
      "hotmail.com",
      "outlook.com",
      "live.com",
      "icloud.com",
      "proton.me",
      "protonmail.com",
      "aol.com"
    ]
  };
})();

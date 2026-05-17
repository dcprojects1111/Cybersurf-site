// ghost-keywords.js — phrases that strongly indicate a non-active hire.
// These are the killer signals from research:
//   "Expression of Interest" / "EOI"  — pipeline-building, no role to fill
//   "Talent Pool" / "Talent Community" — same, but rebranded
//   "Future Opportunities"            — recruiter window dressing
//   "Evergreen role"                  — explicitly always open
//   "Pipeline role"                   — explicitly placeholder
//   "General Application"             — bucket post, not a real ad
//
// A single hit here is worth +40 points to the ghost score.
(function () {
  window.__SGB = window.__SGB || {};
  window.__SGB.lists = window.__SGB.lists || {};
  window.__SGB.lists.ghostKeywords = [
    "expression of interest",
    "EOI",
    "talent pool",
    "talent community",
    "talent network",
    "future opportunities",
    "future opportunity",
    "future opening",
    "future openings",
    "pipeline role",
    "pipelining",
    "general application",
    "evergreen role",
    "evergreen opportunity",
    "register your interest",
    "express your interest",
    "talent pipeline",
    "we are always looking",
    "ongoing recruitment",
    "ongoing applications"
  ];
})();

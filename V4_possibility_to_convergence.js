// NEXUS V4 — Possibility Convergence Layer
// Turns two analyses into explicit shared possibilities without claiming intent.
(function (global) {
  'use strict';

  const N = global.NEXUS = global.NEXUS || {};

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function text(item) {
    if (typeof item === 'string') return item;
    return item?.value || item?.label || item?.name || '';
  }

  function key(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function related(a, b) {
    const x = key(a), y = key(b);
    return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
  }

  function pairs(left, right, type, rationale) {
    const out = [];
    list(left).forEach(l => list(right).forEach(r => {
      const lv = text(l), rv = text(r);
      if (related(lv, rv)) out.push({ type, left: lv, right: rv, rationale });
    }));
    return out;
  }

  function generate(a, b) {
    const matches = [
      ...pairs(a?.needs, b?.capacities, 'need-capacity', 'Le besoin exprimé par A recoupe une capacité identifiée chez B.'),
      ...pairs(b?.needs, a?.capacities, 'need-capacity', 'Le besoin exprimé par B recoupe une capacité identifiée chez A.'),
      ...pairs(a?.needs, b?.resources, 'need-resource', 'Une ressource identifiée chez B peut potentiellement répondre au besoin de A.'),
      ...pairs(b?.needs, a?.resources, 'need-resource', 'Une ressource identifiée chez A peut potentiellement répondre au besoin de B.')
    ];

    return {
      version: '4.1',
      status: matches.length ? 'possibility_emerged' : 'no_evidence',
      possibilities: matches.map((m, i) => ({
        id: `convergence-${i + 1}`,
        type: m.type,
        proposition: `${m.left} ↔ ${m.right}`,
        rationale: m.rationale,
        confidence: Math.min(90, 50 + matches.length * 10),
        requiresConfirmation: true,
        reversible: true
      })),
      principle: 'Une possibilité émergente n’est ni une intention, ni un match social, ni une recommandation obligatoire.'
    };
  }

  N.PossibilityConvergenceV4 = { generate };
})(typeof window !== 'undefined' ? window : globalThis);

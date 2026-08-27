// NEXUS V4 — Explainable Convergence Engine
// A convergence is a possibility to explore, never a claim about people.
(function (global) {
  'use strict';
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const values = list => (Array.isArray(list) ? list : []).map(x => norm(typeof x === 'string' ? x : x?.value)).filter(Boolean);
  const overlap = (a, b) => a.some(x => b.some(y => x === y || x.includes(y) || y.includes(x)));
  const collect = (a, key) => values(a?.[key]);

  function compare(a, b) {
    const A = a || {}, B = b || {};
    const needsA = collect(A, 'needs'), needsB = collect(B, 'needs');
    const capsA = collect(A, 'capacities'), capsB = collect(B, 'capacities');
    const resA = collect(A, 'resources'), resB = collect(B, 'resources');
    const matches = [];
    if (overlap(needsA, capsB)) matches.push({ from: 'A', type: 'need-capacity', reason: 'A exprime un besoin qui recoupe une capacité de B.' });
    if (overlap(needsB, capsA)) matches.push({ from: 'B', type: 'need-capacity', reason: 'B exprime un besoin qui recoupe une capacité de A.' });
    if (overlap(needsA, resB)) matches.push({ from: 'A', type: 'need-resource', reason: 'Une ressource de B peut potentiellement répondre au besoin de A.' });
    if (overlap(needsB, resA)) matches.push({ from: 'B', type: 'need-resource', reason: 'Une ressource de A peut potentiellement répondre au besoin de B.' });
    return { version: '4.0', status: matches.length ? 'possible' : 'none_detected', score: Math.min(100, matches.length * 25), matches, uncertainty: matches.length ? 35 : 65, principle: 'La convergence est une possibilité à confirmer, pas une intention attribuée.' };
  }
  global.NEXUS = global.NEXUS || {};
  global.NEXUS.ConvergenceEngineV4 = { compare };
})(typeof window !== 'undefined' ? window : globalThis);

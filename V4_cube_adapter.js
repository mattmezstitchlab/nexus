// NEXUS V4 — Cube Adapter
// Converts the V4 semantic analysis into a stable visual state for the cube.
// This layer intentionally does not reinterpret intent; it only maps analysis -> visual dimensions.
(function (global) {
  'use strict';

  const clamp = n => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

  function toCubeState(analysis) {
    const d = analysis?.dimensions || {};
    const u = analysis?.uncertainty || {};
    const intention = analysis?.intention || {};
    return {
      version: '4.0',
      dimensions: {
        besoin: clamp(d.need),
        ressource: clamp(d.resource),
        capacite: clamp(d.capacity),
        contexte: clamp(d.context),
        temporalite: clamp(d.temporality),
        incertitude: clamp(d.uncertainty ?? u.overall),
        possibilite: clamp(d.possibility)
      },
      intention: {
        status: intention.status || 'unknown',
        candidates: intention.candidates || []
      },
      possibilities: (analysis?.possibilities || []).map(p => ({
        label: p.value,
        confidence: clamp(p.confidence),
        rationale: p.rationale,
        reversible: p.reversible !== false
      })),
      visualMode: intention.status === 'unknown' ? 'exploration' : 'directed',
      uncertainty: clamp(u.overall)
    };
  }

  const api = global.NEXUS = global.NEXUS || {};
  api.CubeAdapterV4 = { toCubeState };
})(typeof window !== 'undefined' ? window : globalThis);

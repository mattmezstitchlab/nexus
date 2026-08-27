// NEXUS V4 — Convergence Engine
// Finds complementary possibilities between two structured situations.
// Never treats similarity alone as a match and never invents willingness.
(function (global) {
  'use strict';

  const clamp = n => Math.max(0, Math.min(100, Math.round(n)));

  class NEXUSV4ConvergenceEngine {
    compare(a, b) {
      const left = a || {};
      const right = b || {};
      const possibilities = [];

      const needs = this._values(left.needs);
      const resources = this._values(left.resources);
      const capacities = this._values(left.capacities);
      const rightNeeds = this._values(right.needs);
      const rightResources = this._values(right.resources);
      const rightCapacities = this._values(right.capacities);

      const add = (type, score, rationale, leftEvidence, rightEvidence) => {
        if (score < 30) return;
        possibilities.push({
          type,
          score: clamp(score),
          rationale,
          evidence: { left: leftEvidence, right: rightEvidence },
          status: 'possible',
          requiresConfirmation: true
        });
      };

      // Need ↔ capacity/resource complementarity.
      if (needs.length && (rightCapacities.length || rightResources.length)) {
        add('need_capacity', 62, 'Une situation exprime un besoin potentiel et l’autre expose une capacité ou une ressource compatible. Compatibilité sémantique à confirmer.', needs, [...rightCapacities, ...rightResources]);
      }
      if (rightNeeds.length && (capacities.length || resources.length)) {
        add('capacity_need', 62, 'Une situation expose une capacité ou une ressource et l’autre exprime un besoin potentiel. Compatibilité sémantique à confirmer.', [...capacities, ...resources], rightNeeds);
      }

      // Availability strengthens, but never creates, a match.
      const leftSoon = this._temporal(left, ['now', 'soon']);
      const rightSoon = this._temporal(right, ['now', 'soon']);
      if (leftSoon && rightSoon && possibilities.length) {
        possibilities.forEach(p => { p.score = clamp(p.score + 12); p.rationale += ' Les horizons temporels sont compatibles.'; });
      }

      // Unknown intentions reduce certainty instead of blocking exploration.
      const uncertaintyPenalty = (this._uncertainty(left) + this._uncertainty(right)) / 4;
      possibilities.forEach(p => p.score = clamp(p.score - uncertaintyPenalty));

      const best = possibilities.sort((x, y) => y.score - x.score)[0] || null;
      return {
        version: '4.0',
        status: best ? 'possible_convergence' : 'no_convergence_found',
        confidence: best ? best.score : 0,
        best,
        possibilities,
        principle: 'complementarity_not_similarity',
        requiresUserConfirmation: Boolean(best)
      };
    }

    _values(items) {
      return Array.isArray(items) ? items.map(x => typeof x === 'string' ? x : x && x.value).filter(Boolean) : [];
    }

    _temporal(a, horizons) {
      return Boolean(a.temporality && horizons.includes(a.temporality.horizon));
    }

    _uncertainty(a) {
      return Number(a.uncertainty && a.uncertainty.overall) || 0;
    }
  }

  const api = global.NEXUS = global.NEXUS || {};
  api.ConvergenceEngineV4 = new NEXUSV4ConvergenceEngine();
  api.compareV4 = (a, b) => api.ConvergenceEngineV4.compare(a, b);
  api.NEXUSV4ConvergenceEngine = NEXUSV4ConvergenceEngine;
})(typeof window !== 'undefined' ? window : globalThis);

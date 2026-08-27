// NEXUS V4 — Constellation Adapter
// Projects semantic analysis into people/resource nodes and evidence-based links.
(function (global) {
  'use strict';

  const clamp = n => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  const hash = value => String(value || '').split('').reduce((n, c) => ((n << 5) - n + c.charCodeAt(0)) | 0, 0);
  const initials = value => String(value || 'NEXUS').trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();

  function avatarFor(value, type) {
    const seed = Math.abs(hash(value));
    const hue = seed % 360;
    return { initials: initials(value), hue, type };
  }

  function node(id, label, type, confidence, meta = {}) {
    return { id, label, type, confidence: clamp(confidence), avatar: avatarFor(label, type), ...meta };
  }

  function toConstellation(analysis, cubeState) {
    const nodes = [];
    const links = [];
    const rootId = 'situation';
    nodes.push(node(rootId, 'Situation', 'core', 100, { uncertainty: cubeState?.uncertainty || 0 }));

    (analysis?.resources || []).forEach((x, i) => {
      const id = `resource-${i}`;
      nodes.push(node(id, x.value, 'resource', x.confidence));
      links.push({ from: rootId, to: id, type: 'available_resource', confidence: x.confidence });
    });

    (analysis?.capacities || []).forEach((x, i) => {
      const id = `capacity-${i}`;
      nodes.push(node(id, x.value, 'capacity', x.confidence));
      links.push({ from: rootId, to: id, type: 'known_capacity', confidence: x.confidence });
    });

    (analysis?.situation?.context || []).forEach((x, i) => {
      const id = `context-${i}`;
      nodes.push(node(id, x.value, 'context', x.confidence));
      links.push({ from: rootId, to: id, type: 'context', confidence: x.confidence });
    });

    (analysis?.possibilities || []).slice(0, 5).forEach((x, i) => {
      const id = `possibility-${i}`;
      nodes.push(node(id, x.value, 'possibility', x.confidence, { rationale: x.rationale, reversible: x.reversible !== false }));
      links.push({ from: rootId, to: id, type: 'possible', confidence: x.confidence, dashed: true });
    });

    return {
      version: '4.0',
      nodes,
      links,
      mode: cubeState?.visualMode || 'exploration',
      uncertainty: cubeState?.uncertainty || 0
    };
  }

  const api = global.NEXUS = global.NEXUS || {};
  api.ConstellationAdapterV4 = { toConstellation };
})(typeof window !== 'undefined' ? window : globalThis);

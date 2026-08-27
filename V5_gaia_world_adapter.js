// NEXUS V5 — GAÏA World Model Adapter
// Pure adapter: no Base44, no network, no persistence. Converts a GAÏA world JSON
// into the NEXUS constellation contract while preserving real entities/relations.
(function (global) {
  'use strict';
  const api = global.NEXUS = global.NEXUS || {};
  const clamp = n => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
  const hash = value => String(value || '').split('').reduce((n, c) => ((n << 5) - n + c.charCodeAt(0)) | 0, 0);
  const initials = value => String(value || 'N').trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  const avatarFor = (label, type) => ({ initials: initials(label), hue: Math.abs(hash(label)) % 360, type });

  function node(id, label, type, meta = {}) {
    return { id, label: label || id, type: type || 'entity', confidence: 100, avatar: avatarFor(label || id, type), ...meta };
  }

  function relationLabel(relation) {
    return relation.description || relation.relation_type || 'relation';
  }

  function toWorldConstellation(world, analysis = null, cubeState = null, options = {}) {
    const nodes = [];
    const links = [];
    const entities = world?.entities || [];
    const relations = world?.relations || [];
    const blocks = world?.blocks || [];
    const constraints = world?.constraints || [];
    const scenarios = world?.scenarios || [];
    const rootId = `world:${world?.id || 'local'}`;

    nodes.push(node(rootId, world?.name || 'GAÏA', 'world', {
      root: true,
      health: world?.health || null,
      uncertainty: cubeState?.uncertainty || 0
    }));

    const entityIds = new Set(entities.map(e => String(e.id)));
    entities.forEach(e => {
      const id = `entity:${e.id}`;
      const ownBlock = blocks.find(b => String(b.entity_id) === String(e.id));
      const entityConstraints = constraints.filter(c => String(c.entity_id) === String(e.id));
      nodes.push(node(id, e.name || e.label || e.id, e.entity_type || 'entity', {
        entityId: e.id,
        role: e.role,
        status: e.status,
        image: e.image || e.avatar_url || e.photo_url,
        start_time: ownBlock?.start_time || null,
        end_time: ownBlock?.end_time || null,
        constraintCount: entityConstraints.length,
        focused: options.focusEntityId != null && String(options.focusEntityId) === String(e.id)
      }));
      links.push({ from: rootId, to: id, type: 'contains', confidence: 100 });
    });

    relations.forEach(r => {
      if (!entityIds.has(String(r.from_entity_id)) || !entityIds.has(String(r.to_entity_id))) return;
      links.push({
        from: `entity:${r.from_entity_id}`,
        to: `entity:${r.to_entity_id}`,
        type: r.relation_type || 'related',
        label: relationLabel(r),
        strength: r.strength || 'normal',
        confidence: 100,
        dashed: false
      });
    });

    // Constraints become a visual tension layer, not new fake people.
    constraints.forEach(c => {
      if (!entityIds.has(String(c.entity_id))) return;
      const id = `constraint:${c.id}`;
      nodes.push(node(id, c.description || 'Contrainte', 'constraint', {
        status: c.status || 'unknown',
        severity: c.severity || 'important',
        time_value: c.time_value || null,
        confidence: c.status === 'violated' ? 100 : 90
      }));
      links.push({
        from: `entity:${c.entity_id}`,
        to: id,
        type: 'constraint',
        label: c.status || 'unknown',
        dashed: true,
        confidence: 100
      });
    });

    // Scenarios are possibilities: they are deliberately dashed and reversible.
    scenarios.forEach(s => {
      const id = `scenario:${s.id}`;
      nodes.push(node(id, s.title || 'Scénario', 'scenario', {
        status: s.status,
        result_type: s.result_type,
        reversible: true
      }));
      links.push({ from: rootId, to: id, type: 'scenario', dashed: true, confidence: 100 });
    });

    // Keep NEXUS possibility intelligence alongside the real world when available.
    (analysis?.possibilities || []).slice(0, 5).forEach((p, i) => {
      const id = `possibility:${i}`;
      nodes.push(node(id, p.value, 'possibility', {
        confidence: clamp(p.confidence),
        rationale: p.rationale,
        reversible: p.reversible !== false
      }));
      links.push({ from: rootId, to: id, type: 'possible', confidence: clamp(p.confidence), dashed: true });
    });

    return {
      version: '5.0',
      source: 'gaia-world-model',
      world: { id: world?.id || null, name: world?.name || 'GAÏA', health: world?.health || null },
      nodes,
      links,
      mode: cubeState?.visualMode || 'world',
      uncertainty: cubeState?.uncertainty || 0
    };
  }

  api.GaiaWorldAdapterV5 = { toWorldConstellation };
})(typeof window !== 'undefined' ? window : globalThis);

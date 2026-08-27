// NEXUS V4 — GAÏA World Adapter
// Bridges the GAÏA World Model to the NEXUS constellation without changing either engine.
(function (global) {
  'use strict';

  const hash = value => String(value || '').split('').reduce((n, c) => ((n << 5) - n + c.charCodeAt(0)) | 0, 0);
  const initials = value => String(value || 'NEXUS').trim().split(/\s+/).slice(0, 2).map(x => x[0]).join('').toUpperCase();
  const hueFor = value => Math.abs(hash(value)) % 360;
  const clamp = n => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));

  const PERSON_TYPES = new Set(['person', 'guest', 'couple', 'family', 'friend']);
  const CORE_TYPES = new Set(['person', 'guest', 'couple']);

  function nodeFor(entity, rootId) {
    const type = PERSON_TYPES.has(entity.entity_type) ? 'person' : (entity.entity_type || 'entity');
    return {
      id: String(entity.id),
      label: entity.name || 'Sans nom',
      type,
      confidence: 100,
      avatar: { initials: initials(entity.name), hue: hueFor(entity.id || entity.name), type },
      meta: entity.meta || entity.attributes || {},
      root: String(entity.id) === String(rootId)
    };
  }

  function relationLabel(type) {
    const map = {
      family: 'famille', parent_of: 'parent', partner_of: 'partenaire', friend_of: 'ami',
      knows: 'connaît', conflict_with: 'tension', seated_with: 'à table avec',
      must_precede: 'précède', depends_on: 'dépend de', requires: 'requiert',
      uses: 'utilise', invited_by: 'invité par', related_to: 'lié à'
    };
    return map[type] || type || 'lié à';
  }

  function toWorldConstellation(world, analysis, cubeState, options = {}) {
    const entities = Array.isArray(world?.entities) ? world.entities : [];
    const relations = Array.isArray(world?.relations) ? world.relations : [];
    const requestedRoot = options.focusEntityId || world?.focus_entity_id || entities.find(e => CORE_TYPES.has(e.entity_type))?.id || entities[0]?.id;
    const rootId = requestedRoot ? String(requestedRoot) : 'situation';
    const nodes = [];
    const links = [];

    if (!entities.length) {
      nodes.push({ id: 'situation', label: 'Situation', type: 'core', confidence: 100, avatar: { initials: 'NX', hue: 220, type: 'core' }, root: true });
    } else {
      entities.forEach(e => nodes.push(nodeFor(e, rootId)));
    }

    relations.forEach((r, i) => {
      const from = r.from_entity_id != null ? String(r.from_entity_id) : String(r.from || '');
      const to = r.to_entity_id != null ? String(r.to_entity_id) : String(r.to || '');
      if (!from || !to || from === to) return;
      links.push({
        id: r.id || `relation-${i}`, from, to,
        type: r.relation_type || 'related_to', label: relationLabel(r.relation_type),
        confidence: clamp(r.confidence ?? (r.strength === 'critical' ? 95 : r.strength === 'important' ? 80 : 65)),
        dashed: false, worldRelation: true
      });
    });

    // Semantic possibilities are satellites of the focused person/situation and remain visually distinct.
    (analysis?.possibilities || []).slice(0, 4).forEach((p, i) => {
      const id = `possibility-${i}`;
      nodes.push({ id, label: p.value, type: 'possibility', confidence: clamp(p.confidence), avatar: { initials: initials(p.value), hue: hueFor(p.value), type: 'possibility' }, rationale: p.rationale, reversible: p.reversible !== false });
      links.push({ id: `possible-${i}`, from: rootId, to: id, type: 'possible', label: 'possible', confidence: clamp(p.confidence), dashed: true, possibility: true });
    });

    return {
      version: '4.0-world',
      world: { id: world?.id, name: world?.name || 'Mon monde' },
      focusId: rootId,
      nodes, links,
      mode: cubeState?.visualMode || 'exploration',
      uncertainty: cubeState?.uncertainty || 0,
      rules: { solid: 'relation réelle du World Model', dashed: 'possibilité — non intentionnelle' }
    };
  }

  const api = global.NEXUS = global.NEXUS || {};
  api.GaiaWorldAdapterV4 = { toWorldConstellation };
})(typeof window !== 'undefined' ? window : globalThis);

// NEXUS V5 — GAÏA Live Bridge
// Loads a real GAÏA World Model and converts it into the NEXUS constellation contract.
(function (global) {
  'use strict';
  const api = global.NEXUS = global.NEXUS || {};

  function normalizePayload(payload) {
    const data = payload && payload.world ? payload : (payload || {});
    return {
      id: data.world?.id || data.id,
      name: data.world?.name || data.name || 'Mon monde',
      entities: Array.isArray(data.entities) ? data.entities : [],
      relations: Array.isArray(data.relations) ? data.relations : [],
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      constraints: Array.isArray(data.constraints) ? data.constraints : [],
      scenarios: Array.isArray(data.scenarios) ? data.scenarios : [],
      health: data.world?.health || data.health || null
    };
  }

  async function callWorldEngine({ endpoint, worldId, fetchImpl = global.fetch }) {
    if (!endpoint) throw new Error('GAÏA endpoint manquant');
    if (!worldId) throw new Error('world_id manquant');
    if (!fetchImpl) throw new Error('fetch indisponible');
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'recalculate', world_id: worldId, source: 'nexus' })
    });
    if (!response.ok) throw new Error(`GAÏA World Engine: ${response.status}`);
    return response.json();
  }

  async function load({ endpoint, worldId, analysis, cubeState, fetchImpl, focusEntityId }) {
    const payload = await callWorldEngine({ endpoint, worldId, fetchImpl });
    const world = normalizePayload(payload);
    if (!api.GaiaWorldAdapterV4) throw new Error('GaiaWorldAdapterV4 indisponible');
    return api.GaiaWorldAdapterV4.toWorldConstellation(world, analysis, cubeState, { focusEntityId });
  }

  api.GaiaLiveBridgeV5 = { normalizePayload, callWorldEngine, load };
})(typeof window !== 'undefined' ? window : globalThis);

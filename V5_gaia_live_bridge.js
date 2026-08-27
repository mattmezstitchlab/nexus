// NEXUS V5 — GAÏA Live Bridge
// Provider-neutral. No Base44 dependency. Accepts a GAÏA World Model JSON
// from a local file, in-memory object, or any external HTTP adapter.
(function (global) {
  'use strict';
  const api = global.NEXUS = global.NEXUS || {};

  function normalizePayload(payload) {
    const data = payload && payload.world ? payload : (payload || {});
    return {
      id: data.world?.id || data.id || null,
      name: data.world?.name || data.name || 'Mon monde',
      entities: Array.isArray(data.entities) ? data.entities : [],
      relations: Array.isArray(data.relations) ? data.relations : [],
      blocks: Array.isArray(data.blocks) ? data.blocks : [],
      constraints: Array.isArray(data.constraints) ? data.constraints : [],
      scenarios: Array.isArray(data.scenarios) ? data.scenarios : [],
      health: data.world?.health || data.health || null
    };
  }

  function fromJson(payload, { analysis = null, cubeState = null, focusEntityId = null } = {}) {
    if (!api.GaiaWorldAdapterV5) throw new Error('GaiaWorldAdapterV5 indisponible');
    return api.GaiaWorldAdapterV5.toWorldConstellation(
      normalizePayload(payload), analysis, cubeState, { focusEntityId }
    );
  }

  async function fromUrl(url, options = {}) {
    const fetchImpl = options.fetchImpl || global.fetch;
    if (!url) throw new Error('GAÏA JSON URL manquante');
    if (!fetchImpl) throw new Error('fetch indisponible');
    const response = await fetchImpl(url, { headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`GAÏA JSON: ${response.status}`);
    return fromJson(await response.json(), options);
  }

  async function fromFile(file, options = {}) {
    if (!file || typeof file.text !== 'function') throw new Error('Fichier GAÏA JSON invalide');
    return fromJson(JSON.parse(await file.text()), options);
  }

  api.GaiaLiveBridgeV5 = { normalizePayload, fromJson, fromUrl, fromFile };
})(typeof window !== 'undefined' ? window : globalThis);

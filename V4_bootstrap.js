/* NEXUS V4 — browser integration bridge
 *
 * Loads the V4 engine namespace safely and exposes a stable API.
 * This bridge deliberately does not replace the legacy V3.1 engine.
 */
(function (global) {
  'use strict';

  function resolveEngineClass() {
    // V4_possibility_engine.js exports through global.NEXUS.
    if (global.NEXUS && global.NEXUS.NEXUSV4PossibilityEngine) {
      return global.NEXUS.NEXUSV4PossibilityEngine;
    }
    return global.NexusV4PossibilityEngine
      || global.NEXUS_V4_ENGINE
      || global.NexusV4Engine
      || null;
  }

  function create() {
    const Engine = resolveEngineClass();
    if (!Engine) {
      return {
        ready: false,
        version: '4.0.0',
        error: 'NEXUS V4 engine class is not loaded. Load V4_possibility_engine.js before this bridge.'
      };
    }

    const engine = new Engine();

    return {
      ready: true,
      version: engine.version || '4.0.0',
      engine,
      analyze(text) {
        return engine.analyze(text);
      },
      status() {
        return {
          bridge: 'ready',
          engineLoaded: true,
          version: engine.version || '4.0.0'
        };
      }
    };
  }

  global.NEXUS_V4 = {
    version: '4.0.0',
    create,
    analyze(text) {
      const instance = create();
      if (!instance.ready) return instance;
      return instance.analyze(text);
    },
    status() {
      const Engine = resolveEngineClass();
      return {
        bridge: 'ready',
        engineLoaded: !!Engine,
        version: '4.0.0'
      };
    }
  };
})(window);

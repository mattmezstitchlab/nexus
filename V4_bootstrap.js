/* NEXUS V4 — browser integration bridge
 *
 * This bridge deliberately does not replace the legacy V3.1 engine.
 * It exposes a stable browser API for the existing NEXUS page and keeps
 * semantic analysis separate from presentation until validation is complete.
 */
(function (global) {
  'use strict';

  function resolveEngine() {
    return global.NexusV4PossibilityEngine
      || global.NEXUS_V4_ENGINE
      || global.NexusV4Engine
      || null;
  }

  function create() {
    const Engine = resolveEngine();
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
      converge(left, right) {
        if (typeof engine.findConvergences !== 'function') {
          return {
            compatible: false,
            confidence: 0,
            matches: [],
            caution: 'Convergence engine unavailable.'
          };
        }
        return engine.findConvergences(left, right);
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
      const Engine = resolveEngine();
      return {
        bridge: 'ready',
        engineLoaded: !!Engine,
        version: '4.0.0'
      };
    }
  };
})(window);

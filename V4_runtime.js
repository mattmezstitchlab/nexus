/* NEXUS V4 — runtime loader / diagnostic
 * Safe to include after V4_possibility_engine.js and V4_bootstrap.js.
 * Provides a tiny DOM API for validating the semantic engine in any host page.
 */
(function (global) {
  'use strict';

  function analyze(text) {
    if (!global.NEXUS_V4 || typeof global.NEXUS_V4.analyze !== 'function') {
      throw new Error('NEXUS V4 bridge is not available.');
    }
    return global.NEXUS_V4.analyze(text);
  }

  function renderResult(result, target) {
    if (!target) return;
    target.textContent = JSON.stringify(result, null, 2);
  }

  function bind(options) {
    const config = options || {};
    const input = document.querySelector(config.input || '[data-nexus-input]');
    const output = document.querySelector(config.output || '[data-nexus-output]');
    const button = document.querySelector(config.button || '[data-nexus-analyze]');
    if (!input || !output || !button) return false;

    button.addEventListener('click', function () {
      try {
        renderResult(analyze(input.value), output);
      } catch (error) {
        renderResult({ error: error.message }, output);
      }
    });

    return true;
  }

  global.NEXUS_V4_RUNTIME = { analyze, bind, renderResult };
})(window);

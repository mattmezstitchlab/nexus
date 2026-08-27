// NEXUS V4 — Proof of Intelligence smoke tests
// Run in a browser after loading V4_possibility_engine.js, or adapt for a JS runtime.

(function (global) {
  const engine = global.NEXUS && global.NEXUS.PossibilityEngineV4;
  if (!engine) throw new Error('NEXUS V4 engine not loaded');

  const cases = [
    {
      input: "J'ai une chambre qui ne sert plus depuis que ma fille est partie.",
      mustBeUnknownIntent: true,
      forbidden: 'location'
    },
    {
      input: "J'ai plein de temps libre depuis ma retraite mais je ne sais pas quoi en faire.",
      mustBeUnknownIntent: true
    },
    {
      input: "Je ne connais personne ici et j'aimerais voir des gens samedi.",
      mustBeUnknownIntent: false,
      expectedHorizon: 'soon'
    },
    {
      input: "Je connais très bien Lille et je suis libre samedi.",
      mustBeUnknownIntent: true,
      expectedHorizon: 'soon'
    },
    {
      input: "J'ai une voiture et je suis libre samedi.",
      mustBeUnknownIntent: true,
      expectedHorizon: 'soon'
    },
    {
      input: "Je suis épuisé, j'ai juste envie de rentrer chez moi.",
      mustBeUnknownIntent: true,
      expectedHorizon: 'unknown'
    }
  ];

  const results = cases.map(test => {
    const result = engine.analyze(test.input);
    const failures = [];
    if (test.mustBeUnknownIntent && result.intention.status !== 'unknown') failures.push('intent_should_be_unknown');
    if (test.expectedHorizon && result.temporality.horizon !== test.expectedHorizon) failures.push(`horizon_expected_${test.expectedHorizon}`);
    if (test.forbidden && result.possibilities.some(p => p.value.toLowerCase().includes(test.forbidden))) failures.push(`forbidden_possibility_${test.forbidden}`);
    return { input: test.input, pass: failures.length === 0, failures, result };
  });

  const passed = results.filter(r => r.pass).length;
  global.NEXUS = global.NEXUS || {};
  global.NEXUS.V4Proof = { total: results.length, passed, failed: results.length - passed, results };
  console.table(results.map(r => ({ pass: r.pass, input: r.input, failures: r.failures.join(',') })));
})(typeof window !== 'undefined' ? window : globalThis);

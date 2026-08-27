# NEXUS V4 — Integration Plan

The existing `index.html` remains the visual source of truth for the current 3D experience. V4 engines are intentionally isolated first so the semantic model can be validated before altering the visual layer.

## Current modules

- `V3.1_engine.js`: legacy deterministic engine / existing experience.
- `V4_possibility_engine.js`: evidence-first situation analysis.
- `V4_convergence_engine.js`: complementary convergence between structured situations.

## Integration order

1. Load V4 engines without removing V3.1.
2. Add a compatibility adapter from existing input to `NEXUS.analyzeV4()`.
3. Run V3.1 and V4 side-by-side during validation.
4. Replace visual scores only after semantic outputs pass adversarial tests.
5. Connect cube dimensions to model dimensions.
6. Add multi-user convergence visualization last.

## Safety rule

No UI should imply that a possibility is an intention or that a compatibility score is a confirmed social match. Any convergence must remain explicitly provisional until the user confirms it.

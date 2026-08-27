# NEXUS V4 — Possibility Model

## Objective

Move NEXUS from a keyword-driven intent classifier toward a structured model that separates **what is said**, **what is inferred**, **what remains uncertain**, and **what becomes possible**.

## Pipeline

Expression → Compréhension → Situation → Besoin / Ressource / Capacité → Contraintes → Temporalité → Incertitude → Possibilités → Convergence → Action

## Core principles

1. Never treat a resource as an intention.
2. Never turn an hypothesis into a fact.
3. Preserve multiple interpretations when ambiguity is high.
4. Explicitly represent uncertainty.
5. Temporal information must be first-class data.
6. Generate possibilities from combinations of situation, resources, capacities, needs and constraints.
7. A possibility is not an instruction. The user remains in control.
8. Convergence should be based on complementary situations, not keyword similarity.
9. The engine must be able to return `unknown` / `not_enough_information`.
10. The visual cube should represent the current state of the model, not pretend that a score is understanding.

## Proposed analysis object

```ts
interface NexusAnalysis {
  expression: {
    raw: string;
    explicitFacts: string[];
  };
  comprehension: {
    summary: string;
    inferredElements: Array<{
      value: string;
      confidence: number;
      evidence: string;
    }>;
  };
  situation: {
    context: string[];
    state: string[];
  };
  needs: Array<{ value: string; confidence: number }>;
  resources: Array<{ value: string; confidence: number }>;
  capacities: Array<{ value: string; confidence: number }>;
  constraints: Array<{ value: string; confidence: number }>;
  temporality: {
    horizon: 'now' | 'soon' | 'later' | 'recurring' | 'unknown';
    confidence: number;
  };
  uncertainty: {
    overall: number;
    reasons: string[];
  };
  possibilities: Array<{
    value: string;
    confidence: number;
    rationale: string;
    reversible: boolean;
  }>;
  action: {
    status: 'none' | 'optional' | 'suggested';
    value?: string;
  };
}
```

## Critical behavior

Example:

> "J'ai une chambre qui ne sert plus depuis que ma fille est partie."

Expected interpretation:

- resource: unused room
- context: family transition
- state: unused space
- intention: unknown
- possible opportunities: hosting, rental, workspace, studio, shared space
- uncertainty: high
- action: none imposed

The engine must **not** infer that the user wants to rent the room.

## Adversarial validation

The implementation should eventually be evaluated against at least 50–100 ambiguous expressions, with special attention to false positives:

- retirement ≠ activity request
- loneliness ≠ meeting request
- empty room ≠ rental request
- car ownership ≠ transport request
- skill ≠ willingness to help

## Next implementation target

Refactor `V3.1_engine.js` so that deterministic keyword rules become evidence rather than conclusions. Keep the existing V3.1 experience intact while making the semantic model explicit and testable.

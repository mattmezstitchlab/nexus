# NEXUS V4 — Proof of Intelligence

This document defines the validation gate before replacing the V3.1 engine.

## Test categories

### A. Explicit request
The engine should identify a clear request without inventing additional intent.

### B. Implicit situation
The engine should infer context while labeling inference as uncertain.

### C. Dormant resource
A resource must remain a resource unless willingness or intent is explicitly established.

### D. Temporal separation
Now, soon, later, recurring and unknown must remain distinct.

### E. Ambiguity
Multiple plausible interpretations should survive when evidence is insufficient.

### F. Possibility generation
Possibilities should emerge from relationships between needs, resources, capacities, constraints and time.

### G. Convergence
Two situations may converge through complementarity even when their language differs.

### H. No-op / uncertainty
The correct output can be: `I don't know yet` and no action.

## Acceptance criteria

A V4 implementation is not considered successful because it produces plausible text or animated scores. It must expose evidence, confidence and uncertainty separately and avoid converting hypotheses into facts.

The existing V3.1 engine remains the baseline until these criteria are testable in code.

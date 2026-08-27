/*
 * NEXUS V4 — Possibility Engine
 *
 * Purpose:
 *   Turn an expression into a structured situation without inventing an intention.
 *
 * Pipeline:
 *   Expression → Compréhension → Situation → Resources/Capacities/Needs
 *   → Constraints → Temporality → Uncertainty → Possibilities → Convergence
 *
 * Important:
 *   This deterministic layer is an evidence model, not a claim of human-level
 *   semantic understanding. An LLM adapter can enrich `comprehension.inferences`
 *   later. Facts, hypotheses and intentions remain separate.
 */

class NexusV4PossibilityEngine {
  constructor(options = {}) {
    this.version = '4.0.0';
    this.options = options;
    this.memory = [];
  }

  analyze(text) {
    const raw = String(text ?? '').trim();
    if (!raw) return this._emptyAnalysis();

    const normalized = this._normalize(raw);
    const explicitFacts = this._extractExplicitFacts(raw, normalized);
    const context = this._extractContext(raw, normalized);
    const state = this._extractState(raw, normalized);
    const needs = this._extractNeeds(raw, normalized);
    const resources = this._extractResources(raw, normalized);
    const capacities = this._extractCapacities(raw, normalized);
    const constraints = this._extractConstraints(raw, normalized);
    const temporality = this._extractTemporality(raw, normalized);

    const evidence = [
      ...explicitFacts,
      ...context.evidence,
      ...state.evidence,
      ...needs.map(x => x.evidence),
      ...resources.map(x => x.evidence),
      ...capacities.map(x => x.evidence),
      ...constraints.map(x => x.evidence),
      ...temporality.evidence
    ];

    const uncertainty = this._calculateUncertainty({
      raw,
      explicitFacts,
      context,
      state,
      needs,
      resources,
      capacities,
      constraints,
      temporality
    });

    const possibilities = this._generatePossibilities({
      context,
      state,
      needs,
      resources,
      capacities,
      constraints,
      temporality,
      uncertainty
    });

    const intentions = this._extractExplicitIntentions(raw, normalized);

    const analysis = {
      version: this.version,
      expression: {
        raw,
        normalized,
        explicitFacts,
        evidenceCount: evidence.length
      },
      comprehension: {
        summary: this._buildSummary({ context, state, needs, resources, capacities }),
        inferences: [],
        limitations: this._limitations(uncertainty)
      },
      situation: {
        context: context.values,
        state: state.values,
        transition: context.transition,
        intention: intentions.length ? intentions : null
      },
      needs: needs.map(this._publicSignal),
      resources: resources.map(this._publicSignal),
      capacities: capacities.map(this._publicSignal),
      constraints: constraints.map(this._publicSignal),
      temporality: this._publicTemporality(temporality),
      uncertainty,
      possibilities,
      action: {
        status: intentions.length ? 'optional' : 'none',
        value: intentions.length ? null : null,
        reason: intentions.length
          ? 'Une intention explicite existe, mais aucune action ne doit être imposée.'
          : 'Intention insuffisamment déterminée : aucune action imposée.'
      },
      meta: {
        model: 'evidence-first-deterministic-v4',
        intentKnown: intentions.length > 0,
        evidenceFirst: true
      }
    };

    this.memory.push({ timestamp: Date.now(), analysis });
    if (this.memory.length > 100) this.memory.shift();
    return analysis;
  }

  findConvergences(a, b) {
    const left = this._analysis(a);
    const right = this._analysis(b);
    const matches = [];

    const pairs = [
      ['needs', 'capacities', 'Une capacité de B peut répondre à un besoin potentiel de A.'],
      ['capacities', 'needs', 'Une capacité de A peut répondre à un besoin potentiel de B.'],
      ['needs', 'resources', 'Une ressource peut rendre une réponse au besoin possible.'],
      ['resources', 'needs', 'Une ressource peut rendre une réponse au besoin possible.']
    ];

    for (const [leftKey, rightKey, rationale] of pairs) {
      for (const l of left[leftKey] || []) {
        for (const r of right[rightKey] || []) {
          const score = this._semanticCompatibility(l.value, r.value);
          if (score >= 0.55) {
            matches.push({
              type: 'complementarity',
              score,
              left: l.value,
              right: r.value,
              rationale
            });
          }
        }
      }
    }

    return {
      compatible: matches.length > 0,
      confidence: matches.length ? Math.max(...matches.map(x => x.score)) : 0,
      matches,
      caution: 'Une convergence est une possibilité, pas une intention ni une invitation automatique.'
    };
  }

  _analysis(value) {
    return typeof value === 'string' ? this.analyze(value) : value;
  }

  _extractExplicitFacts(raw, n) {
    const facts = [];
    const patterns = [
      [/j['’]ai\s+une\s+chambre|j['’]ai\s+une\s+pièce/, 'une pièce/chambre est mentionnée'],
      [/je\s+connais\s+(?:très\s+bien\s+)?(?:la\s+)?région/, 'connaissance locale déclarée'],
      [/je\s+suis\s+(?:libre|disponible)/, 'disponibilité déclarée'],
      [/je\s+sais\s+/, 'compétence déclarée'],
      [/je\s+viens\s+d['’]arriver|je\s+déménage|je\s+emménage/, 'transition géographique déclarée'],
      [/depuis\s+ma\s+retraite|je\s+suis\s+à\s+la\s+retraite/, 'transition professionnelle déclarée']
    ];
    for (const [regex, value] of patterns) {
      if (regex.test(n)) facts.push({ value, confidence: 0.98, evidence: regex.source });
    }
    return facts;
  }

  _extractContext(raw, n) {
    const values = [];
    const evidence = [];
    let transition = false;
    const add = (value, regex, confidence = 0.88) => {
      if (regex.test(n)) {
        values.push({ value, confidence });
        evidence.push({ value, confidence, evidence: regex.source });
      }
    };
    add('nouvel environnement', /viens d['’]arriver|nouveau(?:elle)? ici|déménage|emménage/);
    add('transition de retraite', /retraite|retraité|fin de carrière/);
    add('transition familiale', /fille est partie|fils est parti|enfants? (?:sont )?partis|enfants? ont quitté/);
    add('changement de situation', /depuis|désormais|maintenant que|depuis que/);
    transition = values.length > 0;
    return { values, evidence, transition };
  }

  _extractState(raw, n) {
    const values = [];
    const evidence = [];
    const add = (value, regex, confidence = 0.84) => {
      if (regex.test(n)) {
        values.push({ value, confidence });
        evidence.push({ value, confidence, evidence: regex.source });
      }
    };
    add('solitude ou isolement', /je ne connais personne|seul(?:e)?|isolement|personne ici/);
    add('fatigue', /épuisé|épuisée|fatigué|fatiguée|marre/);
    add('espace inutilisé', /chambre qui ne sert plus|pièce qui ne sert plus|pièce inutilisée|chambre vide/);
    add('incertitude', /je ne sais pas|aucune idée|je ne sais même pas|peut-être/);
    add('envie d’exploration', /j['’]aimerais partir|envie de découvrir|j['’]aimerais voir/);
    return { values, evidence };
  }

  _extractNeeds(raw, n) {
    const signals = [];
    const add = (value, regex, confidence = 0.68) => {
      if (regex.test(n)) signals.push({ value, confidence, evidence: regex.source });
    };
    add('connexion sociale', /ne connais personne|seul(?:e)?|isolement|voir des gens|rencontrer/);
    add('exploration', /partir quelque part|découvrir|où aller|quoi faire/);
    add('aide ou soutien', /j['’]ai besoin d['’]aide|aidez-moi|support/);
    add('résolution d’un problème', /fuit|problème|repousse le problème|panne/);
    return signals;
  }

  _extractResources(raw, n) {
    const signals = [];
    const add = (value, regex, confidence = 0.94) => {
      if (regex.test(n)) signals.push({ value, confidence, evidence: regex.source });
    };
    add('chambre ou pièce disponible', /chambre|pièce|logement/);
    add('connaissance locale', /je connais (?:très bien )?(?:la )?région|je connais (?:très bien )?le coin/);
    add('voiture', /voiture|véhicule/);
    add('temps disponible', /temps libre|libre samedi|libre dimanche|disponible|beaucoup de temps/);
    return signals;
  }

  _extractCapacities(raw, n) {
    const signals = [];
    const add = (value, regex, confidence = 0.9) => {
      if (regex.test(n)) signals.push({ value, confidence, evidence: regex.source });
    };
    add('capacité à partager une connaissance locale', /je connais (?:très bien )?(?:la )?région/);
    add('disponibilité temporelle', /temps libre|libre samedi|libre dimanche|disponible/);
    add('compétence déclarée', /je sais|je peux|je maîtrise|compétence/);
    add('capacité de déplacement', /voiture|véhicule|je peux conduire/);
    return signals;
  }

  _extractConstraints(raw, n) {
    const signals = [];
    const add = (value, regex, confidence = 0.86) => {
      if (regex.test(n)) signals.push({ value, confidence, evidence: regex.source });
    };
    add('intention non déterminée', /je ne sais pas|je ne sais même pas|aucune idée/);
    add('contrainte temporelle courte', /samedi|dimanche|ce soir|cet après-midi|demain/);
    add('fatigue ou faible énergie', /épuisé|épuisée|fatigué|fatiguée/);
    add('problème reporté', /repousse|repoussé|depuis trois jours|depuis plusieurs jours/);
    return signals;
  }

  _extractTemporality(raw, n) {
    const rules = [
      ['now', /maintenant|tout de suite|immédiatement|cet après-midi|ce soir/],
      ['soon', /demain|samedi|dimanche|ce week-end|dans deux semaines|bientôt/],
      ['later', /plus tard|un jour|l’année prochaine|dans quelques mois/],
      ['recurring', /chaque semaine|tous les jours|régulièrement|souvent/]
    ];
    for (const [horizon, regex] of rules) {
      if (regex.test(n)) return { horizon, confidence: 0.9, evidence: [{ value: horizon, confidence: 0.9, evidence: regex.source }] };
    }
    return { horizon: 'unknown', confidence: 0.2, evidence: [] };
  }

  _extractExplicitIntentions(raw, n) {
    const signals = [];
    const patterns = [
      ['chercher une activité', /je (?:cherche|veux|voudrais) (?:une )?activité/],
      ['rencontrer des personnes', /je (?:veux|voudrais|aimerais) (?:voir|rencontrer) des gens/],
      ['partir ou voyager', /je (?:veux|voudrais|aimerais) partir/],
      ['résoudre un problème', /je veux résoudre|il faut réparer|je dois réparer/]
    ];
    for (const [value, regex] of patterns) {
      if (regex.test(n)) signals.push({ value, confidence: 0.9, evidence: regex.source });
    }
    return signals;
  }

  _calculateUncertainty(data) {
    let score = 0.35;
    const reasons = [];
    if (!data.explicitFacts.length) { score += 0.2; reasons.push('peu de faits explicites'); }
    if (!data.needs.length) { score += 0.1; reasons.push('besoin non déterminé'); }
    if (!data.resources.length) { score += 0.08; reasons.push('ressource non déterminée'); }
    if (!data.temporality || data.temporality.horizon === 'unknown') { score += 0.1; reasons.push('horizon temporel inconnu'); }
    if (data.state.values.some(x => x.value === 'incertitude')) { score += 0.12; reasons.push('incertitude explicitement exprimée'); }
    const explicitIntent = this._extractExplicitIntentions(data.raw || '', this._normalize(data.raw || ''));
    if (!explicitIntent.length) { score += 0.12; reasons.push('intention non explicitement exprimée'); }
    return {
      overall: Math.min(1, Number(score.toFixed(2))),
      label: score >= 0.75 ? 'high' : score >= 0.5 ? 'medium' : 'low',
      reasons
    };
  }

  _generatePossibilities(data) {
    const result = [];
    const add = (value, rationale, confidence, reversible = true) => {
      result.push({ value, rationale, confidence: Number(Math.max(0, Math.min(1, confidence)).toFixed(2)), reversible });
    };

    const hasRoom = this._has(data.resources, 'chambre ou pièce disponible');
    const local = this._has(data.resources, 'connaissance locale');
    const time = this._has(data.resources, 'temps disponible') || this._has(data.capacities, 'disponibilité temporelle');
    const social = this._has(data.needs, 'connexion sociale');
    const exploration = this._has(data.needs, 'exploration');

    if (hasRoom) {
      add('réfléchir à un nouvel usage de la pièce', 'Une pièce est disponible, mais son usage souhaité reste inconnu.', 0.72);
      add('accueil ou partage temporaire', 'Une pièce disponible peut rendre cette possibilité envisageable, sans supposer une volonté de louer.', 0.45);
    }
    if (local && exploration) {
      add('partage de découverte locale', 'Une connaissance locale déclarée peut compléter un besoin potentiel d’exploration.', 0.74);
    }
    if (time && social) {
      add('activité ou rencontre à faible engagement', 'Temps disponible + besoin potentiel de connexion.', 0.62);
    }
    if (data._problem && data.needs.some(x => x.value === 'résolution d’un problème')) {
      add('rechercher une aide ou une solution', 'Un problème est exprimé sans solution déterminée.', 0.7);
    }
    if (!result.length) {
      add('explorer davantage la situation', 'Les informations actuelles ne permettent pas de déterminer une possibilité plus précise.', 0.35);
    }

    return result;
  }

  _has(list, value) {
    return (list || []).some(x => x.value === value);
  }

  _semanticCompatibility(a, b) {
    const x = `${a} ${b}`.toLowerCase();
    if (/connexion sociale.*disponibilité|disponibilité.*connexion sociale/.test(x)) return 0.82;
    if (/exploration.*connaissance locale|connaissance locale.*exploration/.test(x)) return 0.88;
    if (/aide.*capacité|capacité.*aide/.test(x)) return 0.72;
    if (/résolution.*compétence|compétence.*résolution/.test(x)) return 0.76;
    return 0;
  }

  _buildSummary(data) {
    const parts = [];
    if (data.context.values.length) parts.push(`contexte: ${data.context.values.map(x => x.value).join(', ')}`);
    if (data.state.values.length) parts.push(`état: ${data.state.values.map(x => x.value).join(', ')}`);
    if (data.resources.length) parts.push(`ressources: ${data.resources.map(x => x.value).join(', ')}`);
    if (!parts.length) return 'Situation insuffisamment documentée.';
    return parts.join(' · ');
  }

  _limitations(uncertainty) {
    return uncertainty.overall >= 0.75
      ? ['L’intention réelle reste incertaine.', 'Les possibilités sont exploratoires.', 'Aucune action ne doit être imposée.']
      : ['Les inférences restent limitées aux éléments détectables dans l’expression.'];
  }

  _publicSignal(signal) {
    return { value: signal.value, confidence: signal.confidence, evidence: signal.evidence };
  }

  _publicTemporality(t) {
    return { horizon: t.horizon, confidence: t.confidence, evidence: t.evidence };
  }

  _normalize(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  _emptyAnalysis() {
    return {
      version: this.version,
      expression: { raw: '', normalized: '', explicitFacts: [], evidenceCount: 0 },
      comprehension: { summary: 'Aucune expression fournie.', inferences: [], limitations: ['Impossible d’analyser sans expression.'] },
      situation: { context: [], state: [], transition: false, intention: null },
      needs: [], resources: [], capacities: [], constraints: [],
      temporality: { horizon: 'unknown', confidence: 0, evidence: [] },
      uncertainty: { overall: 1, label: 'high', reasons: ['aucune expression'] },
      possibilities: [],
      action: { status: 'none', value: null, reason: 'Aucune expression.' },
      meta: { model: 'evidence-first-deterministic-v4', intentKnown: false, evidenceFirst: true }
    };
  }
}

// Browser + module friendly export.
if (typeof window !== 'undefined') {
  window.NEXUS = window.NEXUS || {};
  window.NEXUS.V4 = new NexusV4PossibilityEngine();
  window.NEXUS.V4PossibilityEngine = NexusV4PossibilityEngine;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NexusV4PossibilityEngine };
}

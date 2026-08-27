// NEXUS V4 — Possibility Engine
// Evidence-first semantic model for browser environments.
// Principles: fact !== inference !== intention; resource !== intention; uncertainty is first-class.

(function (global) {
  'use strict';

  const RX = {
    negation: /\b(ne\s+pas|n'|plus|jamais|aucun|aucune|personne)\b/i,
    uncertainty: /\b(je ne sais pas|je sais pas|peut[- ]être|peut etre|j'hésite|j'hesite|je pourrais|j'aimerais|j'aimerais bien|on verra|pourquoi pas)\b/i,
    temporalNow: /\b(maintenant|tout de suite|immédiatement|immediatement|aujourd'hui|ce matin|cet après-midi|cet apres-midi|ce soir)\b/i,
    temporalSoon: /\b(demain|cette semaine|ce week[- ]end|samedi|dimanche|bientôt|bientot|prochain(?:e)?\s+(?:semaine|mois|week))\b/i,
    temporalLater: /\b(plus tard|un jour|dans quelques mois|l'année prochaine|l annee prochaine|à terme|a terme)\b/i,
    temporalRecurring: /\b(tous les|chaque|chaque semaine|régulièrement|regulierement|souvent|de temps en temps)\b/i,
    newPlace: /\b(viens? d'arriver|nouveau ici|nouvelle ici|déménage|deménage|emménage|emmenage|arrivé ici|arrive ici)\b/i,
    retirement: /\b(retraité|retraite|à la retraite|a la retraite|fin de carrière|fin de carriere)\b/i,
    emptyNest: /\b(ma fille est partie|mon fils est parti|mes enfants sont partis|enfants partis|enfants ont quitté|enfants ont quitte|chambre d'enfant)\b/i,
    room: /\b(chambre|pièce|piece|bureau|logement)\b/i,
    time: /\b(temps libre|temps disponible|libre|disponible|journée libre|journee libre)\b/i,
    localKnowledge: /\b(je connais|je connais bien|je connais très bien|je connais tres bien|je maîtrise|je maitrise)\b/i,
    loneliness: /\b(seul|seule|solitude|isolement|personne ici|connais personne|ne connais personne)\b/i,
    explicitSocialNeed: /\b(voir des gens|rencontrer|rencontre|amis|me faire des amis|sortir avec quelqu'un|sortir avec quelqu un)\b/i,
    explicitHelp: /\b(j'ai besoin d'aide|j ai besoin d'aide|aidez-moi|aide-moi|j'ai besoin de support)\b/i,
    explicitActivity: /\b(quoi faire|activité|activite|sortir|visiter|faire quelque chose)\b/i,
    skill: /\b(sais|sait|compétence|competence|je joue|je parle|je cuisine|je code|je jardine|je conduis|je peux)\b/i,
    vehicle: /\b(voiture|vélo|velo|camion|scooter)\b/i,
    leak: /\b(fuit|fuite|cassé|casse|panne|ne marche plus)\b/i,
    delay: /\b(repousse|repoussé|repousse toujours|depuis trois jours|depuis plusieurs jours|jamais fait)\b/i,
    emotionalFatigue: /\b(épuisé|epuise|fatigué|fatigue|marre|ras-le-bol|ras le bol|angoissé|angoisse|stressé|stresse)\b/i
  };

  function clamp(n) { return Math.max(0, Math.min(100, Math.round(n))); }
  function uniq(arr) { return [...new Set(arr)]; }
  function match(rx, text) { return rx.test(text); }

  class NEXUSV4PossibilityEngine {
    analyze(input) {
      const raw = String(input || '').trim();
      const text = raw.toLowerCase();
      const evidence = [];
      const add = (type, value, confidence, reason) => evidence.push({ type, value, confidence: clamp(confidence), evidence: reason });

      // 1 — Explicit facts: only observable linguistic claims, no interpretation.
      if (match(RX.room, text)) add('resource', 'espace/pièce mentionné', 96, 'présence explicite d’une pièce ou chambre');
      if (match(RX.time, text)) add('resource', 'temps disponible mentionné', 96, 'disponibilité temporelle explicitement exprimée');
      if (match(RX.vehicle, text)) add('resource', 'véhicule mentionné', 96, 'véhicule explicitement mentionné');
      if (match(RX.localKnowledge, text)) add('capacity', 'connaissance locale', 90, 'connaissance explicitement revendiquée');
      if (match(RX.skill, text)) add('capacity', 'compétence ou capacité mentionnée', 82, 'formulation de capacité détectée');
      if (match(RX.leak, text)) add('state', 'problème matériel mentionné', 94, 'fuite/panne/casse explicitement mentionnée');
      if (match(RX.loneliness, text)) add('state', 'isolement ou absence de réseau mentionné', 92, 'état relationnel explicitement exprimé');
      if (match(RX.emotionalFatigue, text)) add('state', 'fatigue ou charge émotionnelle mentionnée', 90, 'état émotionnel explicitement exprimé');

      // 2 — Context: contextual hypotheses are explicitly labelled as hypotheses.
      const contexts = [];
      if (match(RX.newPlace, text)) contexts.push({ value: 'changement de lieu / arrivée récente', confidence: 94 });
      if (match(RX.retirement, text)) contexts.push({ value: 'transition professionnelle / retraite', confidence: 94 });
      if (match(RX.emptyNest, text)) contexts.push({ value: 'transition familiale', confidence: 94 });
      if (contexts.length) contexts.forEach(c => add('context', c.value, c.confidence, 'indice contextuel explicite'));

      // 3 — Explicit intention only when directly formulated.
      const intentions = [];
      if (match(RX.explicitSocialNeed, text)) intentions.push({ value: 'connexion sociale', confidence: 88 });
      if (match(RX.explicitHelp, text)) intentions.push({ value: 'obtenir de l’aide', confidence: 94 });
      if (match(RX.explicitActivity, text)) intentions.push({ value: 'chercher une activité', confidence: 84 });
      const intentionIsUnknown = intentions.length === 0;

      // 4 — Needs are hypotheses unless explicitly requested.
      const needs = [];
      if (match(RX.explicitSocialNeed, text)) needs.push({ value: 'lien social', confidence: 88, evidence: 'demande explicite' });
      else if (match(RX.loneliness, text)) needs.push({ value: 'connexion sociale possible', confidence: 56, evidence: 'état d’isolement, sans demande explicite' });
      if (match(RX.explicitHelp, text)) needs.push({ value: 'soutien', confidence: 94, evidence: 'demande explicite' });
      if (match(RX.leak, text) && match(RX.delay, text)) needs.push({ value: 'résolution d’un problème en attente possible', confidence: 62, evidence: 'problème + report, mais intention non affirmée' });

      // 5 — Temporality is independent from intent.
      let horizon = 'unknown';
      let temporalConfidence = 35;
      if (match(RX.temporalNow, text)) { horizon = 'now'; temporalConfidence = 94; }
      else if (match(RX.temporalSoon, text)) { horizon = 'soon'; temporalConfidence = 92; }
      else if (match(RX.temporalLater, text)) { horizon = 'later'; temporalConfidence = 92; }
      else if (match(RX.temporalRecurring, text)) { horizon = 'recurring'; temporalConfidence = 90; }

      // 6 — Generate possibilities from combinations, never as commands.
      const possibilities = [];
      const addPossibility = (value, confidence, rationale, reversible = true) => {
        possibilities.push({ value, confidence: clamp(confidence), rationale, reversible });
      };

      if (match(RX.room, text)) {
        addPossibility('réaffecter l’espace', 58, 'une pièce est mentionnée, mais son usage souhaité reste inconnu');
        addPossibility('accueillir quelqu’un', 34, 'une pièce disponible peut rendre cette option possible, sans indiquer une volonté d’accueil');
        addPossibility('transformer l’espace en atelier ou bureau', 34, 'une pièce inutilisée peut être réaffectée de plusieurs façons');
      }
      if (match(RX.localKnowledge, text) && match(RX.time, text)) {
        addPossibility('partager une connaissance locale', 48, 'capacité locale + disponibilité temporelle');
      }
      if (match(RX.loneliness, text) && match(RX.newPlace, text)) {
        addPossibility('explorer des occasions de créer du lien', 54, 'nouveau lieu + isolement, sans supposer une demande de rencontre');
      }
      if (match(RX.vehicle, text) && match(RX.time, text)) {
        addPossibility('mobilité disponible', 52, 'véhicule + disponibilité, sans supposer une volonté de transporter');
      }
      if (match(RX.leak, text)) {
        addPossibility('résoudre ou faire diagnostiquer le problème', 61, 'problème matériel explicite; aucune préférence d’action déduite');
      }
      if (match(RX.skill, text) && match(RX.time, text)) {
        addPossibility('mettre une compétence à contribution', 42, 'capacité + temps, sans supposer une volonté de la proposer');
      }

      const uncertaintyReasons = [];
      if (intentionIsUnknown) uncertaintyReasons.push('intention non explicitement formulée');
      if (match(RX.uncertainty, text)) uncertaintyReasons.push('marqueur linguistique d’incertitude');
      if (!contexts.length) uncertaintyReasons.push('contexte global non déterminé');
      if (horizon === 'unknown') uncertaintyReasons.push('horizon temporel inconnu');
      if (possibilities.length > 1) uncertaintyReasons.push('plusieurs possibilités compatibles');

      let uncertainty = 30;
      if (intentionIsUnknown) uncertainty += 30;
      if (match(RX.uncertainty, text)) uncertainty += 20;
      if (horizon === 'unknown') uncertainty += 8;
      if (possibilities.length > 2) uncertainty += 8;
      uncertainty = clamp(uncertainty);

      const dimensions = {
        need: clamp(needs.length ? Math.max(...needs.map(n => n.confidence)) : 0),
        resource: clamp(evidence.filter(e => e.type === 'resource').reduce((m, e) => Math.max(m, e.confidence), 0)),
        capacity: clamp(evidence.filter(e => e.type === 'capacity').reduce((m, e) => Math.max(m, e.confidence), 0)),
        context: clamp(contexts.reduce((m, c) => Math.max(m, c.confidence), 0)),
        temporality: temporalConfidence,
        uncertainty,
        possibility: clamp(possibilities.reduce((m, p) => Math.max(m, p.confidence), 0))
      };

      return {
        version: '4.0',
        expression: { raw, normalized: text },
        comprehension: {
          explicitFacts: evidence.filter(e => ['resource', 'capacity', 'state'].includes(e.type)),
          inferredElements: evidence.filter(e => ['context'].includes(e.type)),
          summary: this._summary(raw, evidence, intentions, uncertainty)
        },
        situation: {
          context: contexts,
          states: evidence.filter(e => e.type === 'state').map(e => ({ value: e.value, confidence: e.confidence }))
        },
        intention: intentionIsUnknown ? { status: 'unknown', candidates: [] } : { status: 'explicit', candidates: intentions },
        needs,
        resources: evidence.filter(e => e.type === 'resource').map(e => ({ value: e.value, confidence: e.confidence })),
        capacities: evidence.filter(e => e.type === 'capacity').map(e => ({ value: e.value, confidence: e.confidence })),
        constraints: [],
        temporality: { horizon, confidence: temporalConfidence },
        uncertainty: { overall: uncertainty, reasons: uniq(uncertaintyReasons) },
        possibilities,
        action: { status: intentionIsUnknown ? 'none' : 'optional' },
        dimensions,
        safeguards: [
          'resource_does_not_imply_intention',
          'state_does_not_imply_request',
          'capacity_does_not_imply_willingness',
          'possibility_is_not_instruction'
        ]
      };
    }

    _summary(raw, evidence, intentions, uncertainty) {
      if (!raw) return 'Aucune expression à analyser.';
      if (!intentions.length) return `Situation partiellement comprise. L’intention reste inconnue (incertitude ${uncertainty}%).`;
      return `Intention explicite détectée : ${intentions.map(i => i.value).join(', ')}. Incertitude globale ${uncertainty}%.`;
    }
  }

  const api = global.NEXUS = global.NEXUS || {};
  api.PossibilityEngineV4 = new NEXUSV4PossibilityEngine();
  api.analyzeV4 = text => api.PossibilityEngineV4.analyze(text);
  api.NEXUSV4PossibilityEngine = NEXUSV4PossibilityEngine;
})(typeof window !== 'undefined' ? window : globalThis);

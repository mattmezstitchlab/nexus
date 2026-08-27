// NEXUS V3.1 - Possibility Engine
// Architecture: Expression → Compréhension → Situation → Ressource/Capacité/Besoins → Contraintes → Temporalité → Incertitude → Possibilités → (pas d'action imposée)

// ============ CORE CLASS: NEXUSPossibilityEngine ============
class NEXUSPossibilityEngine {
    constructor() {
        this.expression = {};
        this.comprehension = {};
        this.situation = {};
        this.resources = {};
        this.needs = {};
        this.capacities = {};
        this.constraints = {};
        this.temporality = {};
        this.uncertainty = {};
        this.possibilities = {};
        this.confidence = 0;
        this.memory = [];
    }

    analyze(text) {
        const engine = this;
        
        // Étape 1: Expression
        engine._analyzeExpression(text);
        
        // Étape 2: Compréhension
        engine._comprehend();
        
        // Étape 3: Situation
        engine._buildSituation();
        
        // Étape 4: Ressources identifiées
        engine._identifyResources();
        
        // Étape 5: besoins
        engine._identifyNeeds();
        
        // Étape 6: capacités
        engine._identifyCapacities();
        
        // Étape 7: contraintes
        engine._identifyConstraints();
        
        // Étape 8: temporalité
        engine._determineTemporality();
        
        // Étape 9: incertitude
        engine._calculateUncertainty();
        
        // Étape 10: possibilités
        engine._generatePossibilities();
        
        return engine;
    }

    _analyzeExpression(text) {
        this.expression = {
            raw: text,
            normalized: text.toLowerCase().trim(),
            length: text.length,
            hasQuestionMark: text.endsWith('?'),
            hasExclamation: text.endsWith('!'),
            containsNegation: /(ne|pas|plus)/i.test(text),
            containsModalite: /(pourrait|aimerais|j\'envisage|peux|suis en train)/i.test(text),
            keywords: this._extractKeywords(text)
        };
    }

    _extractKeywords(text) {
        const keywords = {
            newPlace: /(viens d\'arriver|nouveau ici|déménage|emménage)/i.test(text),
            retirement: /(retraité|fin de carrière|à la retraite)/i.test(text),
            emptyNest: /(enfants ont quitté|enfants partis|maison vide|chambre d\'enfant)/i.test(text),
            roomAvailable: /(chambre|pièce|logement)/i.test(text),
            timeAvailable: /(temps libre|disponible|maintenant que|depuis)/i.test(text),
            knowledge: /(connaisse|bien la région|je connais)/i.test(text),
            loneliness: /(seul|seule|isolement|personne)/i.test(text),
            loneliness: /(seul|seule|isolement|personne)/i.test(text),
            activity: /(quoi faire|sortir|week-end|samedi|dimanche|activité)/i.test(text),
            immediate: /(maintenant|tout de suite|immédiat|cet après-midi)/i.test(text),
            shortTerm: /(cet après-midi|ce soir|ce week-end|prochain)/i.test(text),
            mediumTerm: /(bientôt|dans quelques|prochain mois)/i.test(text),
            longTerm: /(plus tard|un jour|someday|en retraite|futur)/i.test(text),
            unclear: /(je ne sais pas|bien|enfin|peut-être|idk)/i.test(text),
            unsure: /(hum|un peu|maybe|sort of)/i.test(text)
        };
        return keywords;
    }

    _comprehend() {
        const kw = this.expression.keywords;
        this.comprehension = {
            situationType: this._situationType(kw),
            isolation: kw.loneliness || (kw.newPlace && !kw.roomAvailable),
            hasTimeConstraint: /(pas le temps|hâte|pressé)/i.test(this.expression.normalized),
            hasTemporalReference: /(samedi|dimanche|cet après-midi|bientôt|retraite)/i.test(this.expression.normalized),
            ambiguityLevel: this._calculateAmbiguity(kw),
            clarityLevel: this._calculateClarity(kw)
        };
    }

    _calculateAmbiguity(kw) {
        let score = 0;
        if (kw.unclear) score += 30;
        if (kw.unsure) score += 25;
        if (kw.newPlace && !kw.roomAvailable) score += 25;
        if (kw.retirement && !kw.timeAvailable) score += 15;
        return Math.min(100, score);
    }

    _calculateClarity(kw) {
        let score = 50;
        const activeKeys = Object.keys(kw).filter(k => kw[k]);
        if (activeKeys.length > 5) score += 20;
        if (!kw.unclear && !kw.unsure) score += 20;
        if (kw.newPlace ^ kw.retirement) score += 10;
        return Math.min(100, score);
    }

    _situationType(kw) {
        if (kw.newPlace && !kw.retirement) return 'new_arrival';
        if (kw.retirement && !kw.newPlace) return 'post_career';
        if (kw.emptyNest) return 'empty_nest';
        if (kw.newPlace && kw.retirement) return 'dual_transition';
        return 'general';
    }

    _buildSituation() {
        const kw = this.expression.keywords;
        this.situation = {
            context: this._situationType(kw),
            isolation: kw.loneliness || (kw.newPlace && !kw.roomAvailable),
            transition: kw.retirement || kw.emptyNest,
            unusedSpace: kw.roomAvailable && !/*hasActivities*/true, // simplified
            knownArea: kw.knowledge,
            availableTime: this._assessAvailableTime(kw)
        };
    }

    _assessAvailableTime(kw) {
        if (kw.immediate) return 'immediate';
        if (kw.shortTerm) return 'short';
        if (kw.mediumTerm) return 'medium';
        if (kw.longTerm) return 'long';
        if (kw.retirement) return 'flexible';
        return 'unknown';
    }

    _identifyResources() {
        this.resources = {
            physical: {
                room: this.expression.keywords.roomAvailable ? { available: true, description: 'Chambre/logement' } : { available: false },
                time: this._timeAvailability(this.expression.keywords),
                localKnowledge: this.expression.keywords.knowledge ? { level: 'good', description: 'Connaît bien la région' } : { available: false }
            },
            skills: this._identifySkills(this.expression.keywords),
            connections: this._assessConnections(this.expression.keywords)
        };
    }

    _timeAvailability(kw) {
        if (kw.immediate) return { available: true, hours: 'immédiat', constraint: 'none' };
        if (kw.shortTerm) return { available: true, hours: 'cette semaine', constraint: 'schedule' };
        if (kw.retirement) return { available: true, hours: 'flexible', constraint: 'none' };
        return { available: false };
    }

    _identifySkills(kw) {
        const skills = [];
        const normalized = this.expression.normalized;
        if (/sais|peu|compétence/i.test(normalized)) {
            if (/cuisiner|cuisine/i.test(normalized)) skills.push('cooking');
            if (/conduire|voiture/i.test(normalized)) skills.push('driving');
            if (/apprendre|enseignement/i.test(normalized)) skills.push('teaching');
            if (/jardin|plantes/i.test(normalized)) skills.push('gardening');
            if (/informatique|code/i.test(normalized)) skills.push('IT');
        }
        return skills.length > 0 ? skills : ['none detected'];
    }

    _assessConnections(kw) {
        if (kw.newPlace && !/*hasFriends*/true) return { level: 'low', description: 'Nouvel environnement, réseau à construire' };
        if (kw.retirement && /*volunteer*/true) return { level: 'medium', description: 'Retraité impliqué dans des activités' };
        if (/*hasFriends*/true) return { level: 'high', description: 'Réseau social existant' };
        return { level: 'medium', description: 'Réseau modéré, ouvert aux nouvelles rencontres' };
    }

    _identifyNeeds() {
        this.needs = [];
        if (this.expression.keywords.loneliness) this.needs.push({ type: 'social_connection', urgency: 'medium' });
        if (/quoi faire|sortir|activité/i.test(this.expression.normalized)) this.needs.push({ type: 'activity', urgency: 'low' });
        if (/aide|support/i.test(this.expression.normalized)) this.needs.push({ type: 'support', urgency: 'low' });
        if (this.situation.isolation && this.needs.length === 0) this.needs.push({ type: 'exploration', urgency: 'low', description: 'Explorer la situation' });
    }

    _identifyCapacities() {
        const kw = this.expression.keywords;
        this.capacities = {
            time: this._timeAvailability(kw),
            knowledge: kw.knowledge ? { level: 'good', canShare: true } : { available: false, canShare: false },
            skills: this._identifySkills(kw),
            physical: { limited: this.situation.isolation }
        };
    }

    _identifyConstraints() {
        this.constraints = [];
        if (this.expression.keywords.unclear) this.constraints.push('high_uncertainty');
        if (this.expression.keywords.hasExclamation) this.constraints.push('explicit_preference');
        if (!this.expression.keywords.immediate && !this.expression.keywords.shortTerm) this.constraints.push('no_temporal_anchor');
        if (this.situation.isolation) this.constraints.push('social_isolation');
        if (this.resources.physical.room.available && this.capacities.skills.length === 0) this.constraints.push('resource_underutilized');
        if (this.capacities.time.available === 'flexible' && this.situation.isolation) this.constraints.push('time_without_company');
    }

    _determineTemporality() {
        const kw = this.expression.keywords;
        if (kw.immediate) this.temporality = { horizon: 'immédiat', waiting: 'none', nextSteps: 'immediate_action' };
        else if (kw.shortTerm) this.temporality = { horizon: 'court', waiting: 'cette semaine', nextSteps: 'short_term_plan' };
        else if (kw.mediumTerm) this.temporality = { horizon: 'moyen', waiting: 'prochain mois', nextSteps: 'medium_term_plan' };
        else if (kw.retirement) this.temporality = { horizon: 'long', waiting: 'exploration', nextSteps: 'retirement_adjustment' };
        else this.temporality = { horizon: 'inconnu', waiting: 'exploration', nextSteps: 'further_analysis' };
    }

    _calculateUncertainty() {
        let score = 0;
        if (this.expression.keywords.unclear) score += 30;
        if (this.expression.keywords.unsure) score += 25;
        if (this.situation.isolation && !this.resources.physical.room.available) score += 20;
        if (this.needs.length === 0 || this.needs[0].type === 'exploration') score += 15;
        if (this.constraints.length > 2) score += 10;
        this.uncertainty = {
            level: Math.min(100, score),
            description: this._uncertaintyDescription(score),
            areas: this._uncertaintyAreas()
        };
    }

    _uncertaintyDescription(score) {
        if (score >= 70) return 'Très élevé - Nécessite exploration';
        if (score >= 50) return 'Élevé - Plusieurs possibilités ouvertes';
        if (score >= 30) return 'Modéré - Quelques options claires';
        return 'Faible - Situation relativement claire';
    }

    _uncertaintyAreas() {
        const areas = [];
        if (this.expression.keywords.unclear) areas.push('intention');
        if (this.situation.isolation) areas.push('contexte relationnel');
        if (this.resources.physical.room.available && !this.capacities.time.available) areas.push('disponibilité');
        if (this.temporality.horizon === 'inconnu') areas.push('horizon_temporel');
        return areas;
    }

    _generatePossibilities() {
        this.possibilities = {
            explicit: this._explicitPossibilities(),
            implicit: this._implicitPossibilities(),
            forbidden: this._forbiddenAssumptions()
        };
    }

    _explicitPossibilities() {
        const possibilities = [];
        if (this.resources.physical.room.available) {
            possibilities.push({
                type: 'housing',
                description: 'Ressource: chambre disponible',
                uncertainty: this.uncertainty.level,
                confidence: 50 // placeholder
            });
        }
        if (this.needs.some(n => n.type === 'social_connection')) {
            possibilities.push({
                type: 'social',
                description: 'Possibilité: rencontre ou connexion',
                uncertainty: this.uncertainty.level,
                confidence: 50
            });
        }
        if (this.capacities.time.available) {
            possibilities.push({
                type: 'activity',
                description: 'Possibilité: activité avec temps disponible',
                uncertainty: this.uncertainty.level,
                confidence: 50
            });
        }
        if (this.resources.physical.localKnowledge) {
            possibilities.push({
                type: 'guidance',
                description: 'Possibilité: partager connaissance locale',
                uncertainty: this.uncertainty.level,
                confidence: 50
            });
        }
        return possibilities;
    }

    _implicitPossibilities() {
        const implicit = [];
        if (this.situation.isolation && this.resources.physical.room.available && this.capacities.time.available) {
            implicit.push({
                type: 'retirement_transition',
                description: 'Transition de retraite avec ressources sous-utilisées',
                detected: 'sans_demande_explicite'
            });
        }
        if (this.situation.isolation && this.needs.some(n => n.type === 'social_connection') && this.capacities.time.available) {
            implicit.push({
                type: 'new_place_connection',
                description: 'Nouvel environnement - ouverture aux rencontres',
                detected: 'sans_demande_explicite'
            });
        }
        return implicit;
    }

    _forbiddenAssumptions() {
        return [
            { prohibition: 'room_available → housing_demand', reason: 'Resource exists but intent unknown' },
            { prohibition: 'time_available → activity_seek', reason: 'Availability ≠ Intent' },
            { prohibition: 'knowledge → tour_guide', reason: 'Knowledge ≠ Intent_to_share' },
            { prohibition: 'isolation → social_demand', reason: 'State ≠ Intent' },
            { prohibition: 'retirement → occupation_seek', reason: 'Life_stage ≠ Intent' }
        ];
    }
}

// Instance globale
window.NEXUS = window.NEXUS || {};
window.NEXUS.PossibilityEngine = new NEXUSPossibilityEngine();

// ============ POIN D'ENTRÉE ============
function analyzePossibility(text) {
    const engine = window.NEXUS.PossibilityEngine;
    const result = engine.analyze(text);
    
    return {
        expression: result.expression.raw,
        situation: result.situation,
        resources: result.resources,
        needs: result.needs,
        capacities: result.capacities,
        constraints: result.constraints,
        temporality: result.temporality,
        uncertainty: result.uncertainty,
        possibilities: result.possibilities,
        confidence: result.confidence,
        analysis_depth: 'V3.1 Possibility Engine',
        avoided_conclusions: result.possibilities.forbidden.map(f => f.prohibition)
    };
}

// ============ MISE EN FORME POUR L'INTERFACE ============
function formatForDisplay(result) {
    const lines = [];
    
    lines.push(`Situation: ${result.situation?.context || 'non_classifiée'}`);
    lines.push(`Isolation: ${result.situation?.isolation ? 'oui' : 'non'}`);
    lines.push(`Transition: ${result.situation?.transition ? 'oui' : 'non'}`);
    
    lines.push(`\nRessources identifiées:`);
    if (result.resources && result.resources.physical && result.resources.physical.room.available) lines.push('  - Chambre/logement: disponible');
    if (result.resources && result.resources.physical && result.resources.physical.time.available) lines.push(`  - Temps: ${result.resources.physical.time.hours}`);
    if (result.resources && result.resources.physical && result.resources.physical.localKnowledge) lines.push(`  - Connaissance locale: ${result.resources.physical.localKnowledge.level}`);
    
    lines.push(`\nBesoins:`);
    if (result.needs && result.needs.length > 0) {
        result.needs.forEach(n => lines.push(`  - ${n.type}: urgence ${n.urgency}`));
    } else {
        lines.push('  - Aucun besoin spécifique détecté');
    }
    
    lines.push(`\nCapacités:`);
    if (result.capacities && result.capacities.time.available) lines.push(`  - Temps disponible: ${result.capacities.time.available}`);
    if (result.capacities && result.capacities.skills && result.capacities.skills.length > 0) lines.push(`  - Compétences: ${result.capacities.skills.join(', ')}`);
    
    lines.push(`\nIncertitude: ${result.uncertainty?.level}% - ${result.uncertainty?.description}`);
    
    lines.push(`\nPossibilités émergentes:`);
    if (result.possibilities && result.possibilities.explicit) {
        result.possibilities.explicit.forEach(p => lines.push(`  - [${p.type}] ${p.description}`));
    }
    if (result.possibilities && result.possibilities.implicit) {
        result.possibilities.implicit.forEach(p => lines.push(`  • ${p.description}`));
    }
    
    lines.push(`\nConclusions délibérément évitées:`);
    if (result.possibilities && result.possibilities.forbidden) {
        result.possibilities.forbidden.forEach(f => lines.push(`  • ${f.prohibition}`));
    } else {
        lines.push('  Aucune conclusion hâtive imposée');
    }
    
    return lines.join('\n');
}

// ============ SUITE DE TESTS ============
function testSuite() {
    const phrases = [
        'Je suis épuisé, j\'ai juste envie de rentrer chez moi.',
        'J\'ai enormement de temps libre depuis que je suis à la retraite.',
        'J\'ai une chambre vide.',
        'Je connais très bien Lille.',
        'J\'ai une chambre qui ne sert plus depuis que ma fille est partie.',
        'Je pourrais aider samedi, mais seulement le matin.',
        'Ça fait trois jours que mon évier fuit et je repousse toujours le problème.',
        \"J\'apprends le saxophone mais je n\'ai vraiment pas le temps en ce moment.\",
        \"Je déménage dans deux semaines et je connais absolument personne.\",
        \"J\'ai plein de choses à dire sur les plantes si ça peut servir à quelqu'un.\"
    ];
    
    phrases.forEach((phrase, i) => {
        console.log(`${i + 1}. "${phrase}"`);
        const result = analyzePossibility(phrase);
        console.log(`   Situation: ${result.situation?.context || 'non_classifiée'}`);
        console.log(`   Chambre: ${result.resources?.physical?.room?.available ? 'disponible' : 'aucune détectée'}`);
        console.log(`   Besoins: ${result.needs?.length > 0 ? result.needs.map(n => n.type).join(', ') : 'aucun détecté'}`);
        console.log(`   Incertitude: ${result.uncertainty?.level}%`);
        console.log(`   Possibilités: ${result.possibilities?.explicit?.length > 0 ? result.possibilities.explicit.map(p => p.type).join(', ') : 'aucune'}`);
        console.log(`   Conclusions évitées: ${result.avoided_conclusions?.length > 0 ? result.avoided_conclusions.slice(0, 2).join('; ') : 'aucune'}`);
        console.log();
    });
}

testSuite();

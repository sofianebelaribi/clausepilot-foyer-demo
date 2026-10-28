import { CLAUSES } from './policy.js';
const clean = text => (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const unique = list => [...new Set(list)];

export function classify(description) {
  const d = clean(description);
  if ((/(velo|bicycl|bike)/.test(d)) && /(vol|vole|derobe|disparu)/.test(d)) return 'bike';
  if ((/(bougie|cire|chaleur|fondu|fond|brul)/.test(d)) && /(table|mobilier|jardin|terrasse)/.test(d)) return 'garden';
  if (/(vol|vole|cambriol|derobe)/.test(d) && /(porte|effraction|serrure|logement|appartement|maison)/.test(d)) return 'theft';
  return 'other';
}

function result({ kind, status, title, summary, facts, gaps, clauses, checks, decisionRule }) {
  return { kind, status, title, summary, facts: unique(facts), gaps: unique(gaps),
    clauses: unique(clauses).map(k => CLAUSES[k]), checks,
    decisionRule, autoDecision: false, policyEdition: '09/2024' };
}

/** Pure triage function. Input contracts use tri-state: yes / no / unknown. */
export function assess({ description, theftOption = 'unknown', mobilityPack = 'unknown', gardenPack = 'unknown', fireCover = 'unknown', lockedRoom = 'unknown', approvedLock = 'unknown', publicSpace = 'unknown', eventSudden = 'unknown' }) {
  const kind = classify(description);
  if (kind === 'bike') {
    const facts = ['Vol d’un vélo décrit par le déclarant'];
    const gaps = [];
    const checks = [
      ['Garantie vol souscrite', theftOption], ['Pack mobilité souscrit', mobilityPack],
      ['Local fermé', lockedRoom], ['Espace public', publicSpace], ['Antivol approuvé + point fixe', approvedLock],
    ];
    const clauses = ['particular', 'theft', 'mobility', 'mobilityLock', 'precautions'];
    if (theftOption === 'no' && mobilityPack === 'no') {
      return result({kind, status:'negative', title:'Garanties pertinentes non souscrites',
        summary:'Les options pertinentes sont déclarées absentes. Ce résultat reste une vérification de périmètre, pas une décision d’indemnisation.',
        facts, gaps:['Vérifier l’existence éventuelle d’une garantie distincte ou d’un avenant.'], clauses, checks, decisionRule:'OPTION_SCOPE'});
    }
    if (mobilityPack === 'yes' && publicSpace === 'yes' && approvedLock === 'no') {
      return result({kind, status:'negative', title:'Condition de sécurité non satisfaite',
        summary:'Pour le pack mobilité, la protection demandée dans un espace public n’est pas remplie d’après les éléments déclarés.',
        facts, gaps:['Confirmer que le lieu répond juridiquement à la notion d’espace public.','Vérifier les conditions particulières et les faits.'], clauses, checks, decisionRule:'PUBLIC_BIKE_LOCK'});
    }
    if (theftOption === 'unknown' && mobilityPack === 'unknown') gaps.push('Quelles garanties figurent aux conditions particulières ?');
    if (lockedRoom === 'no') facts.push('Local signalé comme non fermé à clé');
    else if (lockedRoom === 'unknown') gaps.push('Le local était-il effectivement fermé à clé ?');
    if (publicSpace === 'unknown') gaps.push('Le local collectif est-il assimilé à un espace public pour ce contrat ?');
    if (approvedLock === 'unknown') gaps.push('Le cadre du vélo était-il attaché à un point fixe avec un antivol approuvé ?');
    if (mobilityPack === 'unknown') gaps.push('Le pack mobilité durable est-il souscrit ?');
    if (theftOption === 'unknown') gaps.push('La garantie vol est-elle souscrite ?');
    if (publicSpace === 'yes' && approvedLock === 'no') facts.push('L’antivol exigé en espace public ne serait pas respecté');
    const favorable = mobilityPack === 'yes' && publicSpace === 'yes' && approvedLock === 'yes';
    return result({kind, status: favorable ? 'possible':'review',
      title: favorable ? 'Éligibilité envisageable, à vérifier' : 'Impossible de conclure en sécurité',
      summary: favorable ? 'La condition d’antivol du pack mobilité paraît satisfaite. La souscription, le statut du lieu et les autres clauses restent à valider.'
       : 'Un local commun non fermé ne suffit pas, à lui seul, à démontrer une exclusion universelle : la qualification du lieu, les options et les protections sont déterminantes.',
      facts, gaps: favorable ? ['Confirmer les conditions particulières et les circonstances exactes du vol.']:gaps,
      clauses, checks, decisionRule: favorable?'MOBILITY_ELIGIBLE_REVIEW':'INSUFFICIENT_CONTRACT_CONTEXT'});
  }
  if (kind === 'garden') {
    const facts = ['Dégradation d’un mobilier de jardin liée à une bougie / chaleur'];
    const checks = [['Pack jardin souscrit',gardenPack], ['Garantie incendie/assimilés',fireCover], ['Événement subit',eventSudden]];
    const clauses = ['particular','garden','heat','heatDefinition'];
    if (gardenPack === 'no') return result({kind,status:'negative',title:'Pack jardin déclaré absent',
      summary:'Le mobilier de jardin figure dans un pack optionnel déclaré non souscrit ; vérifier s’il existe une autre garantie applicable.',
      facts,gaps:['Vérifier les conditions particulières, avenants ou autres garanties.'],clauses,checks,decisionRule:'GARDEN_PACK_SCOPE'});
    const gaps = [];
    if (gardenPack !== 'yes') gaps.push('Le pack jardin / piscine a-t-il été souscrit ?');
    if (fireCover !== 'yes') gaps.push('La garantie incendie et événements assimilés figure-t-elle au contrat ?');
    if (eventSudden !== 'yes') gaps.push('La détérioration était-elle un événement subit ou une évolution progressive ?');
    gaps.push('L’analyse des exclusions, franchises et conditions particulières est nécessaire.');
    return result({kind,status:'review',title:'Qualification du dommage à instruire',
      summary:'La chaleur et le mobilier extérieur sont bien traités dans le document, mais la fonte progressive de la bougie ne prouve pas une action subite de la chaleur.',
      facts,gaps,clauses,checks,decisionRule:'HEAT_CAUSALITY_UNRESOLVED'});
  }
  if (kind === 'theft') {
    const facts = ['Vol / effraction dans un lieu d’habitation déclaré'];
    const checks = [['Garantie vol souscrite',theftOption]];
    const clauses = ['particular','theft','precautions','location'];
    if (theftOption === 'no') return result({kind,status:'negative',title:'Garantie vol non souscrite',
      summary:'La garantie vol est facultative dans le document étudié : l’absence déclarée doit être confirmée sur le contrat individuel.',
      facts,gaps:['Vérifier les conditions particulières et avenants.'],clauses,checks,decisionRule:'OPTION_SCOPE'});
    if (theftOption === 'yes') return result({kind,status:'possible',title:'Garantie potentiellement mobilisable',
      summary:'Le vol avec effraction correspond à un mode opératoire mentionné. Il faut encore établir les conditions du dossier avant toute décision.',
      facts,gaps:['Confirmer la présence d’effraction documentée.', 'Vérifier le périmètre assuré et les mesures de protection.'],clauses,checks,decisionRule:'THEFT_ELIGIBLE_REVIEW'});
    return result({kind,status:'review',title:'Souscription non vérifiée',
      summary:'Les conditions générales décrivent le vol, mais l’existence de la garantie au contrat individuel est inconnue.',
      facts,gaps:['Vérifier la souscription de la garantie vol.','Obtenir le procès-verbal ou les justificatifs d’effraction.'],clauses,checks,decisionRule:'OPTION_UNKNOWN'});
  }
  return result({kind,status:'review',title:'Aucune clause suffisamment pertinente',
    summary:'Le moteur ne trouve pas de correspondance fiable dans son périmètre : il refuse de produire un verdict sans preuve.',
    facts:[],gaps:['Décrire le dommage, le bien concerné et les circonstances.','Ajouter un corpus adapté avant d’évaluer ce sinistre.'],
    clauses:['particular'],checks:[],decisionRule:'OUT_OF_SCOPE'});
}



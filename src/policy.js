/**
 * Manually verified clause index. References are paraphrases, not the full licensed PDF.
 * The public Baloise policy is for recruitment demonstration, not a customer contract.
 */
export const POLICY = Object.freeze({
  id: 'CG-HOME(2)-LUFR-09-24',
  carrier: 'Baloise Assurances Luxembourg S.A.',
  product: 'HOME — Conditions générales',
  edition: '09/2024',
  publicPdf: 'https://www.baloise.lu/dam/baloise-lu/1890/particulier/documents/CG-CS/CG-HOME-2--LUFR-09-24.pdf0',
  actualParticularsProvided: false,
});

const url = (page) => `${POLICY.publicPdf}#page=${page}`;

export const CLAUSES = Object.freeze({
  particular: {
    id: 'CP-00', page: 15, heading: 'Garanties optionnelles', type: 'condition',
    note: 'Une option ne s’applique que si elle figure dans les conditions particulières du contrat.',
    href: url(15),
  },
  theft: {
    id: 'VOL-01', page: 15, heading: 'Vol / vandalisme', type: 'coverage',
    note: 'Le volet vol cite plusieurs modes opératoires et les biens mobiliers dans le bâtiment assuré.',
    href: url(15),
  },
  precautions: {
    id: 'VOL-02', page: 16, heading: 'Prévention / protection', type: 'limitation',
    note: 'Les accès doivent respecter des dispositifs de fermeture, avec des obligations de sécurité en cas d’absence.',
    href: url(16),
  },
  mobility: {
    id: 'MOB-01', page: 19, heading: 'Pack équipements de mobilité durable', type: 'coverage',
    note: 'Le pack inclut les vélos et vélos à assistance électrique, selon les limites et options souscrites.',
    href: url(19),
  },
  mobilityLock: {
    id: 'MOB-02', page: 19, heading: 'Condition pour la garantie vol', type: 'condition',
    note: 'Dans un espace public, le vélo doit être relié par son cadre à un point fixe avec un antivol approuvé.',
    href: url(19),
  },
  garden: {
    id: 'JAR-01', page: 20, heading: 'Pack jardin / piscine', type: 'coverage',
    note: 'Le mobilier de jardin fait partie des biens visés par ce pack, sous réserve d’un événement garanti.',
    href: url(20),
  },
  heat: {
    id: 'INC-01', page: 12, heading: 'Incendie et événements assimilés', type: 'coverage',
    note: 'La garantie de base mentionne les dommages ménagers dus à une action subite de la chaleur ou au contact du feu.',
    href: url(12),
  },
  heatDefinition: {
    id: 'DEF-01', page: 6, heading: 'Dommages ménagers — définition', type: 'definition',
    note: 'Cette définition décrit notamment certains dommages aux objets d’ameublement dus à un excès de chaleur sans embrasement.',
    href: url(6),
  },
  location: {
    id: 'BIEN-01', page: 11, heading: 'Biens mobiliers', type: 'condition',
    note: 'La couverture ordinaire du contenu vise les biens situés dans les locaux assurés, sauf extension prévue.',
    href: url(11),
  },
});


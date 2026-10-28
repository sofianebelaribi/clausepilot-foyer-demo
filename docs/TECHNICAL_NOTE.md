# ClausePilot — Note technique de candidature

**Consigne :** https://lux-guide.github.io/recrutement-ia/#repondre — AI engineering, sujet 1.

## Besoin métier

Pour instruire un sinistre, il faut identifier le bon contrat, sa version, les garanties souscrites, les faits, les conditions, les exclusions et les pièces justificatives. **Une phrase pertinente trouvée dans des conditions générales ne suffit pas à établir la couverture.** Les deux questions imposées : vélo volé dans un local commun non fermé, et bougie fondue sur une table de jardin.

## Ce qui fonctionne sur l'URL publique

Une interface autonome avec quatre cas fictifs, description libre, champs à trois valeurs (oui / non / inconnu), moteur lexical et règles explicites, synthèse, points à vérifier, liens vers les pages et export. Toutes les issues comportent le verrou autoDecision=false. Les neuf références sont des **paraphrases sélectionnées manuellement** dans Baloise HOME 09/2024, un contrat public qui n'est pas affilié à Foyer. Les garanties d'un assuré réel, ses avenants et justificatifs sont inconnus.

**Ce n'est pas un modèle génératif, ni un RAG, ni une décision de garantie.** Une clause proposée est une piste à lire, pas une justification exhaustive.

## POC documentaire exécutable et séparé

Le module Python pipeline/contract_index.py fournit une première brique indépendante :
- manifest de documents : contract_id, édition, chemin PDF et URL source ;
- extraction du texte embarqué avec PyMuPDF ; refus explicite si OCR requis ;
- découpage par page physique en passages se chevauchant ;
- index JSON structuré avec contrat, version, SHA-256, passage, page et URL ;
- recherche BM25 **filtrée par contract_id et par édition** ; si plusieurs éditions portent le même identifiant de contrat, la recherche exige l'édition explicite et s'abstient sinon ;
- réponse sous forme de passages retrouvés avec liens PDF page par page, **sans verdict** ;
- détection heuristique et annotation des passages semblant adresser une instruction à un LLM, sans exécution ni suppression du texte d'origine.

L'interface web **n'est pas connectée à ce POC**. Ce module est une démonstration de faisabilité technique, pas une promesse de scalabilité. Les tests synthétiques de 200 IDs de contrats vérifient l'isolement des sources, pas des performances réelles sur 200 fichiers d'assurance.

## Chaîne à construire pour plusieurs centaines de contrats

1. Identifier contrat, produit, édition, période de validité, avenants et conditions particulières avant la recherche.
2. Ingestion PDF avec détection de scans/OCR, extraction de pages, tableaux, sections, définitions et renvois ; versionnement et contrôle de qualité.
3. Stocker les textes, pages et preuves de provenance ; index BM25 + embeddings et reranking filtrés par droits et contrat.
4. Extraire les faits du sinistre, les garanties effectives et leur statut inconnu, puis rechercher **séparément** conditions, exclusions et exceptions.
5. Retourner chaque conclusion avec citation verbatim, version et page, contradiction détectée, pièces manquantes et justification de l'abstention.
6. Soumettre le résultat à un gestionnaire pour validation et conserver une trace auditable.
7. Évaluer recall@k, précision des citations, erreur de mélange de contrats, taux d'abstention, faux positifs de couverture, latence et coût.

## Tests et limites

- 21 tests Node.js (dont une tentative de prompt injection dans la déclaration).
- 14 tests Python : passages, langue française, provenance, PDF réel généré sur 2 pages, 200 contrats **synthétiques**, absence de contenu et isolation entre polices.
- Ne sont PAS évalués : qualité de l'OCR sur scan, tableaux, franchises, avenants, retrieval sur corpus de contrats réels, calibration d'un modèle, robustesse juridique.
- Une recherche BM25 positive n'est jamais une preuve de couverture, et les mots-clés peuvent échouer sur des paraphrases ou des négations.

## Choix technique

La page de recrutement dit explicitement préférer un petit produit fonctionnel à un projet ambitieux inachevé. Ce dépôt choisit donc un prototype de décision explicable et une expérimentation documentaire distincte, en exposant les limites, plutôt que de prétendre avoir construit un système RAG industrialisé.

## Présentation et déploiement (édition 2026-10-28)

L'interface actuelle est un poste de travail dark compact inspiré, sans copie, des principes visuels d'Affect UI. La déclaration, l'orientation et le panneau de références sont visibles simultanément sur ordinateur. Aucun score de confiance non calibré ni badge marketing.

`npm run build` produit **une seule source de vérité** : `index.html` autonome puis `dist/worker.mjs` et `dist/release.json`. Le Worker expose `/__version` avec l’empreinte SHA-256 du HTML. La CI GitHub exécute tests et vérifie l'absence de différence après build ; le workflow de déploiement exige des secrets Cloudflare. Cette procédure remplace la publication manuelle de deux versions HTML indépendantes. Voir `docs/SECURITY.md` et `DESIGN.md`.

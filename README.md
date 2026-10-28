# ClausePilot — exercice AI engineering Foyer

Prototype indépendant en français, réalisé pour le sujet **« Un sinistre, et les conditions générales »**. [Consigne Foyer](https://lux-guide.github.io/recrutement-ia/#repondre).

**Démonstration :** https://clausepilot-foyer-demo.sofiane5434.workers.dev/  
**Version effectivement publiée :** [/__version](https://clausepilot-foyer-demo.sofiane5434.workers.dev/__version)

## À quoi sert le prototype ?

Une personne choisit un des quatre sinistres fictifs, corrige les faits et les informations sur ses garanties, et consulte une **orientation provisoire accompagnée de références documentaires**, des faits connus et des vérifications manquantes. Le moteur peut s'abstenir. Le PDF public source est accessible depuis chaque référence.

Les deux exemples de l'énoncé sont inclus : **vélo volé dans le local commun non verrouillé** et **bougie ayant abîmé une table de jardin**.

## Ce que la démo fait réellement

- Frontend autonome, responsive et accessible au clavier, en dark mode.
- Moteur déterministe de classification lexicale et règles explicites (`src/inference.js`).
- 9 références **paraphrasées et indexées manuellement** des conditions générales publiques *Baloise HOME 09/2024* (`src/policy.js`).
- Cas déclarés oui / non / inconnu ; orientation *à approfondir*, *condition à vérifier*, ou *garantie envisageable*, jamais une indemnisation décidée.
- Citations, lien vers pages PDF, modification d'hypothèses, export du dossier. Aucun backend ni donnée client.

**Ce n'est PAS un modèle génératif, un RAG complet ni une application capable de statuer juridiquement sur une couverture.** Les conditions particulières, avenants et pièces client sont inconnus. Le choix de Baloise est purement documentaire ; aucune affiliation avec Baloise ou Groupe Foyer.

## Pipeline PDF exécutable (distinct du frontend)

`pipeline/contract_index.py` peut extraire le texte de PDF lisibles, créer un index JSON par contrat / **édition exacte**, empreinte SHA-256 et numéro de page, puis récupérer des passages via BM25. Si plusieurs éditions existent pour un même contrat, l'appelant doit spécifier `--edition` ; sinon la recherche refuse de continuer. Les textes de type prompt injection sont **signalés comme contenu non fiable** mais conservés sans être exécutés. Ces alertes heuristiques ne prétendent pas garantir la sécurité d'un futur LLM.

```bash
python -m pip install pymupdf
python -m pipeline.contract_index index --manifest examples/manifest.example.json --output contract-index.json
python -m pipeline.contract_index search --index contract-index.json --contract-id BALOISE_HOME_2024-09 --query "vol vélo local commun"
```

Télécharger au préalable le contrat public indiqué dans `examples/manifest.example.json` et l'enregistrer sous `examples/baloise-home.pdf`. Le document source n'est pas redistribué dans le dépôt.

**Les deux moteurs ne sont pas connectés.** Un résultat BM25 ne constitue pas une preuve de couverture. Le découpage actuel par page et fenêtres de mots est un POC, non un parseur robuste de clauses, de tableaux, d'avenants et d'exclusions.

## Installation, build et tests

```bash
npm run build                     # index.html + dist/worker.mjs + dist/release.json
npm test                          # tests de triage, limites et texte adversarial
python -m unittest discover -s tests -p test_contract_index.py -v
python tests/ui-smoke.py          # nécessite Playwright + navigateur Chromium
```

Le HTML autonome est reconstruit depuis `index.src.html`, `styles.css` et `src/*.js`. Le Worker est généré depuis **ce même HTML**, jamais depuis une autre copie manuelle. `dist/release.json` contient l’empreinte SHA-256 du HTML. `/__version` expose la même empreinte en production.

La CI valide le build, les tests et l'identité du HTML. Le déploiement est défini dans `.github/workflows/deploy.yml` et `wrangler.toml`. Il requiert les secrets GitHub `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID` pour une publication automatique ; sans ces secrets, il exécute les contrôles et signale que le déploiement est non configuré.

## Documentation

- [Note technique et limites](docs/TECHNICAL_NOTE.md)
- [Matrice de conformité à l'exercice](docs/RECRUITMENT_BRIEF.md)
- [Sécurité des entrées et prompt injections](docs/SECURITY.md)
- [Design system](DESIGN.md)

**Décision produit :** privilégier une tranche verticale justifiable plutôt que feindre une plateforme d'assurance prête pour la production. Licence MIT pour le code du prototype.

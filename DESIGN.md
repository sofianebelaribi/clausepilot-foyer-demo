# ClausePilot — Dark Workbench Design System

## Positionnement

Interface métier à tâche unique, pas une landing page générique. La question du sinistre, l'orientation conditionnelle et les preuves sont visibles dans un même espace. Référence stylistique : [Affect UI](https://www.affectui.com/), en particulier les captures **dark mode** fournies par le porteur du projet. Inspiration de composition et de finition uniquement ; aucun code, composant Pro ou visuel propriétaire n'est copié.

## Identité

- Fond presque noir, panneaux neutres subtils ; interface à faible bruit visuel.
- Inter si disponible, repli sur la pile système. Graisses dominantes 400/500.
- Accent rose `#e26eb4` **rare** pour la marque/sélection ; bleu pâle pour citer une référence contractuelle.
- Une grande surface fonctionnelle structurée par de minces bordures ; pas de tuiles KPI, de gradients, de glows, d'avatares fictifs, d'animations au scroll.

| Rôle | Token | Hex |
|---|---|---|
| Canvas | `--bg` | `#101012` |
| Frame | `--frame` | `#151517` |
| Panneau | `--panel` | `#1c1c1f` |
| Raised | `--raised` | `#242428` |
| Texte | `--ink` | `#f2f2f4` |
| Secondaire | `--muted` | `#a0a0a7` |
| Bordure | `--line` | `#303034` |
| Focus | `--focus` | `#85b7ff` |
| Accent rare | `--accent` | `#e26eb4` |
| Compatible / avertissement / restriction | `--positive` / `--warning` / `--negative` | `#8bdeb5` / `#f5cb83` / `#f4979a` |

## Composition

Ordinateur : header compact → titre de 40 px → surface de travail centrée (max 1180 px) → bande de scénarios → **colonne gauche** (déclaration + orientation), **colonne droite** (références PDF) ; section méthodologique courte et pieds de page. La colonne des sources ne contient **que des preuves**, pas du texte marketing. Dès 950 px, les deux régions se succèdent verticalement et les sources restent lisibles. À 680 px, les contrôles s'enroulent et les champs se présentent en une colonne.

## Composants et états

- `CasePill` : sélectionner un cas fictif, avec `aria-pressed`.
- `ClaimComposer` : texte libre et champs déclaratifs tri-state, erreur si vide.
- `Assessment` : état provisoire, explication, faits retenus, faits manquants ; avertissement constant.
- `CitationChip` : bouton pour inspecter la référence ; ouverture contextuelle, fermeture Escape ; focus visible.
- `EvidenceItem` : titre, paraphrase, numéro de clause et page PDF. Il ne prétend pas afficher un extrait verbatim.
- `StaleState` : empêche export/copie si les faits ont changé depuis l'analyse.
- `Followup` : modifie un fait explicite et réexécute le moteur ; n'effectue jamais de changement caché.

## Accessibilité et anti-slop

Contrastes textuels élevés, état métier par texte **et** couleur, focus visible, `prefers-reduced-motion`, contrôles standard ≥ 38 px sauf actions secondaires compactes. Aucun bouton décoratif. Pas de scores de confiance non calibrés. Les éléments des sources doivent toujours être liés à une URL de contrat et une page. Les tests Playwright couvrent 320, 375, 390, 480, 768, 900, 1024, 1280, 1440 et 1920 px ainsi que la sortie adversariale.

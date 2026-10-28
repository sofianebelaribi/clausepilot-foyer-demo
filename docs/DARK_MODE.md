# Dark mode design tokens

Source: user-supplied **Affect UI** design-system extraction, 28 October 2026.

Default mode: dark; no automatic browser preference switch.

| Role | Token |
|---|---|
| Background | `#090E16` |
| Surface | `#181C24` |
| Raised | `#242930` |
| Primary text | `#F5F8FD` |
| Muted | `#9B9FA5` (higher-contrast variants used for small text) |
| Border | `#30353B` |
| Accent | `#1F79FF` |

The UI structure and insurance triage code are unchanged; the source design tokens were adapted to accessible text sizes, form contrast, focus rings and warning/error states. `styles.css` contains the dark stylesheet at its end. `npm run check` rebuilds the standalone `index.html` and runs the same logic tests.

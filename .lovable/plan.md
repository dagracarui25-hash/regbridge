

## Plan: Fix hardcoded French texts on Auth page

### Problem
The Auth page (`src/pages/Auth.tsx`) has 3 hardcoded French strings that don't respond to language changes:
- Line 118: subtitle text
- Lines 129-131: three bullet point features

All other texts already use `t()` with correct translations in all 4 locale files.

### Changes

**1. Add new i18n keys to all 4 locale files**

New keys: `auth.brandingDesc`, `auth.feature1`, `auth.feature2`, `auth.feature3`

| Key | EN | FR | DE | IT |
|-----|----|----|----|----|
| `auth.brandingDesc` | AI-augmented regulatory intelligence for compliance professionals. | Intelligence réglementaire augmentée par l'IA pour les professionnels de la compliance. | KI-gestützte regulatorische Intelligenz für Compliance-Fachleute. | Intelligenza regolamentare potenziata dall'IA per i professionisti della compliance. |
| `auth.feature1` | Real-time FINMA analysis | Analyse FINMA en temps réel | FINMA-Analyse in Echtzeit | Analisi FINMA in tempo reale |
| `auth.feature2` | Basel III / IV Compliance | Conformité Bâle III / IV | Basel III / IV Konformität | Conformità Basilea III / IV |
| `auth.feature3` | Secured internal documents | Documents internes sécurisés | Gesicherte interne Dokumente | Documenti interni protetti |

**2. Update `src/pages/Auth.tsx`**

- Line 118: Replace hardcoded string with `{t("auth.brandingDesc")}`
- Lines 128-132: Replace hardcoded array with `[t("auth.feature1"), t("auth.feature2"), t("auth.feature3")]`

Also fix `en.json` existing key `auth.loginSubtitle` from "Access your compliance space" → "Access your compliance workspace" per user request.

### Files modified
1. `src/i18n/locales/en.json` — add 4 keys + fix loginSubtitle
2. `src/i18n/locales/fr.json` — add 4 keys
3. `src/i18n/locales/de.json` — add 4 keys
4. `src/i18n/locales/it.json` — add 4 keys
5. `src/pages/Auth.tsx` — replace 2 hardcoded sections with `t()` calls

No design, layout, color, or logic changes.


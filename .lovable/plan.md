

## Plan: Internationalization (i18n) for RegBridge

### Overview
Install `i18next` + `react-i18next` + `i18next-browser-languagedetector`, create 4 translation files (EN/DE/FR/IT), add a language selector dropdown in the header, and replace all hardcoded strings across every component with `t()` calls.

### 1. Install dependencies
- `i18next`, `react-i18next`, `i18next-browser-languagedetector`

### 2. Create i18n infrastructure
- **`src/i18n/index.ts`** — Initialize i18next with browser language detection, localStorage persistence, fallback to `en`
- **`src/i18n/locales/en.json`** — Reference translation file (English)
- **`src/i18n/locales/fr.json`** — French translations
- **`src/i18n/locales/de.json`** — German translations
- **`src/i18n/locales/it.json`** — Italian translations

Key structure following the convention `page.section.element`:
```json
{
  "nav": { "question": "...", "analysis": "...", "documents": "...", "online": "...", "offline": "..." },
  "docs": { "upload": "...", "send": "...", "library": "...", "refresh": "...", "empty": "...", "indexed": "...", "search": "...", "allCategories": "...", "mostRecent": "...", "nameAZ": "...", "dragPdf": "...", "formatPdf": "...", "category": "...", "clickOrDragToChange": "...", "dropHere": "...", "unsupportedFormat": "...", "fileTooLarge": "...", "uploadError": "...", "deleteConfirmTitle": "...", "deleteConfirmDesc": "...", "cancel": "...", "delete": "...", "noResults": "...", "resultsCount": "..." },
  "access": { "title": "...", "description": "...", "placeholder": "...", "incorrectCode": "...", "submit": "..." },
  "settings": { "title": "...", "apiUrl": "...", "test": "...", "reset": "...", "save": "...", "serverOnline": "...", "serverOffline": "..." },
  "chat": { "newConversation": "...", "history": "...", "placeholder": "...", "analyzing": "...", "sources": "...", "today": "...", "yesterday": "..." },
  "cross": { "title": "...", "description": "...", "loading": "...", "finmaTitle": "...", "internalTitle": "...", "noFinma": "...", "noInternal": "...", "placeholder": "..." },
  "error": { "banner": "...", "generic": "..." },
  "footer": { "version": "..." },
  "common": { "logout": "..." },
  "suggestions": { ... }
}
```

### 3. Create LanguageSelector component
- **`src/components/LanguageSelector.tsx`** — Dropdown using existing `DropdownMenu` UI component
- Shows flag + code (🇬🇧 EN) as trigger button
- 4 items: 🇬🇧 EN, 🇩🇪 DE, 🇫🇷 FR, 🇮🇹 IT
- Calls `i18n.changeLanguage()` on selection
- Placed in `Index.tsx` header, between the status indicator and SettingsDrawer

### 4. Import i18n in main.tsx
- Add `import "./i18n"` to `src/main.tsx`

### 5. Update all components with `useTranslation()`
Files to modify (every hardcoded string replaced with `t('key')`):

| Component | Strings to translate |
|---|---|
| `Index.tsx` | Header title/subtitle, tab labels, footer, status |
| `QuestionFinma.tsx` | Suggestions, placeholder, loading text, sources label |
| `AnalyseCroisee.tsx` | Title, description, placeholder, loading, column headers, empty states |
| `DocumentsInternes.tsx` | (minimal, mostly delegates) |
| `UploadZone.tsx` | All labels, upload messages, category options, error messages |
| `DocumentLibrary.tsx` | Library title, filter/sort labels, search placeholder, empty states, delete dialog, results counter |
| `ChatSidebar.tsx` | "New conversation", "History", date labels (Today/Yesterday) |
| `SettingsDrawer.tsx` | All labels, button text, test results |
| `AccessCodeModal.tsx` | Title, description, placeholder, error, button |
| `ErrorBanner.tsx` | Error message text |

### 6. Handle dynamic content
- Categories in `types.ts` will use translation keys (e.g. `t('docs.categories.internal')`) — the `CATEGORIES` array becomes keys mapped through `t()`
- Date formatting will use locale from `i18n.language` instead of hardcoded `"fr-CH"`
- Interpolation for chunks: `t('docs.indexed', { count: n })`


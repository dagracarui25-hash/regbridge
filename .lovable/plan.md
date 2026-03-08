

## Plan : Zone de chat pleine largeur responsive

Remplacer `max-w-5xl` par `max-w-full` avec un padding horizontal adaptatif sur 3 endroits dans `QuestionFinma.tsx` :

**`src/components/QuestionFinma.tsx`** — 3 modifications :

1. **Ligne 82** : Augmenter le padding horizontal `px-4` → `px-4 sm:px-8 lg:px-16` pour aérer sur grands écrans
2. **Ligne 83** : `max-w-5xl mx-auto` → `max-w-full` — supprime la contrainte de largeur sur les messages
3. **Ligne 200** : `max-w-5xl mx-auto` → `max-w-full` — idem pour le champ de saisie

Le contenu occupera toute la largeur disponible avec des marges latérales croissantes selon la taille d'écran, garantissant la lisibilité sur mobile comme sur grand écran.


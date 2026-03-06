

## Plan : Améliorer la lisibilité des réponses de l'agent

### Problème
Les réponses de l'agent sont affichées en texte brut (`whitespace-pre-wrap`) sans aucune mise en forme. Les paragraphes, références et listes se confondent dans un bloc monolithique.

### Solution
Créer un composant `FormattedMessage` qui parse le texte et le rend avec une mise en forme structurée :

1. **`src/components/FormattedMessage.tsx`** (nouveau) :
   - Séparer le texte en paragraphes (double saut de ligne)
   - Mettre en gras les textes entre `**...**`
   - Styliser les références `[1]`, `[2]` etc. comme des badges inline
   - Détecter les lignes commençant par `Référence :` ou `Références :` et les afficher dans un bloc distinct stylisé
   - Détecter les listes à puces (lignes commençant par `- ` ou `• `) et les rendre comme des `<ul>/<li>`
   - Espacement entre paragraphes avec `space-y-2`

2. **`src/pages/Index.tsx`** :
   - Remplacer `<p className="whitespace-pre-wrap">{msg.text}</p>` par `<FormattedMessage text={msg.text} />` pour les messages agent
   - Garder le rendu simple pour les messages utilisateur

### Détail technique
Le parsing sera purement côté client avec des regex simples, sans dépendance markdown externe.


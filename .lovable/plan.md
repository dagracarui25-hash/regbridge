

## Plan : Sidebar avec historique des conversations

### Architecture

**Nouveau fichier** : `src/hooks/useConversations.ts` — Hook custom pour gérer l'état des conversations (liste, conversation active, créer/supprimer/changer de conversation). Stockage dans `localStorage` pour persistance.

**Nouveau fichier** : `src/components/ChatSidebar.tsx` — Composant sidebar utilisant les composants Shadcn `Sidebar*`. Contient :
- Bouton "Nouvelle conversation" en haut avec icône `Plus`
- Liste des conversations passées avec titre (extrait du premier message utilisateur), date et preview
- Conversation active mise en surbrillance
- Bouton supprimer au survol de chaque conversation
- Style glass/sombre cohérent avec le thème existant

**Modifications** :

- **`src/pages/Index.tsx`** : Wrap le layout avec `SidebarProvider` + `Sidebar`. Extraire la logique de messages dans le hook `useConversations`. Le chat affiche les messages de la conversation active. Le header reçoit un `SidebarTrigger`.

- **`src/App.tsx`** : Aucun changement nécessaire.

### Structure des données

```text
Conversation {
  id: string
  title: string (premier message user, tronqué)
  messages: Message[]
  createdAt: number
  updatedAt: number
}
```

### Comportement
- Au lancement : une conversation vide avec le message d'accueil
- "Nouvelle conversation" : crée une nouvelle conversation vide, la rend active
- Cliquer sur une conversation dans la sidebar : charge ses messages
- Le titre se met à jour avec le premier message utilisateur
- Persistance via `localStorage`
- Sidebar collapsible sur mobile (sheet) et desktop (icon mode)


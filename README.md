# FocusADHD

Assistant quotidien mobile pensé pour les cerveaux TDAH. Tâches, micro-étapes, focus Pomodoro adapté, et gamification légère — sans la surcharge visuelle des apps de productivité génériques.

## Stack

- **Expo SDK 51** + React Native 0.74 (TypeScript strict)
- **React Navigation** (bottom tabs)
- **Zustand** + AsyncStorage pour l'état persistant
- **react-native-svg** pour l'anneau de progression Pomodoro
- **expo-haptics** + **expo-keep-awake** pour le confort de session focus

## Fonctionnalités MVP

- **Tâches** : ajout rapide, priorité, décomposition automatique en micro-étapes (heuristique locale, pas d'IA externe).
- **Focus** : timer Pomodoro avec cycles courts (préset 10/15/25/45 min), petites/grandes pauses configurables, vibrations en transition.
- **Gamification** : XP par tâche terminée (+10) et par session focus (+25 + minutes), niveaux progressifs, série de jours consécutifs, stats cumulées.
- **Réglages** : durée des pauses, niveau de vibration, reset complet.
- **Persistance locale** : tout est sauvegardé dans AsyncStorage, fonctionne offline.

## Démarrer

```bash
npm install
npm start
```

Puis scanner le QR code avec Expo Go (iOS/Android), ou `npm run ios` / `npm run android`.

## Structure

```
App.tsx                      Navigation + splash
src/
  store.ts                   Zustand store persistant
  theme.ts                   Couleurs, espacements, typo
  types.ts                   Task, Subtask, GamificationState, Settings
  utils.ts                   uid, formatTime, decomposeTask, levelFromXp
  components/
    AddTaskSheet.tsx         Modal de création de tâche
    PomodoroTimer.tsx        Anneau + contrôles
    TaskItem.tsx             Carte tâche dépliable
    XPBar.tsx                Barre XP + niveau
  screens/
    TasksScreen.tsx          Liste filtrable + FAB
    FocusScreen.tsx          Timer + presets + tâche en cours
    ProfileScreen.tsx        Stats + réglages
```

## Ce qui n'est PAS dans ce MVP

- Pas d'IA externe (décomposition heuristique uniquement) — au menu ensuite.
- Pas de sync cloud, pas de comptes.
- Pas de notifications push planifiées.
- Pas de paiement / abonnement (positionnement $7.99/mois prévu plus tard).

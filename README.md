# FocusADHD

Assistant quotidien mobile pensé pour les cerveaux TDAH. Tâches, micro-étapes, focus Pomodoro adapté, et gamification légère — sans la surcharge visuelle des apps de productivité génériques.

## Stack

- **Expo SDK 51** + React Native 0.74 (TypeScript strict)
- **React Navigation** (bottom tabs)
- **Zustand** + AsyncStorage pour l'état persistant
- **react-native-svg** pour l'anneau de progression Pomodoro
- **expo-haptics** + **expo-keep-awake** pour le confort de session focus

## Fonctionnalités

- **Tâches** : ajout rapide, priorité, décomposition automatique en micro-étapes. Décomposition IA optionnelle via Claude (BYOK — clé Anthropic stockée localement).
- **Routines** : habitudes récurrentes (jours de la semaine, heure de rappel optionnelle), série par routine, reset visuel quotidien.
- **Focus** : timer Pomodoro avec cycles courts (préset 10/15/25/45 min), petites/grandes pauses configurables, vibrations en transition, **mode zen** plein écran sombre pour réduire la surcharge visuelle. State centralisé : pause/reprise/reset cohérents entre vues.
- **Notifications locales** : alerte fin de session Pomodoro (même app fermée), rappel quotidien configurable, rappels par routine.
- **Gamification** : XP par tâche (+10), par routine (+5), par session focus (+25 + minutes), niveaux progressifs, série de jours consécutifs, stats cumulées.
- **Persistance locale** : tout est sauvegardé dans AsyncStorage, fonctionne offline.

## Démarrer

```bash
npm install
npm start
```

Puis scanner le QR code avec Expo Go (iOS/Android), ou `npm run ios` / `npm run android`.

## Structure

```
App.tsx                      Navigation + splash + montage de l'engine Pomodoro
src/
  store.ts                   Zustand store persistant (tâches, routines, gamification, settings, état Pomodoro)
  theme.ts                   Couleurs, espacements, typo
  types.ts                   Task, Routine, GamificationState, Settings, PomodoroState
  utils.ts                   uid, formatTime, decomposeTask (heuristique), levelFromXp
  usePomodoroEngine.ts       Tick global qui détecte les fins de phase
  services/
    notifications.ts         Wrappers expo-notifications (focus end, daily, routines)
    ai.ts                    Appel direct à l'API Anthropic (BYOK)
  components/
    AddTaskSheet.tsx         Modal création tâche (avec option IA)
    AddRoutineSheet.tsx      Modal création routine (jours + heure de rappel)
    PomodoroTimer.tsx        Anneau + contrôles (pure view, lit le store)
    TaskItem.tsx             Carte tâche dépliable
    RoutineItem.tsx          Ligne routine avec toggle + série
    XPBar.tsx                Barre XP + niveau
    ZenMode.tsx              Modal plein écran sombre avec timer + tâche
  screens/
    TasksScreen.tsx          Liste filtrable + FAB
    RoutinesScreen.tsx       Liste des routines + FAB
    FocusScreen.tsx          Timer + presets + tâche en cours + bouton zen
    ProfileScreen.tsx        Stats + rappels + IA (clé API) + réglages
```

## Ce qui n'est PAS encore là

- Pas de sync cloud, pas de comptes (tout est local).
- Pas de notifications push distantes (uniquement notifications locales planifiées).
- Pas de paiement / abonnement (positionnement $7.99/mois prévu plus tard via RevenueCat).
- Pas de proxy serveur pour l'IA — la clé Anthropic est stockée et utilisée côté client (modèle BYOK pour la phase MVP).

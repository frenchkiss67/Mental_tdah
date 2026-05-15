# CLAUDE.md

Contexte d'orientation pour assister sur ce repo. À lire avant tout travail non-trivial.

## Produit

**FocusADHD** — assistant quotidien mobile pensé pour les cerveaux TDAH (adultes diagnostiqués). Tâches avec décomposition en micro-étapes, routines récurrentes, focus Pomodoro adapté, mode zen, gamification compassionnelle (jokers anti-shame). Positionnement : "BY & FOR TDAH", pas une app productivity générique reconfigurée. Cible monétisation : $7.99/mois (non implémenté).

## Stack

- **Expo SDK 51** + React Native 0.74
- **TypeScript** strict (`tsc --noEmit` doit passer sans erreur)
- **React Navigation 6** bottom tabs (4 onglets : Tâches / Routines / Focus / Profil)
- **Zustand 4** + middleware `persist` avec AsyncStorage
- **react-native-svg** pour l'anneau Pomodoro
- **expo-notifications** (locales uniquement), **expo-haptics**, **expo-keep-awake**

Pas d'EAS Build configuré : on développe via Expo Go (`npm start`). Pas d'iOS/Android natif dans le repo.

## Commandes utiles

```bash
npm install            # installer les deps
npm start              # lancer Expo dev server
npx tsc --noEmit       # typecheck (gate avant chaque commit)
```

Il n'y a pas de suite de tests ni de lint configuré activement. Le seul garde-fou auto est `tsc`.

## Structure

```
App.tsx                          Bootstrap nav, splash, monte usePomodoroEngine, applique le thème
src/
  theme.ts                       Palettes lightColors/darkColors, ColorScheme, useColors() hook
  store.ts                       Zustand store unique persistant (TOUT l'état mutable est ici)
  types.ts                       Types partagés + constantes (JOKER_CAP, JOKER_INITIAL)
  utils.ts                       uid, todayKey, daysBetween, formatTime, decomposeTask (heuristique),
                                 levelFromXp, pickWeightedRandomTask
  usePomodoroEngine.ts           Tick global qui détecte les fins de phase (monté UNE fois dans App.tsx)
  services/
    notifications.ts             Wrappers expo-notifications (focus end, daily reminder, routine)
    ai.ts                        Appel direct API Anthropic, BYOK (clé dans settings)
  components/
    AddTaskSheet.tsx             Modal création tâche (avec option décomposition IA)
    AddRoutineSheet.tsx          Modal création routine (jours + heure)
    PomodoroTimer.tsx            Anneau SVG + contrôles, pure view qui lit le store
    TaskItem.tsx                 Carte tâche dépliable
    RoutineItem.tsx              Ligne routine
    StuckCard.tsx                Boutons "Juste 2 min" + "Choisis pour moi" (anti-friction TDAH)
    XPBar.tsx                    Barre XP + niveau
    ZenMode.tsx                  Modal plein écran toujours sombre
  screens/
    TasksScreen.tsx
    RoutinesScreen.tsx
    FocusScreen.tsx
    ProfileScreen.tsx
```

## Conventions à respecter

### Thème dynamique

Tous les composants utilisent le pattern :

```tsx
const Comp: React.FC = () => {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return <View style={styles.card} />;
};

const makeStyles = (c: ColorScheme) => StyleSheet.create({
  card: { backgroundColor: c.surface, borderColor: c.border },
});
```

**Ne pas** importer `colors` directement depuis `'../theme'` dans un composant — ça ne réagit pas au changement de thème. L'export `colors` n'existe que comme fallback pour du code hors React (et pour le splash dans `App.tsx` qui s'affiche avant l'hydratation du store).

`ZenMode` est l'exception : il reste sombre quoi qu'il arrive et utilise des constantes locales.

### State

Tout le state persistant et partagé est dans `src/store.ts`. Une seule store Zustand. Slices logiques : `tasks`, `routines`, `gamification`, `settings`, `pomodoro`, `currentTaskId`. Le flag `hydrated` est non-persisté, juste pour l'écran splash.

Pour ajouter un nouvel état :
1. Ajouter le type dans `types.ts`
2. Ajouter le slot dans `Store` + une valeur initiale
3. Ajouter au `partialize` si ça doit être persisté
4. Préférer une action sur le store plutôt qu'un setter générique

Le state Pomodoro **n'est pas persisté** (`partialize` l'exclut) — on redémarre proprement à chaque ouverture.

### Pomodoro

L'état Pomodoro vit dans le store (`pomodoro`). Le tick (détection de fin de phase) est dans `usePomodoroEngine` monté **une seule fois** dans `App.tsx > AppCore`. Le composant `PomodoroTimer` est une pure view qui :
- lit `endsAt` et calcule `remainingSec` à chaque rendu
- a son propre `setInterval` à 500 ms juste pour re-render l'affichage (pas pour piloter la logique)

Pour modifier la durée d'une session sans toucher les réglages utilisateur, passer un override en secondes : `startPomodoroPhase('focus', 120)`. C'est exactement ce que fait `startQuickFocus` pour le bouton "Juste 2 min".

Pause / reprise : encodé via `pausedSecondsLeft` (number | null). Ne pas réutiliser `endsAt` pour stocker autre chose qu'un timestamp futur.

### Notifications

Toujours passer par `src/services/notifications.ts`. Les fonctions appellent `ensurePermissions()` en interne et renvoient `null` si refusé — gérer ce cas côté appelant. Les notifications planifiées renvoient un ID qu'il faut stocker (dans le store, sur la routine, etc.) pour pouvoir annuler avec `cancelNotification(id)`.

L'API trigger utilisée est l'**ancien** format (pas de champ `type`) parce que c'est ce qu'accepte `expo-notifications ~0.28.19`. Ne pas passer à `SchedulableTriggerInputTypes` sans bumper la version.

### Gamification (jokers)

- `bumpStreak` est appelée à chaque action qui compte comme "actif" (toggle tâche done, toggle routine, fin session focus).
- Idempotente sur le même jour (`lastActiveDay === today` → no-op).
- Sur gap > 1 jour, consomme `missed - 1` jokers si dispo, sinon reset à 1.
- +1 joker tous les 7 jours de série, cap `JOKER_CAP` (3).
- `jokerUsedToday: true` survit jusqu'à la prochaine `bumpStreak` qui le remet à `false` — sert juste à afficher un message gentil dans le profil.

### Décomposition IA

`decomposeWithAI` fait un fetch direct à `api.anthropic.com` avec `claude-sonnet-4-6`. La clé vient de `settings.anthropicApiKey` (BYOK, stockée dans AsyncStorage chiffré au niveau OS). **Toujours** avoir un fallback heuristique (`decomposeTask` dans `utils.ts`) — le call peut échouer (réseau, quota, mauvaise clé). L'erreur est `Alert`-ée à l'utilisateur sans bloquer la création de la tâche.

Pas de prompt caching activé (le system prompt est trop court pour la cache minimum).

### Persistance

`zustand/middleware persist` avec `AsyncStorage`. Clé : `focusadhd-store-v1`. Si tu changes le schéma de manière incompatible, **bumper la clé** (`-v2`) — il n'y a pas de migration en place.

## Pièges à éviter

- **Ne pas remettre StyleSheet au niveau module** dans un composant qui doit suivre le thème.
- **Ne pas monter `usePomodoroEngine` plusieurs fois** — il y a un seul tick global. Si tu ajoutes un autre point d'entrée (deep link, widget) qui doit aussi déclencher la fin de phase, passer par le store.
- **Ne pas oublier de canceler les notifs** quand on reset un Pomodoro ou supprime une routine, sinon elles sonnent dans le vide.
- **expo-notifications dans Expo Go** : les notifications **push** distantes ne fonctionnent plus depuis SDK 53+, mais on n'utilise que des locales schedulées. OK pour Expo Go SDK 51.
- **Le splash dans `App.tsx`** s'affiche avant l'hydratation du store, donc il ne peut pas appeler `useColors()` — utilise `lightColors` en dur. C'est volontaire.

## Branche & workflow

- Branche de dev : `claude/adhd-task-app-R4Z39`
- Pas de PR ouverte ; on commit puis push.
- Pas de hook pre-commit configuré ; lancer `npx tsc --noEmit` à la main avant chaque commit.

## Ce qui n'existe pas (encore)

- Sync cloud / comptes / multi-device
- Paywall / RevenueCat / Stripe
- Widget iOS / Share extension (demande un build EAS, pas Expo Go)
- Tests unitaires ou e2e
- CI
- Soundscapes (brown noise, lofi) — sur la roadmap courte
- Estimation de temps par micro-étape — sur la roadmap courte
- Suivi médication explicite (passe par les routines pour l'instant)

## Prendre le contexte produit

Pour comprendre **pourquoi** chaque choix UX existe (jokers vs streak classique, 2 min vs Pomodoro standard, zen sombre forcé, etc.), lire `design.md`.

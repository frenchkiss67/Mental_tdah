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
- **expo-notifications** (locales uniquement), **expo-haptics**, **expo-keep-awake**, **expo-av** (soundscapes)

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
  useSoundscapeEngine.ts         Charge/décharge Audio.Sound piloté par le store (monté UNE fois)
  services/
    notifications.ts             Wrappers expo-notifications (focus end, daily reminder, routine)
    ai.ts                        Appel direct API Anthropic, BYOK (clé dans settings)
    soundscapes.ts               Catalogue typé { id, title, emoji, source: require(...) }
  components/
    AddTaskSheet.tsx             Modal création tâche (avec option décomposition IA)
    AddRoutineSheet.tsx          Modal création routine (jours + heure)
    CrisisModal.tsx              Modal "Trop ?" : respiration 4-7-8 animée + ancrage 5-4-3-2-1
    EnergyCheck.tsx              Bandeau du jour : 4 emojis, mémoire 1 valeur/jour
    NotesInbox.tsx               Carte "Vider la tête" (capture sans catégorisation)
    PomodoroTimer.tsx            Anneau SVG + contrôles, pure view qui lit le store
    TaskItem.tsx                 Carte tâche dépliable, sous-tâches éditables + chip estimation temps, badge "stale" 7j+
    RoutineItem.tsx              Ligne routine
    SoundscapePicker.tsx         4 ambiances + Aucune + cycle volume (doux/moyen/fort)
    StuckCard.tsx                Boutons "Juste 2 min" + "Choisis pour moi", adapté à l'énergie
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

Tout le state persistant et partagé est dans `src/store.ts`. Une seule store Zustand. Slices logiques : `tasks`, `routines`, `notes`, `gamification`, `mood`, `settings`, `pomodoro`, `currentTaskId`. Le flag `hydrated` est non-persisté, juste pour l'écran splash.

`mood` ne stocke qu'**une valeur par jour** (`{ energyDay, energyValue }`). Si `energyDay !== todayKey()`, l'UI considère qu'aucune valeur n'est définie pour aujourd'hui et affiche le sélecteur. Pas d'historique ni de courbe — c'est volontaire (voir `design.md`).

Les **notes** sont l'inbox brain-dump : entrées texte libres sans catégorisation. Trois cycles de vie : actives → archivées (`archivedAt` non-null) → supprimées. `convertNoteToTask` crée une tâche réelle et archive la note d'origine pour garder la trace. Les notes archivées restent persistées (debug / undo manuel) mais sont filtrées de l'UI principale.

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

### Done log

L'onglet "Faites" du `TasksScreen` rend une `SectionList` groupée par jour (helpers `dayKey` / `dayLabel` locaux dans le screen, format `Aujourd'hui` / `Hier` / nom du jour si <7j / date longue sinon). Une carte de résumé en haut affiche le compte hebdomadaire (`completedAt >= now - 7j`) plus les minutes focus cumulées. Ne PAS y mettre de graphe / évolution — c'est volontaire (voir `design.md`).

### Tâches "stale"

Une tâche non-faite avec `createdAt` > 7 jours hérite d'un visuel discret (bordure pointillée `warning`, tag `{n}j`). Calcul en ligne dans `TaskItem`. Pas d'action automatique : juste un signal doux pour la rendre visible.

### Estimation de temps

`Subtask.estimatedMinutes` est optionnel (undefined = pas d'estimation). Édition via chip qui cycle `—` / `2` / `5` / `10` / `15` / `30` (presets dans `TaskItem.ESTIMATE_PRESETS`). Le total sur la carte affiche le restant si la tâche n'est pas terminée (somme des sous-tâches non-cochées), le total complet sinon. Pas de comparaison "estimé vs réel" — c'est volontaire (voir `design.md`).

### Mode crise (`CrisisModal`)

Accessible via le bouton "Trop ?" en haut à droite de l'onglet Tâches. Modale plein écran fond `#11131F` (palette autonome, pas `useColors()`), animation respiration 4-7-8 pilotée par `Animated.Value` + `setTimeout` (pas un `Animated.loop` parce qu'on doit changer le label `Inspire/Retiens/Expire` entre les étapes). Le timer s'auto-arrête sur unmount/close via un flag `cancelled` capturé dans le useEffect. Aucun XP, aucune série, aucun side-effect dans le store — c'est un espace de pause, pas une "tâche".

### Énergie quotidienne (`EnergyCheck` + `StuckCard`)

Le `StuckCard` lit `mood` et passe en variante "low-energy" quand `energyValue <= 2`. Variante : message changé en "Énergie basse, on y va doucement", bouton "Choisis pour moi" déplacé en lien secondaire (moins d'agressivité). C'est le seul comportement adaptatif basé sur l'énergie pour l'instant — si tu en ajoutes (suggestions de tâches courtes, masquage routines lourdes, etc.), passe par le même check `energyDay === todayKey() && energyValue !== null`.

### Soundscapes

`useSoundscapeEngine` est monté **une seule fois** dans `App.tsx > AppCore`, à côté de `usePomodoroEngine`. Il observe `soundscape: { id, playing, volume }` du store et synchronise un unique `Audio.Sound` :
- Changement d'`id` → unload du précédent puis load du nouveau (avec `isLooping: true`)
- Toggle `playing` → `playAsync()` / `pauseAsync()`
- `volume` → `setVolumeAsync()`

Le state `soundscape` n'est **pas persisté** (`partialize` l'exclut implicitement — on redémarre toujours "Aucune"). Si un chargement échoue (typique tant que `assets/audio/*.mp3` contient les placeholders du repo), `loadFailedIdRef` mémorise l'id et bascule le state sur `{ id: null, playing: false }` pour éviter une boucle de retry.

Les fichiers audio vivent dans `assets/audio/` ; voir `assets/audio/README.md` pour les sources CC0 recommandées (Freesound + filtre licence CC0). Les placeholders du repo sont silencieux et ~2.5 KB chacun — **ne pas les considérer comme un audio fonctionnel**.

## Ce qui n'existe pas (encore)

- Sync cloud / comptes / multi-device
- Paywall / RevenueCat / Stripe
- Widget iOS / Share extension (demande un build EAS, pas Expo Go)
- Tests unitaires ou e2e
- CI
- Estimation de temps par micro-étape — sur la roadmap courte
- Audio CC0 réel dans `assets/audio/` (les placeholders ne jouent pas de son)
- Capture vocale "vraie" (Whisper) — bloquée par Expo Go, fallback actuel = hint dictée native du clavier
- Suivi médication explicite (passe par les routines pour l'instant)

## Prendre le contexte produit

Pour comprendre **pourquoi** chaque choix UX existe (jokers vs streak classique, 2 min vs Pomodoro standard, zen sombre forcé, etc.), lire `design.md`.

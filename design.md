# FocusADHD — Design

Document produit et design. Pourquoi chaque choix existe, et ce qu'on refuse de faire.

## Positionnement

Une app **par et pour** des cerveaux TDAH. Pas une app productivity reconfigurée. Les concurrents génériques (Todoist, Notion, Things) imposent une charge cognitive incompatible avec une dysfonction exécutive : trop d'options, trop de catégorisation, trop de "il faut décider d'abord". Les concurrents TDAH existants (Goblin Tools, Tiimo, Inflow) ont chacun un angle mais aucun ne couvre l'usage quotidien complet.

Notre angle : **réduire la friction d'initiation** et **enlever la honte** des cycles d'échec. Tout le reste découle de ça.

## Principes de design

### 1. Friction zéro à l'action

Le TDAH n'est pas un déficit de motivation, c'est un déficit d'initiation. Toute UI qui demande "et tu veux faire ça quand exactement, avec quelle priorité, dans quel projet ?" perd l'utilisateur. Conséquences :

- Ajouter une tâche = un champ texte et un bouton. La priorité a un défaut sain. La décomposition se fait toute seule.
- Sur la liste, un bouton **Juste 2 min** qui démarre un mini-focus sans rien demander. Pas de tâche sélectionnée ? Pas grave, on lance quand même.
- Un bouton **Choisis pour moi** qui tire au sort une tâche en cours, pondérée par priorité, pour by-passer la paralysie décisionnelle.
- Une **inbox "Vider la tête"** en haut de l'onglet Tâches : un seul champ texte, capture immédiate sans catégorisation. La pensée est attrapée d'abord, traitée plus tard (convertie en tâche ou archivée). Le but est de ne *jamais* perdre une idée à cause de la friction "où je la range ?".

### 1bis. Régulation émotionnelle visible

Le TDAH adulte vient souvent avec dysrégulation émotionnelle et RSD (rejection sensitive dysphoria). Aucune app TDAH grand public ne traite ce volet. On l'aborde via deux gestes :

- **Bouton "Trop ?"** présent dans le header de l'onglet Tâches. Un tap → modale plein écran avec respiration 4-7-8 animée et une suggestion d'ancrage tirée au sort ("Bois un verre d'eau", "Trouve 3 choses bleues autour de toi"). Pas de XP, pas de série, pas de pression. Une seule action : "Je peux y aller" quand prêt.
- **Check d'énergie matin** (1 swipe, 4 emojis, 1 fois par jour). Quand l'énergie est basse, le `StuckCard` change de discours et minimise l'option "Choisis pour moi" (qui demande encore une mini-décision). Le message devient "Énergie basse, on y va doucement" et seul "Juste 2 min" reste mis en avant.

L'idée : **l'app comprend que tu n'es pas dans le même état tous les jours**, et adapte ses suggestions sans interroger ni juger.

### 2. Compassion intégrée, pas la honte par défaut

Les apps de productivité punissent l'échec. Une série Duolingo qui casse à 87 jours fait plus mal qu'elle ne motive — pour un cerveau TDAH, c'est un déclencheur d'abandon total.

- **Système de jokers** : 3 max, +1 tous les 7 jours, absorbent automatiquement les jours manqués. La série n'apparaît jamais "cassée" tant qu'il reste des jokers.
- Message gentil quand un joker est consommé : "Joker utilisé : ta série continue." Pas de croix rouge, pas de "Streak broken!"
- Copy partout dans l'app à la 2ᵉ personne, ton chaleureux, sans culpabilisation. Exemple écran vide : "Commence petit. Ajoute UNE tâche que tu repousses depuis longtemps."
- Le reset est explicite, jamais silencieux, et présenté comme une action de l'utilisateur, jamais comme une sanction du système.

### 3. Une seule chose à la fois

Le multitâche est l'ennemi du TDAH. Tout l'écran Focus, et a fortiori le **mode zen**, est conçu pour réduire le champ visuel à une chose : le timer + la tâche en cours.

- Zen mode masque tout : barre d'onglets, status bar, toute l'UI hors timer et titre de la tâche
- Fond très sombre `#1B1830` (réduction de stimulation lumineuse) — **toujours** sombre quel que soit le thème de l'app, parce que c'est le but
- Une seule phrase de bas de page : "Respire. Une étape à la fois."

### 4. Cycles courts par défaut

Pomodoro classique = 25/5. Pour beaucoup de TDAH, 25 minutes c'est déjà trop long pour la phase d'engagement. Le défaut FocusADHD est **15 min focus / 5 min pause**, avec des presets à 10/15/25/45. Le bouton 2 min est encore plus court : il n'est pas censé être un "vrai" focus, c'est un cheval de Troie pour démarrer.

### 5. Décomposition automatique

Demander à un cerveau TDAH "et tu vas faire ça comment ?" déclenche la paralysie. Toute tâche est automatiquement décomposée en 3-5 micro-étapes. Heuristique locale par défaut, IA Claude en option (BYOK). Les micro-étapes sont cochables individuellement → micro-dopamine régulière.

### 6. Persistance et offline-first

Pas de compte, pas de sync, pas de "se connecter pour continuer". L'app fonctionne hors-ligne, tout est dans AsyncStorage. La friction d'onboarding est nulle. La sync cloud sera optionnelle quand elle arrivera, jamais bloquante.

## Système visuel

### Palette

Deux palettes complètes, basculement via réglage utilisateur (système / clair / sombre).

**Clair** — calme, lavande douce :
- `bg` `#F4F1FB` — fond lavande très clair, moins agressif que blanc pur
- `surface` `#FFFFFF`, `surfaceAlt` `#EFEAF8`
- `primary` `#6C5CE7` — violet (associé à la concentration, peu courant chez les concurrents)
- `accent` `#00B894` — vert (récompense, validation)
- `warning` `#FDCB6E` — jaune chaud (jokers)
- `text` `#2D3436`, `textMuted` `#636E72`, `textFaint` `#9AA1A6`
- `danger` `#E17055` — terracotta plutôt qu'un rouge vif

**Sombre** — repos visuel, contraste mesuré :
- `bg` `#15131F`, `surface` `#211E32`, `surfaceAlt` `#2C2841`
- `primary` `#9C8FFF` — violet éclairci pour contraste accessible sur fond sombre
- `accent` `#1FD8A8`, `warning` `#FFD479`, `danger` `#FF8674`
- `text` `#ECE7FA`, `textMuted` `#9D97B5`, `textFaint` `#6A647F`

**Pas de rouge vif** : on évite le rouge pour les états d'erreur quotidiens. Le rouge déclenche l'anxiété, particulièrement chez les TDAH avec dysrégulation émotionnelle. Le danger n'apparaît que sur l'action "Tout réinitialiser".

### Typographie

Système (`San Francisco` iOS, `Roboto` Android). Pas de police custom : moins de jank au boot, pas d'attente sur un asset.

Échelle :
- `h1` 28 / 700 — titres d'écran
- `h2` 20 / 700 — sections
- `body` 16 / 500 — interactions
- `small` 13 / 500 — méta
- `tiny` 11 / 600 — labels uppercase

### Espace et rayons

Espacement xs/sm/md/lg/xl = 4/8/16/24/32. Pas de pixels improvisés.

Rayons généreux : `lg` = 22 pour les cartes, `pill` = 999 pour les boutons d'action principaux. Le but : adoucir l'agressivité visuelle.

### Iconographie

Aucune librairie d'icônes. Texte uniquement (et un `+` ASCII pour le FAB, `✓` pour les cocher, `×` pour supprimer, `−` / `+` pour les steppers). Le texte est plus lisible, plus accessible, et évite un asset de plus à charger. Si on en ajoute, ce sera lucide / phosphor-style — fines, calmes.

## Patterns d'interaction

### Boutons primaires vs secondaires

- **Primaire** : fond `primary`, texte blanc, action principale. Un seul par écran.
- **Secondaire** : fond `surfaceAlt`, texte `textMuted`, action de support.
- **Danger** : fond `surface`, bordure `danger`, texte `danger`. Jamais rempli — réservé aux actions destructives confirmées.

### Modales bottom-sheet

Toutes les créations (tâche, routine) passent par une bottom-sheet animée slide-up avec backdrop sombre. Pas de full-screen modal pour ces flows courts.

### Listes

- Toujours un vide informatif (jamais un écran blanc)
- Toujours un FAB en bas à droite
- Sort : non-faites en haut, faites en bas, priorité haute remontée

### Feedback

- Haptique `Warning` au tap des contrôles Pomodoro (pause/reset)
- Haptique `Success` à la fin d'une phase
- Pas de son par défaut côté UI. Les notifications système oui (cassent l'hyperfocus).
- Animations Tab / Modal seulement. Pas de micro-anim de "récompense" — la dopamine vient des cases qu'on coche, pas d'un confetti.

## Choix UX décisifs avec rationale

### Pourquoi 4 onglets et pas 3

3 onglets = Routines absentes ou cachées dans Tâches. Or routine ≠ tâche : une routine se re-coche chaque jour, une tâche se complète une fois. Mélanger les deux brouille le modèle mental. 4 onglets restent lisibles avec des labels courts.

### Pourquoi le mode zen est-il une modale et pas un écran navigable

Une fois en zen, on doit pouvoir en sortir d'un seul geste connu (bouton "Quitter le zen"). Un écran navigable risque d'être perdu si l'utilisateur swipe par réflexe. Une modale plein écran est sans ambiguïté.

### Pourquoi pas de notification "ton focus va bientôt finir"

On a testé mentalement : c'est anxiogène. La notification arrive à la fin, point. Pendant la session, l'utilisateur peut regarder l'anneau qui décroît, c'est suffisant.

### Pourquoi BYOK pour l'IA et pas un proxy serveur

À ce stade MVP, gérer un backend = friction d'auth, coûts, et engagement de sync. Le modèle BYOK :
- Respecte la vie privée (la clé reste sur l'appareil)
- N'a pas de coût pour nous
- Force l'utilisateur "early-adopter" à comprendre ce qu'il fait — bonne sélection naturelle pour la v0
- Sera remplacé par un proxy serveur si/quand on lance le paywall ($7.99/mois inclut un quota d'usage IA)

### Pourquoi la décomposition heuristique n'est pas vide même sans note

Si la tâche n'a aucune note ni séparateur, on génère 5 étapes templates ("Ouvrir ce qu'il faut pour : X", "Lister les 3 premières micro-étapes"...). C'est volontairement banal — l'objectif n'est pas de remplacer la réflexion, c'est de **commencer à cocher quelque chose**. Cocher la première étape déclenche le geste, même si l'étape est triviale.

### Pourquoi un "Done log" sans graphes

Le TDAH a une mémoire émotionnelle distordue qui efface les accomplissements ("j'ai rien foutu aujourd'hui" prononcé après une journée de 6 tâches). On répare ça avec une **liste plate** des tâches faites, groupée par jour, sur l'onglet "Faites". Pas de graphe d'évolution, pas de pourcentage, pas de comparaison avec hier. Juste : "voilà ce que tu as fait cette semaine, compte-les". Un graphe descendant serait dévastateur. Une liste qui s'allonge est validante par sa simple existence.

### Pourquoi marquer les tâches "stale" mais ne rien forcer

Une tâche non-faite depuis 7+ jours obtient une bordure pointillée et un petit "{n}j". On la rend visible, on ne la juge pas. L'utilisateur peut choisir de la relancer, l'éditer (sous-tâches modifiables maintenant), ou la supprimer sans culpabilité. Beaucoup d'apps suppriment ou archivent automatiquement les vieilles tâches — c'est en fait dévastateur pour quelqu'un qui repousse les choses justement parce qu'elles l'angoissent. Notre version : la tâche reste là, douce, voyante, mais on ne fait rien sans accord.

### Pourquoi le mode crise est-il une modale et pas un onglet

Un onglet permanent pour "crise" serait stigmatisant — tu le verrais tous les jours. Un bouton discret "Trop ?" dans le header est trouvable quand tu en as besoin et invisible le reste du temps. C'est aussi pour ça qu'il s'appelle "Trop ?" et pas "Crise" ou "Urgence" : un mot du quotidien, pas un mot clinique.

### Pourquoi le check d'énergie ne crée pas de courbe / dashboard

Suivre son humeur sur 30 jours et la voir descendre est un parfait moyen de se sentir mal. On veut juste le **présent** : aujourd'hui je suis comment, et que l'app adapte. Si on ajoute un historique un jour, ce sera caché derrière une action explicite et présenté avec compassion.

### Pourquoi pas de "vraie" capture vocale

Une vraie transcription vocale (Whisper, Google Speech) nécessite soit un build EAS, soit une clé API externe avec coût. À ce stade, on s'appuie sur la **dictée native du clavier OS** (déjà présente, gratuite, locale) avec un simple hint dans le formulaire d'ajout. La majorité des utilisateurs ignore cette feature → la mentionner suffit à débloquer 80% du bénéfice. Le reste viendra avec EAS Build.

## Ce qu'on refuse de faire

- **Analytics et graphes de productivité.** Trop facile à interpréter comme un constat d'échec. Stats minimales seulement : série, total tâches, total minutes focus. Pas d'évolution sur 30 jours.
- **Calendrier intégré.** Notion / Motion / Reclaim font ça. C'est la pente de la complexification qu'on dit éviter. Si besoin, on ajoutera un export ICS de routines, pas une vue calendrier dans l'app.
- **Coach IA conversationnel.** Trop de promesse, trop d'incertitude qualité. L'IA reste cantonnée à une tâche bornée : décomposer.
- **Notifications proactives "vous n'avez rien fait aujourd'hui"** ou "voulez-vous revenir ?". C'est culpabilisant et déclenche la suppression d'app.
- **Onboarding par questionnaire long.** L'utilisateur installe, ajoute une tâche, point. Pas de "configurons d'abord votre profil TDAH".
- **Achievements visuels type Duolingo (badges, mascotte).** Infantilisant. La gamification est sobre : XP, niveau, série, jokers. Rien de plus.
- **Synchronisation par défaut avec un service tiers.** Privacy-first. Quand on ajoutera le cloud, ce sera opt-in.
- **Multiples palettes thématiques façon Notion.** Deux thèmes, point. Plus = paralysie décisionnelle.

## Roadmap visuelle / produit (court terme)

Par ordre de leverage estimé :

1. **Soundscapes intégrés** (brown noise, lofi). Différenciation forte vs Forest / Focusmate qui n'en intègrent pas. Faible coût technique (audio files + lecteur).
2. **Estimation de temps par micro-étape** (mitigation cécité temporelle). Goblin Estimator le fait sur le web, pas en mobile intégré.
3. **Body doubling lite** : compteur anonyme "X personnes focus en ce moment" + ambient sound partagé.
4. **Widget iOS et Share Extension** (nécessite EAS Build, sortie d'Expo Go). Capture friction = 0.
5. **Suivi médication explicite** avec timeline + correlation simple avec productivité.
6. **Brain dump inbox** : capture sans catégorisation, traitement plus tard.

## Roadmap monétisation

Niche payante (santé mentale = LTV élevée, faible churn si l'app est utile). Plan :

- Tout le MVP actuel reste gratuit (acquisition organique sur communautés TDAH)
- Paywall sur les features "pro" : sync cloud, IA décomposition incluse (sans BYOK), soundscapes premium, widget iOS multi-tâches, body doubling avec audio, export pour thérapeute
- $7.99/mois ou $49/an. Pas d'essai gratuit à crédit-card, juste un free tier généreux.
- Implémenté via RevenueCat le moment venu — pas avant d'avoir prouvé la rétention organique.

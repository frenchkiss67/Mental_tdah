# assets/audio

Les 4 fichiers `.mp3` ici sont des **placeholders** silencieux de ~2.5 KB chacun, juste là pour que Metro résolve les `require()` du catalogue (`src/services/soundscapes.ts`) au moment du bundle. Ils ne produiront aucun son — c'est volontaire.

## À remplacer par des vrais fichiers CC0

Pour chaque ambiance, télécharger un fichier CC0 sur [freesound.org](https://freesound.org) en filtrant la licence sur **"Creative Commons 0"**, puis remplacer le placeholder en gardant **exactement le même nom** :

| Fichier        | Recherche suggérée Freesound (filtre licence CC0) |
| -------------- | -------------------------------------------------- |
| `brown.mp3`    | `brown noise loop` — durée 10-300s, seamless       |
| `rain.mp3`     | `rain loop ambient` — éviter le tonnerre           |
| `forest.mp3`   | `forest ambient birds` — préférer chants discrets  |
| `fire.mp3`     | `fireplace crackling loop` — boucle propre         |

## Specs cibles

- MP3 192-320 kbps, mono OK
- Durée 20-60s (l'app boucle automatiquement)
- Loop point propre (cherchez le tag `seamless` sur Freesound)
- Taille typique : 500 KB - 1.5 MB par fichier

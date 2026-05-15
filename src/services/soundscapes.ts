import type { SoundscapeId } from '../types';

export type Soundscape = {
  id: SoundscapeId;
  title: string;
  emoji: string;
  source: number; // require(...) handle
};

// Bundler resolves these at build time. The actual files live in
// assets/audio/ — placeholders ship silent, drop in real CC0 audio
// from Freesound (see assets/audio/README.md).
export const SOUNDSCAPES: Soundscape[] = [
  {
    id: 'brown',
    title: 'Brown noise',
    emoji: '🌫️',
    source: require('../../assets/audio/brown.mp3'),
  },
  {
    id: 'rain',
    title: 'Pluie',
    emoji: '🌧️',
    source: require('../../assets/audio/rain.mp3'),
  },
  {
    id: 'forest',
    title: 'Forêt',
    emoji: '🌲',
    source: require('../../assets/audio/forest.mp3'),
  },
  {
    id: 'fire',
    title: 'Cheminée',
    emoji: '🔥',
    source: require('../../assets/audio/fire.mp3'),
  },
];

export const findSoundscape = (id: SoundscapeId | null): Soundscape | undefined =>
  id ? SOUNDSCAPES.find((s) => s.id === id) : undefined;

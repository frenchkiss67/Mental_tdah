import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { useEffect, useRef } from 'react';
import { findSoundscape } from './services/soundscapes';
import { useStore } from './store';
import type { SoundscapeId } from './types';

// Loads / unloads / syncs the single Audio.Sound instance driven by the
// store's soundscape slice. Mounted once at App root, alongside the
// Pomodoro engine. Errors during load (typically the case while the
// repo still has placeholder audio files) bubble up to the store as
// playing=false so the UI can surface "audio non configuré".
export const useSoundscapeEngine = () => {
  const soundscape = useStore((s) => s.soundscape);
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadedIdRef = useRef<SoundscapeId | null>(null);
  const loadFailedIdRef = useRef<SoundscapeId | null>(null);

  // One-time audio mode configuration.
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const safeUnload = async (s: Audio.Sound) => {
      try {
        await s.stopAsync();
      } catch {}
      try {
        await s.unloadAsync();
      } catch {}
    };

    const sync = async () => {
      const { id, playing, volume } = soundscape;

      // Nothing should play → release any loaded sound.
      if (!id) {
        if (soundRef.current) {
          await safeUnload(soundRef.current);
          soundRef.current = null;
          loadedIdRef.current = null;
        }
        return;
      }

      // Avoid re-trying loads that already failed for this id.
      if (loadFailedIdRef.current === id) return;

      // Selected id changed → swap.
      if (loadedIdRef.current !== id) {
        if (soundRef.current) {
          await safeUnload(soundRef.current);
          soundRef.current = null;
          loadedIdRef.current = null;
        }
        const def = findSoundscape(id);
        if (!def) return;
        try {
          const { sound } = await Audio.Sound.createAsync(def.source, {
            isLooping: true,
            volume,
            shouldPlay: playing,
          });
          if (cancelled) {
            await safeUnload(sound);
            return;
          }
          soundRef.current = sound;
          loadedIdRef.current = id;
        } catch (err) {
          loadFailedIdRef.current = id;
          // Surface failure: bump the slice off so the UI reflects state.
          useStore.setState((s) => ({
            soundscape: { ...s.soundscape, playing: false, id: null },
          }));
          if (__DEV__) {
            console.warn('Soundscape load failed for', id, err);
          }
        }
        return;
      }

      // Same id, sync play/pause + volume.
      const snd = soundRef.current;
      if (!snd) return;
      try {
        await snd.setVolumeAsync(volume);
        if (playing) {
          await snd.playAsync();
        } else {
          await snd.pauseAsync();
        }
      } catch {}
    };

    sync();
    return () => {
      cancelled = true;
    };
    // setPlaying is stable; only soundscape matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundscape]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      const s = soundRef.current;
      if (s) {
        s.unloadAsync().catch(() => {});
      }
    };
  }, []);
};

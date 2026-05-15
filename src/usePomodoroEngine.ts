import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useStore } from './store';

// Single global watcher: ticks every 500ms while running and triggers phase
// transition the instant we cross the end. Mounted once at App root.
export const usePomodoroEngine = () => {
  const running = useStore((s) => s.pomodoro.running);
  const endsAt = useStore((s) => s.pomodoro.endsAt);
  const hapticsEnabled = useStore((s) => s.settings.hapticsEnabled);
  const advance = useStore((s) => s.advancePomodoroPhase);

  useEffect(() => {
    if (!running || endsAt === null) return;
    const id = setInterval(() => {
      if (Date.now() >= endsAt) {
        clearInterval(id);
        if (hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        advance();
      }
    }, 500);
    return () => clearInterval(id);
  }, [running, endsAt, hapticsEnabled, advance]);
};

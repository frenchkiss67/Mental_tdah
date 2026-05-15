import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

const configure = () => {
  if (configured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  configured = true;
};

export const ensurePermissions = async (): Promise<boolean> => {
  configure();
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
};

export const scheduleFocusEnd = async (
  durationSec: number,
  phase: 'focus' | 'break' | 'longBreak',
): Promise<string | null> => {
  configure();
  const granted = await ensurePermissions();
  if (!granted) return null;

  const body =
    phase === 'focus'
      ? 'Session focus terminée. Petite pause méritée.'
      : phase === 'break'
        ? 'Pause finie. On repart pour un cycle ?'
        : 'Grande pause finie. Tu peux reprendre quand tu veux.';

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'FocusADHD',
      body,
      sound: true,
    },
    trigger: { seconds: Math.max(1, Math.round(durationSec)) },
  });
};

export const cancelNotification = async (id: string | null | undefined) => {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already fired or canceled
  }
};

export const scheduleDailyReminder = async (
  hour: number,
  minute: number,
): Promise<string | null> => {
  configure();
  const granted = await ensurePermissions();
  if (!granted) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Petit point ?',
      body: 'Quelle est ta plus petite étape pour aujourd’hui ?',
      sound: false,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
    },
  });
};

export const scheduleRoutineReminder = async (
  title: string,
  hour: number,
  minute: number,
  days: number[],
): Promise<string | null> => {
  configure();
  const granted = await ensurePermissions();
  if (!granted) return null;
  if (days.length === 0) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Routine',
      body: title,
      sound: false,
    },
    trigger: { hour, minute, repeats: true },
  });
};

export const setupAndroidChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#6C5CE7',
  });
};

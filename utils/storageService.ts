import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_PREFS_KEY = 'mealapp_notification_prefs';

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  mealReminders: boolean;
  frequency: 'daily' | 'weekly' | 'none';
}

const DEFAULT_PREFS: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  mealReminders: true,
  frequency: 'daily',
};

/**
 * Get saved notification preferences from AsyncStorage
 * Returns default preferences if none are saved
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return DEFAULT_PREFS;
  } catch (error) {
    console.error('Error reading notification preferences:', error);
    return DEFAULT_PREFS;
  }
};

/**
 * Save notification preferences to AsyncStorage
 */
export const saveNotificationPreferences = async (
  prefs: NotificationPreferences
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    return true;
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return false;
  }
};

/**
 * Clear all notification preferences (reset to defaults)
 */
export const clearNotificationPreferences = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(NOTIFICATION_PREFS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing notification preferences:', error);
    return false;
  }
};

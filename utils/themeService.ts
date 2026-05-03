import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'mealapp_selected_theme';

export type ThemeName = 'coffee' | 'forest' | 'purple' | 'ocean' | 'midnight' | 'sunset' | 'slate' | 'sakura' | 'tomato' | 'garden' | 'honey' | 'crispMint' | 'deepHarvest' | 'spicedCacao' | 'midnightBerry';

export const AVAILABLE_THEMES: { name: ThemeName; label: string }[] = [
  { name: 'coffee', label: 'Coffee' },
  { name: 'forest', label: 'Forest' },
  { name: 'purple', label: 'Purple' },
  { name: 'ocean', label: 'Ocean' },
  { name: 'midnight', label: 'Midnight' },
  { name: 'sunset', label: 'Sunset' },
  { name: 'slate', label: 'Slate' },
  { name: 'sakura', label: 'Sakura' },
  { name: 'tomato', label: 'Tomato' },
  { name: 'garden', label: 'Garden' },
  { name: 'honey', label: 'Honey' },
  { name: 'crispMint', label: 'Crisp Mint' },
  { name: 'deepHarvest', label: 'Deep Harvest' },
  { name: 'spicedCacao', label: 'Spiced Cacao' },
  { name: 'midnightBerry', label: 'Midnight Berry' },
];

/**
 * Get the currently selected theme from AsyncStorage
 * Returns 'deepHarvest' as default if no theme is saved
 */
export const getSelectedTheme = async (): Promise<ThemeName> => {
  try {
    const saved = await AsyncStorage.getItem(THEME_KEY);
    if (saved && isValidTheme(saved)) {
      return saved as ThemeName;
    }
    return 'deepHarvest'; // Default theme
  } catch (error) {
    console.error('Error loading theme preference:', error);
    return 'deepHarvest';
  }
};

/**
 * Save the selected theme to AsyncStorage
 */
export const setSelectedTheme = async (theme: ThemeName): Promise<boolean> => {
  try {
    if (!isValidTheme(theme)) {
      console.error(`Invalid theme: ${theme}`);
      return false;
    }
    await AsyncStorage.setItem(THEME_KEY, theme);
    return true;
  } catch (error) {
    console.error('Error saving theme preference:', error);
    return false;
  }
};

/**
 * Validate if a theme name is valid
 */
const isValidTheme = (theme: string): boolean => {
  return ['coffee', 'forest', 'purple', 'ocean', 'midnight', 'sunset', 'slate', 'sakura', 'tomato', 'garden', 'honey', 'crispMint', 'deepHarvest', 'spicedCacao', 'midnightBerry'].includes(theme);
};

const THEME_KEY = 'workspace_theme';
const ACCENT_KEY = 'workspace_primary_color';

export const ACCENTS = [
  { key: 'blue', value: '#3B82F6' },
  { key: 'indigo', value: '#6366F1' },
  { key: 'emerald', value: '#10B981' },
  { key: 'amber', value: '#F59E0B' },
  { key: 'rose', value: '#F43F5E' },
  { key: 'cyan', value: '#06B6D4' },
];

export const getStoredTheme = () => localStorage.getItem(THEME_KEY) || 'light';
export const getStoredAccent = () => localStorage.getItem(ACCENT_KEY) || ACCENTS[0].key;

export const applyAppearance = (theme = getStoredTheme(), accent = getStoredAccent()) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.accent = accent;
  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(ACCENT_KEY, accent);
};

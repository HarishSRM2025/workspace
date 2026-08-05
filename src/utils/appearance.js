const THEME_KEY = 'hrm_theme';
const ACCENT_KEY = 'hrm_primary_color';

export const ACCENTS = [
  { key: 'blue', value: '#3B82F6', hover: '#2563EB', soft: 'rgba(59, 130, 246, 0.14)' },
  { key: 'indigo', value: '#6366F1', hover: '#4F46E5', soft: 'rgba(99, 102, 241, 0.14)' },
  { key: 'emerald', value: '#10B981', hover: '#059669', soft: 'rgba(16, 185, 129, 0.14)' },
  { key: 'amber', value: '#F59E0B', hover: '#D97706', soft: 'rgba(245, 158, 11, 0.14)' },
  { key: 'rose', value: '#F43F5E', hover: '#E11D48', soft: 'rgba(244, 63, 94, 0.14)' },
  { key: 'cyan', value: '#06B6D4', hover: '#0891B2', soft: 'rgba(6, 182, 212, 0.14)' },
];

export const getStoredTheme = () => localStorage.getItem(THEME_KEY) || 'light';
export const getStoredAccent = () => localStorage.getItem(ACCENT_KEY) || ACCENTS[0].key;

export const applyAppearance = (theme = getStoredTheme(), accentKey = getStoredAccent()) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('data-accent', accentKey);

  const accent = ACCENTS.find(a => a.key === accentKey) || ACCENTS[0];

  root.style.setProperty('--primary', accent.value);
  root.style.setProperty('--primary-color', accent.value);
  root.style.setProperty('--primary-hover', accent.hover);
  root.style.setProperty('--primary-light', accent.soft);
  root.style.setProperty('--primary-soft', accent.soft);

  localStorage.setItem(THEME_KEY, theme);
  localStorage.setItem(ACCENT_KEY, accentKey);
};

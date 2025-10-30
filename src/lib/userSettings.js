export const SETTINGS_STORAGE_KEY = 'real-estate-settings';

export const DEFAULT_SETTINGS = {
  emailAlerts: true,
  autoOpenStreetView: false,
  shareUsageInsights: false,
};

export function readStoredSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeStoredSettings(nextSettings) {
  if (typeof window === 'undefined') return;
  const payload = { ...DEFAULT_SETTINGS, ...nextSettings };
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

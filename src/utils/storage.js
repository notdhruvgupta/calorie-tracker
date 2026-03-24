const PREFIX = 'calorie:';

export const storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },
};

export function getTodayKey() {
  const d = new Date();
  return `log:${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getSettings() {
  return storage.get('settings:user') || { dailyGoal: 2000 };
}

export function saveSettings(settings) {
  storage.set('settings:user', settings);
}

export function getTodayLog() {
  return storage.get(getTodayKey()) || [];
}

export function saveTodayLog(entries) {
  storage.set(getTodayKey(), entries);
}

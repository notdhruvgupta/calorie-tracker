import { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AddFood from './components/AddFood';
import Modal from './components/Modal';
import Button from './components/Button';
import { getSettings, saveSettings, getTodayLog, saveTodayLog } from './utils/storage';

export default function App() {
  const [settings, setSettings] = useState(getSettings);
  const [entries, setEntries] = useState(getTodayLog);
  const [screen, setScreen] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('calorie:settings:user');
  });
  const [showSettings, setShowSettings] = useState(false);
  const [goalInput, setGoalInput] = useState(settings.dailyGoal);

  useEffect(() => {
    saveTodayLog(entries);
  }, [entries]);

  const handleSaveOnboarding = useCallback(() => {
    const goal = Number(goalInput) || 2000;
    const newSettings = { dailyGoal: goal };
    saveSettings(newSettings);
    setSettings(newSettings);
    setShowOnboarding(false);
  }, [goalInput]);

  const handleSaveSettings = useCallback(() => {
    const goal = Number(goalInput) || 2000;
    const newSettings = { dailyGoal: goal };
    saveSettings(newSettings);
    setSettings(newSettings);
    setShowSettings(false);
  }, [goalInput]);

  const handleConfirmFood = useCallback((entry) => {
    setEntries((prev) => [...prev, entry]);
    setScreen('dashboard');
  }, []);

  const handleDelete = useCallback((id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Onboarding Modal */}
      <Modal open={showOnboarding} title="Welcome">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-neutral-400">Set your daily calorie goal to get started.</p>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500">Daily calorie goal</label>
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <Button onClick={handleSaveOnboarding}>Get Started</Button>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Settings">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500">Daily calorie goal</label>
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="bg-surface border border-surface-lighter rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowSettings(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Screens */}
      {screen === 'dashboard' && (
        <Dashboard
          entries={entries}
          goal={settings.dailyGoal}
          onAddFood={() => setScreen('add')}
          onDelete={handleDelete}
          onOpenSettings={() => {
            setGoalInput(settings.dailyGoal);
            setShowSettings(true);
          }}
        />
      )}
      {screen === 'add' && (
        <AddFood
          onConfirm={handleConfirmFood}
          onBack={() => setScreen('dashboard')}
        />
      )}
    </div>
  );
}

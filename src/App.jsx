import { useState, useCallback, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AddFood from './components/AddFood';
import Analytics from './components/Analytics';
import AuthPage from './components/AuthPage';
import Modal from './components/Modal';
import Button from './components/Button';
import { useAuth } from './context/AuthContext';
import { api } from './utils/api';

export default function App() {
  const { isAuthenticated, user, logout, updateUser } = useAuth();
  const [entries, setEntries] = useState([]);
  const [goal, setGoal] = useState(user?.dailyGoal || 2000);
  const [screen, setScreen] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [goalInput, setGoalInput] = useState(goal);
  const [loading, setLoading] = useState(true);

  // Load today's entries from backend
  useEffect(() => {
    if (!isAuthenticated) return;
    const today = new Date().toISOString().slice(0, 10);
    api.getEntries(today)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  // Sync goal from user on login
  useEffect(() => {
    if (user?.dailyGoal) setGoal(user.dailyGoal);
  }, [user?.dailyGoal]);

  const handleSaveSettings = useCallback(async () => {
    const g = Number(goalInput) || 2000;
    await api.updateSettings(g);
    setGoal(g);
    updateUser({ dailyGoal: g });
    setShowSettings(false);
  }, [goalInput, updateUser]);

  const handleConfirmFood = useCallback(async (entry) => {
    const saved = await api.createEntry({
      category: entry.category,
      dishName: entry.dishName,
      items: entry.items,
      totalCalories: entry.totalCalories,
    });
    setEntries((prev) => [...prev, saved]);
    setScreen('dashboard');
  }, []);

  const handleDelete = useCallback(async (id) => {
    await api.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  if (!isAuthenticated) return <AuthPage />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
          goal={goal}
          onAddFood={() => setScreen('add')}
          onDelete={handleDelete}
          onOpenSettings={() => {
            setGoalInput(goal);
            setShowSettings(true);
          }}
          onAnalytics={() => setScreen('analytics')}
          onLogout={logout}
        />
      )}
      {screen === 'add' && (
        <AddFood
          onConfirm={handleConfirmFood}
          onBack={() => setScreen('dashboard')}
        />
      )}
      {screen === 'analytics' && (
        <Analytics
          goal={goal}
          onBack={() => setScreen('dashboard')}
        />
      )}
    </div>
  );
}

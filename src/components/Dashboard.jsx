import { useMemo } from 'react';
import ProgressRing from './ProgressRing';
import Button from './Button';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

export default function Dashboard({ entries, goal, onAddFood, onDelete, onOpenSettings }) {
  const totalCalories = useMemo(
    () => entries.reduce((sum, e) => sum + e.totalCalories, 0),
    [entries]
  );

  const byCategory = useMemo(() => {
    const map = {};
    for (const cat of CATEGORIES) map[cat] = [];
    for (const entry of entries) {
      if (map[entry.category]) map[entry.category].push(entry);
    }
    return map;
  }, [entries]);

  return (
    <div className="flex flex-col items-center gap-8 p-6 pb-24 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h1 className="font-heading text-2xl font-bold">Today</h1>
        <button
          onClick={onOpenSettings}
          className="text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      </div>

      {/* Progress Ring */}
      <div className="relative flex items-center justify-center">
        <ProgressRing consumed={totalCalories} goal={goal} />
      </div>

      {/* Meal Categories */}
      <div className="w-full flex flex-col gap-4">
        {CATEGORIES.map((cat) => (
          <MealSection key={cat} category={cat} entries={byCategory[cat]} onDelete={onDelete} />
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={onAddFood}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-neutral-950 shadow-lg flex items-center justify-center text-3xl font-light hover:bg-accent-light transition-colors cursor-pointer hover:scale-105 active:scale-95"
        title="Add Food"
      >
        +
      </button>
    </div>
  );
}

function MealSection({ category, entries, onDelete }) {
  const total = entries.reduce((s, e) => s + e.totalCalories, 0);

  return (
    <div className="bg-surface rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-neutral-400">
          {category}
        </h3>
        {total > 0 && (
          <span className="text-xs text-neutral-500 tabular-nums">{total} kcal</span>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="text-neutral-600 text-sm">No entries yet</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between group">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{entry.dishName}</span>
                <span className="text-xs text-neutral-500">
                  {entry.items.map((i) => i.name).join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums text-accent font-medium">
                  {entry.totalCalories}
                </span>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-danger transition-all cursor-pointer"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

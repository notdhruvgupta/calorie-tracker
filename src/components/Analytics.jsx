import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Analytics({ goal, onBack }) {
  const [view, setView] = useState('weekly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = view === 'weekly' ? api.getWeekly : api.getMonthly;
    fetcher()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [view]);

  const maxCal = data ? Math.max(...data.days.map((d) => d.totalCalories), goal) : goal;

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h1 className="font-heading text-2xl font-bold">Analytics</h1>
      </div>

      {/* View Toggle */}
      <div className="flex bg-surface rounded-xl p-1 gap-1">
        {['weekly', 'monthly'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer ${
              view === v ? 'bg-accent text-neutral-950' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-neutral-500 text-center">Failed to load analytics</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard label="Avg Calories" value={`${data.avgCalories}`} unit="kcal/day" />
            <SummaryCard
              label="Goal Hit"
              value={`${data.days.filter((d) => d.totalCalories > 0 && d.totalCalories <= goal).length}`}
              unit={`of ${data.days.length} days`}
            />
            <SummaryCard
              label="Total Calories"
              value={`${data.days.reduce((s, d) => s + d.totalCalories, 0)}`}
              unit="kcal"
            />
            <SummaryCard
              label="Total Entries"
              value={`${data.days.reduce((s, d) => s + d.entryCount, 0)}`}
              unit="logged"
            />
          </div>

          {/* Bar Chart */}
          <div className="bg-surface rounded-2xl p-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-neutral-400 mb-4">
              Daily Calories
            </h3>
            <div className="flex items-end gap-1" style={{ height: 160 }}>
              {data.days.map((day) => {
                const pct = maxCal > 0 ? (day.totalCalories / maxCal) * 100 : 0;
                const over = day.totalCalories > goal;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-surface-light border border-surface-lighter rounded-lg px-2 py-1 text-xs whitespace-nowrap z-10">
                      <span className="font-medium">{day.totalCalories} kcal</span>
                      <br />
                      <span className="text-neutral-500">{formatDate(day.date)}</span>
                    </div>
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        over ? 'bg-danger/70' : day.totalCalories > 0 ? 'bg-accent' : 'bg-surface-lighter'
                      }`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Goal line label */}
            <div className="flex items-center gap-2 mt-2">
              <div className="h-px flex-1 bg-accent/30" />
              <span className="text-xs text-neutral-500">Goal: {goal}</span>
              <div className="h-px flex-1 bg-accent/30" />
            </div>
            {/* Date labels */}
            <div className="flex gap-1 mt-2">
              {data.days.map((day, i) => {
                const show = view === 'weekly' || i % 5 === 0 || i === data.days.length - 1;
                return (
                  <div key={day.date} className="flex-1 text-center">
                    {show && (
                      <span className="text-[10px] text-neutral-600">{shortDate(day.date)}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="bg-surface rounded-2xl p-4">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-neutral-400 mb-3">
              Avg Macros / Day
            </h3>
            <MacroRow label="Protein" value={avgMacro(data.days, 'totalProtein')} color="bg-blue-400" unit="g" />
            <MacroRow label="Carbs" value={avgMacro(data.days, 'totalCarbs')} color="bg-amber-400" unit="g" />
            <MacroRow label="Fat" value={avgMacro(data.days, 'totalFat')} color="bg-rose-400" unit="g" />
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, unit }) {
  return (
    <div className="bg-surface rounded-xl p-3">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className="text-xl font-bold font-heading tabular-nums">{value}</p>
      <p className="text-xs text-neutral-600">{unit}</p>
    </div>
  );
}

function MacroRow({ label, value, color, unit }) {
  const max = 300;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-3 mb-2 last:mb-0">
      <span className="text-sm text-neutral-400 w-16">{label}</span>
      <div className="flex-1 h-2 bg-surface-lighter rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium tabular-nums w-12 text-right">{value}{unit}</span>
    </div>
  );
}

function avgMacro(days, key) {
  const withData = days.filter((d) => d.entryCount > 0);
  if (withData.length === 0) return 0;
  return Math.round(withData.reduce((s, d) => s + d[key], 0) / withData.length);
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function shortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

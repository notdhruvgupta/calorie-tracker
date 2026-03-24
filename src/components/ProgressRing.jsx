export default function ProgressRing({ consumed, goal }) {
  const size = 200;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(consumed / goal, 1);
  const offset = circumference * (1 - pct);
  const remaining = Math.max(goal - consumed, 0);
  const over = consumed > goal;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-surface-light"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-4xl font-bold font-heading tabular-nums">{consumed}</span>
        <span className="text-sm text-neutral-400">of {goal} kcal</span>
      </div>
      <p className={`text-sm font-medium ${over ? 'text-danger' : 'text-neutral-400'}`}>
        {over ? `${consumed - goal} kcal over` : `${remaining} kcal remaining`}
      </p>
    </div>
  );
}

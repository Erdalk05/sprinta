interface Props {
  speed: number;
  comprehension: number;
  attention: number;
  primaryWeakness: string;
}

const LABELS: Record<string, string> = {
  speed_control:       'Hız Kontrolü',
  deep_comprehension:  'Derin Anlama',
  attention_power:     'Dikkat Gücü',
  mental_reset:        'Zihinsel Reset',
};

function SkillBar({ label, value, isWeak }: { label: string; value: number; isWeak?: boolean }) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const color = isWeak ? 'bg-red-500' : pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-orange-500';

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-slate-300 text-sm">
          {label}
          {isWeak && <span className="text-red-400 ml-2 text-xs">⚠ Zayıf</span>}
        </span>
        <span className="text-slate-400 text-sm">{pct}</span>
      </div>
      <div className="bg-slate-700 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ModuleProgressBars({ speed, comprehension, attention, primaryWeakness }: Props) {
  const bars = [
    { key: 'speed_control',      label: 'Hız Kontrolü', value: speed },
    { key: 'deep_comprehension', label: 'Derin Anlama',  value: comprehension },
    { key: 'attention_power',    label: 'Dikkat Gücü',   value: attention },
  ];

  const weakLabel = LABELS[primaryWeakness] ?? primaryWeakness;

  return (
    <div className="space-y-4">
      {bars.map(b => (
        <SkillBar
          key={b.key}
          label={b.label}
          value={b.value}
          isWeak={primaryWeakness === b.key}
        />
      ))}
      <p className="text-slate-500 text-xs mt-2">
        Öncelikli gelişim alanı: <span className="text-slate-300">{weakLabel}</span>
      </p>
    </div>
  );
}

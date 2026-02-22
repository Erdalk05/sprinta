'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface DayStat {
  date: string;
  active_students: number;
  avg_arp: number;
  total_minutes: number;
}

interface Props {
  data: DayStat[];
}

export function WeeklyActivityChart({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
    avg_arp: Math.round(d.avg_arp ?? 0),
  }));

  if (formatted.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        Henüz veri yok.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="arpGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
        <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
          labelStyle={{ color: '#94A3B8' }}
          itemStyle={{ color: '#A5B4FC' }}
        />
        <Area
          type="monotone"
          dataKey="avg_arp"
          name="Ort. ARP"
          stroke="#6366F1"
          strokeWidth={2}
          fill="url(#arpGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';

interface DayStat {
  date: string;
  avg_arp: number;
  total_minutes: number;
}

interface Props {
  data: DayStat[];
}

export function ARPTrendChart({ data }: Props) {
  const formatted = data.map(d => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
    avg_arp: Math.round(d.avg_arp ?? 0),
  }));

  if (formatted.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        Son 30 günde veri yok.
      </div>
    );
  }

  const baseline = formatted[0]?.avg_arp;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
        <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
          labelStyle={{ color: '#94A3B8' }}
          itemStyle={{ color: '#A5B4FC' }}
        />
        {baseline && (
          <ReferenceLine y={baseline} stroke="#475569" strokeDasharray="4 4" label={{ value: 'Başlangıç', fill: '#475569', fontSize: 10 }} />
        )}
        <Line
          type="monotone"
          dataKey="avg_arp"
          name="ARP"
          stroke="#6366F1"
          strokeWidth={2}
          dot={{ fill: '#6366F1', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

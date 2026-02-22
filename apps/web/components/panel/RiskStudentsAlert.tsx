import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

interface StudentRow {
  id: string;
  full_name: string;
  last_activity_at: string | null;
  streak_days: number;
}

interface RiskStudent {
  risk_level: string;
  recommendation: string;
  // Supabase join returns array for one-to-many relations
  student: StudentRow | StudentRow[] | null;
}

interface Props {
  students: RiskStudent[];
}

const levelColors: Record<string, string> = {
  critical: 'text-red-400 border-red-700 bg-red-900/20',
  high:     'text-orange-400 border-orange-700 bg-orange-900/20',
};

export function RiskStudentsAlert({ students }: Props) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">Risk Uyarıları</h2>
      </div>

      <div className="space-y-3">
        {students.map((s, i) => {
          const studentRow = Array.isArray(s.student) ? s.student[0] : s.student;
          if (!studentRow) return null;
          const colorClass = levelColors[s.risk_level] ?? 'text-slate-400 border-slate-700 bg-slate-700/20';
          const lastActive = studentRow.last_activity_at
            ? new Date(studentRow.last_activity_at).toLocaleDateString('tr-TR')
            : 'Hiç aktif değil';

          return (
            <div key={i} className={`flex items-start justify-between border rounded-lg p-4 ${colorClass}`}>
              <div>
                <Link href={`/students/${studentRow.id}`}>
                  <p className="font-semibold hover:underline">{studentRow.full_name}</p>
                </Link>
                <p className="text-slate-400 text-sm mt-1">{s.recommendation}</p>
                <p className="text-slate-500 text-xs mt-1">Son aktif: {lastActive} · Seri: {studentRow.streak_days} gün</p>
              </div>
              <span className="text-xs font-bold uppercase ml-4 shrink-0">{s.risk_level}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

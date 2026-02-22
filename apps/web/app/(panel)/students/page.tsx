import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { StudentFilters } from '@/components/panel/StudentFilters';

interface SearchParams {
  search?: string;
  risk?: string;
  exam?: string;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: admin } = await supabase
    .from('tenant_admins')
    .select('tenant_id')
    .eq('auth_user_id', user.id)
    .single();

  if (!admin) redirect('/login');

  let query = supabase
    .from('students')
    .select(`
      id, full_name, email, grade_level, exam_target,
      baseline_arp, current_arp, growth_score,
      streak_days, last_activity_at,
      risk_score:student_risk_scores(risk_level)
    `)
    .eq('tenant_id', admin.tenant_id)
    .eq('is_active', true)
    .order('current_arp', { ascending: false });

  if (params.search) {
    query = query.ilike('full_name', `%${params.search}%`);
  }
  if (params.exam) {
    query = query.eq('exam_target', params.exam);
  }

  const { data: students } = await query;

  const riskColors: Record<string, string> = {
    critical: 'text-red-400 bg-red-900/30',
    high:     'text-orange-400 bg-orange-900/30',
    medium:   'text-yellow-400 bg-yellow-900/30',
    low:      'text-green-400 bg-green-900/30',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Öğrenciler</h1>
        <span className="text-slate-400">{students?.length ?? 0} öğrenci</span>
      </div>

      <StudentFilters />

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {['Öğrenci', 'Sınav', 'Başlangıç ARP', 'Güncel ARP', 'Büyüme', 'Seri', 'Risk'].map(h => (
                <th key={h} className="text-left p-4 text-slate-400 text-sm font-medium last:text-left first:text-left [&:nth-child(n+3)]:text-right [&:nth-child(n+7)]:text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students?.map(student => {
              const riskLevel = (student.risk_score as { risk_level: string }[])?.[0]?.risk_level ?? 'low';
              const growthPositive = (student.growth_score ?? 0) > 0;

              return (
                <tr
                  key={student.id}
                  className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors"
                >
                  <td className="p-4">
                    <Link href={`/students/${student.id}`}>
                      <p className="text-white font-medium hover:text-indigo-400 transition-colors">
                        {student.full_name}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">{student.email}</p>
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300 uppercase text-sm font-mono">{student.exam_target}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-slate-400">{Math.round(student.baseline_arp)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-white font-semibold">{Math.round(student.current_arp)}</span>
                  </td>
                  <td className="p-4 text-right">
                    <span className={growthPositive ? 'text-green-400' : 'text-red-400'}>
                      {growthPositive ? '+' : ''}{student.growth_score?.toFixed(1) ?? '0'}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-orange-400">🔥 {student.streak_days}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskColors[riskLevel] ?? 'text-slate-400'}`}>
                      {riskLevel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {(students?.length ?? 0) === 0 && (
          <p className="text-slate-500 text-center py-12">Öğrenci bulunamadı.</p>
        )}
      </div>
    </div>
  );
}

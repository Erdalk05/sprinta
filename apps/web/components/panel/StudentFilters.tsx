'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const EXAMS = ['tyt', 'ayt', 'lgs', 'kpss'];

export function StudentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/students?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex gap-3 mb-4">
      <input
        type="search"
        placeholder="Öğrenci ara..."
        defaultValue={searchParams.get('search') ?? ''}
        onChange={e => update('search', e.target.value)}
        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 w-64"
      />

      <select
        defaultValue={searchParams.get('exam') ?? ''}
        onChange={e => update('exam', e.target.value)}
        className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="">Tüm Sınavlar</option>
        {EXAMS.map(e => (
          <option key={e} value={e}>{e.toUpperCase()}</option>
        ))}
      </select>
    </div>
  );
}

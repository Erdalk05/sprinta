'use client';

import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export function NewTenantButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/admin/tenants/new')}
      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
    >
      <Plus className="w-4 h-4" />
      Yeni Kurum
    </button>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function DELETE(_req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Student kaydını bul
    const { data: student } = await supabase
      .from('students')
      .select('id, tenant_id')
      .eq('auth_user_id', user.id)
      .single();

    if (student && !student.tenant_id) {
      // B2C: Tüm verileri sil (CASCADE ile)
      await supabase.from('students').delete().eq('id', student.id);
    } else if (student && student.tenant_id) {
      // B2B: Sadece pasife al, kurumun analistik verisi için 30 gün sakla
      await supabase.from('students').update({
        is_active: false,
        deletion_requested_at: new Date().toISOString(),
        email: `deleted_${Date.now()}@removed.invalid`,
        full_name: '[Silindi]',
      }).eq('id', student.id);
    }

    // Auth kullanıcısını sil
    await supabase.auth.admin.deleteUser(user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: superAdmin } = await supabase
    .from('super_admins')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  if (!superAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();

  try {
    const slug = body.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 50);

    const contractEnd = new Date();
    contractEnd.setMonth(contractEnd.getMonth() + body.contractMonths);

    const pricePerStudent = body.tier === 'starter' ? 49 : body.tier === 'professional' ? 39 : 29;
    const minRevenue = body.tier === 'starter' ? 3000 : body.tier === 'professional' ? 5000 : 10000;
    const monthlyRevenue = Math.max(
      minRevenue / body.contractMonths,
      (body.maxStudents * pricePerStudent) / 12
    );

    // 1. Tenant oluştur
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: body.name,
        slug,
        type: body.type,
        tier: body.tier,
        max_students: body.maxStudents,
        contract_start: new Date().toISOString().split('T')[0],
        contract_end: contractEnd.toISOString().split('T')[0],
        is_trial: false,
        primary_email: body.adminEmail,
        city: body.city ?? null,
        monthly_revenue: monthlyRevenue,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // 2. Tenant settings
    await supabase.from('tenant_settings').insert({ tenant_id: tenant.id });

    // 3. Auth kullanıcısı oluştur (service role gerektirir — production'da service-role key ile çalışır)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: body.adminEmail,
      password: body.adminInitialPassword,
      email_confirm: true,
      user_metadata: {
        full_name: body.adminFullName,
        role: 'tenant_admin',
        tenant_id: tenant.id,
      },
    });

    if (authError) throw authError;

    // 4. tenant_admins tablosuna ekle
    await supabase.from('tenant_admins').insert({
      tenant_id: tenant.id,
      auth_user_id: authUser.user.id,
      email: body.adminEmail,
      full_name: body.adminFullName,
      is_primary: true,
    });

    return NextResponse.json({ success: true, tenantId: tenant.id });
  } catch (err) {
    console.error('Tenant oluşturma hatası:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

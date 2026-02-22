import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// content_difficulty enum değerleri
function mapDifficultyToEnum(difficulty: number): string {
  if (difficulty <= 2) return 'cok_kolay';
  if (difficulty <= 4) return 'kolay';
  if (difficulty <= 6) return 'orta';
  if (difficulty <= 8) return 'zor';
  return 'cok_zor';
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Auth kontrolü
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, category, examTypes, wordCount, fleschScore, difficulty } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 });
    }

    const difficultyEnum = mapDifficultyToEnum(difficulty ?? 5);

    const { data, error } = await supabase
      .from('content_library')
      .insert({
        title,
        body: content,
        category: category ?? 'turkce_edebiyat',
        difficulty: difficultyEnum,
        word_count: wordCount ?? 0,
        flesch_score: fleschScore ?? 50,
        estimated_wpm_target: 150 + ((difficulty ?? 5) - 1) * 20,
        exam_types: examTypes ?? [],
        grade_levels: [],
        source_type: 'original',
        is_published: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[content/route] insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    console.error('[content/route] unexpected error:', err);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

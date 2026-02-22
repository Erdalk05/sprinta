'use client';

import { useState } from 'react';
import { calculateFleschScore, estimateDifficulty } from '@sprinta/shared';
import { CONTENT_CATEGORIES, EXAM_CONTENT_WEIGHTS } from '@sprinta/shared';

const CATEGORY_OPTIONS = Object.entries(CONTENT_CATEGORIES).map(([key, label]) => ({
  value: key.toLowerCase(),
  label,
}));

const EXAM_TYPE_OPTIONS = Object.keys(EXAM_CONTENT_WEIGHTS);

export default function NewContentPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('informative');
  const [examTypes, setExamTypes] = useState<string[]>(['tyt']);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Otomatik hesaplanan değerler
  const wordCount = content.split(/\s+/).filter(w => w).length;
  const fleschScore = content.length > 50 ? calculateFleschScore(content) : 0;
  const estimatedDiff = content.length > 50 ? estimateDifficulty(content) : 5;

  function toggleExamType(type: string) {
    setExamTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError('Başlık ve metin alanları zorunludur.');
      return;
    }
    if (examTypes.length === 0) {
      setError('En az bir sınav tipi seçiniz.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          examTypes,
          wordCount,
          fleschScore,
          difficulty: estimatedDiff,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTitle('');
        setContent('');
        setCategory('informative');
        setExamTypes(['tyt']);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const body = await res.json();
        setError(body.error ?? 'Kaydetme başarısız oldu.');
      }
    } catch {
      setError('Ağ hatası oluştu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Yeni İçerik Ekle</h1>

      {saved && (
        <div className="mb-4 bg-green-800 border border-green-600 text-green-200 px-4 py-3 rounded-lg">
          İçerik başarıyla kaydedildi!
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Başlık */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Başlık"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />

        {/* Kategori */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
        >
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Sınav tipleri */}
        <div>
          <p className="text-slate-400 text-sm mb-2">Sınav Tipleri</p>
          <div className="flex gap-3">
            {EXAM_TYPE_OPTIONS.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => toggleExamType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  examTypes.includes(type)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Metin */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Metin içeriği..."
          rows={12}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
        />

        {/* Otomatik metrikler */}
        {content.length > 50 && (
          <div className="bg-slate-700 rounded-lg p-4 flex gap-8">
            <div>
              <p className="text-slate-400 text-xs mb-1">Kelime Sayısı</p>
              <p className="text-white font-bold text-lg">{wordCount}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Flesch Skoru</p>
              <p className="text-white font-bold text-lg">{fleschScore}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Tahmini Güçlük</p>
              <p className="text-indigo-400 font-bold text-lg">{estimatedDiff}/10</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-1">Okunabilirlik</p>
              <p className={`font-bold text-lg ${
                fleschScore >= 60 ? 'text-green-400' :
                fleschScore >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {fleschScore >= 60 ? 'Kolay' : fleschScore >= 40 ? 'Orta' : 'Zor'}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}

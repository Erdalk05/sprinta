'use client'
// =====================================================
// DifficultySelector — Sprint 6
// 5 tıklanabilir daire zorluk seçici
// =====================================================

interface Props {
  value:    number
  onChange: (v: number) => void
}

export function DifficultySelector({ value, onChange }: Props){
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Zorluk seviyesi">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          aria-label={`Zorluk ${n}`}
          aria-pressed={value >= n}
          onClick={() => onChange(n)}
          onKeyDown={e => {
            if (e.key === 'ArrowRight' && value < 5) onChange(value + 1)
            if (e.key === 'ArrowLeft'  && value > 1) onChange(value - 1)
          }}
          className={`w-8 h-8 rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            value >= n
              ? 'bg-indigo-500 border-indigo-500'
              : 'bg-transparent border-slate-500 hover:border-indigo-400'
          }`}
        />
      ))}
      <span className="ml-2 text-slate-400 text-sm">
        {['', 'Çok Kolay', 'Kolay', 'Orta', 'Zor', 'Çok Zor'][value] ?? ''}
      </span>
    </div>
  )
}

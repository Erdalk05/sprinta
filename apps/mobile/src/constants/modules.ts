export interface ModuleConfig {
  label: string
  icon: string
  color: string
  description: string
  duration: string
  tip: string
}

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  speed_control: {
    label: 'Hız Kontrolü',
    icon: '⚡',
    color: '#6C3EE8',
    description: 'Okuma hızını artır, anlayarak ilerle',
    duration: '10–15 dk',
    tip: 'Her parça ekranda belirip kaybolacak. Odaklanmaya çalış.',
  },
  deep_comprehension: {
    label: 'Derin Kavrama',
    icon: '🧠',
    color: '#059669',
    description: 'Metni derinlemesine anla ve analiz et',
    duration: '15–20 dk',
    tip: 'Metni kendi hızında oku, sonra soruları yanıtla.',
  },
  attention_power: {
    label: 'Dikkat Gücü',
    icon: '🎯',
    color: '#D97706',
    description: 'Odak ve dikkat kapasiteni geliştir',
    duration: '5–10 dk',
    tip: 'Hedef harfi en hızlı şekilde bul. Süre önemli!',
  },
  mental_reset: {
    label: 'Zihinsel Sıfırlama',
    icon: '🌿',
    color: '#0EA5E9',
    description: 'Zihnini dinlendir ve yenile',
    duration: '5 dk',
    tip: 'Nefes egzersizi: 4 san nefes al, 7 san tut, 8 san bırak.',
  },
  eye_training: {
    label: 'Kartal Gözü',
    icon: '👁️',
    color: '#F59E0B',
    description: 'Periferik görüşü genişlet, sakkad hareketini geliştir',
    duration: '5–10 dk',
    tip: 'Merkezdeki noktaya odaklan, etrafındakileri de görmaya çalış.',
  },
  vocabulary: {
    label: 'Kelime Hazinesi',
    icon: '📖',
    color: '#8B5CF6',
    description: 'Bağlamsal kelime öğrenme — TYT/LGS formatında',
    duration: '8–12 dk',
    tip: 'Cümle içinde anlamı tahmin et, kelimeleri daha kalıcı öğrenirsin.',
  },

  // ─── Dil Dersleri ───────────────────────────────────────────────
  turkce: {
    label: 'Türkçe',
    icon: '📝',
    color: '#EF4444',
    description: 'Paragraf, anlam, dil bilgisi — LGS & TYT',
    duration: '10–15 dk',
    tip: 'Soruyu önce oku, sonra metne bak. Cümlelerin birbirini nasıl desteklediğini gözlemle.',
  },
  ingilizce: {
    label: 'İngilizce',
    icon: '🇬🇧',
    color: '#2563EB',
    description: 'Grammar, vocabulary & reading — LGS & TYT',
    duration: '10–15 dk',
    tip: 'Önce metnin ana fikrini bul, bilinmeyen kelimeler için bağlamı kullan.',
  },

  // ─── Fen & Sosyal ────────────────────────────────────────────────
  teknoloji: {
    label: 'Teknoloji',
    icon: '💻',
    color: '#7C3AED',
    description: 'AI, blockchain, kuantum, siber güvenlik…',
    duration: '10–15 dk',
    tip: 'Teknik terimlerin Türkçe karşılıklarını öğren, kavramsal bağlantı kur.',
  },
  bilim: {
    label: 'Bilim',
    icon: '🔭',
    color: '#0284C7',
    description: 'Kara delikler, CRISPR, kuantum fiziği, evrim…',
    duration: '10–15 dk',
    tip: 'Neden-nasıl sorularını kendin cevaplamaya çalış okurken.',
  },
  felsefe: {
    label: 'Felsefe',
    icon: '🏺',
    color: '#B45309',
    description: 'Sokrates, Platon, Kant, Nietzsche — TYT/AYT',
    duration: '10–15 dk',
    tip: 'Her filozofun temel sorusunu ve verdiği cevabı not al.',
  },
  tarih: {
    label: 'Tarih',
    icon: '⚔️',
    color: '#B91C1C',
    description: 'Osmanlı, Fransız Devrimi, Kurtuluş Savaşı…',
    duration: '10–15 dk',
    tip: 'Olayları tarihsel sıraya koy; neden → olay → sonuç zincirini kur.',
  },
  psikoloji: {
    label: 'Psikoloji',
    icon: '🧠',
    color: '#0D9488',
    description: 'Maslow, Freud, Pavlov, bilişsel önyargılar…',
    duration: '10–15 dk',
    tip: 'Teorileri günlük hayattan örneklerle ilişkilendir.',
  },

  // ─── Konu Metinleri ─────────────────────────────────────────────
  cografya: {
    label: 'Coğrafya',
    icon: '🌍',
    color: '#10B981',
    description: 'İklim, jeomorfoloji, nüfus ve ekonomik coğrafya',
    duration: '10–15 dk',
    tip: 'Harita üzerinde düşünerek oku, kavramları bölgelerle ilişkilendir.',
  },
  edebiyat: {
    label: 'Edebiyat',
    icon: '📜',
    color: '#8B5CF6',
    description: 'Türk ve dünya edebiyatından metin ve sorular',
    duration: '10–15 dk',
    tip: 'Yazarın dönemini ve akımını aklında tut; metni o çerçevede oku.',
  },
  sosyal: {
    label: 'Sosyal Bilgiler',
    icon: '🏛️',
    color: '#F59E0B',
    description: 'Tarih, vatandaşlık ve sosyal bilimler',
    duration: '10–15 dk',
    tip: 'Neden-sonuç ilişkisine odaklan, olayların bağlamını kavra.',
  },
  fen: {
    label: 'Fen Bilimleri',
    icon: '🔬',
    color: '#3B82F6',
    description: 'Biyoloji, kimya ve fizik okuma parçaları',
    duration: '10–15 dk',
    tip: 'Anahtar kavramları ve denklikleri altını çizerek oku.',
  },
  saglik: {
    label: 'Sağlık',
    icon: '🏥',
    color: '#EF4444',
    description: 'Biyoloji ve sağlık bilimleri okuma parçaları',
    duration: '10–15 dk',
    tip: 'Sistem ve organ adlarını birbirleriyle ilişkilendirerek öğren.',
  },
}

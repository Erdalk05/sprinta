import type { SampleQuestion } from './sampleContent'

export interface DiagnosticContent {
  title: string
  passage: string
  wordCount: number
  questions: SampleQuestion[]
}

/**
 * Tanılama metni — orta güçlük, ~250 kelime
 * ARP baseline ölçümü için standart geçit
 */
export const DIAGNOSTIC_CONTENT: DiagnosticContent = {
  title: 'Zekanın Esnekliği',
  wordCount: 248,
  passage: `Nörobilimdeki son keşifler, zekanın sabit bir kapasite olmadığını ortaya koyuyor. "Nöroplastisite" adı verilen bu olgu, beynin yeni deneyimler, öğrenme ve uygulama yoluyla kendini yeniden yapılandırabildiğini göstermektedir. Beyin, tıpkı bir kas gibi egzersizle güçlenebilir.

Okuma bu süreçte kritik bir rol oynar. Düzenli okuma yapan bireylerin beyinlerinde, dil işleme ve çalışma belleğiyle ilgili bölgelerin daha yoğun sinaptik bağlantılar geliştirdiği saptanmıştır. Dahası, akıcı okuyucuların yalnızca görsel kortekslerini değil, motor sistemlerini de devreye soktuğu görülmektedir; bu durum "bedenleşmiş biliş" teorisiyle örtüşmektedir.

Okuma hızı ve anlama birbirini doğrudan etkiler, ancak bu ilişki doğrusal değildir. Belirli bir eşiğin üzerinde, hız arttıkça dikkat odağı daralır ve yüzeysel işleme devreye girer. Profesyonel okuyucular bu eşiği, geniş algı alanları ve verimli göz hareketleri geliştirerek yükseltirler. Ortalama bir yetişkin dakikada 200–250 kelime okurken, eğitimli okuyucular bu sayıyı 400–500 kelimeye çıkarabilir; üstelik kavrama oranını düşürmeden.

Bu noktada devreye giren bir diğer etken ise "akış" durumudur. Psikolog Mihaly Csikszentmihalyi tarafından tanımlanan bu kavram, zorluk ile beceri düzeyinin dengelendiği bir odak tepesidir. Okuma egzersizleri bu dengeyi koruyacak şekilde tasarlandığında, hem hız hem de anlama birlikte gelişir.

Sonuç olarak, okuma performansını artırmak için ne kadar değil, nasıl okuduğunuz belirleyicidir.`,
  questions: [
    {
      question: 'Nöroplastisite ne anlama gelir?',
      options: [
        'Beynin sabit kapasiteyle çalışması',
        'Beynin yeni deneyimlerle kendini yeniden yapılandırabilmesi',
        'Beynin yalnızca çocuklukta gelişmesi',
        'Zekanın genetik faktörlere bağlı olması',
      ],
      correctIndex: 1,
    },
    {
      question: 'Düzenli okuma yapan bireylerde ne gözlemlenmektedir?',
      options: [
        'Görsel korteks küçülür',
        'Motor sistem zayıflar',
        'Dil işleme bölgelerinde yoğun sinaptik bağlantılar gelişir',
        'Çalışma belleği azalır',
      ],
      correctIndex: 2,
    },
    {
      question: 'Okuma hızı ile anlama arasındaki ilişki nasıl tanımlanmaktadır?',
      options: [
        'Hız arttıkça anlama her zaman artar',
        'İkisi birbirinden bağımsızdır',
        'Belirli bir eşiğin üzerinde hız artışı anlamayı olumsuz etkiler',
        'Hız düştükçe anlama da düşer',
      ],
      correctIndex: 2,
    },
    {
      question: 'Eğitimli okuyucuların dakikada ulaşabileceği kelime sayısı nedir?',
      options: ['100–150 kelime', '200–250 kelime', '400–500 kelime', '700–800 kelime'],
      correctIndex: 2,
    },
    {
      question: 'Metne göre okuma performansını belirleyen temel etken nedir?',
      options: [
        'Ne kadar okunduğu',
        'Nasıl okunduğu',
        'Günde kaç saat çalışıldığı',
        'Okunan metnin zorluğu',
      ],
      correctIndex: 1,
    },
  ],
}

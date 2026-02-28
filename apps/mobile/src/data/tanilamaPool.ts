/**
 * Tanılama Test Havuzu — 10 test, 4 kategori
 * Sağlık(3) · Teknoloji(3) · Eğitim(2) · Edebiyat(2)
 * Her test: 250-300 kelime makale + 5 soru + 4 seçenek
 */
import type { SampleQuestion } from './sampleContent'

export type TanilamaCategory = 'saglik' | 'teknoloji' | 'egitim' | 'edebiyat'

export interface TanilamaTest {
  id: string
  category: TanilamaCategory
  categoryLabel: string
  title: string
  content: string
  wordCount: number
  questions: SampleQuestion[]
}

// ─────────────────────────────────────────────────────────────────
// SAĞLIK
// ─────────────────────────────────────────────────────────────────

const saglik01: TanilamaTest = {
  id: 'tan-saglik-01',
  category: 'saglik',
  categoryLabel: 'Sağlık',
  title: 'D Vitamini ve Bağışıklık',
  wordCount: 261,
  content: `D vitamini, güneş ışığına maruz kalındığında deride sentezlenen yağda çözünen bir vitamindir. Kemik sağlığı için gerekli olan kalsiyum emilimini artırmasıyla tanınan bu vitamin, son yıllarda bağışıklık sistemi üzerindeki etkileriyle de gündeme gelmiştir.

Araştırmalar, D vitamini eksikliğinin solunum yolu enfeksiyonlarına karşı savunmasızlığı artırdığını ortaya koymuştur. Bu vitamin, bağışıklık hücrelerinin olgunlaşmasını ve işlev görmesini destekler. Makrofajlar ve T hücreleri gibi bağışıklık hücreleri D vitamini reseptörü taşır; dolayısıyla bu vitamin doğrudan bağışıklık yanıtını düzenler.

Türkiye'de yapılan araştırmalar, nüfusun önemli bir bölümünde D vitamini düzeylerinin yetersiz kaldığını göstermiştir. Özellikle kış aylarında güneş ışığına yeterince maruz kalamayanlar, yaşlılar ve koyu tenli bireyler risk altındadır. D vitamini eksikliği yalnızca bağışıklığı zayıflatmakla kalmaz; yorgunluk, kas ağrısı ve depresyon belirtilerine de zemin hazırlar.

Yeterli D vitamini düzeyini korumak için günlük on beş ile otuz dakika arasında güneş ışığına maruz kalmak önerilir. Bunun yanı sıra yağlı balık, yumurta sarısı ve zenginleştirilmiş süt ürünleri gibi besinler de vitamini destekler. Gerektiğinde doktor önerisiyle takviye kullanmak ise eksikliği gidermenin en etkili yollarından biridir.

D vitamini düzeyinizi düzenli olarak kontrol ettirmek, özellikle kış mevsiminde yaşam kalitenizi korumak açısından büyük önem taşır.`,
  questions: [
    {
      question: 'D vitamini deride hangi koşulda sentezlenir?',
      options: ['Egzersiz sırasında', 'Güneş ışığına maruz kalındığında', 'Uyku sırasında', 'Su içildiğinde'],
      correctIndex: 1,
    },
    {
      question: 'D vitamini eksikliği hangi sorunu artırır?',
      options: ['Görme bozukluğu', 'Dişlerin çürümesi', 'Solunum yolu enfeksiyonları', 'Cilt hastalıkları'],
      correctIndex: 2,
    },
    {
      question: 'D vitamini reseptörü taşıyan hücreler hangileridir?',
      options: ['Eritrositler ve trombositler', 'Makrofajlar ve T hücreleri', 'Nöronlar ve glia hücreleri', 'Hepatositler ve miyositler'],
      correctIndex: 1,
    },
    {
      question: 'D vitamini eksikliği için risk grubu kimlerdir?',
      options: ['Genç ve spor yapanlar', 'Yaşlılar ve koyu tenli bireyler', 'Vejetaryenler', 'Yüksek irtifada yaşayanlar'],
      correctIndex: 1,
    },
    {
      question: 'Günlük ne kadar güneş ışığı önerilmektedir?',
      options: ['5-10 dakika', '15-30 dakika', '1-2 saat', '30-60 dakika'],
      correctIndex: 1,
    },
  ],
}

const saglik02: TanilamaTest = {
  id: 'tan-saglik-02',
  category: 'saglik',
  categoryLabel: 'Sağlık',
  title: 'Kahve ve Bilişsel Performans',
  wordCount: 258,
  content: `Kahve, dünyada en çok tüketilen içeceklerden biridir. İçeriğindeki kafein, merkezi sinir sistemi üzerindeki uyarıcı etkisiyle bilinir. Ancak kahvenin bilişsel performansa etkisi, kafeinin çok ötesine geçer.

Kafein, adenozin reseptörlerini bloke ederek uyanıklığı ve dikkat kapasitesini artırır. Adenozin, gün içinde biriken ve uyku isteği yaratan bir nörotransmiterdir. Kafeinin bu reseptörleri işgal etmesiyle uyku baskısı geçici olarak azalır, zihinsel keskinlik yükselir.

Düzenli ve ölçülü kahve tüketimiyle uzun vadeli bilişsel faydalar da gözlemlenmektedir. Araştırmalar, günde iki ile dört fincan arası kahve içen bireylerde Alzheimer ve Parkinson gibi nörodejeneratif hastalık riskinin azaldığını göstermektedir. Kahvede bulunan antioksidanlar, beyin hücrelerini oksidatif stresten korur.

Bununla birlikte kahvenin olumsuz etkileri de göz ardı edilmemelidir. Aşırı kafein tüketimi kaygı, uyku bozukluğu ve çarpıntıya yol açabilir. Özellikle öğleden sonra tüketilen kahve uyku kalitesini olumsuz etkileyebilir; bu nedenle uzmanlar, son kahvenin en geç öğle saatlerinde içilmesini önerir.

Bireyler arasındaki genetik farklılıklar da kafeinin etkisini belirler. CYP1A2 geni, kafeini metabolize etme hızını etkiler. Yavaş metabolize edenler kafeinin etkilerini daha uzun süre hissederken, hızlı metabolize edenler için aynı bardak kahve çok daha kısa etkilidir.

Kahveyi bilinçli ve ölçülü biçimde tüketmek, bilişsel performansa katkı sağlamanın en sağlıklı yoludur.`,
  questions: [
    {
      question: 'Kafein hangi nörotransmiterin reseptörlerini bloke eder?',
      options: ['Dopamin', 'Serotonin', 'Adenozin', 'Noradrenalin'],
      correctIndex: 2,
    },
    {
      question: 'Uzun vadeli kahve tüketimi hangi hastalık riskini azaltır?',
      options: ['Diyabet ve obezite', 'Alzheimer ve Parkinson', 'Kalp yetmezliği ve hipertansiyon', 'Kanser ve otoimmün hastalıklar'],
      correctIndex: 1,
    },
    {
      question: 'Kahve içmek için uzmanların önerisi nedir?',
      options: ['Sadece sabah içilmeli', 'Günde en fazla 1 fincan', 'Son kahve en geç öğle saatlerinde içilmeli', 'Akşam yemeğiyle birlikte içilmeli'],
      correctIndex: 2,
    },
    {
      question: 'CYP1A2 geni neyi belirler?',
      options: ['Kahvede antioksidan miktarını', 'Kafeinin metabolize edilme hızını', 'Bağımlılık riskini', 'Uyku süresini'],
      correctIndex: 1,
    },
    {
      question: 'Aşırı kafein tüketiminin olumsuz etkileri nelerdir?',
      options: ['Görme bozukluğu ve mide ağrısı', 'Kaygı, uyku bozukluğu ve çarpıntı', 'Baş ağrısı ve kas krampları', 'Cilt döküntüsü ve yorgunluk'],
      correctIndex: 1,
    },
  ],
}

const saglik03: TanilamaTest = {
  id: 'tan-saglik-03',
  category: 'saglik',
  categoryLabel: 'Sağlık',
  title: 'Meditasyon ve Stres Yönetimi',
  wordCount: 255,
  content: `Stres, modern yaşamın kaçınılmaz bir parçası haline gelmiştir. Kısa süreli stres motivasyonu artırabilir; ancak kronik stres hem zihinsel hem de bedensel sağlığı ciddi biçimde tehdit eder. Bu noktada meditasyon, bilimsel çevrelerce giderek daha fazla ilgi gören etkili bir müdahale yöntemi olarak öne çıkmaktadır.

Meditasyonun en yaygın biçimi olan farkındalık meditasyonu, bireyin dikkatini yargılamadan şimdiki ana odaklamasını kapsar. Düzenli pratikle beynin stres tepkisinden sorumlu yapısı olan amigdala küçülürken, duygusal düzenlemeyle ilişkili prefrontal korteks güçlenir.

Harvard Tıp Okulu araştırmacıları, sekiz haftalık meditasyon programına katılan bireylerde kortizol düzeylerinin anlamlı ölçüde düştüğünü raporlamıştır. Kortizol, birincil stres hormonu olarak bilinir ve kronik olarak yüksek kalması bağışıklık sistemi baskılanmasına, tansiyon artışına ve metabolik bozukluklara yol açar.

Meditasyon pratik açıdan son derece erişilebilirdir. Günlük on dakikalık oturumlar bile fark yaratabilir. Nefese odaklanma, beden taraması veya görselleştirme gibi teknikler farklı ihtiyaçlara uygun seçenekler sunar. Sabah yapılan meditasyon güne daha sakin başlamayı sağlarken, gece yapılanı uyku kalitesini artırır.

Meditasyonun etkileri zaman içinde birikir. İlk haftalarda odaklanmak zor gelebilir; bu normaldir. Önemli olan tutarlılıktır. Uzmanlar, meditasyonun ilaçla birlikte kullanıldığında kaygı bozuklukları ve depresyonun tedavisinde somut katkılar sağladığını vurgulamaktadır.`,
  questions: [
    {
      question: 'Kronik stresin tehlikesi nedir?',
      options: ['Motivasyonu artırır', 'Yalnızca zihinsel sağlığı etkiler', 'Hem zihinsel hem bedensel sağlığı tehdit eder', 'Uyku kalitesini artırır'],
      correctIndex: 2,
    },
    {
      question: 'Meditasyonun etkisiyle amigdalada ne olur?',
      options: ['Büyür', 'Küçülür', 'Yer değiştirir', 'Aktifleşir'],
      correctIndex: 1,
    },
    {
      question: 'Kortizol nedir?',
      options: ['Bağışıklık hormonu', 'Uyku hormonu', 'Birincil stres hormonu', 'Büyüme hormonu'],
      correctIndex: 2,
    },
    {
      question: 'Harvard araştırmasına göre kaç haftalık meditasyon kortizolü düşürür?',
      options: ['4 hafta', '6 hafta', '8 hafta', '12 hafta'],
      correctIndex: 2,
    },
    {
      question: 'Meditasyonda en önemli unsur nedir?',
      options: ['Uzun süreli oturum', 'Tutarlılık', 'Sessiz ortam', 'Profesyonel rehberlik'],
      correctIndex: 1,
    },
  ],
}

// ─────────────────────────────────────────────────────────────────
// TEKNOLOJİ
// ─────────────────────────────────────────────────────────────────

const teknoloji01: TanilamaTest = {
  id: 'tan-teknoloji-01',
  category: 'teknoloji',
  categoryLabel: 'Teknoloji',
  title: 'Yapay Zeka ve Günlük Hayat',
  wordCount: 263,
  content: `Yapay zeka, birkaç yıl içinde laboratuvar ortamından günlük hayatın merkezine taşındı. Akıllı telefonlarımızdaki asistanlardan sosyal medya algoritmalarına, sağlık teşhisinden sürücüsüz araçlara kadar yapay zeka artık her yerde.

Derin öğrenme, yapay zekanın son on yılda gösterdiği büyük atılımın temelini oluşturur. Büyük miktarda veri üzerinde eğitilen yapay sinir ağları, örüntüleri insandan daha hızlı tanıyabilir hale geldi. Görüntü tanıma alanında yapay zeka, radyoloji görüntülerinden tümörleri dermatologlardan daha yüksek doğrulukla tespit edebiliyor.

Dil modelleri ise iletişimi köklü biçimde dönüştürüyor. Büyük dil modelleri metin oluşturma, çeviri, özetleme ve kod yazma gibi görevlerde insan düzeyine yaklaşmış, kimi zaman aşmıştır. Bu modeller eğitim, hukuk ve yazılım geliştirme gibi alanları yeniden şekillendiriyor.

Ancak yapay zekanın beraberinde getirdiği etik sorular da tartışılmaktadır. Veri gizliliği, algoritma yanlılığı ve iş kayıpları başlıca kaygı kaynakları arasında yer alır. Bir yapay zeka modeli, eğitildiği verilerdeki önyargıları pekiştirirse ayrımcılığa yol açabilir.

Yapay zekanın şeffaflığı ve hesap verebilirliği sağlanmadan toplumsal hayata entegrasyonu, tehlikeli sonuçlar doğurabilir. Bu nedenle birçok ülke yapay zekayı düzenlemek için kapsamlı yasal çerçeveler oluşturmaktadır.

Yapay zeka bir araçtır; nasıl kullanıldığı, fırsat mı yoksa tehdit mi oluşturduğunu belirleyecektir.`,
  questions: [
    {
      question: 'Yapay zekanın son büyük atılımını neye borçludur?',
      options: ['Kuantum hesaplama', 'Derin öğrenme', 'Klasik programlama', 'Robotik'],
      correctIndex: 1,
    },
    {
      question: 'Yapay zeka radyoloji alanında ne yapabilmektedir?',
      options: ['Ameliyat yapabilmektedir', 'Hastaları teşhis eder ve tedavi eder', 'Tümörleri dermatologlardan daha yüksek doğrulukla tespit eder', 'Kan tahlili sonuçlarını değerlendirir'],
      correctIndex: 2,
    },
    {
      question: 'Büyük dil modellerinin etkilediği alanlar hangileridir?',
      options: ['Yalnızca eğlence sektörü', 'Eğitim, hukuk ve yazılım geliştirme', 'Yalnızca sağlık sektörü', 'Tarım ve gıda endüstrisi'],
      correctIndex: 1,
    },
    {
      question: 'Algoritma yanlılığı hangi sonuca yol açabilir?',
      options: ['Sistem çökmesi', 'Enerji tüketimi artışı', 'Ayrımcılık', 'Veri kaybı'],
      correctIndex: 2,
    },
    {
      question: 'Metne göre yapay zekanın nasıl kullanılacağı neyi belirler?',
      options: ['Sistemin ne kadar güçlü olduğunu', 'Fırsat mı yoksa tehdit mi oluşturduğunu', 'Algoritmanın hızını', 'Veri miktarını'],
      correctIndex: 1,
    },
  ],
}

const teknoloji02: TanilamaTest = {
  id: 'tan-teknoloji-02',
  category: 'teknoloji',
  categoryLabel: 'Teknoloji',
  title: 'Kuantum Hesaplama',
  wordCount: 257,
  content: `Klasik bilgisayarlar veriyi bitler aracılığıyla işler; her bit ya sıfır ya da bir değerini alır. Kuantum bilgisayarlar ise "kübit" adı verilen birimler kullanır. Kübitlerin temel özelliği süperpozisyon; yani bir kubiti aynı anda hem sıfır hem de bir olarak var olabilme durumudur. Bu özellik, kuantum bilgisayarların belirli problemleri klasik bilgisayarlardan muazzam ölçüde daha hızlı çözmesini sağlar.

Kuantum dolanıklığı ise bir diğer temel ilkedir. İki kübit dolanıklaştırıldığında, birinin durumu anında diğerini etkiler; bu etki ışık hızından dahi hızlıdır. Bu özellik, özellikle kriptografi ve iletişim güvenliği alanında devrim niteliğinde uygulamalar vaat etmektedir.

Google, IBM ve pek çok girişim, ticari kullanıma hazır kuantum sistemleri geliştirmek için yarışmaktadır. 2019'da Google, "kuantum üstünlüğü" iddiasıyla klasik bilgisayarların bin yıl süreceği bir hesaplamayı 200 saniyede tamamladığını duyurdu.

Kuantum hesaplama ilaç geliştirmeden finans modellemeye, iklim simülasyonundan kriptografiye kadar geniş bir yelpazede uygulanabilir. Özellikle moleküler yapıları simüle etme kapasitesi, yeni ilaç ve malzeme keşfinde devrim yaratabilir.

Bununla birlikte kuantum bilgisayarlar henüz pratik açıdan oldukça kısıtlıdır. Kübitlerin hata oranları yüksektir ve sistemin kararlı tutulabilmesi için mutlak sıfıra yakın sıcaklıklar gereklidir. Araştırmacılar, bu engelleri aşarak hataya dayanıklı kuantum sistemleri geliştirmeye çalışmaktadır.`,
  questions: [
    {
      question: 'Kübitin temel özelliği nedir?',
      options: ['Sıfır ile bir arasında seçim yapması', 'Süperpozisyon sayesinde aynı anda sıfır ve bir olabilmesi', 'Klasik bitlerden daha küçük olması', 'Manyetik alan oluşturması'],
      correctIndex: 1,
    },
    {
      question: 'Kuantum dolanıklığı neyi sağlar?',
      options: ['Kübitlerin daha az enerji kullanmasını', 'Bir kübiti etkileyen değişikliğin anında diğerini etkilemesini', 'Daha hızlı internet bağlantısı', 'Gürültüyü azaltmayı'],
      correctIndex: 1,
    },
    {
      question: `Google'ın "kuantum üstünlüğü" iddiasına göre ne gerçekleşti?`,
      options: ['Klasik bilgisayarları aşan yeni bir algoritma geliştirildi', 'Bin yıl sürecek bir hesaplama 200 saniyede tamamlandı', 'İlk kuantum internet ağı kuruldu', 'Tüm kriptografik şifreler kırıldı'],
      correctIndex: 1,
    },
    {
      question: 'Kuantum bilgisayarların özellikle hangi alanda büyük potansiyeli vardır?',
      options: ['Oyun programlama', 'Moleküler yapı simülasyonu ve ilaç keşfi', 'Sosyal medya analizi', 'Grafik tasarım'],
      correctIndex: 1,
    },
    {
      question: 'Kuantum sistemlerinin pratik kısıtlaması nedir?',
      options: ['Çok pahalı olmaları', 'Yalnızca büyük şirketlerin erişebilmesi', 'Yüksek hata oranları ve mutlak sıfıra yakın sıcaklık gerektirme', 'İnternet bağlantısı gerektirmeleri'],
      correctIndex: 2,
    },
  ],
}

const teknoloji03: TanilamaTest = {
  id: 'tan-teknoloji-03',
  category: 'teknoloji',
  categoryLabel: 'Teknoloji',
  title: 'Siber Güvenlik ve Bireysel Önlemler',
  wordCount: 254,
  content: `İnternet kullanımının artmasıyla siber tehditler de giderek karmaşık bir boyut kazanmaktadır. Kimlik avı saldırıları, fidye yazılımları ve veri ihlalleri yalnızca kurumları değil, sıradan kullanıcıları da tehdit etmektedir.

Kimlik avı, siber suçluların güvenilir kurumları taklit ederek kullanıcı bilgilerini çalmaya çalıştığı en yaygın saldırı biçimidir. Resmi görünümlü sahte e-postalar veya web siteleri aracılığıyla gerçekleşir. Kullanıcıların bu saldırılara karşı en etkili korunma yolu, bağlantılara tıklamadan önce gönderici adresini dikkatlice incelemektir.

Fidye yazılımları ise sisteme sızarak dosyaları şifreler ve şifre çözme anahtarı karşılığında para talep eder. Düzenli yedekleme yapılmadığı sürece bu saldırı türü ciddi kayıplara yol açabilir.

Bireysel düzeyde alınabilecek temel önlemler şunlardır: güçlü ve özgün parolalar kullanmak, iki faktörlü kimlik doğrulamayı etkinleştirmek, yazılımları güncel tutmak ve yalnızca güvenilir ağlara bağlanmak. İki faktörlü kimlik doğrulama, parola çalınsa bile hesabın ele geçirilmesini önler.

Sosyal mühendislik saldırıları özellikle dikkat gerektirir. Saldırganlar teknik değil, psikolojik yöntemler kullanarak insanları manipüle eder. Acele karar aldırmak ya da korku yaratmak, bu yöntemlerin başında gelir.

Siber güvenlik, yalnızca uzmanlara bırakılmaması gereken bir sorumluluktur. Küçük alışkanlık değişiklikleriyle bireylerin dijital güvenliği büyük ölçüde artırılabilir.`,
  questions: [
    {
      question: 'Kimlik avı saldırısı nasıl gerçekleşir?',
      options: ['Fiziksel cihaza müdahale ederek', 'Güvenilir kurumları taklit ederek kullanıcı bilgilerini çalmak', 'Sistemi çökerterek', 'Dosyaları şifreleyerek'],
      correctIndex: 1,
    },
    {
      question: 'Fidye yazılımlarının amacı nedir?',
      options: ['Kullanıcı parolalarını değiştirmek', 'Şifrelenen dosyalar karşılığında para talep etmek', 'İnternet bağlantısını kesmek', 'Spam e-posta göndermek'],
      correctIndex: 1,
    },
    {
      question: 'İki faktörlü kimlik doğrulama ne sağlar?',
      options: ['Daha hızlı giriş', 'Parola çalınsa bile hesap güvenliği', 'Ağ bağlantısı hızını artırma', 'Veri şifrelemesi'],
      correctIndex: 1,
    },
    {
      question: 'Sosyal mühendislik saldırılarında hangi yöntem kullanılır?',
      options: ['Teknik yazılım açıkları', 'Psikolojik manipülasyon', 'Fiziksel erişim', 'Ağ trafiği izleme'],
      correctIndex: 1,
    },
    {
      question: 'Fidye yazılımına karşı en etkili kişisel önlem nedir?',
      options: ['Antivirüs yazılımı kullanmak', 'Düzenli yedekleme yapmak', 'İnterneti kapatmak', 'Parola değiştirmek'],
      correctIndex: 1,
    },
  ],
}

// ─────────────────────────────────────────────────────────────────
// EĞİTİM
// ─────────────────────────────────────────────────────────────────

const egitim01: TanilamaTest = {
  id: 'tan-egitim-01',
  category: 'egitim',
  categoryLabel: 'Eğitim',
  title: 'Aralıklı Tekrar Yöntemi',
  wordCount: 259,
  content: `Öğrencilerin çoğu sınav öncesinde yoğun tekrar yapar; "ezber tekrarı" olarak da bilinen bu yöntem kısa vadede etkili görünse de uzun vadeli hatırlamayı zayıflatır. Bilişsel bilimin bulguları, öğrenilen bilgilerin kalıcı hale gelmesi için tekrarların farklı aralıklarla dağıtılması gerektiğini göstermektedir.

"Aralıklı tekrar" olarak adlandırılan bu yöntemde bilgiler, bellek zayıflamadan hemen önce tekrar edilir. Almanca kökenli "ebbinghaus unutma eğrisi" bu ilkeyi açıklar: yeni öğrenilen bilginin yüzde yetmişi ilk yirmi dört saat içinde, sınandığı takdirde ise çok daha az kısmı unutulur. Sınama etkisi, test edilmenin öğrenmeyi pekiştirdiğini gösterir.

Aralıklı tekrar sistemleri, öğrencinin performansına göre tekrar aralığını dinamik biçimde ayarlar. Doğru hatırladığın bilgiyi bir sonraki seferde daha uzun aralıkla gösterir; yanlış hatırladığın bilgiyi ise daha kısa süreyle yeniden sunar. Bu mekanizma beynin kaynaklarını verimli kullanmayı sağlar.

Anki ve diğer flash kart uygulamaları bu prensibi yazılım düzeyinde hayata geçirir. Araştırmalar, aynı içeriği ezberlemeye kıyasla aralıklı tekrar kullanan öğrencilerin bir yıl sonra bilgiyi iki ila üç kat daha iyi hatırladığını ortaya koymuştur.

Bu yöntemi kullanabilmek için yalnızca küçük bir günlük çaba yeterlidir; örneğin günde on beş ile otuz dakika arasında düzenli çalışma büyük fark yaratır. Disiplinli bir uygulama, herhangi bir konuyu derinlemesine öğrenmenin en kanıtlı yolu haline gelmiştir.`,
  questions: [
    {
      question: 'Ebbinghaus unutma eğrisine göre yeni bilginin ne kadarı 24 saatte unutulur?',
      options: ['%30', '%50', '%70', '%90'],
      correctIndex: 2,
    },
    {
      question: 'Aralıklı tekrarda yanlış hatırlanan bilgi ne zaman tekrar gösterilir?',
      options: ['Bir hafta sonra', 'Bir ay sonra', 'Daha kısa sürede', 'Sınav tarihinde'],
      correctIndex: 2,
    },
    {
      question: 'Sınama etkisi ne anlama gelir?',
      options: ['Sınav sayısını artırmanın öğrencileri zorladığı', 'Test edilmenin öğrenmeyi pekiştirdiği', 'Sınav kaygısının olumsuz etkileri', 'Ezber yapmanın başarıyı artırdığı'],
      correctIndex: 1,
    },
    {
      question: 'Aralıklı tekrar kullanan öğrenciler bir yıl sonra bilgiyi ne kadar daha iyi hatırlar?',
      options: ['%10-20 daha iyi', '1 kat daha iyi', '2-3 kat daha iyi', '5 kat daha iyi'],
      correctIndex: 2,
    },
    {
      question: 'Günlük kaç dakikalık çalışma önerilmektedir?',
      options: ['5-10 dakika', '15-30 dakika', '1-2 saat', '3-4 saat'],
      correctIndex: 1,
    },
  ],
}

const egitim02: TanilamaTest = {
  id: 'tan-egitim-02',
  category: 'egitim',
  categoryLabel: 'Eğitim',
  title: 'Büyüme Zihniyeti',
  wordCount: 256,
  content: `Stanford Üniversitesi psikologu Carol Dweck, on yılı aşkın araştırmanın sonunda iki temel zihinsel tutum tanımladı: sabit zihniyet ve büyüme zihniyeti.

Sabit zihniyete sahip bireyler, zekânın ve yeteneklerin doğuştan geldiğine ve değiştirilemeyeceğine inanır. Bu inanış, başarısızlık karşısında pes etmeye ve yeni zorluklardan kaçınmaya yol açar. Başarısız olmak, onlar için yetersizliğin kanıtıdır.

Büyüme zihniyetine sahip bireyler ise yeteneklerin çaba ve deneyimle geliştirilebileceğini kabul eder. Başarısızlık, öğrenme sürecinin doğal bir parçasıdır. Zorluklar, gelişim için fırsat olarak değerlendirilir.

Dweck'in araştırmaları, çocuklara verilen geri bildirimin bu zihniyetleri doğrudan şekillendirdiğini göstermiştir. Çocuğun zekâsını övmek ("Ne kadar akıllısın!") sabit zihniyeti pekiştirir. Buna karşın çabayı övmek ("Çok çalıştın!") büyüme zihniyetini destekler ve akademik başarıyı artırır.

Bu anlayış eğitim sistemini derinden etkilemektedir. Öğrencilere notlardan çok öğrenme süreçlerine odaklanmayı öğretmek, uzun vadede hem akademik hem de kişisel gelişime katkı sağlar. Kendi kendine "henüz yapamazdım ama yapabileceğim" demek, büyüme zihniyetinin temel pratiğidir.

Büyüme zihniyeti yalnızca çocuklara değil, yetişkinlere de uygulanabilir. Herhangi bir alanda yetkin olmak istiyorsanız, doğuştan gelen yeteneğe değil, bilinçli pratik ve isteğe bağlı çabaya odaklanmak en etkili yoldur.`,
  questions: [
    {
      question: 'Carol Dweck hangi üniversitede çalışmaktadır?',
      options: ['Harvard', 'MIT', 'Stanford', 'Oxford'],
      correctIndex: 2,
    },
    {
      question: 'Sabit zihniyete sahip bireylerin başarısızlık karşısındaki tutumu nedir?',
      options: ['Daha çok çalışırlar', 'Pes etme ve zorluktan kaçınma eğilimi gösterirler', 'Başarısızlığı motivasyon kaynağı olarak kullanırlar', 'Stratejilerini değiştirirler'],
      correctIndex: 1,
    },
    {
      question: 'Araştırmalara göre hangi tür övgü büyüme zihniyetini destekler?',
      options: ['Zekâyı övmek', 'Başarıyı övmek', 'Çabayı övmek', 'Sonuçları övmek'],
      correctIndex: 2,
    },
    {
      question: 'Büyüme zihniyetinde zorluklar nasıl algılanır?',
      options: ['Kaçınılması gereken tehditler', 'Gelişim için fırsatlar', 'Yetersizlik belirtileri', 'Başkalarının önüne geçmenin yolu'],
      correctIndex: 1,
    },
    {
      question: 'Büyüme zihniyetinin temel pratiği nedir?',
      options: ['"Ben bunu yapamam" demek', '"Henüz yapamadım ama yapabileceğim" demek', '"Bu benim için değil" demek', '"Çok zor" demek'],
      correctIndex: 1,
    },
  ],
}

// ─────────────────────────────────────────────────────────────────
// EDEBİYAT
// ─────────────────────────────────────────────────────────────────

const edebiyat01: TanilamaTest = {
  id: 'tan-edebiyat-01',
  category: 'edebiyat',
  categoryLabel: 'Edebiyat',
  title: 'Orhan Pamuk ve Bellek',
  wordCount: 254,
  content: `Orhan Pamuk, 2006 Nobel Edebiyat Ödülü'nü kazanan ilk Türk yazardır. İstanbul doğumlu Pamuk'un romanları, kişisel bellek ile toplumsal tarih arasındaki gerilimi ustalıkla işler. İstanbul'u ve Osmanlı'nın çöküşünü eserlerinde sıklıkla ele alır.

"Benim Adım Kırmızı" romanı, on altıncı yüzyıl Osmanlı İstanbul'unda geçer ve Doğu ile Batı sanat geleneklerinin çatışmasını anlatır. Roman, minyatür sanatından ilham alarak yazılmış olup her bölüm farklı bir anlatıcının sesinden aktarılır. Pamuk'un bu yapısal tercihi, okuyucuyu gerçeklik ve temsil üzerine düşünmeye davet eder.

"Kar" ise siyasi boyutuyla öne çıkan bir romandır. Doğu ile Batı, din ile laiklik, kimlik ve yersizlik gibi temaları Kars şehri üzerinden ele alır. Adı hem kar yağışına hem de Kars şehrinin Almanca okunuşuna gönderme yapar.

Pamuk'un en kişisel eseri sayılan "İstanbul: Hatıralar ve Şehir", bir anı kitabı olduğu kadar İstanbul üzerine yazılmış bir deneme niteliği de taşır. Türk düşünce hayatındaki "hüzün" kavramını İstanbul'un fiziksel ve ruhsal dokusuna işlemiştir. Buradaki hüzün, yalnızca bireysel bir duygu değil, Osmanlı'nın yitirilmesinin kolektif yarasıdır.

Pamuk'un edebiyatı, anlatı ve bellek üzerine kurulu felsefi bir arayıştır. Eserlerindeki çok katmanlı yapılar, okuru pasif alıcı olmaktan çıkarıp anlam yaratma sürecine dahil eder.`,
  questions: [
    {
      question: "Orhan Pamuk Nobel Edebiyat Ödülü'nü hangi yıl aldı?",
      options: ['2000', '2003', '2006', '2010'],
      correctIndex: 2,
    },
    {
      question: '"Benim Adım Kırmızı" romanı hangi dönemde geçer?',
      options: ['On dördüncü yüzyıl', 'On beşinci yüzyıl', 'On altıncı yüzyıl', 'On yedinci yüzyıl'],
      correctIndex: 2,
    },
    {
      question: '"Kar" romanındaki "Kar" isminin çift anlamı nedir?',
      options: ['Hem soğuk hem de yalnızlık', 'Hem kar yağışı hem de Kars şehrinin Almanca okunuşu', 'Hem yas hem de zafer', 'Hem beyazlık hem de masumiyet'],
      correctIndex: 1,
    },
    {
      question: `Pamuk'un "İstanbul" kitabındaki "hüzün" kavramı neyi ifade eder?`,
      options: ['Yalnızca kişisel üzüntüyü', "Osmanlı'nın yitirilmesinin kolektif yarasını", "İstanbul'un coğrafi güzelliğini", "Modern Türkiye'nin özgüvenini"],
      correctIndex: 1,
    },
    {
      question: "Pamuk'un edebiyatında okuru nasıl bir konuma yerleştirir?",
      options: ['Pasif alıcı olarak', 'Anlam yaratma sürecine dahil olarak', 'Yalnızca izleyici olarak', 'Eleştirmen olarak'],
      correctIndex: 1,
    },
  ],
}

const edebiyat02: TanilamaTest = {
  id: 'tan-edebiyat-02',
  category: 'edebiyat',
  categoryLabel: 'Edebiyat',
  title: 'Kısa Hikayenin Gücü',
  wordCount: 260,
  content: `Kısa hikaye, on dokuzuncu yüzyılda bağımsız bir edebi tür olarak belirginleşti. Edgar Allan Poe'nun "tek etki" ilkesi, bu türün temel estetiğini şekillendirdi. Poe'ya göre bir kısa hikaye, tek bir oturuşta okunabilmeli ve tek bir yoğun izlenim bırakmalıdır. Bu kısıt, her kelimenin özenle seçilmesini zorunlu kılar.

Anton Çehov, türün ustası sayılır. "Merhamet" ve "Bayan Köpekli" gibi eserleriyle sıradan insanların gündelik yaşamlarındaki derin çatışmaları birkaç sayfada görünür kıldı. Çehov tüfekten etkileyici bir ilke üretmişti: İlk bölümde bir tüfek gösterilmişse, son bölümde ateşlenmek zorundadır. Bu "Çehov'un tabancası" ilkesi, anlatıdaki her unsurla işlevi arasındaki bağı vurgular.

Ernest Hemingway "buz dağı teorisi" diye adlandırılan anlatım biçimini geliştirdi. Hikayenin büyük bölümü söylenmez; söylenmeyen anlam, söylenenin altında yatar. "Altı kelimelik hikaye" olarak bilinen "Satılık: Bebek ayakkabıları, hiç kullanılmamış." cümlesi bu yoğunluğun simgesi haline gelmiştir.

Türk edebiyatında Sait Faik Abasıyanık ve Haldun Taner, bu geleneği yerel imgeler ve Anadolu gerçekliğiyle buluşturdu. Sait Faik'in hikayelerindeki deniz, balıkçı ve kenarlarda yaşayan insanlar, evrensel yalnızlık temalarını yerel ayrıntılarla dile getirir.

Kısa hikaye, edebiyatın en yoğun ve en zorlu biçimlerinden biridir. Az söyleyip çok anlatmak, her anlatıcının ideal ettiği ama çok azının tam anlamıyla başardığı sanattır.`,
  questions: [
    {
      question: '"Tek etki" ilkesini kim geliştirdi?',
      options: ['Anton Çehov', 'Ernest Hemingway', 'Edgar Allan Poe', 'Sait Faik'],
      correctIndex: 2,
    },
    {
      question: `"Çehov'un tabancası" ilkesi neyi vurgular?`,
      options: ['Şiddetin edebiyattaki yeri', 'Anlatıdaki her unsurla işlevi arasındaki bağı', 'Gerilim yaratma tekniğini', 'Diyaloğun önemini'],
      correctIndex: 1,
    },
    {
      question: `Hemingway'in "buz dağı teorisi" neyi anlatır?`,
      options: ['Soğuk anlatım tarzını', 'Söylenmeyen anlamın söylenenin altında yattığını', 'Uzun betimlemelerin gerekliliğini', 'Doğa tasvirlerine verilen önemi'],
      correctIndex: 1,
    },
    {
      question: "Sait Faik Abasıyanık'ın hikayelerinde öne çıkan temalar ve imgeler nelerdir?",
      options: ['Kırsal yaşam ve tarım', 'Deniz, balıkçı, kenarlarda yaşayan insanlar ve yalnızlık', 'Savaş ve kahramanlık', 'Şehir zenginleri ve siyaset'],
      correctIndex: 1,
    },
    {
      question: `Hemingway'in "altı kelimelik hikayesi" hangi unsuru simgeler?`,
      options: ['Uzun romanların özünü', 'Kısa yazımın yoğunluğunu', 'Çocuk edebiyatını', 'Şiirin gücünü'],
      correctIndex: 1,
    },
  ],
}

// ─────────────────────────────────────────────────────────────────
// Tüm havuz
// ─────────────────────────────────────────────────────────────────

export const TANILAMA_POOL: TanilamaTest[] = [
  saglik01, saglik02, saglik03,
  teknoloji01, teknoloji02, teknoloji03,
  egitim01, egitim02,
  edebiyat01, edebiyat02,
]

// Rastgele test seç — son 5 testId ve son kategoriyi dışla
export function selectNextTest(
  lastTestIds: string[],
  lastCategory: TanilamaCategory | null,
): TanilamaTest {
  const excluded = new Set(lastTestIds.slice(-5))

  // Kategori hariç tut (aynı kategori art arda gelmesin)
  let candidates = TANILAMA_POOL.filter(
    (t) => !excluded.has(t.id) && t.category !== lastCategory,
  )

  // Yeterli aday yoksa yalnızca testId kısıtını uygula
  if (candidates.length === 0) {
    candidates = TANILAMA_POOL.filter((t) => !excluded.has(t.id))
  }

  // Hepsi tükenmişse baştan başla
  if (candidates.length === 0) {
    candidates = TANILAMA_POOL
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

export interface SampleQuestion {
  question: string
  options: string[]
  correctIndex: number
}

export interface SampleExercise {
  id: string
  moduleCode: string
  title: string
  content: string
  questions: SampleQuestion[]
  wordCount: number
  difficulty: number
}

// Türkçe okuma parçaları — her modül için 1 örnek
export const SAMPLE_EXERCISES: Record<string, SampleExercise> = {
  speed_control: {
    id: 'sample-sc-01',
    moduleCode: 'speed_control',
    title: 'Beynin Hızı',
    wordCount: 120,
    difficulty: 5,
    content: `İnsan beyni saniyede yaklaşık 11 milyon bit bilgiyi işleyebilir. Ancak bilinçli olarak yalnızca 50 bit kadarını fark ederiz. Bu fark, beynin büyük bölümünün arka planda çalıştığını gösterir. Okuma sırasında gözler sayfada kayar değil; sıçramalar yapar. Her sıçramaya "sakkad" denir. İki sakkad arasındaki durmaya ise "fiksasyon" denir. Hızlı okuyucular daha az fiksasyon yaparak daha fazla kelimeyi tek bakışta kavrar. Bu beceri geliştirilebilir. Düzenli egzersizle çevresel görüş genişler ve beyin kelime kalıplarını daha hızlı tanımaya başlar. Anahtar nokta şudur: hız arttıkça anlama düşmez, eğer doğru teknik kullanılırsa.`,
    questions: [
      {
        question: 'İnsan beyni saniyede kaç bit bilgiyi işleyebilir?',
        options: ['50 bit', '1 milyon bit', '11 milyon bit', '100 milyon bit'],
        correctIndex: 2,
      },
      {
        question: '"Göz Hareketi (Sakkad)" nedir?',
        options: ['Gözün durma anı', 'Gözün sıçrama hareketi', 'Beyin dalgası', 'Okuma hızı birimi'],
        correctIndex: 1,
      },
      {
        question: 'Hızlı okuyucular nasıl daha fazla kelime kavrar?',
        options: ['Daha hızlı Göz Hareketi (Sakkad) yaparak', 'Daha az fiksasyon yaparak', 'Gözlerini hızlı hareket ettirerek', 'Daha az uyuyarak'],
        correctIndex: 1,
      },
    ],
  },

  deep_comprehension: {
    id: 'sample-dc-01',
    moduleCode: 'deep_comprehension',
    title: 'Derin Uyku ve Bellek',
    wordCount: 180,
    difficulty: 5,
    content: `Uyku, beynin günlük deneyimleri kalıcı belleğe aktardığı kritik bir süreçtir. Derin uyku evresinde, hipokampüs gün içinde toplanan bilgileri prefrontal kortekse aktarır. Bu süreç "bellek konsolidasyonu" olarak bilinir. Araştırmalar, bir sınav gecesi önce uyuyan öğrencilerin bilgiyi yüzde kırk daha iyi hatırladığını ortaya koymuştur.

Uyku sırasında beyin ayrıca zararlı atık maddelerden temizlenir. Glia hücreleri, Alzheimer hastalığıyla ilişkilendirilen beta-amiloid birikintilerini uzaklaştırır. Bu temizlik mekanizması uyandığınızda baş ağrısı ve bulanık düşünce olmadan güne başlamanızı sağlar.

Yetişkinlerin günde yedi ila dokuz saat uyuması önerilir. Bu sürenin altına düşüldüğünde dikkat, karar verme ve yaratıcılık işlevleri ciddi biçimde bozulur. Kısa süreli uyku, hızlı tepki gerektiren görevlerde alkolün yarattığı bozulmaya benzer etkiler yaratabilir.`,
    questions: [
      {
        question: 'Bellek konsolidasyonu hangi uyku evresinde gerçekleşir?',
        options: ['REM uykusu', 'Derin uyku', 'Hafif uyku', 'Şekerleme'],
        correctIndex: 1,
      },
      {
        question: 'Sınav öncesi uyuyan öğrenciler bilgiyi ne kadar daha iyi hatırlar?',
        options: ['%10', '%20', '%40', '%60'],
        correctIndex: 2,
      },
      {
        question: 'Beta-amiloid birikintilerini hangi hücreler temizler?',
        options: ['Nöronlar', 'Hipokampüs hücreleri', 'Glia hücreleri', 'Prefrontal hücreler'],
        correctIndex: 2,
      },
      {
        question: 'Uyku eksikliğinin etkisi neye benzetilmiştir?',
        options: ['Stres', 'Alkol tüketimi', 'Aşırı egzersiz', 'Kötü beslenme'],
        correctIndex: 1,
      },
      {
        question: 'Yetişkinler için önerilen günlük uyku süresi kaç saattir?',
        options: ['5-6 saat', '6-7 saat', '7-9 saat', '9-11 saat'],
        correctIndex: 2,
      },
    ],
  },

  attention_power: {
    id: 'sample-ap-01',
    moduleCode: 'attention_power',
    title: 'Dikkat Matrisi',
    wordCount: 0,
    difficulty: 5,
    content: '',
    questions: [],
  },

  mental_reset: {
    id: 'sample-mr-01',
    moduleCode: 'mental_reset',
    title: '4-7-8 Nefes Egzersizi',
    wordCount: 0,
    difficulty: 1,
    content: '',
    questions: [],
  },

  eye_training: {
    id: 'sample-et-01',
    moduleCode: 'eye_training',
    title: 'Schulte Tablosu',
    wordCount: 0,
    difficulty: 5,
    content: '',
    questions: [],
  },

  vocabulary: {
    id: 'sample-voc-01',
    moduleCode: 'vocabulary',
    title: 'Bağlam Tahmin',
    wordCount: 0,
    difficulty: 5,
    content: '',
    questions: [],
  },

  // ─── Konu Metinleri ────────────────────────────────────────────
  cografya: {
    id: 'sample-cog-01',
    moduleCode: 'cografya',
    title: 'İklim ve Bitki Örtüsü',
    wordCount: 210,
    difficulty: 5,
    content: `İklim, bir bölgenin uzun yıllar boyunca gözlemlenen hava koşullarının ortalamasıdır. Türkiye'nin coğrafi konumu ve yüzey şekilleri nedeniyle ülke içinde birden fazla iklim tipi yaşanmaktadır. Karadeniz kıyılarında ılıman ve yağışlı bir iklim hüküm sürerken, iç bölgelerde karasal iklim egemendir.

Bitki örtüsü ile iklim arasında çok sıkı bir ilişki vardır. Yağış miktarı arttıkça ormanlık alanlar genişler; kurak bölgelerde ise bozkır (step) hakimiyeti görülür. Akdeniz ikliminin etkisi altındaki bölgelerde maki adı verilen sert yapraklı bitkiler yetişir.

Türkiye'nin %27'si ormanlarla kaplıdır. Karadeniz'in nemli havasıyla beslenen Doğu Karadeniz bölgesi, ülkedeki en yüksek yağış miktarına ulaşır: yılda 2.000 milimetreden fazla. Bu nedenle söz konusu bölgede çay, fındık ve mısır tarımı başarıyla yapılır. Güneydoğu Anadolu'da ise yağışların azalmasıyla birlikte tarımda sulama kaçınılmaz hale gelir.`,
    questions: [
      { question: "Türkiye'nin hangi bölgesi en yüksek yağış miktarına sahiptir?", options: ['Güneydoğu Anadolu', 'İç Anadolu', 'Doğu Karadeniz', 'Ege kıyıları'], correctIndex: 2 },
      { question: 'Maki bitkisi hangi iklim bölgesinde yetişir?', options: ['Karasal iklim', 'Akdeniz iklimi', 'Karadeniz iklimi', 'Tundra iklimi'], correctIndex: 1 },
      { question: 'İklim ne anlama gelir?', options: ['Günlük hava durumu', 'Uzun yıllar ortalama hava koşulları', 'Mevsimsel yağış miktarı', 'Rüzgar yönü'], correctIndex: 1 },
      { question: "Türkiye'nin yüzeyinin yaklaşık kaçta biri ormanlarla kaplıdır?", options: ['%10', '%18', '%27', '%45'], correctIndex: 2 },
    ],
  },

  edebiyat: {
    id: 'sample-ede-01',
    moduleCode: 'edebiyat',
    title: 'Tanzimat Edebiyatının Doğuşu',
    wordCount: 195,
    difficulty: 5,
    content: `Tanzimat, 1839 yılında ilan edilen bir reform fermanıdır. Bu tarihten itibaren Osmanlı toplumunda köklü değişimler yaşandı; edebiyat da bu dönüşümden nasibini aldı. Batı edebiyatıyla kurulan temas, yeni türlerin Türk edebiyatına girmesini sağladı: roman, hikâye, tiyatro ve gazete.

İlk Türk romanı olarak kabul edilen "Taaşşuk-ı Talat ve Fitnat", Şemseddin Sami tarafından 1872'de kaleme alındı. Ardından Namık Kemal'in "İntibah"ı ve Recaizade Mahmut Ekrem'in eserleri, romanın Türk okuyucusuna yerleşmesini hızlandırdı.

Tanzimat edebiyatı iki dönemde incelenir. Birinci dönemde toplum için sanat anlayışı benimsendi; vatan, özgürlük ve hak temaları öne çıktı. İkinci dönemde ise sanat için sanat görüşü ağır bastı; bireysel duygular ve dil güzelliği ön plana geçti. Bu iki dönem arasındaki fark, yalnızca estetik değil aynı zamanda ideolojik bir ayrışmanın yansımasıdır.`,
    questions: [
      { question: 'Tanzimat fermanı hangi yılda ilan edilmiştir?', options: ['1826', '1839', '1856', '1876'], correctIndex: 1 },
      { question: 'İlk Türk romanı olarak kabul edilen eser hangisidir?', options: ['İntibah', 'Araba Sevdası', 'Taaşşuk-ı Talat ve Fitnat', 'Zehra'], correctIndex: 2 },
      { question: "Tanzimat'ın birinci döneminde benimsenen sanat anlayışı nedir?", options: ['Sanat için sanat', 'Toplum için sanat', 'Bireysel duygular', 'Saf şiir'], correctIndex: 1 },
      { question: '"Taaşşuk-ı Talat ve Fitnat"ı kim yazmıştır?', options: ['Namık Kemal', 'Recaizade Ekrem', 'Şemseddin Sami', 'Ahmet Mithat'], correctIndex: 2 },
    ],
  },

  sosyal: {
    id: 'sample-sos-01',
    moduleCode: 'sosyal',
    title: 'Sanayi Devrimi ve Toplumsal Dönüşüm',
    wordCount: 200,
    difficulty: 5,
    content: `18. yüzyılın sonlarında İngiltere'de başlayan Sanayi Devrimi, insanlık tarihinin en köklü dönüşümlerinden birini temsil eder. Buhar makinesinin bulunması ve fabrika üretim sisteminin yaygınlaşmasıyla birlikte ekonomik ve sosyal yapılar hızla değişti.

Köylerden şehirlere göç hızlandı; fabrikalar etrafında büyük kentler oluştu. İşçi sınıfı tarihte ilk kez ekonomik ve siyasi bir güç olarak sahneye çıktı. Kadın ve çocuk emeğinin sömürülmesi, ağır çalışma koşulları toplumsal huzursuzluklara zemin hazırladı.

Bu dönemde sendikal hareketler güç kazandı; işçi hakları için verilen mücadeleler bugünkü iş hukuku sisteminin temellerini attı. Eğitime erişimin genişlemesiyle okuryazarlık oranı yükseldi. Buharlı lokomotifler sayesinde ulaşım kolaylaştı, ticaret hızlandı ve küresel piyasalar şekillenmeye başladı.`,
    questions: [
      { question: 'Sanayi Devrimi nerede başlamıştır?', options: ['Fransa', 'Almanya', 'İngiltere', 'ABD'], correctIndex: 2 },
      { question: "Sanayi Devrimi'nin temel tetikleyicisi nedir?", options: ['Elektriğin keşfi', 'Buhar makinesinin bulunması', 'Matbaanın icadı', 'Deniz ticaretinin artması'], correctIndex: 1 },
      { question: 'Sanayi Devrimi sonucunda toplumda ortaya çıkan yeni sınıf hangisidir?', options: ['Feodal beyler', 'Rahipler', 'İşçi sınıfı', 'Tüccarlar'], correctIndex: 2 },
      { question: 'Sendikal hareketlerin güçlenmesi hangi alana katkı sağlamıştır?', options: ['Tarım hukuku', 'İş hukuku', 'Uluslararası ticaret', 'Dini özgürlükler'], correctIndex: 1 },
    ],
  },

  fen: {
    id: 'sample-fen-01',
    moduleCode: 'fen',
    title: 'Fotosentez: Yaşamın Enerjisi',
    wordCount: 190,
    difficulty: 5,
    content: `Fotosentez, yeşil bitkilerin güneş ışığını kullanarak karbondioksit ve suyu glikoza dönüştürdüğü biyokimyasal bir süreçtir. Bu tepkime kloroplastlarda, özellikle klorofil pigmenti aracılığıyla gerçekleşir.

Fotosentezin genel denklemi şu şekilde özetlenir: 6 CO₂ + 6 H₂O + ışık enerjisi → C₆H₁₂O₆ + 6 O₂. Yani bitkiler karbondioksitten organik madde (şeker) üretirken oksijen gazı açığa çıkar. Bu oksijen, atmosferdeki oksijen dengesinin korunmasında kritik bir rol oynar.

Fotosentez iki aşamada gerçekleşir: ışığa bağımlı tepkimeler ve Calvin döngüsü. Işığa bağımlı tepkimelerde güneş enerjisi kimyasal enerjiye (ATP ve NADPH) dönüştürülür. Calvin döngüsünde ise bu enerji, karbondioksitten glikoz sentezlemek için kullanılır.

İklim değişikliği bağlamında fotosentez büyük önem taşır. Ormanlar, her yıl milyonlarca ton karbondioksiti bağlayarak küresel ısınmayı yavaşlatır.`,
    questions: [
      { question: 'Fotosentez bitkide nerede gerçekleşir?', options: ['Mitokondri', 'Ribozom', 'Kloroplast', 'Çekirdek'], correctIndex: 2 },
      { question: 'Fotosentez sonucunda hangi gaz açığa çıkar?', options: ['Karbondioksit', 'Azot', 'Oksijen', 'Hidrojen'], correctIndex: 2 },
      { question: 'Fotosentezde ışık enerjisi hangi kimyasal bileşiklere dönüşür?', options: ['ADP ve NADP', 'ATP ve NADPH', 'Glikoz ve su', 'CO₂ ve O₂'], correctIndex: 1 },
      { question: 'Calvin döngüsünde ne üretilir?', options: ['Oksijen', 'ATP', 'Glikoz', 'Su'], correctIndex: 2 },
    ],
  },

  saglik: {
    id: 'sample-sag-01',
    moduleCode: 'saglik',
    title: 'Bağışıklık Sistemi ve Savunma Mekanizmaları',
    wordCount: 205,
    difficulty: 5,
    content: `Bağışıklık sistemi, vücudu hastalık yapıcı mikroorganizmalara karşı koruyan karmaşık bir savunma ağıdır. İki temel koldan oluşur: doğal bağışıklık ve edinsel bağışıklık.

Doğal bağışıklık, deri, mukoza ve fagositler gibi yapılardan oluşur. Bu mekanizmalar, tehditlere hızla yanıt verir ancak özgün değildir. Bir yabancı madde (antijen) vücuda girdiğinde nötrofiller ve makrofajlar devreye girerek onu yok etmeye çalışır.

Edinsel bağışıklık ise daha özgün ve kalıcıdır. B lenfositler, antijene özgü antikorlar üretir. T lenfositler ise enfekte hücreleri doğrudan ortadan kaldırır. Bu süreçte oluşan hafıza hücreleri, aynı antijene karşı ileri tarihte daha hızlı ve güçlü bir yanıt verilmesini sağlar. Aşılar tam olarak bu hafıza mekanizmasından yararlanır.

Bağışıklık sistemi düzenli egzersiz, yeterli uyku, dengeli beslenme ve düşük stres düzeyiyle desteklenebilir. Sigara ve aşırı alkol ise bağışıklık yanıtını zayıflatır.`,
    questions: [
      { question: 'Bağışıklık sisteminin kaç temel kolu vardır?', options: ['1', '2', '3', '4'], correctIndex: 1 },
      { question: 'Antijene özgü antikorları hangi hücreler üretir?', options: ['T lenfositler', 'Makrofajlar', 'B lenfositler', 'Nötrofiller'], correctIndex: 2 },
      { question: 'Aşılar hangi mekanizmayı kullanır?', options: ['Doğal bağışıklık', 'Fagositoz', 'Hafıza hücreleri', 'Mukoza engeli'], correctIndex: 2 },
      { question: 'Bağışıklığı zayıflatan faktörler arasında ne yer alır?', options: ['Düzenli egzersiz', 'Yeterli uyku', 'Sigara', 'Dengeli beslenme'], correctIndex: 2 },
    ],
  },
}

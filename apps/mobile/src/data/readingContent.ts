import type { SampleExercise } from './sampleContent'

export const READING_ARTICLES: SampleExercise[] = [
  {
    id: 'turkce-01',
    moduleCode: 'turkce',
    title: 'Paragrafta Yapı ve Anlam',
    wordCount: 162,
    difficulty: 5,
    content: `Bir paragraf, tek bir ana düşünce etrafında kurulmuş cümleler topluluğudur. Paragrafın ilk cümlesi çoğunlukla konuyu tanıtan giriş cümlesidir. Ortadaki cümleler bu ana düşünceyi destekler, açıklar ya da örneklendirir. Son cümle ise genellikle sonuç veya özet niteliği taşır.

Ana fikir, paragrafın tümünü kapsayan en genel düşüncedir. Konu ise paragrafın "ne hakkında olduğu"nu kısaca belirtir. Bu ikisini birbirinden ayırt etmek, sınav sorularında sıklıkla test edilir.

Destekleyici cümleler, ana fikri kanıtlamak için somut bilgi, örnek ya da karşılaştırma sunar. İyi yazılmış bir paragrafta her cümle birbirine mantıksal bağlarla bağlıdır. "Çünkü, bu nedenle, ancak, oysa" gibi bağlaçlar bu mantıksal ilişkiyi kurar.

LGS ve TYT sınavlarında paragraf soruları, öğrencinin metnin bütününü kavrayıp kavramadığını ölçer. Bu tür sorularda dikkatli okuma ve cümlelerin birbirini nasıl desteklediğini anlamak büyük önem taşır.`,
    questions: [
      {
        question: "Paragrafın ana fikri ile konusu arasındaki temel fark nedir?",
        options: [
          "Ana fikir daha kısadır, konu daha uzundur",
          "Konu paragrafın neyle ilgili olduğunu, ana fikir ise en genel düşünceyi verir",
          "İkisi aynı anlama gelir, aralarında fark yoktur",
          "Ana fikir yalnızca son cümlede yer alır"
        ],
        correctIndex: 1,
      },
      {
        question: "Destekleyici cümlelerin görevi nedir?",
        options: [
          "Paragrafın konusunu değiştirmek",
          "Yeni bir ana fikir ortaya koymak",
          "Ana fikri kanıtlamak, açıklamak veya örneklendirmek",
          "Paragrafı sonlandırmak"
        ],
        correctIndex: 2,
      },
      {
        question: "Bağlaçlar paragrafta ne işe yarar?",
        options: [
          "Cümleleri daha uzun yapar",
          "Cümleler arasındaki mantıksal ilişkiyi kurar",
          "Okumayı zorlaştırır",
          "Ana fikri gizler"
        ],
        correctIndex: 1,
      },
      {
        question: "LGS ve TYT sınavlarında paragraf soruları neyi ölçer?",
        options: [
          "Öğrencinin yazma hızını",
          "Öğrencinin kelime sayısını bilip bilmediğini",
          "Öğrencinin metnin bütününü kavrayıp kavramadığını",
          "Öğrencinin bağlaç sayısını"
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'turkce-02',
    moduleCode: 'turkce',
    title: 'Sözcükte Anlam: Eş, Zıt ve Mecaz Anlam',
    wordCount: 158,
    difficulty: 5,
    content: `Türkçede her sözcüğün birden fazla anlam boyutu bulunabilir. Gerçek anlam, sözcüğün sözlükte kayıtlı olan temel anlamıdır. Mecaz anlam ise sözcüğün benzetme ya da çağrışım yoluyla kazandığı yan anlamdır. "Taş kalpli" ifadesinde "taş" sözcüğü mecaz anlamda kullanılmıştır.

Eş anlamlı sözcükler, yazılış ve söylenişleri farklı olsa da aynı ya da yakın anlamı karşılayan kelimelerdir. "Güzel" ile "hoş", "hızlı" ile "çabuk" bunlara örnek verilebilir. Zıt anlamlı sözcükler ise anlam bakımından birbirinin karşıtı olan kelimelerdir; "açık-kapalı", "iyi-kötü" gibi.

Bağlam içinde anlam da sınavlarda sıkça çıkan konular arasındadır. Aynı sözcük farklı cümlelerde farklı anlam taşıyabilir. "Ağır" sözcüğü bir cümlede "fazla kilolu", başka bir cümlede "zor" anlamında kullanılabilir.

Bu farklı anlam katmanlarını kavramak, hem okuma anlayışını geliştirir hem de sınav sorularında doğru seçeneği bulmayı kolaylaştırır.`,
    questions: [
      {
        question: "\"Taş kalpli\" ifadesinde \"taş\" sözcüğü hangi anlamda kullanılmıştır?",
        options: [
          "Gerçek anlam",
          "Mecaz anlam",
          "Eş anlam",
          "Zıt anlam"
        ],
        correctIndex: 1,
      },
      {
        question: "Eş anlamlı sözcüklerin temel özelliği nedir?",
        options: [
          "Yazılışları aynıdır",
          "Zıt anlamlar taşırlar",
          "Farklı yazılıp söylenseler de aynı ya da yakın anlamı karşılarlar",
          "Her zaman mecaz anlam taşırlar"
        ],
        correctIndex: 2,
      },
      {
        question: "\"Açık-kapalı\" sözcükleri hangi anlam ilişkisine örnektir?",
        options: [
          "Eş anlamlılık",
          "Mecaz anlamlılık",
          "Zıt anlamlılık",
          "Gerçek anlamlılık"
        ],
        correctIndex: 2,
      },
      {
        question: "\"Ağır\" sözcüğünün farklı cümlelerde farklı anlam taşıması hangi kavramı açıklar?",
        options: [
          "Eş anlamlılık",
          "Bağlam içinde anlam",
          "Zıt anlamlılık",
          "Gerçek anlam"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'turkce-03',
    moduleCode: 'turkce',
    title: 'Cümle Türleri',
    wordCount: 160,
    difficulty: 5,
    content: `Türkçede cümleler yapılarına göre üçe ayrılır: basit cümle, bileşik cümle ve sıralı cümle.

Basit cümle, içinde yalnızca bir yargı barındıran cümledir. Tek bir özne ve tek bir yüklemden oluşur. "Öğrenciler sınıfta çalışıyor." cümlesi buna iyi bir örnektir.

Bileşik cümle, bir temel cümle ile ona bağlı bir ya da birden fazla yan cümleden oluşur. "Hava soğuk olduğu için dışarı çıkmadık." cümlesinde "dışarı çıkmadık" temel cümle, "hava soğuk olduğu için" ise yan cümledir.

Sıralı cümle ise birden fazla temel yargının noktalı virgül ya da virgülle ayrılarak yan yana sıralanmasından oluşur. "Güneş battı; karanlık çöktü; yıldızlar belirdi." cümlesi buna örnektir.

Cümle türlerini doğru biçimde tanımak, özellikle yazma ve anlatım bilgisi sorularında başarıyı doğrudan etkiler. LGS ve TYT sınavlarında cümle türleriyle ilgili sorular düzenli olarak yer almaktadır.`,
    questions: [
      {
        question: "\"Öğrenciler sınıfta çalışıyor.\" cümlesi hangi türdendir?",
        options: [
          "Bileşik cümle",
          "Sıralı cümle",
          "Basit cümle",
          "Eksiltili cümle"
        ],
        correctIndex: 2,
      },
      {
        question: "Bileşik cümleyi basit cümleden ayıran temel özellik nedir?",
        options: [
          "Daha uzun olması",
          "Temel cümleye bağlı en az bir yan cümle içermesi",
          "Yüklem içermemesi",
          "Birden fazla özne içermesi"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Güneş battı; karanlık çöktü; yıldızlar belirdi.\" cümlesi hangi türdendir?",
        options: [
          "Basit cümle",
          "Bileşik cümle",
          "Sıralı cümle",
          "Devrik cümle"
        ],
        correctIndex: 2,
      },
      {
        question: "Sıralı cümlede yargılar genellikle hangi işaret/bağlaçlarla ayrılır?",
        options: [
          "Nokta ve soru işareti",
          "Virgül ve noktalı virgül",
          "Tırnak işareti",
          "Ünlem işareti"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'turkce-04',
    moduleCode: 'turkce',
    title: 'Ses Bilgisi: Ünlü Uyumları ve Ünsüz Yumuşaması',
    wordCount: 155,
    difficulty: 6,
    content: `Türkçenin temel ses özelliklerinden biri ünlü uyumudur. Büyük ünlü uyumuna göre bir sözcükteki ünlüler ya hep kalın (a, ı, o, u) ya da hep ince (e, i, ö, ü) olmalıdır. "Kaplumbağa" sözcüğündeki tüm ünlüler kalındır ve bu kurala uymaktadır. Küçük ünlü uyumunda ise son hecedeki ünlüye göre ek alınır; düz ünlüden sonra düz, yuvarlak ünlüden sonra yuvarlak ek gelir.

Ünsüz yumuşaması ise sözcük sonundaki sert ünsüzlerin (ç, k, p, t) ünlüyle başlayan ek aldıklarında yumuşamasıdır. "Kitap" sözcüğü "kitabı" biçimini alır; burada "p" sesi "b"ye dönüşür.

Sınav sorularında bu kuralların istisnaları da sorulur. Tek heceli sözcükler ile yabancı kökenli sözcükler ünsüz yumuşamasına uğramayabilir. "Harp" sözcüğünde "p" yumuşamaz.

Bu kuralları kavramak, yazım yanlışlarını önler ve TYT Türkçe sorularında doğru biçim tercihini sağlar.`,
    questions: [
      {
        question: "Büyük ünlü uyumuna göre bir sözcükteki ünlüler nasıl olmalıdır?",
        options: [
          "Birbirinden farklı olmalıdır",
          "Ya hep kalın ya da hep ince olmalıdır",
          "Yalnızca kalın olmalıdır",
          "Yalnızca ince olmalıdır"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Kitap\" sözcüğünün \"kitabı\" biçimini alması hangi ses olayını gösterir?",
        options: [
          "Ünlü türemesi",
          "Ünsüz yumuşaması",
          "Ünlü daralması",
          "Ünsüz benzeşmesi"
        ],
        correctIndex: 1,
      },
      {
        question: "Ünsüz yumuşaması ne zaman gerçekleşir?",
        options: [
          "Her zaman gerçekleşir",
          "Sözcük sonundaki sert ünsüz ünlüyle başlayan ek aldığında",
          "Sözcük başına ek getirildiğinde",
          "Sözcük tek heceli olduğunda"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Harp\" sözcüğünde \"p\" sesi neden yumuşamaz?",
        options: [
          "Sözcük kalın ünlü içerdiği için",
          "Sözcük yabancı kökenli olduğu için",
          "Sözcük fiil olduğu için",
          "Sözcük çok heceli olduğu için"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'turkce-05',
    moduleCode: 'turkce',
    title: 'Anlatım Bozuklukları',
    wordCount: 163,
    difficulty: 6,
    content: `Anlatım bozukluğu, bir cümlede anlam karışıklığına, mantık hatasına ya da dil kurallarına aykırı kullanıma yol açan yanlışlıklar olarak tanımlanır. Bu bozukluklar yapı bakımından ya da anlam bakımından ortaya çıkabilir.

Yapı bakımından anlatım bozuklukları; eksik öge, gereksiz sözcük kullanımı, özne-yüklem uyumsuzluğu ve tamlama yanlışlıklarını kapsar. "Öğrenciler toplantıya katıldı ve konuşmalar yapıldı." cümlesinde özne belirsizliği vardır.

Anlam bakımından bozukluklar ise çelişkili ifadeler, anlam belirsizliği ve sözcüklerin yanlış anlamda kullanımı biçiminde görülür. "Herkes kendi fikirlerini birbirinden aldı." cümlesinde anlam çelişkisi bulunmaktadır.

TYT ve LGS sınavlarında anlatım bozukluğu soruları, verilen dört seçenek arasından hatalı ya da doğru cümleyi bulmayı gerektirir. Bu soruları çözebilmek için cümleyi dikkatle okuyup her ögenin görevini düşünmek gerekir.

Düzenli pratik yaparak anlatım bozukluklarını tanımak, sınavda yüksek puan almanın etkili yollarından biridir.`,
    questions: [
      {
        question: "Anlatım bozukluğu hangi tür yanlışlıkları kapsar?",
        options: [
          "Yalnızca yazım hatalarını",
          "Anlam karışıklığı, mantık hatası veya dil kurallarına aykırı kullanımları",
          "Yalnızca noktalama hatalarını",
          "Yalnızca sözcük seçimi hatalarını"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Öğrenciler toplantıya katıldı ve konuşmalar yapıldı.\" cümlesindeki bozukluk nedir?",
        options: [
          "Gereksiz sözcük kullanımı",
          "Anlam çelişkisi",
          "Özne belirsizliği",
          "Yüklem eksikliği"
        ],
        correctIndex: 2,
      },
      {
        question: "Anlam bakımından anlatım bozukluğuna hangi örnekler girer?",
        options: [
          "Eksik öge ve tamlama yanlışlıkları",
          "Çelişkili ifadeler, anlam belirsizliği ve sözcüklerin yanlış anlamda kullanımı",
          "Özne-yüklem uyumsuzluğu",
          "Gereksiz sözcük kullanımı"
        ],
        correctIndex: 1,
      },
      {
        question: "Sınavlarda anlatım bozukluğu sorularında ne yapılmalıdır?",
        options: [
          "En kısa cümle seçilmelidir",
          "Cümle dikkatle okunup her ögenin görevi düşünülmelidir",
          "Yalnızca yükleme bakılmalıdır",
          "Sözcük sayısı hesaplanmalıdır"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'turkce-06',
    moduleCode: 'turkce',
    title: 'Yazım Kuralları ve Noktalama',
    wordCount: 157,
    difficulty: 5,
    content: `Türkçede doğru yazım, iletişimi kolaylaştırır ve anlamı kesinleştirir. Türk Dil Kurumu tarafından belirlenen yazım kuralları, sözcüklerin bitişik mi ayrı mı yazılacağını, büyük harf kullanımını ve noktalama işaretlerinin yerini düzenler.

Büyük harf kuralına göre cümle başları, özel isimler ve unvanlar büyük harfle başlar. "Atatürk" ve "Türkiye" gibi özel isimler her zaman büyük harfle yazılır.

Birleşik sözcüklerin yazımı ise sıkça karıştırılan konular arasındadır. "Başbakan" bitişik yazılırken "el ele" ayrı yazılır. Bu konuda kararlı bir kural yoktur; sözcük sözlükte nasıl geçiyorsa öyle yazılır.

Noktalama işaretlerinden nokta, cümle sonuna; virgül, yan cümleleri ve sıralı ögeleri birbirinden ayırmaya; soru işareti ise soru cümlelerinin sonuna gelir.

Sınav sorularında en çok karıştırılan noktalama işareti kesme işaretidir. Özel isimlere getirilen ekler kesme işaretiyle ayrılır: "Ankara'ya", "Atatürk'ün" gibi.`,
    questions: [
      {
        question: "Türkçede büyük harf hangi durumlarda kullanılır?",
        options: [
          "Yalnızca cümle başlarında",
          "Cümle başları, özel isimler ve unvanlarda",
          "Yalnızca özel isimlerde",
          "Her sözcüğün başında"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Başbakan\" sözcüğünün doğru yazımı nedir?",
        options: [
          "Baş Bakan",
          "Baş-bakan",
          "Başbakan",
          "baş bakan"
        ],
        correctIndex: 2,
      },
      {
        question: "Kesme işareti ne zaman kullanılır?",
        options: [
          "Her sözcükten önce",
          "Özel isimlere getirilen ekleri ayırmak için",
          "Soru cümlelerinin sonunda",
          "Yalnızca alıntılarda"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Ankara'ya\" yazımında kesme işareti hangi görevi üstlenir?",
        options: [
          "Sözcüğü kısaltır",
          "Özel isim olan \"Ankara\" ile eki ayırır",
          "Cümleyi bitirir",
          "Vurguyu gösterir"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'turkce-07',
    moduleCode: 'turkce',
    title: 'Deyimler ve Atasözleri',
    wordCount: 161,
    difficulty: 5,
    content: `Deyimler, en az iki sözcükten oluşan ve kalıplaşmış bir anlam taşıyan söz gruplarıdır. Deyimlerdeki sözcükler gerçek anlamını yitirmiş, mecaz bir anlam kazanmıştır. "Göz kulak olmak" deyimi "dikkatli biçimde bakmak ve korumak" anlamına gelir; burada göz ve kulak sözcükleri gerçek anlamda kullanılmamaktadır.

Atasözleri ise uzun deneyimlerin ürünü olan, toplumun ortak yaşam bilgeliğini yansıtan kısa ve öz kalıp sözlerdir. Atasözlerinde genellikle bir öğüt ya da evrensel bir gerçek dile getirilir. "Damlaya damlaya göl olur." atasözü, küçük şeylerin birikmesiyle büyük sonuçlara ulaşılabileceğini anlatır.

Deyim ile atasözü arasındaki temel fark şudur: Deyimler tam bir yargı bildirmez, atasözleri ise tam bir yargı içerir ve bağımsız kullanılabilir.

Sınav sorularında öğrencilerden deyim ile atasözünü birbirinden ayırt etmeleri, verilen bir ifadenin hangi anlama geldiğini bulmaları beklenir. Bu konuda pratik yapmak, söz varlığını zenginleştirmenin de etkili bir yoludur.`,
    questions: [
      {
        question: "Deyimlerin temel özelliği nedir?",
        options: [
          "Her zaman tek sözcükten oluşurlar",
          "Kalıplaşmış ve mecaz anlam taşıyan söz gruplarıdır",
          "Tam bir yargı bildirirler",
          "Gerçek anlamda kullanılırlar"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Göz kulak olmak\" deyiminin anlamı nedir?",
        options: [
          "Hem görmek hem duymak",
          "Dikkatli biçimde bakmak ve korumak",
          "Meraklı olmak",
          "Gözetlemek"
        ],
        correctIndex: 1,
      },
      {
        question: "Deyim ile atasözü arasındaki temel fark nedir?",
        options: [
          "Deyimler daha uzundur",
          "Atasözleri daha eskidir",
          "Deyimler tam yargı bildirmez, atasözleri tam yargı içerir",
          "Atasözleri mecaz anlam taşımaz"
        ],
        correctIndex: 2,
      },
      {
        question: "\"Damlaya damlaya göl olur.\" atasözünün anlamı nedir?",
        options: [
          "Su önemli bir kaynaktır",
          "Küçük şeylerin birikmesiyle büyük sonuçlara ulaşılır",
          "Göller yağmurla dolar",
          "Sabırsız olmak gerekmez"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'turkce-08',
    moduleCode: 'turkce',
    title: 'Şiir Türleri: Lirik, Epik ve Didaktik',
    wordCount: 159,
    difficulty: 6,
    content: `Şiir, duygu ve düşüncelerin yoğun ve ahenkli bir biçimde dile getirildiği yazınsal türdür. Türk ve dünya edebiyatında şiirler, içeriklerine göre çeşitli türlere ayrılmaktadır.

Lirik şiir, aşk, özlem, hüzün gibi bireysel duyguları yoğun biçimde işler. Okuyucuda duygusal bir etki bırakmayı amaçlar. Ahmet Haşim'in şiirleri lirik şiire örnek gösterilebilir.

Epik şiir, savaş, kahramanlık ve destansı olayları anlatır. Okuyucuda yiğitlik ve coşku duygusu uyandırır. Köroğlu Destanı, Türk edebiyatındaki önemli epik örneklerden biridir.

Didaktik şiir ise bir öğreti ya da bilgi vermek amacıyla yazılır. Okuyucuya ahlaki, dini ya da felsefi bir ders aktarmayı hedefler. Yunus Emre'nin şiirleri didaktik özellikleriyle öne çıkar.

Sınavlarda şiir türünü belirlemek için şiirde işlenen tema ve duygu tonu dikkate alınmalıdır. Şiirin amacı ve okuyucuda yaratmak istediği etki, türü belirlemenin en güvenilir yoludur.`,
    questions: [
      {
        question: "Lirik şiirin temel özelliği nedir?",
        options: [
          "Savaş ve kahramanlık anlatır",
          "Bilgi ve öğüt verir",
          "Aşk, özlem, hüzün gibi bireysel duyguları işler",
          "Toplumsal olayları eleştirir"
        ],
        correctIndex: 2,
      },
      {
        question: "Epik şiirde hangi duygular ön plana çıkar?",
        options: [
          "Hüzün ve özlem",
          "Yiğitlik ve coşku",
          "Aşk ve sevinç",
          "Felsefi düşünceler"
        ],
        correctIndex: 1,
      },
      {
        question: "Didaktik şiirin amacı nedir?",
        options: [
          "Okuyucuyu eğlendirmek",
          "Destan anlatmak",
          "Ahlaki, dini ya da felsefi bir ders aktarmak",
          "Bireysel duyguları dile getirmek"
        ],
        correctIndex: 2,
      },
      {
        question: "Şiir türünü belirlemek için en güvenilir yöntem nedir?",
        options: [
          "Şiirin uyak düzenine bakmak",
          "Şiirin uzunluğuna bakmak",
          "Şiirde işlenen tema, duygu tonu ve okuyucuda yaratılan etkiyi değerlendirmek",
          "Şairin adını bilmek"
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'turkce-09',
    moduleCode: 'turkce',
    title: 'Roman ve Hikâye: Olay Örgüsü, Kişi ve Zaman',
    wordCount: 164,
    difficulty: 6,
    content: `Roman ve hikâye, anlatmaya dayalı yazınsal türlerin en önemlileridir. Her ikisinde de olay örgüsü, kişiler ve zaman unsurları temel yapı taşlarını oluşturur.

Olay örgüsü, eserdeki olayların belirli bir nedensellik çerçevesinde birbirine bağlanarak oluşturduğu zincirimsi yapıdır. Bu yapı genellikle serim, düğüm ve çözüm bölümlerinden oluşur.

Kişi unsuru, eserde yer alan karakterleri kapsar. Ana karakter, olayların merkezindeyken yan karakterler onu destekler ya da çatışmada karşısında durur. Karakterlerin psikolojik derinliği, eserin kalitesini belirleyen önemli etkenlerden biridir.

Zaman unsuru, olayların geçtiği dönem, günlük ve saatlik dilimler ile anlatının iç zamanını içerir. Romanlarda geriye dönüş (flashback) ve ileriye sıçrama (foreshadowing) teknikleri kullanılır.

Hikâye roman'dan daha kısa, tek bir olay çevresinde yoğunlaşır ve sınırlı sayıda kişi barındırır. Sınavlarda bu iki tür arasındaki farkı bilmek, soruları doğru yanıtlamak için zorunludur.`,
    questions: [
      {
        question: "Olay örgüsü hangi bölümlerden oluşur?",
        options: [
          "Başlangıç, orta ve son",
          "Serim, düğüm ve çözüm",
          "Giriş, gelişme ve sonuç",
          "Tanıtım, çatışma ve kapanış"
        ],
        correctIndex: 1,
      },
      {
        question: "Ana karakter ile yan karakter arasındaki fark nedir?",
        options: [
          "Ana karakter daha uzun tanıtılır",
          "Ana karakter olayların merkezindeyken yan karakterler destekleyici rol üstlenir",
          "Yan karakterler her zaman kötü adamdır",
          "Ana karakter her zaman kahraman olur"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Flashback\" tekniği ne anlama gelir?",
        options: [
          "Olayları hızlı anlatmak",
          "İleriye sıçramak",
          "Anlatıda geçmiş olaylara dönmek",
          "Karakteri detaylı tanıtmak"
        ],
        correctIndex: 2,
      },
      {
        question: "Hikâye ile roman arasındaki temel fark nedir?",
        options: [
          "Hikâye şiirsel, roman düz yazıdır",
          "Hikâye daha kısa ve tek olay odaklıdır, roman daha uzun ve kapsamlıdır",
          "Roman gerçek, hikâye kurgusaldır",
          "Hikâyelerde kahraman yoktur"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'turkce-10',
    moduleCode: 'turkce',
    title: 'Gazete Haberi ve Röportaj',
    wordCount: 160,
    difficulty: 5,
    content: `Gazete haberi, güncel olayları kısa ve yalın bir dille aktaran haber türüdür. Bir haberin temel unsurları şunlardır: ne, nerede, ne zaman, nasıl, neden ve kim. Bu altı soruya verilen yanıtlar, haberin tüm önemli bilgilerini kapsamalıdır.

Haberlerde dil tarafsız ve nesnel olmalıdır. Gazetecilik etiği gereği haber yazarı, kendi görüşünü habere katmamalıdır. Başlık dikkat çekici, ilk paragraf ise tüm önemli bilgileri içeren özet niteliğinde olmalıdır.

Röportaj ise bir kişiyle yapılan sorulu-yanıtlı konuşmanın yazıya aktarılmış halidir. Röportajlarda kişinin görüşleri, deneyimleri ve hayat hikâyesi aktarılır. Dil daha kişisel ve anlatısal olabilir.

Gazete haberi ile röportajı birbirinden ayırt etmek, Türkçe ve Edebiyat sınavlarında önemli bir konudur. Haberde bilgi aktarımı ön plandayken röportajda kişinin sesi ve bakış açısı öne çıkar.

Her iki türde de başlığa bakarak metnin içeriği hakkında ön fikir edinilebilir.`,
    questions: [
      {
        question: "Bir gazete haberinin temel unsurları nelerdir?",
        options: [
          "Başlık, giriş ve son paragraf",
          "Ne, nerede, ne zaman, nasıl, neden ve kim soruları",
          "Fotoğraf, altyazı ve metin",
          "Yazar adı, tarih ve sayfa numarası"
        ],
        correctIndex: 1,
      },
      {
        question: "Gazete haberinde dilin nasıl olması gerekir?",
        options: [
          "Duygusal ve öznel",
          "Tarafsız ve nesnel",
          "Şiirsel ve mecazlı",
          "Kişisel ve anlatısal"
        ],
        correctIndex: 1,
      },
      {
        question: "Röportajın temel özelliği nedir?",
        options: [
          "Bir olayı tarafsız aktarmak",
          "Sorulu-yanıtlı bir konuşmanın yazıya dökülmesidir",
          "Kısa ve öz bilgi vermek",
          "Toplumsal sorunları eleştirmek"
        ],
        correctIndex: 1,
      },
      {
        question: "Haber ile röportaj arasındaki temel fark nedir?",
        options: [
          "Haberde resim kullanılır, röportajda kullanılmaz",
          "Haberde bilgi aktarımı ön plandayken röportajda kişinin sesi öne çıkar",
          "Röportaj daha kısa olur",
          "Haber yalnızca siyasi konuları ele alır"
        ],
        correctIndex: 1,
      },
    ],
  },

  // ─────────────── İNGİLİZCE ───────────────
  {
    id: 'ingilizce-01',
    moduleCode: 'ingilizce',
    title: 'Modal Fiiller: Can, Must, Should, May',
    wordCount: 155,
    difficulty: 4,
    content: `Modal fiiller (modal verbs), İngilizce cümlelerde yardımcı fiil olarak kullanılan ve cümleye olasılık, zorunluluk, izin ya da öneri anlamı katan fiillerdir. "Can, must, should ve may" en sık kullanılan modal fiiller arasındadır.

"Can" yetenek ya da izin anlamı taşır. "She can speak three languages." cümlesi onun üç dil konuşabildiğini gösterir. İzin için ise "Can I sit here?" biçiminde kullanılır.

"Must" güçlü bir zorunluluk ifade eder. "You must wear a seatbelt." cümlesi emniyet kemeri takmanın zorunlu olduğunu belirtir. Aynı zamanda güçlü bir çıkarım yapmak için de kullanılır: "He must be tired."

"Should" öneri ve tavsiye içerir. "You should study every day." cümlesi her gün çalışmanın iyi bir fikir olduğunu önerir.

"May" olasılık ya da resmi izin anlamına gelir. "It may rain tomorrow." olasılığı ifade ederken "May I leave early?" resmi izin ister.

Bu modal fiillerin doğru kullanımı, LGS ve TYT İngilizce sınavlarında sıkça test edilir.`,
    questions: [
      {
        question: "\"She can speak three languages.\" cümlesinde \"can\" hangi anlamı taşır?",
        options: [
          "Zorunluluk",
          "Öneri",
          "Yetenek",
          "Olasılık"
        ],
        correctIndex: 2,
      },
      {
        question: "\"Must\" modal fiili hangi anlamları taşır?",
        options: [
          "Öneri ve tavsiye",
          "Güçlü zorunluluk ve güçlü çıkarım",
          "Yetenek ve izin",
          "Olasılık ve resmi izin"
        ],
        correctIndex: 1,
      },
      {
        question: "\"You should study every day.\" cümlesinde \"should\" ne anlamına gelir?",
        options: [
          "Her gün çalışmak zorunludur",
          "Her gün çalışmak tavsiye edilir",
          "Her gün çalışmak yasaktır",
          "Her gün çalışmak olasıdır"
        ],
        correctIndex: 1,
      },
      {
        question: "\"May I leave early?\" cümlesinde \"may\" ne işlev görür?",
        options: [
          "Olasılık belirtir",
          "Zorunluluk belirtir",
          "Resmi izin ister",
          "Öneri sunar"
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'ingilizce-02',
    moduleCode: 'ingilizce',
    title: 'Edilgen Çatı (Passive Voice)',
    wordCount: 157,
    difficulty: 5,
    content: `İngilizce'de edilgen çatı (passive voice), eylemin kim tarafından yapıldığından çok neyin yapıldığına odaklanmak için kullanılır. Cümlenin nesnesi özne konumuna geçer ve fiil "be + past participle" (geçmiş ortaç) yapısıyla oluşturulur.

Örneğin, "The teacher corrects the homework." (etken) cümlesi edilgen çatıda "The homework is corrected by the teacher." biçimini alır. Özne olan "the teacher" edilgen cümlede "by the teacher" ifadesiyle gösterilir.

Farklı zamanlarda edilgen yapı şöyle kurulur: Geniş zaman için "is/are + past participle", geçmiş zaman için "was/were + past participle", gelecek zaman için "will be + past participle" kullanılır.

Edilgen çatı özellikle haber metinlerinde, bilimsel yazılarda ve resmi belgelerde sıklıkla görülür. Örneğin: "The new bridge was opened last week."

LGS ve TYT sınavlarında etken cümleyi edilgene ya da edilgen cümleyi etkene dönüştürmek, sık karşılaşılan soru tiplerindendir. Fiilin üçüncü halini (past participle) doğru kullanmak bu dönüşümlerde kritik öneme sahiptir.`,
    questions: [
      {
        question: "Edilgen çatı hangi yapıyla oluşturulur?",
        options: [
          "Have + past participle",
          "Be + past participle",
          "Do + past participle",
          "Get + infinitive"
        ],
        correctIndex: 1,
      },
      {
        question: "\"The teacher corrects the homework.\" cümlesinin edilgen biçimi hangisidir?",
        options: [
          "The homework corrects the teacher.",
          "The teacher is corrected by the homework.",
          "The homework is corrected by the teacher.",
          "The homework was correct."
        ],
        correctIndex: 2,
      },
      {
        question: "Geçmiş zaman edilgen çatı hangi yapıyla kurulur?",
        options: [
          "Is/are + past participle",
          "Will be + past participle",
          "Was/were + past participle",
          "Has been + past participle"
        ],
        correctIndex: 2,
      },
      {
        question: "Edilgen çatı hangi tür metinlerde sıklıkla kullanılır?",
        options: [
          "Günlük diyaloglar ve şiirler",
          "Haber metinleri, bilimsel yazılar ve resmi belgeler",
          "Çocuk masalları ve romanlar",
          "Yalnızca akademik tezler"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'ingilizce-03',
    moduleCode: 'ingilizce',
    title: 'Koşul Cümleleri (Conditional Sentences)',
    wordCount: 162,
    difficulty: 5,
    content: `İngilizce'de koşul cümleleri (conditional sentences), bir koşul ile bu koşulun sonucunu bir arada ifade eden cümle yapılarıdır. "If" (eğer) bağlacıyla başlayan yan cümle koşulu, temel cümle ise sonucu bildirir.

Sıfır koşul (zero conditional) genel gerçekler için kullanılır. Her iki yan da geniş zamandadır: "If you heat ice, it melts."

Birinci koşul (first conditional) gerçekleşmesi mümkün olan gelecek durumlar için kullanılır. "If you study hard, you will pass the exam." cümlesinde koşul gerçekleşirse sonucun da gerçekleşeceği öngörülür.

İkinci koşul (second conditional) gerçek olmayan ya da olması çok zor olan durumları anlatır. "If I were rich, I would travel the world." Bu yapıda "if" yan cümlesinde past simple, temel cümlede "would + infinitive" kullanılır.

Üçüncü koşul (third conditional) ise geçmişte gerçekleşmemiş durumlar için pişmanlık ya da varsayım ifade eder. "If I had studied harder, I would have passed the test."

Sınavlarda koşul türleri arasındaki farkı bilmek ve doğru zaman kipini seçmek büyük önem taşır.`,
    questions: [
      {
        question: "Sıfır koşul cümleleri ne için kullanılır?",
        options: [
          "Gerçekleşmemiş geçmiş durumlar için",
          "Genel gerçekler için",
          "Olası gelecek durumlar için",
          "Hayal kurmak için"
        ],
        correctIndex: 1,
      },
      {
        question: "\"If you study hard, you will pass the exam.\" hangi koşul türüdür?",
        options: [
          "Sıfır koşul",
          "Birinci koşul",
          "İkinci koşul",
          "Üçüncü koşul"
        ],
        correctIndex: 1,
      },
      {
        question: "İkinci koşul cümlesinde \"if\" yan cümlesinde hangi zaman kullanılır?",
        options: [
          "Present simple",
          "Future simple",
          "Past simple",
          "Present perfect"
        ],
        correctIndex: 2,
      },
      {
        question: "Üçüncü koşul cümleleri hangi durumları ifade eder?",
        options: [
          "Olası gelecek durumları",
          "Genel gerçekleri",
          "Geçmişte gerçekleşmemiş durumları",
          "Şimdiki zamanı"
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'ingilizce-04',
    moduleCode: 'ingilizce',
    title: 'Sıfat Cümleleri (Relative Clauses)',
    wordCount: 158,
    difficulty: 5,
    content: `Sıfat cümleleri (relative clauses), bir ismi ya da zamir ifadesini niteleyen yan cümlelerdir. Bu cümleler "who, which, that, whose, where ve when" gibi ilgi zamiriyle başlar.

"Who" insanlar için, "which" nesneler ve hayvanlar için, "that" ise her ikisi için kullanılabilir. "The boy who sits next to me is my friend." cümlesinde "who sits next to me" bölümü "the boy"u niteler.

Tanımlayıcı sıfat cümleleri (defining relative clauses), cümleye zorunlu bilgi ekler. Bu cümleler virgülle ayrılmaz. Örneğin: "The book that I read was interesting."

Tanımlamayan sıfat cümleleri (non-defining relative clauses) ise ekstra bilgi verir ve virgülle ayrılır. Örneğin: "My sister, who lives in Ankara, is a doctor." Bu yapıda "that" kullanılmaz.

"Whose" iyelik belirtir: "The student whose bag is red is absent today."

LGS ve TYT sınavlarında bu yapı, hem gramer soruları hem de okuma anlayışı testlerinde sıkça karşılaşılan konular arasındadır. Doğru ilgi zamirini seçmek ve virgül kullanımına dikkat etmek başarıyı artırır.`,
    questions: [
      {
        question: "\"The boy who sits next to me is my friend.\" cümlesinde \"who\" neyi niteliyor?",
        options: [
          "Arkadaşı",
          "\"The boy\"u",
          "Konuşmacıyı",
          "Oturma eylemini"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Which\" ilgi zamiri ne için kullanılır?",
        options: [
          "Yalnızca insanlar için",
          "Yalnızca yerler için",
          "Nesneler ve hayvanlar için",
          "Zaman bildirmek için"
        ],
        correctIndex: 2,
      },
      {
        question: "Tanımlamayan sıfat cümleleri (non-defining) nasıl ayrılır?",
        options: [
          "Noktalı virgülle",
          "Virgülle",
          "Tire ile",
          "Ayraçla"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Whose\" ilgi zamiri ne işlev görür?",
        options: [
          "Yer bildirir",
          "Zaman bildirir",
          "İyelik belirtir",
          "Eylem belirtir"
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'ingilizce-05',
    moduleCode: 'ingilizce',
    title: 'Present Perfect Tense',
    wordCount: 160,
    difficulty: 4,
    content: `Present Perfect Tense (geniş geçmiş zaman), geçmişte başlayan ya da tamamlanan ancak şimdiki zamanla bağlantısı olan eylemleri ifade etmek için kullanılır. Bu zaman "have/has + past participle" yapısıyla kurulur.

Örneğin: "I have visited Istanbul three times." cümlesi, konuşmacının İstanbul'u kaç kez ziyaret ettiğini, bu ziyaretin ne zaman olduğundan bağımsız olarak aktarır.

Present Perfect çeşitli bağlamlarda kullanılır. "Already, yet, just, ever, never, since ve for" gibi zaman zarfları bu yapıyla sıklıkla kullanılır. "She has just arrived." (az önce geldi), "Have you ever eaten sushi?" (hiç yedim mi?) gibi.

"Since" belirli bir başlangıç noktası için, "for" ise süre belirtmek için kullanılır: "I have lived here since 2020." ve "I have lived here for five years."

Bu zaman dilimi, Simple Past ile sıkça karıştırılır. Temel fark şudur: Simple Past belirli bir geçmiş zaman dilimine atıfta bulunurken Present Perfect bugünle bağlantısı olan bir geçmiş durumu anlatır.

LGS ve TYT sınavlarında bu iki zamanın farkı düzenli olarak sorulmaktadır.`,
    questions: [
      {
        question: "Present Perfect Tense hangi yapıyla oluşturulur?",
        options: [
          "Did + past participle",
          "Have/has + past participle",
          "Was/were + past participle",
          "Will + base form"
        ],
        correctIndex: 1,
      },
      {
        question: "\"She has just arrived.\" cümlesindeki \"just\" ne anlama gelir?",
        options: [
          "Henüz gelmedi",
          "Az önce geldi",
          "Yakında gelecek",
          "Yarın geldi"
        ],
        correctIndex: 1,
      },
      {
        question: "\"Since\" ve \"for\" kelimeleri arasındaki fark nedir?",
        options: [
          "\"Since\" süre, \"for\" başlangıç noktası belirtir",
          "\"Since\" başlangıç noktası, \"for\" süre belirtir",
          "İkisi de aynı anlamda kullanılır",
          "\"Since\" gelecek, \"for\" geçmiş belirtir"
        ],
        correctIndex: 1,
      },
      {
        question: "Present Perfect ile Simple Past arasındaki temel fark nedir?",
        options: [
          "Simple Past daha eski olaylar için kullanılır",
          "Present Perfect daha uzun bir süreyi anlatır",
          "Simple Past belirli geçmiş zamana, Present Perfect bugünle bağlantılı geçmişe atıfta bulunur",
          "İkisi arasında fark yoktur"
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'ingilizce-06',
    moduleCode: 'ingilizce',
    title: 'Dolaylı Anlatım (Reported Speech)',
    wordCount: 156,
    difficulty: 5,
    content: `Dolaylı anlatım (reported speech), bir kişinin söylediklerini doğrudan aktarmak yerine başkasına bildirirken kullanılan dilbilgisi yapısıdır. Bu yapıda cümle, genellikle "said that, told him/her that, asked if" gibi giriş ifadeleriyle başlar.

Fiil zamanları bir adım geriye kayar: Geniş zaman (present simple) geçmiş zamana (past simple) dönüşür. "I am tired." cümlesi dolaylı anlatımda "She said that she was tired." biçimini alır.

Soru cümlelerinde "said" yerine "asked" kullanılır. Evet-hayır soruları "asked if/whether" ile, soru sözcüklü sorular ise söz konusu soru kelimesiyle aktarılır: "Where do you live?" → "She asked where I lived."

Emir cümlelerinde ise "told + kişi + to infinitive" yapısı kullanılır: "Open the window." → "He told me to open the window."

Zaman ve yer belirteçleri de değişir: "now" yerine "then", "here" yerine "there", "today" yerine "that day" kullanılır.

Bu yapı LGS ve TYT sınavlarında hem dilbilgisi hem de okuma anlayışı sorularında karşımıza çıkmaktadır.`,
    questions: [
      {
        question: "\"I am tired.\" cümlesinin dolaylı anlatım biçimi hangisidir?",
        options: [
          "She said that she is tired.",
          "She said that she was tired.",
          "She told that she is tired.",
          "She asked if she was tired."
        ],
        correctIndex: 1,
      },
      {
        question: "Evet-hayır sorularını dolaylı anlatıma dönüştürürken ne kullanılır?",
        options: [
          "Said that",
          "Told to",
          "Asked if/whether",
          "Wanted that"
        ],
        correctIndex: 2,
      },
      {
        question: "\"Open the window.\" emrinin dolaylı anlatım biçimi hangisidir?",
        options: [
          "He said to open the window.",
          "He asked if I opened the window.",
          "He told me to open the window.",
          "He told that open the window."
        ],
        correctIndex: 2,
      },
      {
        question: "Dolaylı anlatımda \"now\" kelimesi hangi kelimeyle değiştirilir?",
        options: [
          "Here",
          "Then",
          "That day",
          "Today"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'ingilizce-07',
    moduleCode: 'ingilizce',
    title: 'Çevre (The Environment)',
    wordCount: 163,
    difficulty: 4,
    content: `Çevre sorunları günümüzde hem bireysel hem de küresel düzeyde büyük önem taşımaktadır. İklim değişikliği (climate change), hava kirliliği (air pollution), su kirliliği (water pollution) ve orman kesimi (deforestation) bu sorunların başında gelmektedir.

İklim değişikliği, sera gazlarının atmosferde birikmesiyle oluşur. Karbondioksit (CO₂), metan ve su buharı en önemli sera gazlarıdır. Fosil yakıtların yakılması ve sanayi faaliyetleri bu gazların salınımını artırır.

Orman kesimi biyoçeşitlilik kaybına ve karbon depolanmasının azalmasına yol açar. Dünya nüfusunun artmasıyla birlikte tarım alanı açmak için her yıl milyonlarca hektar orman yok edilmektedir.

Bireyler de çevre koruma sürecine katkıda bulunabilir. Geri dönüşüm yapmak, enerji tasarrufu sağlamak, toplu taşıma kullanmak ve tek kullanımlık plastiklerden kaçınmak bu adımların en bilinenleridir.

Sürdürülebilir kalkınma (sustainable development), hem ekonomik büyümeyi hem de çevre korumayı bir arada hedefleyen bir yaklaşımdır. Gelecek nesillere yaşanabilir bir dünya bırakmak ortak sorumluluğumuzdur.`,
    questions: [
      {
        question: "İklim değişikliğinin temel nedeni nedir?",
        options: [
          "Okyanus sıcaklıklarının artması",
          "Sera gazlarının atmosferde birikmesi",
          "Güneş aktivitesinin artması",
          "Ormanların genişlemesi"
        ],
        correctIndex: 1,
      },
      {
        question: "Orman kesimi hangi sonuçlara yol açar?",
        options: [
          "Hava kirliliğini azaltır",
          "Biyoçeşitlilik kaybı ve karbon depolanmasının azalması",
          "Su kirliliğini önler",
          "İklim değişikliğini durdurur"
        ],
        correctIndex: 1,
      },
      {
        question: "Bireylerin çevre korumaya katkısı olarak hangi davranış verilmemiştir?",
        options: [
          "Geri dönüşüm yapmak",
          "Toplu taşıma kullanmak",
          "Tek kullanımlık plastikten kaçınmak",
          "Daha fazla araba üretmek"
        ],
        correctIndex: 3,
      },
      {
        question: "Sürdürülebilir kalkınma ne anlama gelir?",
        options: [
          "Yalnızca ekonomik büyümeyi hedeflemek",
          "Yalnızca çevre korumayı hedeflemek",
          "Hem ekonomik büyümeyi hem de çevre korumayı bir arada hedeflemek",
          "Sanayiyi durdurmak"
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'ingilizce-08',
    moduleCode: 'ingilizce',
    title: 'Günlük Yaşamda Teknoloji (Technology in Daily Life)',
    wordCount: 161,
    difficulty: 4,
    content: `Teknoloji günümüzde hayatın her alanına girmiş, bireylerin yaşam biçimlerini köklü biçimde değiştirmiştir. Akıllı telefonlar (smartphones), tabletler ve giyilebilir teknolojiler (wearable technologies) artık gündelik yaşamın vazgeçilmez parçaları haline gelmiştir.

İnternet, bilgiye erişimi kolaylaştırmış ve iletişim alışkanlıklarını dönüştürmüştür. Sosyal medya platformları insanları dünyanın dört bir yanındaki bireylerle anlık olarak bağlamaktadır. Uzaktan çalışma (remote work) ve çevrimiçi eğitim (online education) gibi kavramlar pandemi süreciyle birlikte yaygınlaşmıştır.

Yapay zekâ (artificial intelligence) ve makine öğrenmesi (machine learning) ise teknolojinin en hızlı gelişen alanları arasındadır. Sağlık, ulaşım, finans ve eğitim sektörleri bu teknolojilerden yoğun biçimde yararlanmaktadır.

Ancak teknolojinin olumsuz etkileri de göz ardı edilmemelidir. Ekran bağımlılığı (screen addiction), mahremiyet sorunları (privacy issues) ve siber zorbalık (cyberbullying) modern dünyanın ciddi sorunları arasında yer almaktadır.

Teknolojiyi bilinçli ve dengeli kullanmak; bireylerin hem üretkenliklerini artırmasını hem de sağlıklarını korumasını sağlar.`,
    questions: [
      {
        question: "Metne göre teknoloji günlük yaşamı nasıl etkilemiştir?",
        options: [
          "Yalnızca iş hayatını değiştirmiştir",
          "Hayatın her alanına girerek yaşam biçimlerini köklü biçimde değiştirmiştir",
          "Yalnızca iletişimi etkilemiştir",
          "Olumsuz etkiler dışında bir etkisi olmamıştır"
        ],
        correctIndex: 1,
      },
      {
        question: "Pandemi süreciyle birlikte hangi kavramlar yaygınlaşmıştır?",
        options: [
          "Yapay zekâ ve robotik",
          "Sosyal medya ve internet",
          "Uzaktan çalışma ve çevrimiçi eğitim",
          "Giyilebilir teknoloji ve akıllı ev sistemleri"
        ],
        correctIndex: 2,
      },
      {
        question: "\"Screen addiction\" Türkçe'de ne anlama gelir?",
        options: [
          "Ekran kalitesi",
          "Ekran bağımlılığı",
          "Ekran parlaklığı",
          "Ekran boyutu"
        ],
        correctIndex: 1,
      },
      {
        question: "Metne göre teknolojiyi nasıl kullanmak gereklidir?",
        options: [
          "Olabildiğince çok kullanmak",
          "Hiç kullanmamak",
          "Bilinçli ve dengeli kullanmak",
          "Yalnızca iş amaçlı kullanmak"
        ],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'ingilizce-09',
    moduleCode: 'ingilizce',
    title: 'Sağlık ve Yaşam Tarzı (Health and Lifestyle)',
    wordCount: 164,
    difficulty: 4,
    content: `Sağlıklı bir yaşam sürmek, hem fiziksel hem de zihinsel refahın temelini oluşturur. Dengeli beslenme (balanced diet), düzenli egzersiz (regular exercise), yeterli uyku (sufficient sleep) ve stresin yönetimi sağlıklı yaşamın dört ana bileşenidir.

Dengeli bir beslenme düzeni; protein, karbonhidrat, yağ, vitamin ve minerallerin yeterli miktarda alınmasını gerektirir. İşlenmiş gıdalar (processed foods) ve şekerli içecekler uzun vadede obezite, diyabet ve kalp hastalıklarına zemin hazırlayabilir.

Düzenli fiziksel aktivite, kardiyovasküler sağlığı güçlendirir, kemikleri sağlamlaştırır ve ruh halini olumlu etkiler. Dünya Sağlık Örgütü, yetişkinlere haftada en az 150 dakika orta şiddette egzersiz önermektedir.

Uyku, vücudun onarım ve yenilenme sürecidir. Yetişkinlerin günde yedi ile dokuz saat uyuması gerektiği bilinmektedir. Yetersiz uyku bağışıklık sistemini zayıflatır ve dikkat süresini kısaltır.

Zihinsel sağlık da ihmal edilmemelidir. Meditasyon (meditation), hobiler ve sosyal bağlar stresin azaltılmasına katkı sağlar. Sağlıklı bir yaşam tarzı benimsemek, uzun ve kaliteli bir yaşamın anahtarıdır.`,
    questions: [
      {
        question: "Sağlıklı yaşamın dört ana bileşeni hangileridir?",
        options: [
          "Egzersiz, uyku, hobiler ve meditasyon",
          "Dengeli beslenme, düzenli egzersiz, yeterli uyku ve stresin yönetimi",
          "Su içmek, vitamin almak, spor yapmak ve erken uyumak",
          "Diyet, yürüyüş, kitap okumak ve sosyalleşmek"
        ],
        correctIndex: 1,
      },
      {
        question: "İşlenmiş gıdaların uzun vadede hangi hastalıklara zemin hazırlayabileceği belirtilmiştir?",
        options: [
          "Kemik erimesi ve anemi",
          "Obezite, diyabet ve kalp hastalıkları",
          "Cilt hastalıkları ve alerji",
          "Görme bozuklukları ve migren"
        ],
        correctIndex: 1,
      },
      {
        question: "Dünya Sağlık Örgütü yetişkinlere haftada kaç dakika egzersiz önermektedir?",
        options: [
          "En az 60 dakika",
          "En az 100 dakika",
          "En az 150 dakika",
          "En az 200 dakika"
        ],
        correctIndex: 2,
      },
      {
        question: "Zihinsel sağlığı desteklemek için metinde hangi yöntemler önerilmektedir?",
        options: [
          "Daha fazla uyku ve egzersiz",
          "Meditasyon, hobiler ve sosyal bağlar",
          "Vitamin takviyeleri ve ilaçlar",
          "Diyet ve su içmek"
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'ingilizce-10',
    moduleCode: 'ingilizce',
    title: 'Dünyada Eğitim Sistemleri (Education Systems Around the World)',
    wordCount: 166,
    difficulty: 5,
    content: `Dünya genelinde eğitim sistemleri büyük farklılıklar göstermektedir. Finlandiya, eğitim alanında uzun yıllardır en başarılı ülkeler arasında gösterilmektedir. Finlandiya modelinde rekabet yerine iş birliği, standart testler yerine bireysel değerlendirme ön plana çıkmaktadır. Öğretmenlik en saygın meslekler arasında yer alır ve öğretmen adayları yüksek akademik standartları karşılamak zorundadır.

Japonya ise disiplin, çalışkanlık ve grup dayanışmasını vurgulayan bir eğitim kültürüne sahiptir. Japon öğrenciler okullarını temizlemekte, bu uygulama sorumluluk bilincini pekiştirmektedir.

Amerika Birleşik Devletleri'nde ise eğitim sistemi eyaletten eyalete değişmektedir. Eleştirel düşünme (critical thinking), yaratıcılık ve bireysellik ön plana çıkarılmaktadır.

Türkiye'de eğitim sistemi son yıllarda köklü değişiklikler geçirmiştir. LGS ve YKS gibi ulusal sınavlar, öğrencilerin ortaöğretim ve yükseköğretim kurumlarına geçişini belirlemektedir.

Tüm bu sistemlerin ortak amacı, bireyleri topluma ve iş dünyasına hazırlamak, merak duygusunu ve öğrenme isteğini canlı tutmaktır. Küresel düzeyde en başarılı sistemler öğrenci merkezli yaklaşımı benimseyen sistemlerdir.`,
    questions: [
      {
        question: "Finlandiya eğitim modelinde hangi yaklaşım ön plana çıkmaktadır?",
        options: [
          "Rekabet ve standart testler",
          "İş birliği ve bireysel değerlendirme",
          "Disiplin ve grup çalışması",
          "Eleştirel düşünme ve yaratıcılık"
        ],
        correctIndex: 1,
      },
      {
        question: "Japon eğitim kültüründe öğrencilerin okullarını temizlemesinin amacı nedir?",
        options: [
          "Temizlik alışkanlığı kazandırmak",
          "Okul bütçesini düşürmek",
          "Sorumluluk bilincini pekiştirmek",
          "Disiplin uygulamak"
        ],
        correctIndex: 2,
      },
      {
        question: "Türkiye'de LGS ve YKS sınavları ne amaçla kullanılmaktadır?",
        options: [
          "Öğretmen istihdamı için",
          "Öğrencilerin ortaöğretim ve yükseköğretim kurumlarına geçişini belirlemek için",
          "Okul fonlaması için",
          "Müfredat değerlendirmesi için"
        ],
        correctIndex: 1,
      },
      {
        question: "Metne göre küresel düzeyde en başarılı eğitim sistemleri hangi yaklaşımı benimsemiştir?",
        options: [
          "Öğretmen merkezli yaklaşım",
          "Sınav odaklı yaklaşım",
          "Öğrenci merkezli yaklaşım",
          "Rekabetçi yaklaşım"
        ],
        correctIndex: 2,
      },
    ],
  },
]

// Konu → makale listesi haritası (turkce+ingilizce)
export const ARTICLES_BY_SUBJECT: Record<string, SampleExercise[]> = {}
for (const article of READING_ARTICLES) {
  if (!ARTICLES_BY_SUBJECT[article.moduleCode]) {
    ARTICLES_BY_SUBJECT[article.moduleCode] = []
  }
  ARTICLES_BY_SUBJECT[article.moduleCode].push(article)
}

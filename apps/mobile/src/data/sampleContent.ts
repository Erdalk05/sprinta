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
        question: '"Sakkad" nedir?',
        options: ['Gözün durma anı', 'Gözün sıçrama hareketi', 'Beyin dalgası', 'Okuma hızı birimi'],
        correctIndex: 1,
      },
      {
        question: 'Hızlı okuyucular nasıl daha fazla kelime kavrar?',
        options: ['Daha hızlı sakkad yaparak', 'Daha az fiksasyon yaparak', 'Gözlerini hızlı hareket ettirerek', 'Daha az uyuyarak'],
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
}

// packages/shared/src/legal/kvkk.ts
// 6698 sayılı KVKK kapsamında aydınlatma ve rıza metinleri

export const KVKK_AYDINLATMA_METNI = `
SPRINTA KİŞİSEL VERİ AYDINLATMA METNİ

Veri Sorumlusu: [Şirket Adı] (bundan böyle "Sprinta" olarak anılacaktır)

1. İŞLENEN KİŞİSEL VERİLER
Sprinta tarafından aşağıdaki kişisel verileriniz işlenmektedir:
• Ad, soyad ve e-posta adresi
• Eğitim bilgileri (okul, sınıf, hedef sınav)
• Performans verileri (okuma hızı, anlama oranı, egzersiz geçmişi)
• Uygulama kullanım verileri

2. KİŞİSEL VERİLERİN İŞLENME AMAÇLARI
• Kullanıcı hesabı oluşturma ve yönetimi
• Kişiselleştirilmiş eğitim deneyimi sunma
• Performans analizi ve raporlama
• Yasal yükümlülüklerin yerine getirilmesi

3. KİŞİSEL VERİLERİN AKTARILMASI
Verileriniz; hizmet alınan teknoloji altyapısı sağlayıcılarına (Supabase/AWS - ABD)
aktarılmaktadır. Bu aktarım, KVKK'nın 9. maddesi kapsamında yeterli koruma tedbirleri
alınarak gerçekleştirilmektedir.

4. VERİ SAKLAMA SÜRESİ
Kişisel verileriniz, hesap aktif olduğu sürece ve hesap kapatıldıktan 3 yıl sonrasına
kadar saklanmaktadır. Performans verileri anonimleştirilerek daha uzun süre tutulabilir.

5. HAKLARINIZ (KVKK m.11)
• Verilerinize erişim hakkı
• Düzeltme talep hakkı
• Silme/yok etme talep hakkı
• İşlemeye itiraz hakkı
• Veri taşınabilirliği hakkı

İletişim: kvkk@sprinta.app
`.trim();

export const RIZA_METNI_B2C = `
Sprinta Kişisel Veri Aydınlatma Metni'ni okudum ve anladım.
Kişisel verilerimin yukarıda belirtilen amaçlarla işlenmesine açık rızamı veriyorum.
`.trim();

export const RIZA_METNI_VELI = `
13 yaşın altındaki çocuğum/velayetindeki kişi için Sprinta'ya kayıt yaptırmaktayım.
Çocuğumun kişisel verilerinin Aydınlatma Metni'nde belirtilen amaçlarla işlenmesine
veli sıfatıyla açık rızamı veriyorum.
`.trim();

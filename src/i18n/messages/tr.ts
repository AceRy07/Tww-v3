import type { Dictionary } from "@/i18n/types";

export const tr: Dictionary = {
  nav: {
    brand: "The West Wing",
    catalog: "Katalog",
    contact: "Iletisim",
    viewCollection: "Koleksiyonu Gor",
    themeToggle: "Temayi degistir",
    languageToggle: "Dili degistir",
    english: "Ingilizce",
    turkish: "Turkce",
    openMenu: "Menuyu ac",
  },
  footer: {
    description:
      "12mm kompakt laminattan uretilen modern mobilyalar, uzun omurlu estetik ve gunluk dayaniklilik icin tasarlandi.",
    rights: "Tum haklari saklidir.",
    crafted: "Turkiye'de el isciligiyle uretildi",
  },
  inquiry: {
    sentTitle: "Talep Gonderildi!",
    sentBody: "Isteginizi aldik:",
    sendAnother: "Yeni bir talep gonder",
    labels: {
      name: "Ad Soyad",
      email: "E-posta Adresi",
      dimensions: "Istenen Olculer",
      optional: "opsiyonel",
      message: "Mesaj",
    },
    placeholders: {
      name: "Ayse Yilmaz",
      email: "ayse@example.com",
      dimensions: "ornek: 180x80x75 cm",
      message: "Projeniz, mekaniniz veya ihtiyaciniz olan ozellestirmeler hakkinda bilgi verin.",
    },
    actions: {
      sending: "Gonderiliyor...",
      send: "Talep Gonder",
    },
    errors: {
      nameShort: "Ad en az 2 karakter olmalidir",
      invalidEmail: "Lutfen gecerli bir e-posta adresi girin",
      messageShort: "Mesaj en az 10 karakter olmalidir",
      failed: "Talep gonderilemedi",
      unknown: "Bir seyler ters gitti",
    },
  },
};

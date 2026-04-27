// Next.js 16'da middleware adlandirmasi deprecated oldugu icin mevcut guvenlik mantigini proxy dosyasindan tekrar kullaniyoruz.
// Bu dosya, middleware.ts bekleyen ortamlarda ayni Clerk korumasinin devreye girmesi icin bir bridge gorevi gorur.
export { default, config } from './proxy';

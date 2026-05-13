# Bir Mühendisin Günlüğü (BMG) 🛠️📖

Mühendislerin teknik notlarını, projelerini ve günlük rutinlerini takip edebileceği, modern teknolojilerle donatılmış bir mühendislik ajandası ve dashboard platformu.

> [!WARNING]
> **Proje Durumu:** Bu proje şu anda aktif geliştirme aşamasındadır (Work in Progress). Henüz tamamlanmamıştır ve yeni özellikler eklenmeye devam edilmektedir.

## ✨ Özellikler

- **Modern Dashboard:** Kişisel projelerin ve görevlerin genel bakışı.
- **Teknik Notlar:** Mühendislik odaklı not tutma ve kategori yönetimi.
- **Proje Yönetimi:** Devam eden projelerin takibi ve görev (task) listeleri.
- **Blog Yönetimi:** Teknik yazıların paylaşılabileceği entegre blog sistemi.
- **Güvenli Kimlik Doğrulama:** JWT tabanlı, Role-based erişim kontrolü (Login/Register).
- **Bulut Veritabanı:** Neon Serverless PostgreSQL entegrasyonu ile her yerden erişim.

## 🚀 Teknoloji Yığını

### Backend
- **Framework:** .NET 8 (ASP.NET Core Web API)
- **Mimari:** Clean Architecture (Core, Infrastructure, Persistence, Presentation)
- **Veritabanı:** PostgreSQL (Neon.tech Cloud)
- **ORM:** Entity Framework Core
- **Cache:** Redis
- **MediatR:** CQRS pattern uygulaması

### Frontend
- **Framework:** Next.js 15+ (App Router)
- **Dil:** TypeScript
- **Styling:** TailwindCSS
- **Animasyon:** Framer Motion
- **Icon Set:** Lucide React
- **UI Components:** Shadcn/ui & Radix UI

## 🛠️ Kurulum

### Ön Gereksinimler
- Docker Desktop
- .NET 8 SDK
- Node.js (v18+)

### Docker ile Çalıştırma (Önerilen)
Tüm altyapıyı (API + Redis) tek komutla ayağa kaldırabilirsiniz:

```bash
docker-compose up -d --build
```
*API adresi:* `http://localhost:5000`  
*Swagger:* `http://localhost:5000/swagger`

### Frontend'i Çalıştırma
```bash
cd frontend
npm install
npm run dev
```
*Frontend adresi:* `http://localhost:3000`

## 📅 Yol Haritası (Yapılacaklar)
- [x] Temel Dashboard yapısı
- [x] JWT Auth Sistemi
- [x] Neon Cloud DB entegrasyonu
- [ ] Teknik Notlar modülü detaylandırılması
- [ ] Blog sayfasının yayına alınması
- [ ] Proje istatistikleri ve grafikler
- [ ] Dark/Light mode iyileştirmeleri

---
*Bu proje bir mühendisin gelişim serüvenini dijitalleştirmek amacıyla geliştirilmektedir.*

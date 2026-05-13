# Bir Mühendisin Günlüğü (BMG) - Teknik Dökümantasyon 📚

Bu döküman, **Bir Mühendisin Günlüğü** projesinin mimarisini, veritabanı yapısını, backend ve frontend işleyişini detaylı bir şekilde açıklar.

---

## 1. Proje Genel Bakış
BMG, mühendislerin teknik bilgilerini, günlüklerini ve projelerini tek bir merkezden yönetebilmeleri için tasarlanmış bir platformdur. Clean Architecture prensipleriyle geliştirilmiş bir .NET backend ve modern bir Next.js frontend'den oluşur.

## 2. Sistem Mimarisi (Clean Architecture)

Backend projesi 4 ana katmandan oluşur:

### A. Core (Çekirdek)
- **Domain:** Veritabanı tablolarını temsil eden Entity'ler (`BaseEntity`'den türetilir) ve temel kurallar yer alır.
- **Application:** İş mantığının (Business Logic) yer aldığı katmandır. MediatR kütüphanesi kullanılarak **CQRS (Command Query Responsibility Segregation)** deseni uygulanmıştır.
  - *Commands:* Yazma/Güncelleme işlemleri (örn: `LoginCommand`, `RegisterCommand`).
  - *Queries:* Okuma işlemleri.
  - *DTOs:* Veri transfer nesneleri.

### B. Infrastructure (Altyapı)
- **Persistence:** Veritabanı erişim katmanıdır. `DbContext` (EF Core) ve Repository implementasyonları buradadır. Kimlik doğrulama (Identity) ve JWT servisleri de bu katmanda yer alır.
- **Infrastructure:** AI entegrasyonu (OpenAI) veya e-posta servisi gibi harici sistemlerle iletişim kuran servisleri barındırır.

### C. Presentation (Sunum)
- **WebAPI:** Dış dünyaya açılan REST API uç noktalarını (Endpoints) barındırır.
  - *Controllers:* Auth, Projects, Tasks, Notes, AI, Dashboard gibi modüllere ayrılmıştır.

---

## 3. Veritabanı Yapısı ve İlişkiler

Veritabanı olarak **Neon Serverless PostgreSQL** kullanılmaktadır. Ana tablolar ve görevleri:

- **Users (Identity):** Kullanıcı bilgileri ve şifreler.
- **Projects:** Kullanıcının yürüttüğü projeler.
- **TaskItems:** Projelere bağlı görevler (1 Proje -> N Görev).
- **Notes:** Hiyerarşik teknik notlar (Parent/Child desteği ile).
- **Journals:** Günlük teknik ve kişisel kayıtlar.
- **BlogPosts:** Yayınlanmak üzere hazırlanan teknik yazılar.
- **DictionaryTerms:** Teknik terimler sözlüğü.
- **Tags:** Notlara veya projelere atanabilen etiketler.

---

## 4. Kimlik Doğrulama ve Güvenlik

- **JWT (JSON Web Token):** Kullanıcı girişi sonrası backend tarafından bir `AccessToken` üretilir.
- **AuthContext (Frontend):** Giriş yapan kullanıcının durumu frontend tarafında bir Context provider ile tüm uygulamaya dağıtılır.
- **Validation:** 
  - *Frontend:* E-posta formatı, şifre uzunluğu ve zorunlu alanlar `useEffect` ve state bazlı doğrulanır.
  - *Backend:* `FluentValidation` veya manuel kontrollerle veritabanına gitmeden önce veri doğruluğu test edilir.

---

## 5. API Modülleri (Endpoints)

| Modül | Açıklama |
| :--- | :--- |
| `/api/Auth` | Giriş (Login), Kayıt (Register) ve Token işlemleri. |
| `/api/Dashboard` | İstatistikler ve genel bakış verileri. |
| `/api/Projects` | Proje CRUD işlemleri. |
| `/api/Tasks` | Görev yönetimi ve durum güncellemeleri. |
| `/api/Notes` | Zengin içerikli not yönetimi. |
| `/api/AI` | OpenAI destekli teknik asistan ve not özetleme. |

---

## 6. Frontend Yapısı

Next.js 15+ **App Router** mimarisi kullanılmaktadır:

- **src/app/(auth):** Giriş ve Kayıt sayfaları.
- **src/app/dashboard:** Ana uygulama arayüzü ve modüller.
- **src/components/ui:** Shadcn/ui tabanlı tekrar kullanılabilir bileşenler.
- **src/context:** Global durum yönetimi (AuthContext).
- **src/lib:** Axios instance ve yardımcı araçlar (`api.ts`, `utils.ts`).

---

## 7. Geliştirme ve Çalıştırma Akışı

1. **Docker Altyapısı:** `docker-compose.yml` dosyası Redis ve .NET API'yi paketler.
2. **Migrations:** Veritabanı değişiklikleri EF Core üzerinden yönetilir:
   ```bash
   dotnet ef database update
   ```
3. **Environment Variables:**
   - `.env.local` (Frontend): API adresi.
   - `appsettings.json` (Backend): Connection strings ve JWT secret keys.

---

## 8. Proje Durumu ve Gelecek Planları

Proje şu an **MVP (Minimum Viable Product)** aşamasındadır. Gelecekte eklenecek özellikler:
- AI destekli kod analizi.
- PDF formatında teknik dökümantasyon çıktısı alma.
- Gerçek zamanlı bildirimler (SignalR).

---
*Son Güncelleme: 13 Mayıs 2026*

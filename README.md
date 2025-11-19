# DronAlert 🚁

System do zgłaszania i zarządzania incydentami związanymi z dronami.

**Projekt zaliczeniowy** na zajęcia _Zaawansowane Technologie Webowe_ | AGH 2025

**Autorzy**: Sandra Lipniak, Jakub Nowalski, Julia Papée

---

## 📋 O projekcie

DronAlert to aplikacja webowa umożliwiająca obywatelom zgłaszanie incydentów związanych z niebezpiecznym lub nielegalnym użyciem dronów. Aplikacja oferuje system uwierzytelniania, interaktywne mapy, panel użytkownika oraz panel administratora do zarządzania zgłoszeniami.

## 🚀 Funkcjonalności

### Dla użytkowników
- ✅ Rejestracja i logowanie (NextAuth.js)
- ✅ Zgłaszanie incydentów z wyborem lokalizacji na mapie
- ✅ Wyszukiwanie lokalizacji po adresie (forward geocoding)
- ✅ Dashboard z własnymi zgłoszeniami
- ✅ Edycja i anulowanie zgłoszeń
- ✅ Zarządzanie profilem

### Dla administratorów
- ✅ Panel administratora z dostępem do wszystkich zgłoszeń
- ✅ Statystyki systemu
- ✅ Zarządzanie statusami zgłoszeń (Zaakceptowano/Odrzucono)
- ✅ Kontrola dostępu oparta na rolach (RBAC)

## 🛠️ Stack technologiczny

- **Framework**: Next.js 16 (App Router)
- **Język**: JavaScript
- **Styling**: Vanilla CSS (CSS Modules)
- **Baza danych**: PostgreSQL
- **ORM**: Prisma
- **Uwierzytelnianie**: NextAuth.js
- **Mapy**: React-Leaflet + OpenStreetMap (Nominatim)

## 📦 Instalacja i uruchomienie

### Wymagania
- Node.js 18+
- PostgreSQL
- npm lub yarn

### Kroki

1. **Klonowanie repozytorium**
```bash
git clone https://github.com/kubanowalski/dron-alert.git
cd dron-alert
```

2. **Instalacja zależności**
```bash
npm install
```

3. **Konfiguracja zmiennych środowiskowych**

Stwórz plik `.env` w głównym katalogu:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dronalert"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Migracja bazy danych**
```bash
npx prisma migrate dev
npx prisma db seed  # opcjonalnie: dane testowe
```

5. **Uruchomienie aplikacji**
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3000**

## 📊 Struktura projektu

```
dron-alert/
├── prisma/
│   ├── schema.prisma      # Schema bazy danych
│   └── migrations/        # Migracje
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── auth/          # Strony autentykacji
│   │   ├── dashboard/     # Dashboard użytkownika
│   │   ├── admin/         # Panel administratora
│   │   └── incidents/     # Szczegóły zgłoszeń
│   ├── components/        # Komponenty React
│   └── middleware.js      # Route protection
├── CHANGELOG.md           # Historia zmian
├── TODO.md               # Planowane zadania
└── DEPLOYMENT.md         # Instrukcje wdrożenia
```

## 🗄️ Model danych

### User
- id (UUID)
- email (unique)
- password (hashed)
- name, firstName, lastName
- role (USER | ADMIN)
- createdAt, updatedAt

### Incident
- id (UUID)
- type (RESTRICTED_ZONE | PRIVACY_VIOLATION | DANGEROUS_FLIGHT | OTHER)
- status (REPORTED | ACCEPTED | REJECTED | CANCELLED | ARCHIVED)
- description
- location (JSON: lat, lng, address)
- userId (FK → User)
- createdAt, updatedAt

## 🔐 Bezpieczeństwo

- ✅ Hasła hashowane (bcrypt)
- ✅ Sesje JWT (NextAuth.js)
- ✅ Route protection (middleware)
- ✅ Role-based access control (RBAC)
- ✅ Authorization checks w API
- ✅ HTTPS ready (dla produkcji)

## 🌐 Wdrożenie

Szczegółowe instrukcje wdrożenia na AWS (Amplify, App Runner, EC2) znajdują się w pliku [DEPLOYMENT.md](DEPLOYMENT.md).

## 📝 Licencja

Ten projekt został stworzony jako projekt zaliczeniowy na zajęcia _Zaawansowane Technologie Webowe_ na AGH w 2025 roku.

## 👥 Autorzy

- Sandra Lipniak
- Jakub Nowalski
- Julia Papée

---

**Wersja**: v0.3.0 | **Data wydania**: 19.11.2025

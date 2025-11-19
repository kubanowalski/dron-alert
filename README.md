# 🤖 DronAlert

System zgłaszania i monitorowania incydentów z dronami w przestrzeni publicznej.

> **Projekt edukacyjny** stworzony w ramach kursu "Zaawansowane technologie webowe" na AGH.

## 📋 Opis

DronAlert to aplikacja webowa umożliwiająca:
- 📝 Zgłaszanie obserwacji dronów poprzez formularz
- 📍 Wybór lokalizacji na interaktywnej mapie
- 🗂️ Przeglądanie historii swoich zgłoszeń
- ✏️ Edycję i anulowanie zgłoszeń
- 👨‍💼 Zarządzanie zgłoszeniami z poziomu panelu administratora

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Język**: JavaScript
- **Baza danych**: PostgreSQL (Prisma)
- **Mapy**: React-Leaflet (OpenStreetMap)
- **Stylowanie**: Vanilla CSS

## 🚀 Szybki Start

### Wymagania

- Node.js 18+
- PostgreSQL database (lub Prisma Accelerate)

### Instalacja

1. Sklonuj repozytorium:
```bash
git clone <your-repo-url>
cd dron-alert
```

2. Zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj zmienne środowiskowe:
```bash
cp .env.example .env
```

Edytuj `.env` i dodaj swój connection string do PostgreSQL:
```env
DATABASE_URL="postgresql://user:password@host:5432/database"
# lub Prisma Accelerate:
# DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

4. Zastosuj schemat bazy danych:
```bash
npx prisma db push
```

5. Uruchom serwer deweloperski:
```bash
npm run dev
```

6. Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce.

## 📁 Struktura Projektu

```
dron-alert/
├── prisma/
│   └── schema.prisma          # Schemat bazy danych
├── src/
│   ├── app/
│   │   ├── api/incidents/     # API routes (CRUD)
│   │   ├── admin/             # Panel administratora
│   │   ├── dashboard/         # Panel użytkownika
│   │   ├── incidents/[id]/    # Szczegóły zgłoszenia
│   │   ├── report/            # Formularz zgłaszania
│   │   └── page.js            # Landing page
│   └── components/
│       ├── Map/               # Komponenty mapy
│       ├── IncidentForm.js    # Formularz zgłoszenia
│       └── IncidentList.js    # Lista zgłoszeń
└── package.json
```

## 🎯 Funkcjonalności (MVP)

### ✅ Zaimplementowane

- **WF-01**: Formularz zgłaszania incydentów
  - Typ incydentu (strefa zakazana, podejrzenie szpiegowania, itp.)
  - Opis (max 200 znaków)
  - Wybór lokalizacji na mapie
  
- **WF-02**: Lista zgłoszeń użytkownika
  - Wyświetlanie własnych zgłoszeń
  - Status zgłoszenia
  - Podgląd szczegółów

- **WF-03, WF-04, WF-05**: Szczegóły zgłoszenia
  - Podgląd wszystkich informacji
  - Edycja zgłoszenia
  - Anulowanie zgłoszenia

- **WF-06**: Panel administratora
  - Lista wszystkich zgłoszeń
  - Zmiana statusu (Zatwierdź/Odrzuć/Archiwizuj)

- **WF-07**: Integracja z mapami (Leaflet + OpenStreetMap)

### 📋 Planowane (poza MVP)

- Rejestracja i logowanie użytkowników
- Powiadomienia email/SMS
- Upload zdjęć incydentów
- Integracja z API rządowymi

## 🌐 Wdrożenie na AWS

### Opcja 1: AWS Amplify (Rekomendowane - najłatwiejsze)

1. Zaloguj się do [AWS Console](https://console.aws.amazon.com/)
2. Przejdź do **AWS Amplify**
3. Kliknij **"New app"** → **"Host web app"**
4. Połącz z GitHub repository
5. Skonfiguruj build settings:
   - Build command: \`npm run build\`
   - Output directory: \`.next\`
6. Dodaj zmienne środowiskowe:
   - \`DATABASE_URL\`: Twój PostgreSQL connection string
7. Kliknij **"Save and deploy"**

### Opcja 2: AWS EC2

Zobacz szczegółowe instrukcje w pliku [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔒 Bezpieczeństwo

- ⚠️ **NIGDY** nie commituj pliku \`.env\` z prawdziwymi danymi
- ✅ Plik \`.env\` jest w \`.gitignore\`
- ✅ Użyj \`.env.example\` jako template
- ✅ Przechowuj wrażliwe dane w AWS Secrets Manager przy wdrożeniu

## 📝 Licencja

Projekt edukacyjny - AGH University of Science and Technology

## 👤 Autor

Julia Papée
Jakub Nowalski
Sandra Lipniak

---

**Status**: ✅ MVP Complete | 🚀 Production Ready

# Changelog - DronAlert

## [v0.4.0] - 2025-11-19

### ✨ New Features

#### Geolocation Support
- **Current location button**: Added 📍 button to MapPicker for instant location detection
- **Browser geolocation API**: Uses `navigator.geolocation.getCurrentPosition()`
- **Automatic address lookup**: Reverse geocodes user's coordinates to display address
- **Error handling**: User-friendly messages for permission denial, unavailable location, or timeout

#### Address Autocomplete
- **Live suggestions**: Dropdown list appears as user types in search field
- **Debounced search**: 500ms delay to optimize API calls
- **5 suggestions**: Shows top 5 matching addresses from Nominatim
- **Click to select**: Clicking a suggestion updates map position and address
- **Poland-focused**: Results filtered to Polish addresses

### 🎨 UI/UX Improvements

#### Layout Consistency
- **Address position**: Moved address display above map in edit mode (consistent with view mode)
- **Border cleanup**: Removed border frames around map components in both view and edit modes
- **Unified styling**: MapPicker now matches the design of MapView and IncidentForm

#### Search Enhancement
- **Button tooltips**: Added title attributes to search and geolocation buttons
- **Visual feedback**: Loading state shared between search and geolocation
- **Dropdown styling**: Professional-looking suggestions with hover effects and shadows

### 🐛 Bug Fixes

#### Incident Editing
- **Missing address fix**: MapPicker now accepts `initialLocation` prop to display existing address
- **Infinite loop fix**: Used `useCallback` for location handler to prevent render loop
- **Stable callbacks**: Prevented "Maximum update depth exceeded" error

### 📦 Technical Improvements
- **Debouncing**: Implemented proper debounce for autocomplete to reduce API load
- **State management**: Better handling of suggestions state and visibility
- **Position tracking**: Improved coordinate and address synchronization

---

## [v0.3.0] - 2025-11-19

### ✨ New Features

#### Location Search (Forward Geocoding)
- **Search field in MapPicker**: Added text input with search functionality above the map
- **Forward geocoding**: Search by address (city, street) using Nominatim API
- **Two-way synchronization**:
  - Searching by address → marker on map + zoom
  - Clicking on map → reverse geocoding → address display
- **Enter key support**: Press Enter in search field to search
- **Poland-only results**: Search filtered to Polish addresses (`countrycodes=pl`)
- **Loading states**: Visual feedback during search operations

### 🎨 UI/UX Improvements

#### Layout Optimization
- **Narrower container**: Reduced max-width from `1200px` to `900px` for better readability
- **Removed duplicate displays**: Eliminated redundant address boxes
- **Removed overlapping borders**: Cleaned up nested border styles in MapPicker
- **Improved placeholder**: "Wyszukaj adres lub kliknij na mapie" for better UX
- **Compact location display**: Shows address with 📍 icon below map instead of in separate box

### 🐛 Bug Fixes
- **Nested forms fix**: Replaced `<form>` with `<div>` in MapPicker to avoid hydration errors
- **Border cleanup**: Removed extra wrapper div with borders in IncidentForm

### 📦 Documentation
- **TODO updates**: Added tasks for location search improvements, account deletion feature
- **Forward geocoding implementation**: Completed forward geocoding task

---

## [v0.2.0] - 2025-11-19

### 🎨 UI/UX Improvements

#### Design & Styling
- **Kompaktowy layout**: Zmniejszono padding i margines w całej aplikacji dla lepszego wykorzystania przestrzeni
- **Polskie konwencje nazewnictwa**: Zmieniono wszystkie tytuły z "Title Case" na polską notację (tylko pierwsza litera wielka)
- **Dark mode fix**: Poprawiono kontrast tekstu `--color-text-muted` w trybie ciemnym (`#d4d4d8` zamiast `#a1a1aa`)
- **Sticky footer**: Zaimplementowano sticky footer z informacjami o projekcie i autorach

#### Incident Display
- **Przyjazne nazwy**: Dodano funkcje `getTypeLabel()` i `getStatusLabel()` do wyświetlania przetłumaczonych nazw typów i statusów
- **Formatowanie daty**: Zgłoszenia pokazują pełną datę w polskim formacie (np. "19 listopada 2025, 00:37")
- **Lokalizacje**: Wyświetlanie adresów z geokodowania zamiast współrzędnych (np. "Warszawa, ulica Marszałkowska")
- **Ikona lokalizacji**: Dodano ikonę 📍 przed adresem

#### Incident Submission
- **Ekran sukcesu**: Usunięto automatyczne przekierowanie po zgłoszeniu, dodano ekran sukcesu z opcjami:
  - "Dodaj kolejne zgłoszenie" (czyści formularz)
  - "Przejdź do dashboardu"

#### Registration & Login
- **Komunikaty sukcesu**: 
  - Po rejestracji: zielony banner z komunikatem i 2-sekundowym opóźnieniem przed przekierowaniem
  - Na stronie logowania: "Konto zostało utworzone! Możesz się teraz zalogować" (auto-hide po 5s)

#### User Menu
- **Lepsze wyrównanie**: Poprawiono padding i spacing w rozwijanym menu użytkownika
- **Jednolity rozmiar ikon**: Wszystkie ikony mają stały rozmiar 18x18px

#### Incident Details
- **Custom modal**: Zamieniono natywny `confirm()` na niestandardowy modal do potwierdzania anulowania
- **Spójny layout**: Ujednolicono wyświetlanie informacji zgodnie z wzorcem z listy incydentów

### 🔐 Security & Authorization

#### Role-Based Access Control (RBAC)
- **Middleware**: Utworzono `src/middleware.js` do ochrony tras:
  - `/admin/*` - wymaga roli ADMIN
  - `/dashboard`, `/profile`, `/report` - wymaga uwierzytelnienia
- **API Authorization**: Dodano sprawdzanie uprawnień w `/api/incidents/[id]`:
  - Zmiana statusu: tylko ADMIN
  - Edycja: właściciel lub ADMIN
  - Anulowanie: właściciel lub ADMIN
- **Panel administratora**: Usunięto toggle "Tryb admina", dostęp tylko dla użytkowników z rolą ADMIN w bazie
- **Session fix**: Naprawiono NextAuth callbacks aby rola z bazy była przekazywana do sesji JWT

#### Admin Features
- **Dashboard admina**: Admin widzi wszystkie zgłoszenia w systemie (nie tylko swoje)
- **Informacje o użytkowniku**: Admin widzi email/nazwę zgłaszającego (👤) na liście incydentów
- **Panel administratora (`/admin`)**: 
  - Statystyki (wszystkie, oczekujące, zaakceptowane, odrzucone)
  - Lista wszystkich zgłoszeń z danymi użytkowników
  - Możliwość zarządzania statusami

### 🐛 Bug Fixes

#### API
- **Next.js 15+ compatibility**: Naprawiono błąd 404 w `/api/incidents/[id]` - `params` jest Promise i wymaga `await`
- **Infinite loop**: Rozwiązano problem nieskończonej pętli w `MapPicker` poprzez użycie `useCallback`

#### Authentication
- **Wylogowanie**: Zmieniono `signOut()` aby używało `callbackUrl: '/'` zamiast generycznej strony NextAuth
- **Role propagation**: Naprawiono przekazywanie roli użytkownika do sesji (JWT callbacks)

#### Database
- **User filtering**: Poprawiono filtrowanie incydentów po `userId` - dashboard pokazuje właściwe zgłoszenia
- **Include relations**: API dla administratorów zwraca dane użytkowników (relacja Prisma)

### 📦 Technical Improvements

- **Component optimization**: Poprawa struktury i reużywalności komponentów
- **Error handling**: Dodano try-catch i lepsze komunikaty błędów
- **Code organization**: Separacja logiki authorization w middleware i API routes
- **TypeScript-ready**: Przygotowanie struktury dla potencjalnej migracji na TypeScript

### 🎓 Documentation

- **Footer**: Dodano footer z informacjami o projekcie:
  - "Projekt zaliczeniowy na zajęcia 'Zaawansowane Technologie Webowe'"
  - "AGH 2025"
  - "© Sandra Lipniak, Jakub Nowalski, Julia Papée"

---

## [v0.1.0] - 2025-11-18

### Initial Release
- Podstawowa funkcjonalność zgłaszania incydentów
- System uwierzytelniania (NextAuth.js)
- Dashboard użytkownika
- Panel administratora (podstawowy)
- Integracja z mapami (React-Leaflet)
- Baza danych PostgreSQL (Prisma ORM)

---

**Format**: [Semantic Versioning](https://semver.org/)
**Typy zmian**: 
- 🎨 UI/UX - zmiany interfejsu i doświadczeń użytkownika
- 🔐 Security - poprawki bezpieczeństwa i autoryzacji
- 🐛 Bug Fixes - naprawy błędów
- ✨ Features - nowe funkcjonalności
- 📦 Technical - usprawnienia techniczne
- 📚 Documentation - dokumentacja

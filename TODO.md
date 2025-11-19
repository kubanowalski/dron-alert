# TODO - DronAlert

## Zaplanowane na następną sesję

### 🔍 Wyszukiwanie lokalizacji w formularzu zgłoszenia
- [ ] **FIX**: Usunąć duplikat wyświetlania wartości wyszukiwania
- [ ] Dodać pole tekstowe z wyszukiwaniem w komponencie `MapPicker`
- [ ] Implementacja forward geocoding (adres → współrzędne)
- [ ] Autocomplete dla sugestii adresów podczas wpisywania
- [ ] Wyśrodkowanie mapy na wybrany adres
- [ ] Fallback do ręcznego wyboru na mapie
- [ ] Usprawnienia UX (lepszy feedback, debounce)

### 🗺️ Mapa aktywnych zgłoszeń
- [ ] Dodać interaktywną mapę na landing page
- [ ] Wyświetlać wszystkie aktywne zgłoszenia (status: REPORTED, ACCEPTED)
- [ ] Markery z kolorami zależnymi od statusu
- [ ] Popup z podstawowymi informacjami po kliknięciu w marker
- [ ] Filtrowanie po typie incydentu

### ☁️ Wdrożenie na AWS
- [ ] Przygotować bazę danych PostgreSQL na AWS RDS
- [ ] Skonfigurować AWS Amplify / App Runner / EC2 do hostingu aplikacji
- [ ] Skonfigurować zmienne środowiskowe (DATABASE_URL, NEXTAUTH_SECRET)
- [ ] Przeprowadzić migrację bazy danych
- [ ] Przetestować aplikację w środowisku produkcyjnym
- [ ] Skonfigurować domenę (jeśli dotyczy)
- [ ] Zabezpieczyć credentials i API keys

## Backlog

### Funkcjonalności
- [ ] **Usuwanie konta użytkownika**
  - Opcja w profilu użytkownika
  - Potwierdzenie przed usunięciem
  - Soft delete lub hard delete
  - Obsługa powiązanych zgłoszeń (anonymizacja lub kasowanie)
- [ ] Zaawansowane wyszukiwanie i filtrowanie zgłoszeń
- [ ] Powiadomienia email dla adminów o nowych zgłoszeniach
- [ ] Eksport danych do CSV/PDF
- [ ] Statystyki i wykresy w panelu admina
- [ ] Historia zmian statusu zgłoszenia
- [ ] Dodawanie zdjęć do zgłoszeń

### Usprawnienia UX/UI
- [ ] Wyszukiwanie lokalizacji (forward geocoding) w MapPicker
- [ ] Dark mode improvements
- [ ] Animacje i transycje
- [ ] Breadcrumbs navigation
- [ ] Paginacja dla dużej liczby zgłoszeń

### Techniczne
- [ ] Testy jednostkowe i integracyjne
- [ ] CI/CD pipeline
- [ ] Error monitoring (Sentry)
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Accessibility audit (WCAG)

---

**Ostatnia aktualizacja**: 19.11.2025

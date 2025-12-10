/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  /**
   * Konfiguracja nagłówków bezpieczeństwa.
   * Te ustawienia chronią aplikację przed atakami hakerskimi.
   */
  async headers() {
    return [
      {
        // Zastosuj te zasady do wszystkich stron w aplikacji
        source: '/:path*',
        headers: [
          {
            // Przyspiesza ładowanie stron poprzez wcześniejsze sprawdzanie adresów serwerów
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            // Wymusza bezpieczne połączenie (HTTPS), żeby nikt nie mógł podsłuchać danych
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            // Zapobiega osadzaniu naszej strony na innych stronach (ochrona przed clickjackingiem)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            // Blokuje przeglądarkę przed zgadywaniem typu pliku (bezpieczeństwo)
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // Blokuje złośliwe skrypty (XSS)
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            // Kontroluje jakie informacje są wysyłane, gdy użytkownik klika w link do innej strony
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            // Blokuje dostęp do kamery, mikrofonu i lokalizacji (z wyjątkiem lokalizacji na żądanie)
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)'
          },
          // Polityka Bezpieczeństwa Treści (CSP) - określa co wolno ładować na stronie
          // Pozwalamy na mapy (OpenStreetMap) i zewnętrzne skrypty tylko z zaufanych źródeł
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' unpkg.com",
              "style-src 'self' 'unsafe-inline' unpkg.com",
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://unpkg.com",
              "font-src 'self' data:",
              "connect-src 'self' https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'"
            ].join('; ')
          }
        ],
      },
    ];
  },
};

export default nextConfig;

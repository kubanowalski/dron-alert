import Navbar from './Navbar';

/**
 * Główny Układ Strony (Layout)
 * Tutaj ustalamy wygląd wspólny dla wszystkich podstron:
 * - Pasek nawigacji na górze (Navbar)
 * - Miejsce na treść (Container)
 * - Stopka autorska na dole (Footer)
 */
export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            {/* Główny kontener na treść strony */}
            <div className="container">
                <main>{children}</main>
            </div>
            <footer className="footer">
                <div className="footer-content">
                    <p className="text-xs text-muted mb-sm">
                        Projekt zaliczeniowy na zajęcia "Zaawansowane Technologie Webowe"
                    </p>
                    <p className="text-xs text-muted mb-sm">
                        AGH 2025
                    </p>
                    <p className="text-xs text-muted mb-0">
                        © Sandra Lipniak, Jakub Nowalski, Julia Papée
                    </p>
                </div>
            </footer>
        </>
    );
}

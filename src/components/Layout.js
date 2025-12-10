import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';

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
            <nav className="navbar">
                <div className="nav-content">
                    <Link href="/" className="nav-brand">
                        DronAlert
                    </Link>
                    <div className="nav-links">
                        <Link href="/report" className="nav-link">
                            Zgłoś
                        </Link>
                        <Link href="/dashboard" className="nav-link">
                            Dashboard
                        </Link>
                        {/* Przełącznik trybu ciemnego/jasnego */}
                        <ThemeToggle />
                        {/* Menu użytkownika (Logowanie/Wylogowanie) */}
                        <UserMenu />
                    </div>
                </div>
            </nav>
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

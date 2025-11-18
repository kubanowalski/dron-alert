import Link from 'next/link';

export default function Layout({ children }) {
    return (
        <div className="container">
            <nav className="navbar">
                <Link href="/" className="nav-brand">
                    🤖 DronAlert
                </Link>
                <div className="nav-links">
                    <Link href="/report" className="nav-link">
                        Zgłoś
                    </Link>
                    <Link href="/dashboard" className="nav-link">
                        Moje Zgłoszenia
                    </Link>
                    <Link href="/admin" className="nav-link">
                        Admin
                    </Link>
                </div>
            </nav>
            <main>{children}</main>
        </div>
    );
}

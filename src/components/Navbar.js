"use client";

import { useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className="nav-content">
                <Link href="/" className="nav-brand" onClick={closeMenu}>
                    DronAlert
                </Link>

                {/* Mobile: theme toggle + hamburger — before nav-links so it stays in top row */}
                <div className="nav-mobile-actions">
                    <ThemeToggle />
                    <button
                        className="nav-toggle"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Nav links: inline on desktop, dropdown on mobile */}
                <div className={`nav-links ${menuOpen ? "nav-links-open" : ""}`}>
                    <Link href="/report" className="nav-link" onClick={closeMenu}>
                        Zgłoś
                    </Link>
                    <Link href="/dashboard" className="nav-link" onClick={closeMenu}>
                        Dashboard
                    </Link>
                    <span className="nav-desktop-only nav-theme-desktop">
                        <ThemeToggle />
                    </span>
                    <UserMenu onNavigate={closeMenu} />
                </div>
            </div>
        </nav>
    );
}

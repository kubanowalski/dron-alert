import Link from "next/link";

/**
 * Strona Główna (Landing Page)
 * To widzi użytkownik zaraz po wejściu na stronę.
 * Zawiera powitanie i przyciski do najważniejszych akcji.
 */
export default function Home() {
  return (
    <div className="hero">
      <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
        <h1 className="hero-title">
          DronAlert
        </h1>
        <p className="text-muted" style={{ fontSize: "var(--font-size-lg)", marginBottom: 0 }}>
          System monitorowania i zgłaszania incydentów z dronami w przestrzeni publicznej
        </p>
      </div>

      <div className="hero-actions">
        <Link href="/report" className="btn btn-primary">
          Zgłoś incydent
        </Link>
        <Link href="/dashboard" className="btn btn-secondary">
          Przeglądaj zgłoszenia
        </Link>
      </div>
    </div>
  );
}

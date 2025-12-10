import Link from "next/link";

/**
 * Strona Główna (Landing Page)
 * To widzi użytkownik zaraz po wejściu na stronę.
 * Zawiera powitanie i przyciski do najważniejszych akcji.
 */
export default function Home() {
  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "var(--space-3xl)" }}>
      <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "var(--space-md)", fontWeight: 600 }}>
          DronAlert
        </h1>
        <p className="text-muted" style={{ fontSize: "var(--font-size-lg)", marginBottom: 0 }}>
          System monitorowania i zgłaszania incydentów z dronami w przestrzeni publicznej
        </p>
      </div>

      <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", flexWrap: "wrap" }}>
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

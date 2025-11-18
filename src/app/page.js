import Link from "next/link";

export default function Home() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 0" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem", background: "linear-gradient(to right, #6366f1, #ef4444)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        DronAlert
      </h1>
      <p style={{ fontSize: "1.2rem", color: "var(--text-muted)", marginBottom: "3rem" }}>
        System monitorowania i zgłaszania incydentów z dronami w przestrzeni publicznej.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
        <Link href="/report" className="btn btn-primary" style={{ fontSize: "1.1rem", padding: "0.75rem 2rem" }}>
          Zgłoś Incydent
        </Link>
        <Link href="/dashboard" className="btn" style={{ border: "1px solid var(--border)", fontSize: "1.1rem", padding: "0.75rem 2rem" }}>
          Moje Konto
        </Link>
      </div>
    </div>
  );
}

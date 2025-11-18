import Link from "next/link";

export default function IncidentList({ incidents, isAdmin = false }) {
    if (incidents.length === 0) {
        return <p className="text-muted">Brak zgłoszeń.</p>;
    }

    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            {incidents.map((incident) => (
                <Link href={`/incidents/${incident.id}`} key={incident.id} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ transition: "transform 0.2s", cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <div>
                                <h3 style={{ margin: "0 0 0.5rem 0" }}>{incident.type.replace(/_/g, " ")}</h3>
                                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                    {new Date(incident.createdAt).toLocaleString("pl-PL")}
                                </p>
                            </div>
                            <span
                                style={{
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "var(--radius)",
                                    fontSize: "0.8rem",
                                    backgroundColor:
                                        incident.status === "REPORTED"
                                            ? "#3b82f6"
                                            : incident.status === "ACCEPTED"
                                                ? "#22c55e"
                                                : "#64748b",
                                    color: "white",
                                }}
                            >
                                {incident.status}
                            </span>
                        </div>
                        <p style={{ margin: "0.5rem 0 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {incident.description}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

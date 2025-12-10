import Link from "next/link";
import {
    getIncidentTypeLabel,
    getIncidentStatusLabel,
    getIncidentStatusBadgeClass,
    getLocationText
} from "@/lib/constants";

/**
 * Komponent IncidentList (Lista Zgłoszeń)
 * Wyświetla siatkę kafelków z incydentami.
 * Każdy kafelek pokazuje typ, datę, status i krótki opis.
 */
export default function IncidentList({ incidents, showUserInfo = false, isAdmin = false }) {
    // Jeśli nie ma żadnych zgłoszeń, wyświetl komunikat "Brak zgłoszeń"
    if (!Array.isArray(incidents) || incidents.length === 0) {
        return (
            <div className="card text-center">
                <p className="text-muted mb-0">Brak zgłoszeń</p>
            </div>
        );
    }

    return (
        <div className="grid">
            {incidents.map((incident) => (
                <Link href={`/incidents/${incident.id}`} key={incident.id}>
                    <div className="card card-interactive">
                        <div className="flex-between mb-sm">
                            <div>
                                <h3 className="mb-xs">
                                    {getIncidentTypeLabel(incident.type)}
                                </h3>
                                <p className="text-xs text-muted mb-0">
                                    {new Date(incident.createdAt).toLocaleDateString("pl-PL", {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                                {/* Show user info if requested (e.g. in Admin Panel) */}
                                {showUserInfo && incident.user && (
                                    <p className="text-xs text-muted mb-0" style={{ marginTop: "var(--space-xs)" }}>
                                        👤 {incident.user.name || incident.user.email}
                                    </p>
                                )}
                            </div>
                            <span className={getIncidentStatusBadgeClass(incident.status)}>
                                {getIncidentStatusLabel(incident.status)}
                            </span>
                        </div>
                        <p className="text-muted mb-sm" style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}>
                            {incident.description}
                        </p>
                        <p className="text-xs text-muted mb-0">
                            📍 {getLocationText(incident.location)}
                        </p>
                    </div>
                </Link>
            ))}
        </div>
    );
}

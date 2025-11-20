import Link from "next/link";
import {
    getIncidentTypeLabel,
    getIncidentStatusLabel,
    getIncidentStatusBadgeClass,
    getLocationText
} from "@/lib/constants";

export default function IncidentList({ incidents, showUserInfo = false, isAdmin = false }) {
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

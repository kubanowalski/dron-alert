import Link from "next/link";

export default function IncidentList({ incidents, showUserInfo = false, isAdmin = false }) {
    if (!Array.isArray(incidents) || incidents.length === 0) {
        return (
            <div className="card text-center">
                <p className="text-muted mb-0">Brak zgłoszeń</p>
            </div>
        );
    }

    const getTypeLabel = (type) => {
        const typeMap = {
            'RESTRICTED_ZONE': 'Strefa zakazana',
            'PRIVACY_VIOLATION': 'Naruszenie prywatności',
            'DANGEROUS_FLIGHT': 'Niebezpieczny lot',
            'OTHER': 'Inne',
        };
        return typeMap[type] || type;
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'REPORTED': 'Zgłoszono',
            'ACCEPTED': 'Zaakceptowano',
            'REJECTED': 'Odrzucono',
            'CANCELLED': 'Anulowano',
            'ARCHIVED': 'Zarchiwizowano',
        };
        return statusMap[status] || status;
    };

    const getStatusBadgeClass = (status) => {
        const statusMap = {
            'REPORTED': 'badge-reported',
            'ACCEPTED': 'badge-accepted',
            'REJECTED': 'badge-rejected',
            'CANCELLED': 'badge-cancelled',
            'ARCHIVED': 'badge-archived',
        };
        return `badge ${statusMap[status] || 'badge-reported'}`;
    };

    const getLocationText = (locationStr) => {
        try {
            const location = JSON.parse(locationStr);
            if (location.address) {
                // Skróć adres do miasta i ulicy
                const parts = location.address.split(',');
                return parts.slice(0, 2).join(',').trim();
            }
            return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        } catch {
            return "Nieznana lokalizacja";
        }
    };

    return (
        <div className="grid">
            {incidents.map((incident) => (
                <Link href={`/incidents/${incident.id}`} key={incident.id}>
                    <div className="card card-interactive">
                        <div className="flex-between mb-sm">
                            <div>
                                <h3 className="mb-xs">
                                    {getTypeLabel(incident.type)}
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
                            <span className={getStatusBadgeClass(incident.status)}>
                                {getStatusLabel(incident.status)}
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

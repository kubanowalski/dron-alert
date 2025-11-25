"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import {
    getIncidentTypeLabel,
    getIncidentStatusLabel,
    getIncidentStatusBadgeClass,
    getLocationText
} from "@/lib/constants";

const MapView = dynamic(() => import("@/components/Map/MapView"), { ssr: false });
const MapPicker = dynamic(() => import("@/components/Map/MapPicker"), { ssr: false });

export default function IncidentDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showConfirm, setShowConfirm] = useState(false);

    const isAdmin = session?.user?.role === "ADMIN";

    const handleLocationChange = useCallback((loc) => {
        setFormData(prev => ({ ...prev, location: loc }));
    }, []);

    useEffect(() => {
        fetch(`/api/incidents/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setIncident(data);
                setFormData({
                    description: data.description,
                    type: data.type,
                    location: JSON.parse(data.location),
                });
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id]);

    const handleUpdate = async () => {
        setMessage({ type: '', text: '' });
        const res = await fetch(`/api/incidents/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            const updated = await res.json();
            setIncident(updated);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Zgłoszenie zaktualizowane pomyślnie' });
        } else {
            setMessage({ type: 'error', text: 'Błąd podczas aktualizacji zgłoszenia' });
        }
    };

    const handleCancel = async () => {
        setMessage({ type: '', text: '' });
        setShowConfirm(false);

        try {
            const res = await fetch(`/api/incidents/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                const updated = await res.json();
                setIncident(updated);
                setMessage({ type: 'success', text: 'Zgłoszenie zostało anulowane' });
            } else {
                setMessage({ type: 'error', text: 'Błąd podczas anulowania zgłoszenia' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Błąd podczas anulowania zgłoszenia' });
        }
    };

    const handleStatusChange = async (newStatus) => {
        setMessage({ type: '', text: '' });
        const res = await fetch(`/api/incidents/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
            const updated = await res.json();
            setIncident(updated);
            setMessage({ type: 'success', text: 'Status zgłoszenia zmieniony pomyślnie' });
        } else {
            setMessage({ type: 'error', text: 'Błąd podczas zmiany statusu' });
        }
    };

    if (loading) return <div className="loading">Ładowanie...</div>;
    if (!incident) return <p className="text-muted">Nie znaleziono zgłoszenia.</p>;

    return (
        <div>
            {/* Custom Confirm Modal */}
            {showConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-surface)',
                        padding: 'var(--space-xl)',
                        borderRadius: 'var(--border-radius)',
                        maxWidth: '400px',
                        width: '90%',
                        border: 'var(--border-width) solid var(--color-border)'
                    }}>
                        <h3 className="mb-md">Potwierdzenie</h3>
                        <p className="mb-lg">Czy na pewno chcesz anulować to zgłoszenie?</p>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowConfirm(false)} className="btn btn-secondary">
                                Nie
                            </button>
                            <button onClick={handleCancel} className="btn btn-danger">
                                Tak, anuluj
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-between mb-xl">
                <h1>Szczegóły zgłoszenia</h1>
            </div>

            {message.text && (
                <div style={{
                    padding: "var(--space-md)",
                    backgroundColor: message.type === 'success' ? "#dcfce7" : "#fee2e2",
                    color: message.type === 'success' ? "#166534" : "#991b1b",
                    borderRadius: "var(--border-radius)",
                    marginBottom: "var(--space-lg)",
                    border: `var(--border-width) solid ${message.type === 'success' ? '#16a34a' : '#dc2626'}`
                }}>
                    {message.text}
                </div>
            )}

            <div className="card">
                <div className="flex-between mb-lg">
                    <div>
                        <h2 className="mb-xs">{getIncidentTypeLabel(incident.type)}</h2>
                        <p className="text-xs text-muted mb-0">
                            {new Date(incident.createdAt).toLocaleDateString("pl-PL", {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <span className={getIncidentStatusBadgeClass(incident.status)}>
                        {getIncidentStatusLabel(incident.status)}
                    </span>
                </div>

                {!isEditing && (
                    <>
                        <div className="mb-lg">
                            <h3 className="mb-sm" style={{ fontSize: "var(--font-size-base)", fontWeight: 600 }}>Opis</h3>
                            <p className="text-muted mb-0">{incident.description}</p>
                        </div>

                        <div className="mb-lg">
                            <h3 className="mb-sm" style={{ fontSize: "var(--font-size-base)", fontWeight: 600 }}>Lokalizacja</h3>
                            <p className="text-muted mb-sm">📍 {getLocationText(incident.location)}</p>
                            <div style={{ borderRadius: "var(--border-radius)", overflow: "hidden" }}>
                                <MapView location={JSON.parse(incident.location)} />
                            </div>
                        </div>

                        {incident.status !== "CANCELLED" && (
                            <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
                                <button onClick={() => setIsEditing(true)} className="btn btn-secondary">
                                    Edytuj
                                </button>
                                <button onClick={() => setShowConfirm(true)} className="btn btn-danger">
                                    Anuluj zgłoszenie
                                </button>
                            </div>
                        )}
                    </>
                )}

                {isEditing && (
                    <>
                        <div className="form-group">
                            <label className="form-label">Typ incydentu</label>
                            <select
                                className="select"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="RESTRICTED_ZONE">Strefa zakazana</option>
                                <option value="PRIVACY_VIOLATION">Naruszenie prywatności</option>
                                <option value="DANGEROUS_FLIGHT">Niebezpieczny lot</option>
                                <option value="OTHER">Inne</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Opis</label>
                            <textarea
                                className="textarea"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Zmień lokalizację</label>
                            <div style={{ borderRadius: "var(--border-radius)", overflow: "hidden" }}>
                                <MapPicker
                                    initialLocation={formData.location}
                                    onLocationSelect={handleLocationChange}
                                />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "var(--space-md)" }}>
                            <button onClick={handleUpdate} className="btn btn-primary">Zapisz</button>
                            <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Anuluj</button>
                        </div>
                    </>
                )}

                {isAdmin && (
                    <div style={{ marginTop: "var(--space-2xl)", paddingTop: "var(--space-xl)", borderTop: "var(--border-width) solid var(--color-border)" }}>
                        <h3 className="mb-lg">Panel administratora</h3>
                        <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
                            <button
                                onClick={() => handleStatusChange("ACCEPTED")}
                                className="btn"
                                style={{ backgroundColor: "#16a34a", color: "white", borderColor: "#16a34a" }}
                            >
                                Zatwierdź
                            </button>
                            <button
                                onClick={() => handleStatusChange("REJECTED")}
                                className="btn"
                                style={{ backgroundColor: "#dc2626", color: "white", borderColor: "#dc2626" }}
                            >
                                Odrzuć
                            </button>
                            <button
                                onClick={() => handleStatusChange("ARCHIVED")}
                                className="btn btn-secondary"
                            >
                                Archiwizuj
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/Map/MapView"), { ssr: false });
const MapPicker = dynamic(() => import("@/components/Map/MapPicker"), { ssr: false });

export default function IncidentDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // Mock admin check - in real app check session
    // For MVP, we can add a toggle or just assume everyone can edit their own, 
    // and maybe a special URL or button to simulate Admin.
    // Let's add a "Simulate Admin" button for demo purposes.
    const [isAdmin, setIsAdmin] = useState(false);

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
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handleUpdate = async () => {
        const res = await fetch(`/api/incidents/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            const updated = await res.json();
            setIncident(updated);
            setIsEditing(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Czy na pewno chcesz anulować zgłoszenie?")) return;
        const res = await fetch(`/api/incidents/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            const updated = await res.json();
            setIncident(updated);
        }
    };

    const handleStatusChange = async (newStatus) => {
        const res = await fetch(`/api/incidents/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });
        if (res.ok) {
            const updated = await res.json();
            setIncident(updated);
        }
    };

    if (loading) return <p>Ładowanie...</p>;
    if (!incident) return <p>Nie znaleziono zgłoszenia.</p>;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h1>Szczegóły Zgłoszenia</h1>
                <button onClick={() => setIsAdmin(!isAdmin)} className="btn" style={{ fontSize: "0.8rem", border: "1px solid var(--border)" }}>
                    {isAdmin ? "Tryb Admina: WŁ" : "Tryb Admina: WYŁ"}
                </button>
            </div>

            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>ID: {incident.id}</span>
                    <span style={{
                        fontWeight: "bold",
                        color: incident.status === "CANCELLED" ? "var(--secondary)" : "var(--primary)"
                    }}>
                        {incident.status}
                    </span>
                </div>

                {isEditing ? (
                    <>
                        <div style={{ marginBottom: "1rem" }}>
                            <label>Typ</label>
                            <select
                                className="input"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="strefa_zakazana">Strefa Zakazana</option>
                                <option value="podejrzenie_szpiegowania">Podejrzenie Szpiegowania</option>
                                <option value="niebezpieczna_odleglosc">Niebezpieczna Odległość</option>
                                <option value="inne">Inne</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label>Opis</label>
                            <textarea
                                className="input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                            <label>Zmień Lokalizację</label>
                            <div style={{ height: "300px", borderRadius: "var(--radius)", overflow: "hidden" }}>
                                <MapPicker onLocationSelect={(loc) => setFormData({ ...formData, location: loc })} />
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={handleUpdate} className="btn btn-primary">Zapisz</button>
                            <button onClick={() => setIsEditing(false)} className="btn">Anuluj</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 style={{ textTransform: "capitalize" }}>{incident.type.replace(/_/g, " ")}</h2>
                        <p style={{ fontSize: "1.1rem", marginBottom: "1.5rem" }}>{incident.description}</p>

                        <div style={{ marginBottom: "1.5rem", borderRadius: "var(--radius)", overflow: "hidden" }}>
                            <MapView location={JSON.parse(incident.location)} />
                        </div>

                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                            {incident.status !== "CANCELLED" && (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="btn" style={{ border: "1px solid var(--border)" }}>
                                        Edytuj
                                    </button>
                                    <button onClick={handleCancel} className="btn btn-secondary">
                                        Anuluj Zgłoszenie
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                )}

                {isAdmin && (
                    <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                        <h3>Panel Administratora</h3>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => handleStatusChange("ACCEPTED")} className="btn" style={{ backgroundColor: "#22c55e", color: "white" }}>
                                Zatwierdź
                            </button>
                            <button onClick={() => handleStatusChange("REJECTED")} className="btn" style={{ backgroundColor: "#ef4444", color: "white" }}>
                                Odrzuć
                            </button>
                            <button onClick={() => handleStatusChange("ARCHIVED")} className="btn" style={{ backgroundColor: "#64748b", color: "white" }}>
                                Archiwizuj
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import("./Map/MapPicker"), {
    ssr: false,
    loading: () => <p>Ładowanie mapy...</p>,
});

export default function IncidentForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type: "strefa_zakazana",
        description: "",
        location: null,
        photoUrl: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.location) {
            alert("Proszę zaznaczyć lokalizację na mapie!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/dashboard");
            } else {
                alert("Wystąpił błąd podczas wysyłania zgłoszenia.");
            }
        } catch (error) {
            console.error(error);
            alert("Błąd sieci.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <h2>Zgłoś Incydent</h2>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Typ Incydentu</label>
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
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Opis (max 200 znaków)</label>
                <textarea
                    className="input"
                    maxLength={200}
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
            </div>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Lokalizacja</label>
                <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
                    <MapPicker onLocationSelect={(loc) => setFormData({ ...formData, location: loc })} />
                </div>
                {formData.location && (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                        Wybrano: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                    </p>
                )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Wysyłanie..." : "Wyślij Zgłoszenie"}
            </button>
        </form>
    );
}

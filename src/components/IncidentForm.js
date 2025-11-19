"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const MapPicker = dynamic(() => import("@/components/Map/MapPicker"), {
    ssr: false,
});

export default function IncidentForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        type: "",
        description: "",
        location: null,
        photoUrl: "",
    });

    const handleLocationSelect = useCallback((loc) => {
        setFormData((prev) => ({ ...prev, location: loc }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch("/api/incidents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: formData.type,
                    description: formData.description,
                    location: JSON.stringify(formData.location),
                    photoUrl: formData.photoUrl || null,
                }),
            });

            if (!res.ok) throw new Error("Failed to create incident");

            setSuccess(true);

            // Clear form but don't redirect
            setFormData({
                type: "",
                description: "",
                location: null,
                photoUrl: "",
            });
        } catch (error) {
            console.error("Error creating incident:", error);
            alert("Wystąpił błąd podczas tworzenia zgłoszenia");
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{ maxWidth: "600px", margin: "0 auto", paddingTop: "var(--space-3xl)", textAlign: "center" }}>
                <div style={{
                    padding: "var(--space-2xl)",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: "var(--border-radius)",
                    border: "var(--border-width) solid #16a34a",
                    marginBottom: "var(--space-lg)"
                }}>
                    <h2 style={{ marginBottom: "var(--space-md)" }}>✅ Dziękujemy za zgłoszenie!</h2>
                    <p className="mb-0">Twoje zgłoszenie zostało pomyślnie przesłane.</p>
                </div>
                <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={() => setSuccess(false)}
                        className="btn btn-primary"
                    >
                        Dodaj kolejne zgłoszenie
                    </button>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="btn btn-secondary"
                    >
                        Przejdź do dashboardu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
                <label className="form-label">Typ incydentu</label>
                <select
                    className="select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                >
                    <option value="">Wybierz typ</option>
                    <option value="RESTRICTED_ZONE">Strefa zakazana</option>
                    <option value="PRIVACY_VIOLATION">Naruszenie prywatności</option>
                    <option value="DANGEROUS_FLIGHT">Niebezpieczny lot</option>
                    <option value="OTHER">Inne</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Opis (max 200 znaków)</label>
                <textarea
                    className="textarea"
                    maxLength={200}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    placeholder="Opisz szczegóły incydentu..."
                />
            </div>

            <div className="form-group">
                <label className="form-label">Lokalizacja</label>
                <div style={{ border: "var(--border-width) solid var(--color-border)", borderRadius: "var(--border-radius)", overflow: "hidden" }}>
                    <MapPicker onLocationSelect={handleLocationSelect} />
                </div>
                {formData.location && (
                    <p className="text-xs text-muted mt-sm mb-0">
                        Wybrano: {formData.location.address || `${formData.location.lat.toFixed(4)}, ${formData.location.lng.toFixed(4)}`}
                    </p>
                )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Wysyłanie..." : "Wyślij zgłoszenie"}
            </button>
        </form>
    );
}

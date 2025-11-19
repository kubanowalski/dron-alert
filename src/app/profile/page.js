"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        firstName: "",
        lastName: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/auth/login");
            return;
        }

        // Pobierz dane użytkownika
        fetch("/api/profile")
            .then((res) => res.json())
            .then((data) => {
                setFormData({
                    email: data.email || "",
                    name: data.name || "",
                    firstName: data.firstName || "",
                    lastName: data.lastName || "",
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });
                setLoading(false);
            })
            .catch((err) => {
                setError("Nie udało się załadować danych profilu");
                setLoading(false);
            });
    }, [session, status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Walidacja zmiany hasła
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmNewPassword) {
                setError("Nowe hasła nie są identyczne");
                return;
            }
            if (!formData.currentPassword) {
                setError("Podaj obecne hasło aby zmienić hasło");
                return;
            }
        }

        setSaving(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    currentPassword: formData.currentPassword || undefined,
                    newPassword: formData.newPassword || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Wystąpił błąd podczas aktualizacji");
                return;
            }

            setSuccess("Profil zaktualizowany pomyślnie");
            // Wyczyść pola hasła
            setFormData({
                ...formData,
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
        } catch (err) {
            setError("Wystąpił błąd podczas aktualizacji profilu");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading">Ładowanie...</div>;
    }

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h1 className="mb-xl">Moje konto</h1>

            {error && (
                <div style={{
                    padding: "var(--space-md)",
                    backgroundColor: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "var(--border-radius)",
                    marginBottom: "var(--space-lg)",
                    fontSize: "var(--font-size-sm)"
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: "var(--space-md)",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: "var(--border-radius)",
                    marginBottom: "var(--space-lg)",
                    fontSize: "var(--font-size-sm)"
                }}>
                    {success}
                </div>
            )}

            <div className="card">
                <h2 className="mb-lg">Dane osobowe</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nazwa użytkownika</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Opcjonalne"
                        />
                    </div>

                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Imię</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Opcjonalne"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nazwisko</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Opcjonalne"
                            />
                        </div>
                    </div>

                    <hr className="divider" />

                    <h2 className="mb-lg">Zmiana hasła</h2>

                    <div className="form-group">
                        <label className="form-label">Obecne hasło</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            placeholder="Wymagane tylko przy zmianie hasła"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nowe hasło</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            placeholder="Minimum 8 znaków, 1 wielka litera, 1 cyfra"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Potwierdź nowe hasło</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.confirmNewPassword}
                            onChange={(e) => setFormData({ ...formData, confirmNewPassword: e.target.value })}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "var(--space-md)", marginTop: "var(--space-xl)" }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                        </button>

                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => signOut({ callbackUrl: "/" })}
                        >
                            Wyloguj się
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

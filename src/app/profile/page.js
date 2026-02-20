"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

/**
 * Strona Profilu
 * Tutaj użytkownik może zarządzać swoim kontem:
 * - Zmienić imię i nazwisko
 * - Zmienić hasło (musi znać stare)
 * - Wylogować się (alternatywny guzik)
 */
export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        firstName: "",
        lastName: "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });

    // Fetch user profile data
    useEffect(() => {
        if (status === "loading") return;
        if (!session) {
            router.push("/auth/login");
            return;
        }

        // Fetch user data from API
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

        // Validate password change
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
            // Update profile
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
            // Clear password fields on success
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

    // Obsługa usuwania konta
    const handleDeleteAccount = async () => {
        setDeleting(true);
        try {
            const res = await fetch("/api/account/delete", {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Wystąpił błąd podczas usuwania konta");
                setShowDeleteConfirm(false);
                setDeleting(false);
                return;
            }

            // Po udanym usunięciu — wylogowanie i przekierowanie na stronę główną
            signOut({ callbackUrl: "/" });
        } catch (err) {
            setError("Wystąpił błąd podczas usuwania konta");
            setShowDeleteConfirm(false);
            setDeleting(false);
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

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--space-xl)" }}>
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
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            Usuń konto
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal potwierdzenia usunięcia konta */}
            {showDeleteConfirm && (
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
                        <h3 className="mb-md">Usuwanie konta</h3>
                        <p className="mb-lg">
                            Czy na pewno chcesz usunąć konto? Uwaga, tej akcji nie można cofnąć.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="btn btn-secondary"
                                disabled={deleting}
                            >
                                Anuluj
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="btn btn-danger"
                                disabled={deleting}
                            >
                                {deleting ? "Usuwanie..." : "Tak, usuń konto"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Strona Rejestracji
 * Formularz tworzenia nowego konta użytkownika.
 */
export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        firstName: "",
        lastName: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Simple Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Hasła nie są identyczne");
            return;
        }

        setLoading(true);

        try {
            // Register API call
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Wystąpił błąd podczas rejestracji");
                setLoading(false); // Keep loading false on error
                return;
            }

            setSuccess(true);
            setLoading(false); // Set loading to false on success

            // Redirect to homepage after showing success message
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } catch (err) {
            setError("Wystąpił błąd podczas rejestracji");
            setLoading(false); // Set loading to false on catch error
        }
    };

    if (success) {
        return (
            <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "var(--space-3xl)", textAlign: "center" }}>
                <div style={{
                    padding: "var(--space-2xl)",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: "var(--border-radius)",
                    border: "var(--border-width) solid #16a34a"
                }}>
                    <h2 style={{ marginBottom: "var(--space-md)" }}>✅ Rejestracja zakończona!</h2>
                    <p className="mb-0">Konto zostało utworzone. Za chwilę przekierujemy Cię na stronę główną...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", paddingTop: "var(--space-3xl)" }}>
            <div className="card">
                <h1 className="mb-xl">Rejestracja</h1>

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

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="twoj@email.com"
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
                                placeholder="Jan"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Nazwisko</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Kowalski"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nazwa użytkownika</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="jankowalski"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Hasło *</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="••••••••"
                        />
                        <p className="text-xs text-muted mt-sm mb-0">
                            Min. 8 znaków, 1 wielka litera, 1 cyfra
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Potwierdź hasło *</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%" }}
                    >
                        {loading ? "Rejestracja..." : "Zarejestruj się"}
                    </button>
                </form>

                <hr className="divider" />

                <p className="text-center text-muted mb-0">
                    Masz już konto?{" "}
                    <Link href="/auth/login" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </div>
    );
}

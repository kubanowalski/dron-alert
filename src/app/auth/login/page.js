"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * Formularz Logowania
 * Umożliwia wejście do systemu przy użyciu emaila i hasła.
 */
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showRegisteredMessage, setShowRegisteredMessage] = useState(false);

    // Wyświetl komunikat sukcesu, jeśli użytkownik właśnie się zarejestrował i został tu przekierowany
    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setShowRegisteredMessage(true);
            // Ukryj komunikat po 5 sekundach
            setTimeout(() => setShowRegisteredMessage(false), 5000);
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Próba zalogowania przez NextAuth
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                // Sukces -> idź do dashboardu
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Wystąpił błąd podczas logowania");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "var(--space-3xl)" }}>
            <h1 className="mb-xl" style={{ textAlign: "center" }}>Logowanie</h1>

            {showRegisteredMessage && (
                <div style={{
                    padding: "var(--space-md)",
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: "var(--border-radius)",
                    marginBottom: "var(--space-lg)",
                    border: "var(--border-width) solid #16a34a"
                }}>
                    ✅ Konto zostało utworzone! Możesz się teraz zalogować.
                </div>
            )}

            <div className="card">
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
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="twoj@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Hasło</label>
                        <input
                            type="password"
                            className="input"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                        {loading ? "Logowanie..." : "Zaloguj się"}
                    </button>
                </form>

                <hr className="divider" />

                <p className="text-center text-muted mb-0">
                    Nie masz konta?{" "}
                    <Link href="/auth/register" style={{ color: "var(--color-primary)", fontWeight: 500 }}>
                        Zarejestruj się
                    </Link>
                </p>
            </div>
        </div>
    );
}

/**
 * Strona Logowania - Kontener
 * Wrapper potrzebny, żeby Next.js poprawnie obsługiwał parametry URL (np. ?registered=true)
 */
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="loading">Ładowanie...</div>}>
            <LoginForm />
        </Suspense>
    );
}

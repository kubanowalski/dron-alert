"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import IncidentList from "@/components/IncidentList";

/**
 * Dashboard (Tablica Zgłoszeń)
 * To jest główne centrum dowodzenia.
 * - Jeśli jesteś Adminem: widzisz WSZYSTKIE zgłoszenia od wszystkich ludzi.
 * - Jeśli jesteś Użytkownikiem: widzisz tylko SWOJE zgłoszenia.
 */
export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = session?.user?.role === "ADMIN";

    // Fetch incidents on mount
    useEffect(() => {
        if (status === "loading") return;

        // Redirect if not authenticated
        if (!session) {
            router.push("/auth/login");
            return;
        }

        // Fetch incidents from API
        fetch("/api/incidents")
            .then(async (res) => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Fetch failed:", res.status, text);
                    throw new Error(`Failed to fetch incidents: ${res.status} ${text}`);
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setIncidents(data);
                } else {
                    console.error("Received invalid incidents data:", data);
                    setIncidents([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching incidents:", err);
                setIncidents([]);
                setLoading(false);
            });
    }, [session, status, router]);

    if (status === "loading" || loading) {
        return <div className="loading">Ładowanie...</div>;
    }

    return (
        <div>
            <h1 className="mb-xl">
                {isAdmin ? "Wszystkie zgłoszenia" : "Moje zgłoszenia"}
            </h1>
            {incidents.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "var(--space-3xl)" }}>
                    <p className="text-muted mb-lg">
                        {isAdmin ? "Brak zgłoszeń w systemie." : "Nie masz jeszcze żadnych zgłoszeń."}
                    </p>
                    <a href="/report" className="btn btn-primary">
                        Zgłoś incydent
                    </a>
                </div>
            ) : (
                <IncidentList incidents={incidents} showUserInfo={isAdmin} />
            )}
        </div>
    );
}
